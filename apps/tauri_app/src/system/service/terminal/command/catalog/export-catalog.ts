import { get } from "svelte/store";
import FileUtil from "../../../../infra/file/file-util";
import { saveTextFilePath } from "../../../../infra/tauri/dialog";
import { writeBinaryFile } from "../../../../infra/tauri/fs";
import { derivedStore } from "../../../../store/global-store";
import createScoreWav from "../../../export/audio/create-score-wav";
import MidiExporter from "../../../export/midi-exporter";
import MusicXmlExporter from "../../../export/musicxml-exporter";
import TerminalCommand from "../../terminal-command";

const createExportCatalog = (ctx: TerminalCommand.Context): TerminalCommand.Props => {
  const { logger, settings, terminal } = ctx;
  const defaultProps = TerminalCommand.createDefaultProps("system");
  const exportFormats = ["musicxml", "wav", "midi"];

  const finishWaiting = () => {
    terminal.wait = false;
    ctx.commit.terminal();
  };

  const exportMusicXml = () => {
    const track = ctx.selectors.melody.getCurrScoreTrack();
    const derived = get(derivedStore);
    const result = MusicXmlExporter.create({
      title: track.name,
      track,
      derived,
    });

    if (!result.ok) {
      logger.outputError("Cannot export MusicXML: invalid lyric pronunciation.");
      result.errors.forEach((error) => {
        logger.outputInfo(`block: ${error.chordSeq}, pron: ${error.pron}`);
      });
      ctx.commit.terminal();
      return;
    }

    logger.outputInfo("Select the file to export.");
    terminal.wait = true;
    FileUtil.saveTextFile({
      defaultDirectory: settings.envs.SCH_FILE_DIR,
      extension: "musicxml",
      filterName: "MusicXML File",
      plainData: result.xml,
      success: (handle) => {
        logger.outputInfo(`MusicXML exported successfully. [${handle.name}]`);
        finishWaiting();
      },
      cancel: () => {
        logger.outputInfo("MusicXML export was canceled.");
        finishWaiting();
      },
    });
  };

  const exportWav = () => {
    logger.outputInfo("Select the file to export.");
    terminal.wait = true;
    ctx.commit.terminal();

    (async () => {
      const path = await saveTextFilePath({
        defaultDirectory: settings.envs.SCH_FILE_DIR,
        extension: "wav",
        name: "WAV File",
      });

      if (path == null) {
        logger.outputInfo("WAV export was canceled.");
        return;
      }

      const exportPath = path.toLowerCase().endsWith(".wav")
        ? path
        : `${path}.wav`;
      const bytes = await createScoreWav({
        data: ctx.data,
        derived: get(derivedStore),
        settings,
      });
      await writeBinaryFile(exportPath, bytes);
      logger.outputInfo(`WAV exported successfully. [${exportPath.split(/[\\/]/).pop() ?? exportPath}]`);
    })().catch((error) => {
      console.error("Failed to export WAV:", error);
      logger.outputError("Failed to export WAV.");
    }).finally(() => {
      finishWaiting();
    });
  };

  const exportMidi = () => {
    const track = ctx.selectors.melody.getCurrScoreTrack();
    const { focus } = ctx.control.melody;
    if (focus === -1) {
      logger.outputError("Cannot export MIDI: no melody notes selected.");
      ctx.commit.terminal();
      return;
    }

    const [start, end] = ctx.selectors.melody.getFocusRange();
    const notes = track.notes.slice(start, end + 1);
    const result = MidiExporter.create({
      title: track.name,
      notes,
      volume: track.volume,
      derived: get(derivedStore),
    });

    if (!result.ok) {
      logger.outputError("Cannot export MIDI: no melody notes selected.");
      ctx.commit.terminal();
      return;
    }

    logger.outputInfo("Select the file to export.");
    terminal.wait = true;
    ctx.commit.terminal();

    (async () => {
      const path = await saveTextFilePath({
        defaultDirectory: settings.envs.SCH_FILE_DIR,
        extension: "mid",
        name: "MIDI File",
      });

      if (path == null) {
        logger.outputInfo("MIDI export was canceled.");
        return;
      }

      const exportPath = path.toLowerCase().endsWith(".mid")
        ? path
        : `${path}.mid`;
      await writeBinaryFile(exportPath, result.bytes);
      logger.outputInfo(`MIDI exported successfully. [${exportPath.split(/[\\/]/).pop() ?? exportPath}]`);
    })().catch((error) => {
      console.error("Failed to export MIDI:", error);
      logger.outputError("Failed to export MIDI.");
    }).finally(() => {
      finishWaiting();
    });
  };

  const outputUnknownFormat = (format: string) => {
    logger.outputError(`Unknown export format. [${format}]`);
    ctx.commit.terminal();
  };

  return {
    ...defaultProps,
    key: "export",
    usage: "Export the active data to an external file format.",
    args: [
      {
        name: "format",
        getCandidate: () => exportFormats,
      },
    ],
    callback: (args) => {
      const format = logger.validateRequired(args[0], 1);
      if (format == null) return;

      switch (format) {
        case "musicxml":
          exportMusicXml();
          break;
        case "wav":
          exportWav();
          break;
        case "midi":
          exportMidi();
          break;
        default:
          outputUnknownFormat(format);
          break;
      }
    },
  };
};

export default createExportCatalog;
