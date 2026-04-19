import {
  createTerminalCommandDefault,
  type TerminalCommand,
} from "../../../../../app/terminal/terminal-command-registry";
import { createPlaybackActions } from "../../../../../app/playback/playback-actions";
import { createTerminalLogger } from "../../../../../app/terminal/terminal-logger";
import { createMelodyActions } from "../../../../../app/melody/melody-actions";
import { createProjectDataActions } from "../../../../../app/project-data/project-data-actions";
import { createProjectIoService } from "../../../../../app/project-io/project-io-service";
import {
  pushTrackRefGroup,
  removeTrackRefGroup,
  resetScoreTrackRefs,
} from "../../../../../state/session-state/track-ref-session";
import {
  getMelodyTrackIndex,
  setMelodyTrackIndex,
} from "../../../../../state/session-state/melody-track-store";
import {
  PREVIEW_INSTRUMENT_NAMES,
  validatePreviewInstrumentName,
} from "../../../../../state/session-state/preview-store";
import { createStoreUtil, type StoreProps } from "../../../store";
import useReducerTermianl from "../../reducerTerminal";

const useBuilderMelody = (lastStore: StoreProps) => {
  const storeUtil = createStoreUtil(lastStore);
  const { commit } = storeUtil;
  const reducer = useReducerTermianl(lastStore);
  const terminal = reducer.getTerminal();
  const { changeScoreTrack, getCurrScoreTrack } = createMelodyActions(lastStore);
  const { getScoreTracks, getAudioTracks } = createProjectDataActions(lastStore);
  const { isLoadSoundFont, loadSoundFont } = createPlaybackActions(storeUtil);

  const logger = createTerminalLogger(terminal);

  const get = (): TerminalCommand[] => {
    const defaultProps = createTerminalCommandDefault("melody");
    const projectIo = createProjectIoService(lastStore);

    const lss = () => {
      const func = terminal.availableFuncs.find((f) => f.funcKey === "lss");
      if (func == undefined) throw new Error();
      func.callback([]);
    };
    const lsa = () => {
      const func = terminal.availableFuncs.find((f) => f.funcKey === "lsa");
      if (func == undefined) throw new Error();
      func.callback([]);
    };

    return [
      {
        ...defaultProps,
        funcKey: "lss",
        usage: "Displays a list of existing score tracks.",
        args: [],
        callback: () => {
          const trackIndex = getMelodyTrackIndex();
          const tracks = getScoreTracks().map((t, i) => ({
            ...t,
            isActive: trackIndex === i,
          }));
          terminal.outputs.push({
            type: "table",
            table: {
              cols: [
                { headerName: "Index", width: 80, attr: "item", isNumber: true },
                { headerName: "Name", width: 120, attr: "item" },
                { headerName: "Soundfont", width: 220, attr: "def" },
                { headerName: "Vol", width: 80, attr: "sentence", isNumber: true },
                { headerName: "Mute", width: 80, attr: "sentence" },
                { headerName: "Notes", width: 80, attr: "sentence", isNumber: true },
              ],
              table: tracks.map((item, i) => {
                const active = item.isActive ? "*" : "";
                return [
                  i.toString(),
                  active + item.name,
                  item.soundFont,
                  item.volume.toString(),
                  item.isMute ? "on" : "",
                  item.notes.length.toString(),
                ];
              }),
            },
          });
        },
      },
      {
        ...defaultProps,
        funcKey: "lsa",
        usage: "Displays a list of existing audio tracks.",
        args: [],
        callback: () => {
          const trackIndex = getMelodyTrackIndex();
          const tracks = getAudioTracks().map((t, i) => ({
            ...t,
            isActive: trackIndex === i,
          }));
          terminal.outputs.push({
            type: "table",
            table: {
              cols: [
                { headerName: "Index", width: 80, attr: "item", isNumber: true },
                { headerName: "Name", width: 120, attr: "item" },
                { headerName: "File", width: 220, attr: "resource" },
                { headerName: "Vol", width: 80, attr: "sentence", isNumber: true },
                { headerName: "Mute", width: 80, attr: "sentence" },
                { headerName: "Adjust", width: 80, attr: "sentence", isNumber: true },
              ],
              table: tracks.map((item, i) => {
                return [
                  i.toString(),
                  item.name,
                  item.fileName,
                  item.volume.toString(),
                  item.isMute ? "on" : "",
                  item.adjust.toString(),
                ];
              }),
            },
          });
        },
      },
      {
        ...defaultProps,
        funcKey: "mks",
        usage: "Create a new score track.",
        args: [{ name: "trackName?: string" }],
        callback: (args) => {
          const tracks = getScoreTracks();
          const name = args[0] ?? `track${tracks.length}`;
          tracks.push({
            name,
            isMute: false,
            volume: 10,
            soundFont: "",
            notes: [],
          });
          pushTrackRefGroup();
          logger.outputInfo(`Created a new track. [${name}]`);
          lss();
        },
      },
      {
        ...defaultProps,
        funcKey: "mka",
        usage: "Create a new audio track.",
        args: [{ name: "audioName?: string" }],
        callback: (args) => {
          const audios = getAudioTracks();
          const name = args[0] ?? `audio${audios.length}`;
          audios.push({
            name,
            fileName: "",
            isMute: false,
            volume: 10,
            adjust: 0,
            source: "",
          });
          pushTrackRefGroup();
          logger.outputInfo(`Created a new audio. [${name}]`);
          lsa();
        },
      },
      {
        ...defaultProps,
        funcKey: "aul",
        usage: "Upload an audio file.",
        args: [
          {
            name: "name",
            getCandidate: () => getAudioTracks().map((a) => a.name),
          },
        ],
        callback: (args) => {
          const arg0 = logger.validateRequired(args[0], 1);
          if (arg0 == null) return;
          const audio = getAudioTracks().find((a) => a.name === arg0);
          if (audio == undefined) {
            logger.outputError(`The specified audio track does not exist. [${arg0}]`);
            return;
          }
          terminal.wait = true;
          projectIo.loadMp3(
            audio,
            (handle) => {
              logger.outputInfo(`The audio file was successfully uploaded. [${handle.name}]`);
              terminal.wait = false;
              lsa();
              commit();
            },
            () => {
              logger.outputInfo("File upload canceled.");
              terminal.wait = false;
              commit();
            },
          );
        },
      },
      {
        ...defaultProps,
        funcKey: "rms",
        usage: "Deletes the music track.",
        args: [],
        callback: (args) => {
          const tracks = getScoreTracks();
          let delIndex = getMelodyTrackIndex();
          const arg0 = logger.validateRequired(args[0], 1);
          if (arg0 == null) return;
          const arg0Number = logger.validateNumber(arg0, 1);
          if (arg0Number == null) return;
          delIndex = arg0Number;
          if (tracks.length === 1) {
            logger.outputError("You cannot delete all tracks.");
            return;
          }
          const name = tracks[delIndex].name;
          tracks.splice(delIndex, 1);
          removeTrackRefGroup(delIndex);
          const currentTrackIndex = getMelodyTrackIndex();
          if (delIndex > 0 && delIndex <= currentTrackIndex) {
            setMelodyTrackIndex(currentTrackIndex - 1);
          }
          logger.outputInfo(`Track deleted. [${name}].`);
        },
      },
      {
        ...defaultProps,
        funcKey: "chs",
        usage: "Change the active track by name.",
        args: [
          {
            name: "trackName: string",
            getCandidate: () => getScoreTracks().map((st) => st.name),
          },
        ],
        callback: (args) => {
          const tracks = getScoreTracks();
          const arg0 = logger.validateRequired(args[0], 1);
          if (arg0 == null) return;
          const nextIndex = tracks.findIndex((st) => st.name === arg0);
          if (nextIndex === -1) {
            logger.outputError("");
            return;
          }
          const prev = tracks[getMelodyTrackIndex()]?.name ?? "";
          try {
            changeScoreTrack(nextIndex);
            logger.outputInfo(`Active track changed. [${prev} -> ${arg0}]`);
            reducer.updateTarget();
            resetScoreTrackRefs(lastStore);
            lss();
          } catch {
            logger.outputError(`The destination track does not exist. [${nextIndex}]`);
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
            const track = getCurrScoreTrack();
            track.soundFont = sfName;

            const endProc = () => {
              logger.outputInfo(`Set a soundfont as the active track. [${sfName}]`);
              lss();
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
            logger.outputError(`The specified soundfont does not exist. [${arg0}]`);
          }
        },
      },
    ];
  };

  return {
    get,
  };
};

export default useBuilderMelody;

