import SoundFontFile from "../../../../infra/audio/soundfont-file";
import UserSoundFontCache from "../../../../infra/audio/user-soundfont-cache";
import UserSoundFontPath from "../../../../infra/audio/user-soundfont-path";
import { openSoundFontFilePath } from "../../../../infra/tauri/dialog";
import type SettingsState from "../../../../store/state/settings-state";
import TerminalCommand from "../../terminal-command";

const createRfsCommand = (ctx: TerminalCommand.Context): TerminalCommand.Props => {
  const { logger, settings, terminal } = ctx;
  const defaultProps = TerminalCommand.createDefaultProps("system");

  const getSoundFontFormat = (path: string): SettingsState.SoundFontFileFormat | null => {
    const ext = path.split(".").pop()?.toLowerCase();
    if (ext === "sf2" || ext === "sf3") return ext;
    return null;
  };

  const findUserSoundFont = (name: string) => {
    return settings.userSoundFonts.find((soundFont) => soundFont.name === name);
  };

  const findUserSoundFontIndex = (name: string) => {
    return settings.userSoundFonts.findIndex((soundFont) => soundFont.name === name);
  };

  return {
    ...defaultProps,
    funcKey: "rfs",
    usage: "Read or manage user SoundFont definitions.",
    args: [
      {
        name: "soundFontName: string",
        getCandidate: () => settings.userSoundFonts.map((soundFont) => soundFont.name),
      },
      {
        name: "operation: string",
        getCandidate: () => ["-update", "-delete"],
      },
    ],
    callback: (args) => {
      const arg0 = args[0];
      const operation = args[1];

      if (arg0 == undefined || arg0 === "") {
        if (settings.userSoundFonts.length === 0) {
          logger.outputInfo("No user SoundFont definitions found.");
          ctx.commit.terminal();
          return;
        }

        terminal.outputs.push({
          type: "table",
          table: {
            cols: [
              { headerName: "Name", width: 150, attr: "def" },
              { headerName: "Path", width: 440, attr: "resource" },
              { headerName: "Cached", width: 90, attr: "sentence" },
            ],
            table: settings.userSoundFonts.map((soundFont) => {
              const filePath = UserSoundFontPath.resolvePath(soundFont, settings);
              return [
                soundFont.name,
                UserSoundFontPath.formatPathRef(soundFont),
                UserSoundFontCache.hasPresetCache(filePath) ? "*" : "",
              ];
            }),
          },
        });
        ctx.commit.terminal();
        return;
      }

      const soundFont = findUserSoundFont(arg0);
      if (soundFont == undefined) {
        logger.outputError(`The specified SoundFont definition does not exist. [${arg0}]`);
        return;
      }

      if (operation === "-delete") {
        const index = findUserSoundFontIndex(arg0);
        if (index === -1) {
          logger.outputError(`The specified SoundFont definition does not exist. [${arg0}]`);
          return;
        }

        settings.userSoundFonts.splice(index, 1);
        logger.outputInfo(`Deleted a user SoundFont definition. [${arg0}]`);
        ctx.commit.settings();
        ctx.commit.terminal();
        return;
      }

      if (operation === "-update") {
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
          soundFont.filePath = path;
          soundFont.pathRef = UserSoundFontPath.createPathRef(path, settings.envs.HOME_DIR);
          soundFont.format = format;
          logger.outputInfo(`Updated a user SoundFont definition. [${arg0}]`);
        })().catch((error) => {
          console.error("Failed to update SoundFont definition:", error);
          logger.outputError(`Failed to update SoundFont definition. [${arg0}]`);
        }).finally(() => {
          terminal.wait = false;
          ctx.commit.settings();
          ctx.commit.terminal();
        });
        return;
      }

      if (operation != undefined && operation !== "") {
        logger.outputError(`Unknown SoundFont definition operation. [${operation}]`);
        ctx.commit.terminal();
        return;
      }

      const filePath = UserSoundFontPath.resolvePath(soundFont, settings);
      const presets = UserSoundFontCache.getPresets(filePath);
      if (!UserSoundFontCache.hasPresetCache(filePath)) {
        logger.outputError(`SoundFont presets are not cached. [${arg0}]`);
        ctx.commit.terminal();
        return;
      }

      if (presets.length === 0) {
        logger.outputInfo(`No presets were found. [${arg0}]`);
        ctx.commit.terminal();
        return;
      }

      terminal.outputs.push({
        type: "table",
        table: {
          cols: [
            { headerName: "Bank", width: 80, attr: "sentence", isNumber: true },
            { headerName: "Program", width: 100, attr: "sentence", isNumber: true },
            { headerName: "Preset", width: 320, attr: "def" },
          ],
          table: presets.map(SoundFontFile.formatPresetTableRow),
        },
      });
      ctx.commit.terminal();
    },
  };
};

export default createRfsCommand;
