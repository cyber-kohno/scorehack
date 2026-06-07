import { openDirectoryPath } from "../../../../infra/tauri/dialog";
import SettingsState from "../../../../store/state/settings-state";
import TerminalCommand from "../../terminal-command";
import createAudioCatalog from "../catalog/audio-catalog";
import createExportCatalog from "../catalog/export-catalog";
import createLoadCatalog from "../catalog/load-catalog";
import createLibraryCatalog from "../catalog/library-catalog";
import createSaveCatalog from "../catalog/save-catalog";
import createShortcutCatalog from "../catalog/shortcut-catalog";
import createSoundfontCatalog from "../catalog/soundfont-catalog";

const createGlobalProvider = (ctx: TerminalCommand.Context) => {
  const { logger, settings, terminal } = ctx;

  const isEnvKey = (key: string): key is SettingsState.EnvKey => {
    return SettingsState.EnvKeys.includes(key as SettingsState.EnvKey);
  };

  const commands = (props: {
    items: TerminalCommand.Props[];
  }): TerminalCommand.Props[] => {
    const defaultProps = TerminalCommand.createDefaultProps("system");
    return [
      {
        ...defaultProps,
        funcKey: "clear",
        usage: "Delete all output from the terminal.",
        args: [],
        callback: () => {
          terminal.outputs.length = 0;
        },
      },
      {
        ...defaultProps,
        funcKey: "help",
        usage: "Lists the available help commands.",
        args: [],
        callback: () => {
          terminal.outputs.push({
            type: "table",
            table: {
              cols: [
                { headerName: "Sector", width: 110, attr: "category" },
                { headerName: "Command", width: 150, attr: "def" },
                { headerName: "Usage", width: 400, attr: "sentence" },
              ],
              table: props.items.map((item) => {
                return [item.sector, item.funcKey, item.usage];
              }),
            },
          });
        },
      },
      createSaveCatalog(ctx),
      createExportCatalog(ctx),
      createLoadCatalog(ctx),
      createLibraryCatalog(ctx),
      createAudioCatalog(ctx),
      createSoundfontCatalog(ctx),
      createShortcutCatalog(ctx),
      {
        ...defaultProps,
        funcKey: "env",
        usage: "Show or configure application environment variables.",
        args: [
          {
            name: "key: string",
            getCandidate: () => SettingsState.EnvKeys,
          },
          {
            name: "operation: string",
            getCandidate: (args) => (isEnvKey(args[0]) ? ["clear"] : []),
          },
        ],
        callback: (args) => {
          const key = args[0];
          const operation = args[1];

          if (key == undefined || key === "") {
            terminal.outputs.push({
              type: "table",
              table: {
                cols: [
                  { headerName: "Key", width: 150, attr: "def" },
                  { headerName: "Value", width: 520, attr: "sentence" },
                ],
                table: SettingsState.EnvKeys.map((envKey) => [envKey, settings.envs[envKey] || "(empty)"]),
              },
            });
            ctx.commit.terminal();
            return;
          }

          if (!isEnvKey(key)) {
            logger.outputError(`Unknown environment variable. [${key}]`);
            ctx.commit.terminal();
            return;
          }

          if (operation === "clear") {
            settings.envs[key] = "";
            logger.outputInfo(`Cleared environment variable. [${key}]`);
            ctx.commit.settings();
            ctx.commit.terminal();
            return;
          }

          if (operation != undefined && operation !== "") {
            logger.outputError(`Unknown environment operation. [${operation}]`);
            ctx.commit.terminal();
            return;
          }

          terminal.wait = true;
          (async () => {
            const path = await openDirectoryPath(settings.envs[key], key === "HOME_DIR");
            if (path == null) {
              logger.outputInfo(`Environment variable setting was canceled. [${key}]`);
              return;
            }

            settings.envs[key] = path;
            logger.outputInfo(`Set environment variable. [${key}]`);
          })().catch((error) => {
            console.error("Failed to set environment variable:", error);
            logger.outputError(`Failed to set environment variable. [${key}]`);
          }).finally(() => {
            terminal.wait = false;
            ctx.commit.settings();
            ctx.commit.terminal();
          });
        },
      },
    ];
  };

  return {
    commands,
  };
};

export default createGlobalProvider;
