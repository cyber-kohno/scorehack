import PlaybackState from "../../../../store/state/playback-state";
import useSoundfontLoader from "../../../playback/soundfont-loader";
import TerminalCommand from "../../terminal-command";

type VoiceCatalogKind = "harmonize" | "melody";

const createVoiceCatalog = (
  ctx: TerminalCommand.Context,
  kind: VoiceCatalogKind,
): TerminalCommand.Props => {
  const { data, logger, terminal } = ctx;
  const defaultProps = TerminalCommand.createDefaultProps("voice");
  const { isLoadSoundFont, loadSoundFont } = useSoundfontLoader();
  const actions = ["list", "use"];

  const outputReference = () => {
    terminal.outputs.push({
      type: "table",
      table: {
        cols: [
          { headerName: "Command", width: 180, attr: "def" },
          { headerName: "Usage", width: 420, attr: "sentence" },
        ],
        table: [
          ["voice list", "Displays a list of built-in voices."],
          ["voice use <name>", "Use a built-in voice for the active track."],
        ],
      },
    });
    ctx.commit.terminal();
  };

  const getActiveTrack = () => {
    switch (kind) {
      case "melody":
        return data.scoreTracks[ctx.control.melody.trackIndex];
      case "harmonize":
        return data.arrange.tracks[ctx.control.outline.trackIndex];
    }
  };

  const getActiveVoiceName = () => {
    const track = getActiveTrack();
    const instRef = track?.instRef;
    if (instRef?.source === "builtin") return instRef.name;
    return "";
  };

  const listVoices = () => {
    const activeVoiceName = getActiveVoiceName();
    terminal.outputs.push({
      type: "table",
      table: {
        cols: [
          { headerName: "Name", width: 220, attr: "def" },
          { headerName: "Active", width: 80, attr: "sentence" },
        ],
        table: PlaybackState.InstrumentNames.map((name) => [
          name,
          name === activeVoiceName ? "*" : "",
        ]),
      },
    });
  };

  const finishUseVoice = (voiceName: string) => {
    logger.outputInfo(`Set a voice as the active track. [${voiceName}]`);
    listVoices();
  };

  const useVoice = (name: string | undefined) => {
    const arg = logger.validateRequired(name, 2);
    if (arg == null) return;

    try {
      const voiceName = PlaybackState.validateSFName(arg);
      const track = getActiveTrack();
      track.instRef = {
        source: "builtin",
        name: voiceName,
      };

      if (!isLoadSoundFont(voiceName)) {
        logger.outputInfo(`Voice not yet loaded. [${voiceName}]`);
        logger.outputInfo("Loading...");
        terminal.wait = true;
        loadSoundFont(voiceName).then(() => {
          finishUseVoice(voiceName);
          terminal.wait = false;
          ctx.commit.data();
          ctx.commit.terminal();
        });
        return;
      }

      finishUseVoice(voiceName);
      ctx.commit.data();
    } catch {
      logger.outputError(`The specified voice does not exist. [${arg}]`);
    }
  };

  const outputUnknownAction = (action: string) => {
    logger.outputError(`Unknown voice action. [${action}]`);
    ctx.commit.terminal();
  };

  return {
    ...defaultProps,
    funcKey: "voice",
    usage: "Show or use built-in voices.",
    args: [
      {
        name: "action: string",
        getCandidate: () => actions,
      },
      {
        name: "voiceName?: string",
        getCandidate: (args) => (args[0] === "use" ? PlaybackState.InstrumentNames : []),
      },
    ],
    callback: (args) => {
      const action = args[0];

      if (action == undefined || action === "") {
        outputReference();
        return;
      }

      switch (action) {
        case "list":
          listVoices();
          break;
        case "use":
          useVoice(args[1]);
          break;
        default:
          outputUnknownAction(action);
          break;
      }
    },
  };
};

export default createVoiceCatalog;
