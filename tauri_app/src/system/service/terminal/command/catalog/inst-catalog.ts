import SoundFontFile from "../../../../infra/audio/soundfont-file";
import UserSoundFontCache from "../../../../infra/audio/user-soundfont-cache";
import UserSoundFontPath from "../../../../infra/audio/user-soundfont-path";
import PlaybackState from "../../../../store/state/playback-state";
import {
  prepareUserSoundFont,
  UserSoundFontPrepareError,
} from "../../../playback/user-soundfont-service";
import useSoundfontLoader from "../../../playback/soundfont-loader";
import useUserSoundfontLoader from "../../../playback/user-soundfont-loader";
import TerminalCommand from "../../terminal-command";

type InstCatalogKind = "harmonize" | "melody";

const createInstCatalog = (
  ctx: TerminalCommand.Context,
  kind: InstCatalogKind,
): TerminalCommand.Props => {
  const { data, logger, settings, terminal } = ctx;
  const defaultProps = TerminalCommand.createDefaultProps("inst");
  const { isLoadSoundFont, loadSoundFont } = useSoundfontLoader();
  const { isLoadUserSoundFont } = useUserSoundfontLoader();
  const sources = ["builtin", "soundfont"];

  const getActiveTrack = () => {
    switch (kind) {
      case "melody":
        return data.scoreTracks[ctx.control.melody.trackIndex];
      case "harmonize":
        return data.arrange.tracks[ctx.control.outline.trackIndex];
    }
  };

  const findSoundFont = (name: string) => {
    return settings.userSoundFonts.find((soundFont) => soundFont.name === name);
  };

  const formatCurrentInst = () => {
    const instRef = getActiveTrack()?.instRef;
    if (instRef == undefined) return "(none)";

    switch (instRef.source) {
      case "builtin":
        return `builtin ${instRef.name}`;
      case "soundfont":
        return `soundfont ${instRef.definitionName} ${SoundFontFile.formatPresetKey(instRef)}`;
    }
  };

  const outputReference = () => {
    terminal.outputs.push({
      type: "record",
      record: {
        attr: "info",
        texts: [
          { str: "Current: " },
          { str: formatCurrentInst(), highlight: "word" },
        ],
      },
    });
    terminal.outputs.push({
      type: "table",
      table: {
        cols: [
          { headerName: "Command", width: 240, attr: "def" },
          { headerName: "Usage", width: 420, attr: "sentence" },
        ],
        table: [
          ["inst builtin <name>", "Use a built-in instrument for the active track."],
          ["inst soundfont <name> <bank> <program>", "Use a SoundFont preset for the active track."],
        ],
      },
    });
    ctx.commit.terminal();
  };

  const useBuiltin = (name: string | undefined) => {
    const arg = logger.validateRequired(name, 2);
    if (arg == null) return;

    try {
      const instName = PlaybackState.validateSFName(arg);
      const track = getActiveTrack();
      track.instRef = {
        source: "builtin",
        name: instName,
      };

      const finish = () => {
        logger.outputInfo(`Set a built-in instrument as the active track. [${instName}]`);
      };

      if (!isLoadSoundFont(instName)) {
        logger.outputInfo(`Built-in instrument not yet loaded. [${instName}]`);
        logger.outputInfo("Loading...");
        terminal.wait = true;
        loadSoundFont(instName).then(() => {
          finish();
          terminal.wait = false;
          ctx.commit.data();
          ctx.commit.terminal();
        });
        return;
      }

      finish();
      ctx.commit.data();
    } catch {
      logger.outputError(`The specified built-in instrument does not exist. [${arg}]`);
    }
  };

  const parsePresetNumber = (value: string | undefined, argIndex: 1 | 2 | 3 | 4, label: string) => {
    const text = logger.validateRequired(value, argIndex);
    if (text == null) return null;
    if (!/^\d+$/.test(text)) {
      logger.outputError(`The ${label} must be a number. [${text}]`);
      return null;
    }
    return Number(text);
  };

  const useSoundFont = (
    definitionName: string | undefined,
    bankArg: string | undefined,
    programArg: string | undefined,
  ) => {
    const name = logger.validateRequired(definitionName, 2);
    if (name == null) return;

    const bank = parsePresetNumber(bankArg, 3, "bank");
    if (bank == null) return;

    const program = parsePresetNumber(programArg, 4, "program");
    if (program == null) return;

    const soundFont = findSoundFont(name);
    if (soundFont == undefined) {
      logger.outputError(`The specified SoundFont definition does not exist. [${name}]`);
      return;
    }

    const presetKeyText = SoundFontFile.formatPresetKey({ bank, program });

    const instRef = {
      source: "soundfont",
      definitionName: name,
      bank,
      program,
    } as const;

    terminal.wait = true;
    if (!isLoadUserSoundFont(instRef)) {
      logger.outputInfo(`SoundFont preset not yet loaded. [${name} ${presetKeyText}]`);
      logger.outputInfo("Loading...");
      ctx.commit.terminal();
    }

    (async () => {
      const { preset } = await prepareUserSoundFont(instRef);
      const track = getActiveTrack();
      track.instRef = instRef;
      logger.outputInfo(
        `Set a SoundFont preset as the active track. [${name} ${presetKeyText} ${preset.name}]`,
      );
    })().catch((error) => {
      console.error("Failed to set SoundFont preset:", error);
      if (error instanceof UserSoundFontPrepareError) {
        logger.outputError(error.message);
        return;
      }
      logger.outputError(`Failed to set SoundFont preset. [${name} ${presetKeyText}]`);
    }).finally(() => {
      terminal.wait = false;
      ctx.commit.data();
      ctx.commit.terminal();
    });
  };

  const outputUnknownSource = (source: string) => {
    logger.outputError(`Unknown instrument source. [${source}]`);
    ctx.commit.terminal();
  };

  return {
    ...defaultProps,
    funcKey: "inst",
    usage: "Set the active track instrument.",
    args: [
      {
        name: "source: string",
        getCandidate: () => sources,
      },
      {
        name: "name: string",
        getCandidate: (args) => {
          switch (args[0]) {
            case "builtin":
              return PlaybackState.InstrumentNames;
            case "soundfont":
              return settings.userSoundFonts.map((soundFont) => soundFont.name);
            default:
              return [];
          }
        },
      },
      {
        name: "bank: number",
        getCandidate: (args) => {
          if (args[0] !== "soundfont") return [];
          const soundFont = findSoundFont(args[1]);
          if (soundFont == undefined) return [];
          return UserSoundFontCache.getPresetBanks(UserSoundFontPath.resolvePath(soundFont, settings));
        },
      },
      {
        name: "program: number",
        getCandidate: (args) => {
          if (args[0] !== "soundfont") return [];
          const soundFont = findSoundFont(args[1]);
          if (soundFont == undefined) return [];
          const bank = Number(args[2]);
          if (!Number.isFinite(bank)) return [];
          return UserSoundFontCache.getPresetPrograms(UserSoundFontPath.resolvePath(soundFont, settings), bank);
        },
      },
    ],
    callback: (args) => {
      const source = args[0];

      if (source == undefined || source === "") {
        outputReference();
        return;
      }

      switch (source) {
        case "builtin":
          useBuiltin(args[1]);
          break;
        case "soundfont":
          useSoundFont(args[1], args[2], args[3]);
          break;
        default:
          outputUnknownSource(source);
          break;
      }
    },
  };
};

export default createInstCatalog;
