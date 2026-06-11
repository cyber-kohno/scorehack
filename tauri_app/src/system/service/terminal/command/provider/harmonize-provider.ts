import ArrangeState from "../../../../store/state/data/arrange/arrange-state";
import type SettingsState from "../../../../store/state/settings-state";
import TerminalCommand from "../../terminal-command";
import createInstCatalog from "../catalog/inst-catalog";
import createTrackCatalog from "../catalog/track-catalog";

const createHarmonizeProvider = (ctx: TerminalCommand.Context) => {
  const { control, data, settings, terminal, logger } = ctx;
  const { getCurrHarmonizeTrack } = ctx.selectors.outline;

  const listHarmonizeTracks = () => {
    const trackIndex = control.outline.trackIndex;
    const tracks = data.arrange.tracks.map((track, index) => ({
      ...track,
      isActive: trackIndex === index,
    }));

    terminal.outputs.push({
      type: "table",
      table: {
        cols: [
          { headerName: "Index", width: 80, attr: "item", isNumber: true },
          { headerName: "Name", width: 120, attr: "item" },
          { headerName: "Method", width: 100, attr: "def" },
          { headerName: "Vol", width: 70, attr: "sentence", isNumber: true },
          { headerName: "Mute", width: 80, attr: "sentence" },
        ],
        table: tracks.map((track, index) => {
          const active = track.isActive ? "*" : "";
          return [
            index.toString(),
            active + track.name,
            track.method,
            track.volume.toString(),
            track.isMute ? "*" : "",
          ];
        }),
      },
    });
  };

  const commands = (): TerminalCommand.Props[] => {
    const defaultProps = TerminalCommand.createDefaultProps("harmonize");
    return [
      createInstCatalog(ctx, "harmonize"),
      createTrackCatalog(ctx, "harmonize"),
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

          const trackIndex = control.outline.trackIndex;
          const track = data.arrange.tracks[trackIndex];
          if (track == undefined) throw new Error();
          const prev = track.method;
          if (prev === arg0) {
            logger.outputInfo(`Arrange method is already selected. [${arg0}]`);
            return;
          }

          const nextTrack = arg0 === "piano"
            ? ArrangeState.createPianoTrackInitial(track.name)
            : ArrangeState.createGuitarTrackInitial(track.name);
          nextTrack.instRef = track.instRef;
          nextTrack.volume = track.volume;
          nextTrack.isMute = track.isMute;
          data.arrange.tracks[trackIndex] = nextTrack;
          control.outline.arrange = null;

          ctx.commit.control();
          ctx.commit.dataAndRecalculate();
          logger.outputInfo(`Changed arrange method. [${prev} -> ${arg0}]`);
          listHarmonizeTracks();
        },
      },
      {
        ...defaultProps,
        funcKey: "notation",
        usage: "Change notation settings.",
        args: [
          {
            name: "property: degree-basis",
            getCandidate: () => ["degree-basis"],
          },
          {
            name: "value: tonality | relative-major",
            getCandidate: (args) => args[0] === "degree-basis"
              ? ["tonality", "relative-major"]
              : [],
          },
        ],
        callback: (args) => {
          const prop = logger.validateRequired(args[0], 1);
          if (prop == null) return;
          const value = logger.validateRequired(args[1], 2);
          if (value == null) return;

          if (prop !== "degree-basis") {
            logger.outputError(`The specified notation property does not exist. [${prop}]`);
            return;
          }
          if (value !== "tonality" && value !== "relative-major") {
            logger.outputError(`The specified degree basis does not exist. [${value}]`);
            return;
          }

          const prev = settings.notation.degreeBasis;
          settings.notation.degreeBasis = value as SettingsState.DegreeBasis;
          ctx.commit.settings();
          logger.outputInfo(`Changed degree basis. [${prev} -> ${value}]`);
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
          ctx.commit.data();
        },
      },
    ];
  };

  return {
    commands,
  };
};

export default createHarmonizeProvider;
