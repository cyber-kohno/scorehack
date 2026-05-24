import { get } from "svelte/store";
import FileUtil from "../../../../infra/file/fileUtil";
import { derivedStore } from "../../../../store/global-store";
import MusicXmlExporter from "../../../export/musicxml-exporter";
import TerminalCommand from "../../terminal-command";

const createExportCatalog = (ctx: TerminalCommand.Context): TerminalCommand.Props => {
  const { logger, settings, terminal } = ctx;
  const defaultProps = TerminalCommand.createDefaultProps("system");
  const fileUtil = FileUtil.getUtil();
  const exportFormats = ["musicxml"];

  const finishWaiting = () => {
    terminal.wait = false;
    ctx.commit.terminal();
  };

  const exportMusicXml = () => {
    const track = ctx.selectors.melody.getCurrScoreTrack();
    const derived = get(derivedStore);
    const xml = MusicXmlExporter.create({
      title: track.name,
      track,
      derived,
    });

    logger.outputInfo("Select the file to export.");
    terminal.wait = true;
    fileUtil.saveTextFile({
      defaultDirectory: settings.envs.SCH_FILE_DIR,
      extension: "musicxml",
      filterName: "MusicXML File",
      plainData: xml,
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

  const outputUnknownFormat = (format: string) => {
    logger.outputError(`Unknown export format. [${format}]`);
    ctx.commit.terminal();
  };

  return {
    ...defaultProps,
    funcKey: "export",
    usage: "Export the active data to an external file format.",
    args: [
      {
        name: "format: string",
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
        default:
          outputUnknownFormat(format);
          break;
      }
    },
  };
};

export default createExportCatalog;
