import { get } from "svelte/store";
import FileUtil from "../../../../infra/file/fileUtil";
import { dataStore } from "../../../../store/global-store";
import type DataState from "../../../../store/state/data/data-state";
import type { TrackInstRef } from "../../../../store/state/data/track-inst-ref";
import PlaybackState from "../../../../store/state/playback-state";
import {
  formatUserSoundFontRef,
  prepareUserSoundFont,
  UserSoundFontPrepareError,
  type UserTrackInstRef,
} from "../../../playback/user-soundfont-service";
import useSoundfontLoader from "../../../playback/soundfont-loader";
import TerminalCommand from "../../terminal-command";

const createLoadCatalog = (ctx: TerminalCommand.Context): TerminalCommand.Props => {
  const { logger, settings, terminal } = ctx;
  const defaultProps = TerminalCommand.createDefaultProps("system");
  const fileUtil = FileUtil.getUtil();
  const { isLoadSoundFont, loadSoundFont } = useSoundfontLoader();
  const loadTargets = ["project"];

  const finishWaiting = () => {
    terminal.wait = false;
    ctx.commit.terminal();
  };

  const isUserSoundFontRef = (ref: TrackInstRef | undefined): ref is UserTrackInstRef => {
    return ref?.source === "soundfont";
  };

  const collectUserSoundFontRefs = (scoreData: DataState.Value) => {
    const refs = [
      ...scoreData.scoreTracks.map((track) => track.instRef),
      ...scoreData.arrange.tracks.map((track) => track.instRef),
    ].filter(isUserSoundFontRef);

    const uniqueRefs = new Map<string, UserTrackInstRef>();
    refs.forEach((ref) => {
      uniqueRefs.set(`${ref.definitionName}:${ref.bank}:${ref.program}`, ref);
    });
    return [...uniqueRefs.values()];
  };

  const loadProjectSoundFonts = async (scoreData: DataState.Value) => {
    const sfNames = Array.from(
      new Set(
        [
          ...scoreData.scoreTracks
            .map((track) => track.instRef)
            .filter((ref) => ref?.source === "builtin")
            .map((ref) => ref.name),
          ...scoreData.arrange.tracks
            .map((track) => track.instRef)
            .filter((ref) => ref?.source === "builtin")
            .map((ref) => ref.name),
        ].filter((sfName) => sfName !== ""),
      ),
    ).map((sfName) => PlaybackState.validateSFName(sfName));
    const userSoundFontRefs = collectUserSoundFontRefs(scoreData);

    for (const sfName of sfNames) {
      if (isLoadSoundFont(sfName)) continue;
      logger.outputInfo(`Loading... [${sfName}]`);
      ctx.commit.terminal();
      await loadSoundFont(sfName);
    }

    for (const instRef of userSoundFontRefs) {
      logger.outputInfo(`Loading... [${formatUserSoundFontRef(instRef)}]`);
      ctx.commit.terminal();
      try {
        const { preset } = await prepareUserSoundFont(instRef);
        logger.outputInfo(`User SoundFont loaded. [${formatUserSoundFontRef(instRef)} ${preset.name}]`);
      } catch (error) {
        console.error("Failed to load user SoundFont:", error);
        if (error instanceof UserSoundFontPrepareError) {
          logger.outputError(error.message);
        } else {
          logger.outputError(`Failed to load user SoundFont. [${formatUserSoundFontRef(instRef)}]`);
        }
      }
      ctx.commit.terminal();
    }
  };

  const loadProject = () => {
    terminal.wait = true;
    fileUtil.loadScoreFile(
      (handle) => {
        logger.outputInfo(`File load successfully. [${handle.name}]`);
        const loadedData = get(dataStore);

        loadProjectSoundFonts(loadedData).then(() => {
          logger.outputInfo("Soundfont load successfully");
          finishWaiting();
        }).catch((error) => {
          console.error("Failed to load SoundFont:", error);
          logger.outputError("Failed to load SoundFont.");
          finishWaiting();
        });
        ctx.commit.terminal();
      },
      () => {
        logger.outputInfo("File loading was canceled.");
        finishWaiting();
      },
      settings.envs.SCH_FILE_DIR,
    );
  };

  const outputUnknownTarget = (target: string) => {
    logger.outputError(`Unknown load target. [${target}]`);
    ctx.commit.terminal();
  };

  return {
    ...defaultProps,
    funcKey: "load",
    usage: "Load project or other external data.",
    args: [
      {
        name: "target: string",
        getCandidate: () => loadTargets,
      },
    ],
    callback: (args) => {
      const target = args[0] ?? "project";

      switch (target) {
        case "project":
          loadProject();
          break;
        default:
          outputUnknownTarget(target);
          break;
      }
    },
  };
};

export default createLoadCatalog;
