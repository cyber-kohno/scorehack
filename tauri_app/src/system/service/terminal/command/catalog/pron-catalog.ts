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

  return {
    sector: defaultProps.sector,
    kind: "multi",
    key: "pron",
    usage: "Manage pronunciation data on the active track.",
    subCommands: [
      {
        key: "clear",
        usage: "Remove pronunciation data from all notes on the active track.",
        args: [],
        callback: () => clearPron(),
      },
      {
        key: "dummy",
        usage: "Set dummy pronunciation data to all notes on the active track.",
        args: [],
        callback: () => setDummyPron(),
      },
    ],
  };
};

export default createPronCatalog;
