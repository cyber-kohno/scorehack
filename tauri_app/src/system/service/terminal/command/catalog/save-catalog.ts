import FileUtil from "../../../../infra/file/fileUtil";
import SettingsFile from "../../../../infra/settings/settings-file";
import TerminalCommand from "../../terminal-command";

const createSaveCatalog = (ctx: TerminalCommand.Context): TerminalCommand.Props => {
  const { logger, settings, terminal } = ctx;
  const defaultProps = TerminalCommand.createDefaultProps("system");
  const fileUtil = FileUtil.getUtil();
  const saveTargets = ["project", "settings"];

  const finishWaiting = () => {
    terminal.wait = false;
    ctx.commit.terminal();
  };

  const saveSettings = () => {
    terminal.wait = true;
    (async () => {
      await SettingsFile.saveSettings(settings);
      logger.outputInfo("Settings saved successfully.");
    })().catch((error) => {
      console.error("Failed to save settings:", error);
      logger.outputError("Failed to save settings.");
    }).finally(finishWaiting);
  };

  const saveProject = () => {
    logger.outputInfo("Select the file to save.");
    terminal.wait = true;
    fileUtil.saveScoreFile({
      defaultDirectory: settings.envs.SCH_FILE_DIR,
      success: (handle) => {
        logger.outputInfo(`File saved successfully. [${handle.name}]`);
        finishWaiting();
      },
      cancel() {
        logger.outputInfo("File saveing was canceled.");
        finishWaiting();
      },
    });
  };

  const outputUnknownTarget = (target: string) => {
    logger.outputError(`Unknown save target. [${target}]`);
    ctx.commit.terminal();
  };

  return {
    ...defaultProps,
    funcKey: "save",
    usage: "Save project or application settings.",
    args: [
      {
        name: "target: string",
        getCandidate: () => saveTargets,
      },
    ],
    callback: (args) => {
      const target = args[0] ?? "project";

      switch (target) {
        case "project":
          saveProject();
          break;
        case "settings":
          saveSettings();
          break;
        default:
          outputUnknownTarget(target);
          break;
      }
    },
  };
};

export default createSaveCatalog;
