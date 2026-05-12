import ArrangeState from "../../../store/state/data/arrange/arrange-state";
import PlaybackState from "../../../store/state/playback-state";
import TerminalCommand from "../terminal-command";
import useSoundfontLoader from "../../playback/soundfont-loader";

const createHarmonizeCommands = (ctx: TerminalCommand.Context) => {
  const { control, data, ref, terminal, logger } = ctx;

  const { isLoadSoundFont, loadSoundFont } = useSoundfontLoader();

  const { getCurrHarmonizeTrack } = ctx.selectors.outline;

  const lsh = () => {
    const func = terminal.availableFuncs.find((f) => f.funcKey === "lsh");
    if (func == undefined) throw new Error();
    func.callback([]);
  };

  const list = (): TerminalCommand.Props[] => {
    const defaultProps = TerminalCommand.createDefaultProps("harmonize");
    return [
      {
        ...defaultProps,
        funcKey: "lsh",
        usage: "Displays a list of existing harmony tracks.",
        args: [],
        callback: () => {
          const trackIndex = control.outline.trackIndex;
          const tracks = data.arrange.tracks.map((t, i) => ({
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
          const tracks = data.arrange.tracks;
          const name = args[0] ?? `track${tracks.length}`;
          tracks.push(ArrangeState.createPianoTrackInitial(name));
          ref.trackArr.push([]);
          ctx.commit.data();
          ctx.commit.ref();
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
              data.arrange.tracks.map((ht) => ht.name),
          },
        ],
        callback: (args) => {
          const outline = control.outline;
          const tracks = data.arrange.tracks;
          const arg0 = logger.validateRequired(args[0], 1);
          if (arg0 == null) return;
          const nextIndex = tracks.findIndex((st) => st.name === arg0);
          if (nextIndex === -1) {
            logger.outputError(``);
            return;
          }
          const prev = tracks[outline.trackIndex];
          try {
            if (tracks[nextIndex] == undefined) throw new Error();
            outline.trackIndex = nextIndex;
            logger.outputInfo(`Active track changed. [${prev} → ${arg0}]`);
            ctx.commit.control();
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
        funcKey: "method",
        usage: "Change the arrange method for the active track.",
        args: [
          {
            name: "method: piano | guitar",
            getCandidate: () => [...ArrangeState.ArrangeMedhods],
          },
        ],
        callback: (args) => {
          const arg0 = logger.validateRequired(args[0], 1);
          if (arg0 == null) return;
          if (arg0 !== "piano" && arg0 !== "guitar") {
            logger.outputError(`The specified arrange method does not exist. [${arg0}]`);
            return;
          }

          const track = getCurrHarmonizeTrack();
          const prev = track.method;
          if (prev === arg0) {
            logger.outputInfo(`Arrange method is already selected. [${arg0}]`);
            return;
          }

          track.method = arg0;
          track.relations = [];
          if (arg0 === "piano") {
            track.pianoLib = ArrangeState.createPianoTrackInitial(track.name).pianoLib;
          } else {
            track.guitarLib = ArrangeState.createGuitarTrackInitial(track.name).guitarLib;
          }
          control.outline.arrange = null;

          ctx.commit.control();
          ctx.commit.dataAndRecalculate();
          logger.outputInfo(`Changed arrange method. [${prev} -> ${arg0}]`);
          lsh();
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
                ctx.commit.terminal();
                ctx.commit.data();
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
          ctx.commit.data();
        },
      },
    ];
  };
  return {
    list,
  };
};
export default createHarmonizeCommands;
