import TerminalCommand from "../../terminal-command";

const createPronCatalog = (ctx: TerminalCommand.Context): TerminalCommand.Props => {
  const { control, data, logger, terminal } = ctx;
  const defaultProps = TerminalCommand.createDefaultProps("pron");
  const actions = ["clear", "dummy"];

  const getActiveTrack = () => {
    return data.scoreTracks[control.melody.trackIndex];
  };

  const outputReference = () => {
    terminal.outputs.push({
      type: "table",
      table: {
        cols: [
          { headerName: "Command", width: 180, attr: "def" },
          { headerName: "Usage", width: 420, attr: "sentence" },
        ],
        table: [
          ["pron clear", "Remove pronunciation data from all notes on the active track."],
          ["pron dummy", "Set dummy pronunciation data to all notes on the active track."],
        ],
      },
    });
    ctx.commit.terminal();
  };

  const clearPron = () => {
    const track = getActiveTrack();
    track.notes.forEach((note) => {
      delete note.pron;
    });

    logger.outputInfo(`Cleared pronunciation data. [${track.name}]`);
    ctx.commit.data();
  };

  const setDummyPron = () => {
    const track = getActiveTrack();
    const hasPron = track.notes.some((note) => note.pron != undefined);
    if (hasPron) {
      logger.outputError(`Pronunciation data already exists. [${track.name}]`);
      return;
    }

    track.notes.forEach((note) => {
      note.pron = "ra";
    });

    logger.outputInfo(`Set dummy pronunciation data. [${track.name}]`);
    ctx.commit.data();
  };

  const outputUnknownAction = (action: string) => {
    logger.outputError(`Unknown pronunciation action. [${action}]`);
    ctx.commit.terminal();
  };

  return {
    ...defaultProps,
    funcKey: "pron",
    usage: "Manage pronunciation data on the active track.",
    args: [
      {
        name: "action: string",
        getCandidate: () => actions,
      },
    ],
    callback: (args) => {
      const action = args[0];

      if (action == undefined || action === "") {
        outputReference();
        return;
      }

      switch (action) {
        case "clear":
          clearPron();
          break;
        case "dummy":
          setDummyPron();
          break;
        default:
          outputUnknownAction(action);
          break;
      }
    },
  };
};

export default createPronCatalog;
