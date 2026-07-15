import FilePathRef from "../../../../infra/file/file-path-ref";
import { openAudioFilePath } from "../../../../infra/tauri/dialog";
import type MelodyState from "../../../../store/state/data/melody-state";
import ArgumentRegulationFactory from "../../argument-regulation-factory";
import TerminalCommand from "../../terminal-command";
import TerminalArgumentReader from "../../terminal-argument-reader";

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

    const adjustMs = TerminalArgumentReader.readNumber([trackName, ms], 1, logger, { min: -60000, max: 60000 });
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
  const existingAudioNameReg = ArgumentRegulationFactory.createExistingNameReg(trackNames);
  const uniqueAudioNameReg = ArgumentRegulationFactory.createUniqueNameReg(trackNames);

  return {
    sector: defaultProps.sector,
    kind: "multi",
    key: "audio",
    usage: "Manage audio tracks.",
    subCommands: [
      {
        key: "list",
        usage: "Displays audio tracks.",
        args: [],
        callback: () => listTracks(),
      },
      {
        key: "add",
        usage: "Add an audio track.",
        args: [{ name: "name", ...uniqueAudioNameReg }],
        callback: (args) => addTrack(args[0]),
      },
      {
        key: "delete",
        usage: "Delete an audio track.",
        args: [{ name: "name", ...existingAudioNameReg }],
        callback: (args) => deleteTrack(args[0]),
      },
      {
        key: "rename",
        usage: "Rename an audio track.",
        args: [
          { name: "name", ...existingAudioNameReg },
          { name: "name", ...uniqueAudioNameReg },
        ],
        callback: (args) => renameTrack(args[0], args[1]),
      },
      {
        key: "update",
        usage: "Update an audio track resource.",
        args: [{ name: "name", ...existingAudioNameReg }],
        callback: (args) => updateTrack(args[0]),
      },
      {
        key: "adjust",
        usage: "Adjust an audio track timing.",
        args: [
          { name: "name", ...existingAudioNameReg },
          { name: "value", ...ArgumentRegulationFactory.createNumberReg(-60000, 60000) },
        ],
        callback: (args) => adjustTrack(args[0], args[1]),
      },
    ],
  };
};

export default createAudioCatalog;
