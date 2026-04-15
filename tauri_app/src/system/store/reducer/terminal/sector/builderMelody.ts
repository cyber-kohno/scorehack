import {
  createTerminalCommandDefault,
  type TerminalCommand,
} from "../../../../../app/terminal/terminal-command-registry";
import { createPlaybackActions } from "../../../../../app/playback/playback-actions";
import { createTerminalLogger } from "../../../../../app/terminal/terminal-logger";
import { createMelodyActions } from "../../../../../app/melody/melody-actions";
import { createProjectIoService } from "../../../../../app/project-io/project-io-service";
import StorePreview from "../../../props/storePreview";
import { createStoreUtil, type StoreProps } from "../../../store";
import useReducerRef from "../../reducerRef";
import useReducerTermianl from "../../reducerTerminal";

const useBuilderMelody = (lastStore: StoreProps) => {
  const storeUtil = createStoreUtil(lastStore);
  const { commit } = storeUtil;
  const reducer = useReducerTermianl(lastStore);
  const terminal = reducer.getTerminal();
  const { changeScoreTrack, getCurrScoreTrack } = createMelodyActions(lastStore);
  const { isLoadSoundFont, loadSoundFont } = createPlaybackActions(storeUtil);

  const logger = createTerminalLogger(terminal);

  const get = (): TerminalCommand[] => {
    const defaultProps = createTerminalCommandDefault("melody");
    const projectIo = createProjectIoService(lastStore);
    const { resetScoreTrackRef } = useReducerRef(lastStore);

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
          const trackIndex = lastStore.control.melody.trackIndex;
          const tracks = lastStore.data.scoreTracks.map((t, i) => ({
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
          const trackIndex = lastStore.control.melody.trackIndex;
          const tracks = lastStore.data.audioTracks.map((t, i) => ({
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
          const tracks = lastStore.data.scoreTracks;
          const name = args[0] ?? `track${tracks.length}`;
          tracks.push({
            name,
            isMute: false,
            volume: 10,
            soundFont: "",
            notes: [],
          });
          lastStore.ref.trackArr.push([]);
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
          const audios = lastStore.data.audioTracks;
          const name = args[0] ?? `audio${audios.length}`;
          audios.push({
            name,
            fileName: "",
            isMute: false,
            volume: 10,
            adjust: 0,
            source: "",
          });
          lastStore.ref.trackArr.push([]);
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
            getCandidate: () => lastStore.data.audioTracks.map((a) => a.name),
          },
        ],
        callback: (args) => {
          const arg0 = logger.validateRequired(args[0], 1);
          if (arg0 == null) return;
          const audio = lastStore.data.audioTracks.find((a) => a.name === arg0);
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
          const tracks = lastStore.data.scoreTracks;
          const melody = lastStore.control.melody;
          let delIndex = melody.trackIndex;
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
          lastStore.ref.trackArr.splice(delIndex, 1);
          if (delIndex > 0 && delIndex <= melody.trackIndex) melody.trackIndex--;
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
            getCandidate: () => lastStore.data.scoreTracks.map((st) => st.name),
          },
        ],
        callback: (args) => {
          const melody = lastStore.control.melody;
          const tracks = lastStore.data.scoreTracks;
          const arg0 = logger.validateRequired(args[0], 1);
          if (arg0 == null) return;
          const nextIndex = tracks.findIndex((st) => st.name === arg0);
          if (nextIndex === -1) {
            logger.outputError("");
            return;
          }
          const prev = tracks[melody.focus];
          try {
            changeScoreTrack(nextIndex);
            logger.outputInfo(`Active track changed. [${prev} -> ${arg0}]`);
            reducer.updateTarget();
            resetScoreTrackRef();
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
            getCandidate: () => StorePreview.InstrumentNames,
          },
        ],
        callback: (args) => {
          const arg0 = logger.validateRequired(args[0], 1);
          if (arg0 == null) return;
          try {
            const sfName = StorePreview.validateSFName(arg0);
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
