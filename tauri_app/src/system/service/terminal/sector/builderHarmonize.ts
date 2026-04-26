import PreviewUtil from "../../playback/previewUtil";
import PianoEditorState from "../../../store/state/data/arrange/piano/piano-editor-state";
import PlaybackState from "../../../store/state/playback-state";
import { createStoreUtil, type StoreProps } from "../../../store/store";
import useReducerOutline from "../../outline/reducerOutline";
import useReducerTerminal from "../reducerTerminal";
import CommandRegistUtil from "../commandRegistUtil";
import useTerminalLogger from "../terminalLogger";
import { get as getStore } from "svelte/store";
import { controlStore } from "../../../store/global-store";

const useBuilderHarmonize = (lastStore: StoreProps) => {
  const { commit } = createStoreUtil(lastStore);
  const control = getStore(controlStore);
  lastStore.control = control;
  const reducer = useReducerTerminal(lastStore);
  const terminal = reducer.getTerminal();
  const { isLoadSoundFont, loadSoundFont } = PreviewUtil.useReducer(lastStore);

  const { changeHarmonizeTrack, getCurrHarmonizeTrack } =
    useReducerOutline();

  const logger = useTerminalLogger(terminal);
  const lsh = () => {
    const func = terminal.availableFuncs.find((f) => f.funcKey === "lsh");
    if (func == undefined) throw new Error();
    func.callback([]);
  };

  const get = (): CommandRegistUtil.FuncProps[] => {
    const defaultProps = CommandRegistUtil.createDefaultProps("harmonize");
    return [
      {
        ...defaultProps,
        funcKey: "lsh",
        usage: "Displays a list of existing harmony tracks.",
        args: [],
        callback: () => {
          const trackIndex = control.outline.trackIndex;
          const tracks = lastStore.data.arrange.tracks.map((t, i) => ({
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
              table: (() =>
                tracks.map((item, i) => {
                  const active = item.isActive ? "*" : "";
                  return [
                    i.toString(),
                    active + item.name,
                    item.method,
                    item.soundFont,
                    item.volume.toString(),
                    item.isMute ? "●" : "",
                  ];
                }))(),
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
          const tracks = lastStore.data.arrange.tracks;
          const name = args[0] ?? `track${tracks.length}`;
          tracks.push({
            name,
            isMute: false,
            method: "piano",
            volume: 10,
            soundFont: "",
            relations: [],
            pianoLib: PianoEditorState.createInitialLib(),
          });
          lastStore.ref.trackArr.push([]);
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
            getCandidate: () =>
              lastStore.data.arrange.tracks.map((ht) => ht.name),
          },
        ],
        callback: (args) => {
          const outline = control.outline;
          const tracks = lastStore.data.arrange.tracks;
          const arg0 = logger.validateRequired(args[0], 1);
          if (arg0 == null) return;
          const nextIndex = tracks.findIndex((st) => st.name === arg0);
          if (nextIndex === -1) {
            logger.outputError(``);
            return;
          }
          const prev = tracks[outline.focus];
          try {
            changeHarmonizeTrack(nextIndex);
            logger.outputInfo(`Active track changed. [${prev} → ${arg0}]`);
            // reducer.updateTarget();
            // resetScoreTrackRef();
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
            getCandidate: () => PlaybackState.InstrumentNames,
          },
        ],
        callback: (args) => {
          const arg0 = logger.validateRequired(args[0], 1);
          if (arg0 == null) return;
          try {
            const sfName = PlaybackState.validateSFName(arg0);
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
              logger.outputInfo(`Loading...`);
              terminal.wait = true;
              loadSoundFont(sfName).then(() => {
                endProc();
                terminal.wait = false;
                commit();
              });
            } else endProc();
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
          logger.outputInfo(`Changed volume. [${prev} → ${arg0}]`);
        },
      },
    ];
  };
  return {
    get,
  };
};
export default useBuilderHarmonize;
