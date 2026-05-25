import FilePathRef from "../../../../infra/file/file-path-ref";
import { openAudioFilePath } from "../../../../infra/tauri/dialog";
import type MelodyState from "../../../../store/state/data/melody-state";
import TerminalCommand from "../../terminal-command";

const createAudioCatalog = (ctx: TerminalCommand.Context): TerminalCommand.Props => {
  const { data, logger, settings, terminal } = ctx;
  const defaultProps = TerminalCommand.createDefaultProps("system");
  const actions = ["list", "add", "delete", "rename", "update", "adjust"];

  const findTrack = (name: string) => {
    return data.audioTracks.find((track) => track.name === name);
  };

  const findTrackIndex = (name: string) => {
    return data.audioTracks.findIndex((track) => track.name === name);
  };

  const trackNames = () => {
    return data.audioTracks.map((track) => track.name);
  };

  const formatPath = (track: MelodyState.AudioTrack) => {
    return track.pathRef == undefined ? "" : FilePathRef.formatPathRef(track.pathRef);
  };

  const finishDataWait = () => {
    terminal.wait = false;
    ctx.commit.data();
    ctx.commit.terminal();
  };

  const outputReference = () => {
    terminal.outputs.push({
      type: "table",
      table: {
        cols: [
          { headerName: "Command", width: 240, attr: "def" },
          { headerName: "Usage", width: 420, attr: "sentence" },
        ],
        table: [
          ["audio list", "Displays audio tracks."],
          ["audio add <name>", "Add an audio track and select an audio file."],
          ["audio delete <name>", "Delete an audio track."],
          ["audio rename <name> <newName>", "Rename an audio track."],
          ["audio update <name>", "Change the audio file for an audio track."],
          ["audio adjust <name> <ms>", "Set audio track timing adjustment in milliseconds."],
        ],
      },
    });
    ctx.commit.terminal();
  };

  const listTracks = () => {
    if (data.audioTracks.length === 0) {
      logger.outputInfo("No audio tracks found.");
      ctx.commit.terminal();
      return;
    }

    terminal.outputs.push({
      type: "table",
      table: {
        cols: [
          { headerName: "Name", width: 120, attr: "def" },
          { headerName: "Path", width: 320, attr: "resource" },
          { headerName: "Adjust", width: 90, attr: "sentence", isNumber: true },
          { headerName: "Mute", width: 70, attr: "sentence" },
          { headerName: "Vol", width: 70, attr: "sentence", isNumber: true },
        ],
        table: data.audioTracks.map((track) => {
          return [
            track.name,
            formatPath(track),
            `${track.adjust}`,
            track.isMute ? "*" : "",
            `${track.volume}`,
          ];
        }),
      },
    });
    ctx.commit.terminal();
  };

  const chooseAudioFile = async () => {
    const path = await openAudioFilePath();
    if (path == null) {
      logger.outputInfo("Audio file selection was canceled.");
      return null;
    }

    return FilePathRef.createPathRef(path, settings.envs.HOME_DIR);
  };

  const addTrack = (name: string | undefined) => {
    const trackName = logger.validateRequired(name, 2);
    if (trackName == null) return;

    if (findTrack(trackName) != undefined) {
      logger.outputError(`Audio track already exists. [${trackName}]`);
      return;
    }

    terminal.wait = true;
    (async () => {
      const pathRef = await chooseAudioFile();
      if (pathRef == null) return;

      data.audioTracks.push({
        name: trackName,
        isMute: false,
        volume: 10,
        adjust: 0,
        pathRef,
      });
      logger.outputInfo(`Added an audio track. [${trackName}]`);
    })().catch((error) => {
      console.error("Failed to add audio track:", error);
      logger.outputError(`Failed to add audio track. [${trackName}]`);
    }).finally(finishDataWait);
  };

  const deleteTrack = (name: string | undefined) => {
    const trackName = logger.validateRequired(name, 2);
    if (trackName == null) return;

    const index = findTrackIndex(trackName);
    if (index === -1) {
      logger.outputError(`The specified audio track does not exist. [${trackName}]`);
      return;
    }

    data.audioTracks.splice(index, 1);
    logger.outputInfo(`Deleted an audio track. [${trackName}]`);
    ctx.commit.data();
    ctx.commit.terminal();
  };

  const renameTrack = (name: string | undefined, newName: string | undefined) => {
    const trackName = logger.validateRequired(name, 2);
    if (trackName == null) return;

    const nextName = logger.validateRequired(newName, 3);
    if (nextName == null) return;

    const track = findTrack(trackName);
    if (track == undefined) {
      logger.outputError(`The specified audio track does not exist. [${trackName}]`);
      return;
    }
    if (findTrack(nextName) != undefined) {
      logger.outputError(`Audio track already exists. [${nextName}]`);
      return;
    }

    track.name = nextName;
    logger.outputInfo(`Renamed an audio track. [${trackName} -> ${nextName}]`);
    ctx.commit.data();
    ctx.commit.terminal();
  };

  const updateTrack = (name: string | undefined) => {
    const trackName = logger.validateRequired(name, 2);
    if (trackName == null) return;

    const track = findTrack(trackName);
    if (track == undefined) {
      logger.outputError(`The specified audio track does not exist. [${trackName}]`);
      return;
    }

    terminal.wait = true;
    (async () => {
      const pathRef = await chooseAudioFile();
      if (pathRef == null) return;

      track.pathRef = pathRef;
      logger.outputInfo(`Updated an audio track file. [${trackName}]`);
    })().catch((error) => {
      console.error("Failed to update audio track:", error);
      logger.outputError(`Failed to update audio track. [${trackName}]`);
    }).finally(finishDataWait);
  };

  const adjustTrack = (name: string | undefined, ms: string | undefined) => {
    const trackName = logger.validateRequired(name, 2);
    if (trackName == null) return;

    const adjustMsText = logger.validateRequired(ms, 3);
    if (adjustMsText == null) return;

    const adjustMs = logger.validateNumber(adjustMsText, 3);
    if (adjustMs == null) return;

    const track = findTrack(trackName);
    if (track == undefined) {
      logger.outputError(`The specified audio track does not exist. [${trackName}]`);
      return;
    }

    track.adjust = adjustMs;
    logger.outputInfo(`Updated audio track adjustment. [${trackName} ${adjustMs}ms]`);
    ctx.commit.data();
    ctx.commit.terminal();
  };

  const outputUnknownAction = (action: string) => {
    logger.outputError(`Unknown audio action. [${action}]`);
    ctx.commit.terminal();
  };

  return {
    ...defaultProps,
    funcKey: "audio",
    usage: "Manage audio tracks.",
    args: [
      {
        name: "action: string",
        getCandidate: () => actions,
      },
      {
        name: "audioTrackName?: string",
        getCandidate: (args) => {
          return ["delete", "rename", "update", "adjust"].includes(args[0]) ? trackNames() : [];
        },
      },
      {
        name: "newNameOrMs?: string",
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
          listTracks();
          break;
        case "add":
          addTrack(args[1]);
          break;
        case "delete":
          deleteTrack(args[1]);
          break;
        case "rename":
          renameTrack(args[1], args[2]);
          break;
        case "update":
          updateTrack(args[1]);
          break;
        case "adjust":
          adjustTrack(args[1], args[2]);
          break;
        default:
          outputUnknownAction(action);
          break;
      }
    },
  };
};

export default createAudioCatalog;
