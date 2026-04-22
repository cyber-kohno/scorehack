import {
  createTerminalCommandDefault,
  type TerminalCommand,
} from "../terminal-command-registry";
import { createPlaybackActions } from "../../playback/playback-actions";
import { createTerminalLogger } from "../terminal-logger";
import { createOutlineActions } from "../../outline/outline-actions";
import { createProjectDataActions } from "../../project-data/project-data-actions";
import { getOutlineTrackIndex } from "../../../state/session-state/outline-track-store";
import { pushTrackRefGroup } from "../../../state/session-state/track-ref-session";
import {
  PREVIEW_INSTRUMENT_NAMES,
  validatePreviewInstrumentName,
} from "../../../state/session-state/preview-store";
import StorePianoEditor from "../../../domain/arrange/piano-editor-store";
import {
  createCommitContext,
  type CommitContext,
  type RootStoreToken,
} from "../../../state/root-store";
import useReducerTermianl from "../terminal-reducer";

const useBuilderHarmonize = (rootStoreToken: RootStoreToken) => {
  const commitContext: CommitContext = createCommitContext(rootStoreToken);
  const { commit } = commitContext;
  const reducer = useReducerTermianl(rootStoreToken);
  const terminal = reducer.getTerminal();
  const { isLoadSoundFont, loadSoundFont } = createPlaybackActions(commitContext);
  const { getArrangeTracks } = createProjectDataActions(rootStoreToken);

  const { changeHarmonizeTrack, getCurrHarmonizeTrack } =
    createOutlineActions(rootStoreToken);

  const logger = createTerminalLogger(terminal);
  const lsh = () => {
    const func = terminal.availableFuncs.find((f) => f.funcKey === "lsh");
    if (func == undefined) throw new Error();
    func.callback([]);
  };

  const get = (): TerminalCommand[] => {
    const defaultProps = createTerminalCommandDefault("harmonize");
    return [
      {
        ...defaultProps,
        funcKey: "lsh",
        usage: "Displays a list of existing harmony tracks.",
        args: [],
        callback: () => {
          const trackIndex = getOutlineTrackIndex();
          const tracks = getArrangeTracks().map((t, i) => ({
            ...t,
            isActive: trackIndex === i,
          }));
          terminal.outputs.push({
            type: "table",
            table: {
              cols: [
                {
                  headerName: "Index",
                  width: 80,
                  attr: "item",
                  isNumber: true,
                },
                { headerName: "Name", width: 120, attr: "item" },
                { headerName: "Method", width: 100, attr: "def" },
                { headerName: "Soundfont", width: 220, attr: "def" },
                {
                  headerName: "Vol",
                  width: 70,
                  attr: "sentence",
                  isNumber: true,
                },
                { headerName: "Mute", width: 80, attr: "sentence" },
              ],
              table: tracks.map((item, i) => {
                const active = item.isActive ? "*" : "";
                return [
                  i.toString(),
                  active + item.name,
                  item.method,
                  item.soundFont,
                  item.volume.toString(),
                  item.isMute ? "on" : "",
                ];
              }),
            },
          });
        },
      },
      {
        ...defaultProps,
        funcKey: "mkh",
        usage: "Create a new harmonize track.",
        args: [{ name: "trackName?: string" }],
        callback: (args) => {
          const tracks = getArrangeTracks();
          const name = args[0] ?? `track${tracks.length}`;
          tracks.push({
            name,
            isMute: false,
            method: "piano",
            volume: 10,
            soundFont: "",
            relations: [],
            pianoLib: StorePianoEditor.createInitialLib(),
          });
          pushTrackRefGroup();
          logger.outputInfo(`Created a new track. [${name}]`);
          lsh();
        },
      },
      {
        ...defaultProps,
        funcKey: "cht",
        usage: "Change the active track by name.",
        args: [
          {
            name: "trackName: string",
            getCandidate: () => getArrangeTracks().map((ht) => ht.name),
          },
        ],
        callback: (args) => {
          const tracks = getArrangeTracks();
          const arg0 = logger.validateRequired(args[0], 1);
          if (arg0 == null) return;
          const nextIndex = tracks.findIndex((st) => st.name === arg0);
          if (nextIndex === -1) {
            logger.outputError("");
            return;
          }
          const prev = tracks[getOutlineTrackIndex()]?.name ?? "";
          try {
            changeHarmonizeTrack(nextIndex);
            logger.outputInfo(`Active track changed. [${prev} -> ${arg0}]`);
            lsh();
          } catch {
            logger.outputError(
              `The destination track does not exist. [${nextIndex}]`,
            );
          }
        },
      },
      {
        ...defaultProps,
        funcKey: "sf",
        usage: "Sets the SoundFont for the active track.",
        args: [
          {
            name: "soundfontName: string",
            getCandidate: () => [...PREVIEW_INSTRUMENT_NAMES],
          },
        ],
        callback: (args) => {
          const arg0 = logger.validateRequired(args[0], 1);
          if (arg0 == null) return;
          try {
            const sfName = validatePreviewInstrumentName(arg0);
            const track = getCurrHarmonizeTrack();
            track.soundFont = sfName;

            const endProc = () => {
              logger.outputInfo(
                `Set a soundfont as the active track. [${sfName}]`,
              );
              lsh();
            };
            if (!isLoadSoundFont(sfName)) {
              logger.outputInfo(`SoundFont not yet loaded. [${sfName}]`);
              logger.outputInfo("Loading...");
              terminal.wait = true;
              loadSoundFont(sfName).then(() => {
                endProc();
                terminal.wait = false;
                commit();
              });
            } else {
              endProc();
            }
          } catch {
            logger.outputError(
              `The specified soundfont does not exist. [${arg0}]`,
            );
          }
        },
      },
      {
        ...defaultProps,
        funcKey: "volume",
        usage: "Adjust volume for the active track.",
        args: [{ name: "value" }],
        callback: (args) => {
          const arg0 = logger.validateRequired(args[0], 1);
          if (arg0 == null) return;
          const arg0Number = logger.validateNumber(arg0, 1);
          if (arg0Number == null) return;
          const track = getCurrHarmonizeTrack();
          const prev = track.volume;
          track.volume = arg0Number;
          logger.outputInfo(`Changed volume. [${prev} -> ${arg0}]`);
        },
      },
    ];
  };

  return {
    get,
  };
};

export default useBuilderHarmonize;

