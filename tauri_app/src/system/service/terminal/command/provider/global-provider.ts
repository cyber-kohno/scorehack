import UserSoundFontCache from "../../../../infra/audio/user-soundfont-cache";
import UserSoundFontPath from "../../../../infra/audio/user-soundfont-path";
import { openDirectoryPath, openSoundFontFilePath } from "../../../../infra/tauri/dialog";
import SettingsState from "../../../../store/state/settings-state";
import TerminalCommand from "../../terminal-command";
import createAudioCatalog from "../catalog/audio-catalog";
import createExportCatalog from "../catalog/export-catalog";
import createLoadCatalog from "../catalog/load-catalog";
import createRfsCatalog from "../catalog/rfs-catalog";
import createSaveCatalog from "../catalog/save-catalog";
import createShortcutCatalog from "../catalog/shortcut-catalog";
import createSoundfontCatalog from "../catalog/soundfont-catalog";

const createGlobalProvider = (ctx: TerminalCommand.Context) => {
  const { logger, settings, terminal } = ctx;

  const getSoundFontFormat = (path: string): SettingsState.SoundFontFileFormat | null => {
    const ext = path.split(".").pop()?.toLowerCase();
    if (ext === "sf2" || ext === "sf3") return ext;
    return null;
  };

  const findUserSoundFont = (name: string) => {
    return settings.userSoundFonts.find((soundFont) => soundFont.name === name);
  };

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
      {
        ...defaultProps,
        funcKey: "cfs",
        usage: "Create a user SoundFont definition.",
        args: [{ name: "soundFontName: string" }],
        callback: (args) => {
          const arg0 = logger.validateRequired(args[0], 1);
          if (arg0 == null) return;

          if (findUserSoundFont(arg0) != undefined) {
            logger.outputError(`SoundFont definition already exists. [${arg0}]`);
            return;
          }

          terminal.wait = true;
          (async () => {
            const path = await openSoundFontFilePath(settings.envs.SF_FILE_DIR);
            if (path == null) {
              logger.outputInfo("SoundFont file selection was canceled.");
              return;
            }

            const format = getSoundFontFormat(path);
            if (format == null) {
              logger.outputError(`The selected file is not a supported SoundFont file. [${path}]`);
              return;
            }

            await UserSoundFontCache.buildPresetCache(path);
            settings.userSoundFonts.push({
              name: arg0,
              filePath: path,
              pathRef: UserSoundFontPath.createPathRef(path, settings.envs.HOME_DIR),
              format,
            });
            logger.outputInfo(`Created a user SoundFont definition. [${arg0}]`);
          })().catch((error) => {
            console.error("Failed to create SoundFont definition:", error);
            logger.outputError(`Failed to create SoundFont definition. [${arg0}]`);
          }).finally(() => {
            terminal.wait = false;
            ctx.commit.settings();
            ctx.commit.terminal();
          });
        },
      },
      createRfsCatalog(ctx),
    ];
  };
  return {
    commands,
  };
};

export default createGlobalProvider;
