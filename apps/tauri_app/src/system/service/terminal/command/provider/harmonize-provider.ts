import ArrangeState from "../../../../store/state/data/arrange/arrange-state";
import type SettingsState from "../../../../store/state/settings-state";
import ArgumentRegulationFactory from "../../argument-regulation-factory";
import TerminalArgumentReader from "../../terminal-argument-reader";
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

  const hasArrangeData = (track: ArrangeState.Track) => {
    if (track.relations.length > 0) return true;

    switch (track.method) {
      case "piano":
        return track.bank.backingPatterns.length > 0 ||
          track.bank.soundsPatterns.length > 0 ||
          track.bank.regulars.length > 0;
      case "guitar":
        return track.bank.voicingPatterns.length > 0;
      case "drum":
        return track.bank.mappings.length > 0 ||
          track.bank.patterns.length > 0 ||
          track.bank.regulars.length > 0;
    }
  };

  const commands = (): TerminalCommand.Props[] => {
    const defaultProps = TerminalCommand.createDefaultProps("harmonize");
    return [
      createInstCatalog(ctx, "harmonize"),
      createTrackCatalog(ctx, "harmonize"),
      {
        ...defaultProps,
        key: "method",
        usage: "Change the arrange method for the active track.",
        args: [
          {
            name: "method",
            getCandidate: () => [...ArrangeState.ArrangeMedhods],
          },
        ],
        callback: (args) => {
          const arg0 = logger.validateRequired(args[0], 1);
          if (arg0 == null) return;
          if (!ArrangeState.ArrangeMedhods.includes(arg0 as ArrangeState.ArrangeMedhod)) {
            logger.outputError(`The specified arrange method does not exist. [${arg0}]`);
            return;
          }
          const method = arg0 as ArrangeState.ArrangeMedhod;

          const trackIndex = control.outline.trackIndex;
          const track = data.arrange.tracks[trackIndex];
          if (track == undefined) throw new Error();
          const prev = track.method;
          if (prev === method) {
            logger.outputInfo(`Arrange method is already selected. [${method}]`);
            return;
          }

          const changeMethod = () => {
            const nextTrack = (() => {
            switch (method) {
              case "piano": return ArrangeState.createPianoTrackInitial(track.name);
              case "guitar": return ArrangeState.createGuitarTrackInitial(track.name);
              case "drum": return ArrangeState.createDrumTrackInitial(track.name);
            }
            })();
            nextTrack.instRef = track.instRef;
            nextTrack.volume = track.volume;
            nextTrack.isMute = track.isMute;
            data.arrange.tracks[trackIndex] = nextTrack;
            control.outline.arrange = null;

            ctx.commit.control();
            ctx.commit.dataAndRecalculate();
            logger.outputInfo(`Changed arrange method. [${prev} -> ${method}]`);
            listHarmonizeTracks();
          };

          if (!hasArrangeData(track)) {
            changeMethod();
            return;
          }

          terminal.prompt = {
            message: "Changing method will delete all arrange data for this track. Continue?",
            focus: 0,
            choices: [
              { label: "Cancel", value: "cancel" },
              { label: `Change method to ${method}`, value: "change" },
            ],
            apply: (value) => {
              if (value !== "change") {
                logger.outputInfo("Method change canceled.");
                return;
              }
              changeMethod();
            },
          };
        },
      },
      {
        ...defaultProps,
        key: "notation",
        usage: "Change notation settings.",
        args: [
          {
            name: "property",
            getCandidate: () => ["degree-basis"],
          },
          {
            name: "value",
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
        key: "volume",
        usage: "Adjust volume for the active track.",
        args: [{ name: "value", ...ArgumentRegulationFactory.createNumberReg(1, 10) }],
        callback: (args) => {
          const arg0Number = TerminalArgumentReader.readNumber(args, 0, logger, { min: 1, max: 10 });
          if (arg0Number == null) return;
          const track = getCurrHarmonizeTrack();
          const prev = track.volume;
          track.volume = arg0Number;
          logger.outputInfo(`Changed volume. [${prev} -> ${arg0Number}]`);
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
