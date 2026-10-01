import SoundFontFile from "../../../../infra/audio/soundfont-file";
import UserSoundFontCache from "../../../../infra/audio/user-soundfont-cache";
import UserSoundFontPath from "../../../../infra/audio/user-soundfont-path";
import { openSoundFontFilePath } from "../../../../infra/tauri/dialog";
import type SettingsState from "../../../../store/state/settings-state";
import ArgumentRegulationFactory from "../../argument-regulation-factory";
import TerminalCommand from "../../terminal-command";

const createSoundfontCatalog = (ctx: TerminalCommand.Context): TerminalCommand.Props => {
  const { logger, settings, terminal } = ctx;
  const defaultProps = TerminalCommand.createDefaultProps("system");
  const actions = ["list", "add", "update", "remove", "presets"];

  const getSoundFontFormat = (path: string): SettingsState.SoundFontFileFormat | null => {
    const ext = path.split(".").pop()?.toLowerCase();
    if (ext === "sf2" || ext === "sf3") return ext;
    return null;
  };

  const findDefinition = (name: string) => {
    return settings.userSoundFonts.find((soundFont) => soundFont.name === name);
  };

  const findDefinitionIndex = (name: string) => {
    return settings.userSoundFonts.findIndex((soundFont) => soundFont.name === name);
  };

  const definitionNames = () => {
    return settings.userSoundFonts.map((soundFont) => soundFont.name);
  };

  const finishSettingsWait = () => {
    terminal.wait = false;
    ctx.commit.settings();
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
          ["soundfont list", "Displays registered SoundFont definitions."],
          ["soundfont add <name>", "Add a SoundFont definition."],
          ["soundfont update <name>", "Update a SoundFont definition file."],
          ["soundfont remove <name>", "Remove a SoundFont definition."],
          ["soundfont presets <name>", "Displays presets in a SoundFont definition."],
        ],
      },
    });
    ctx.commit.terminal();
  };

  const listDefinitions = () => {
    if (settings.userSoundFonts.length === 0) {
      logger.outputInfo("No SoundFont definitions found.");
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
  };

  const addDefinition = (name: string | undefined) => {
    const definitionName = logger.validateRequired(name, 2);
    if (definitionName == null) return;

    if (findDefinition(definitionName) != undefined) {
      logger.outputError(`SoundFont definition already exists. [${definitionName}]`);
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
        name: definitionName,
        filePath: path,
        pathRef: UserSoundFontPath.createPathRef(path, settings.envs.HOME_DIR),
        format,
      });
      logger.outputInfo(`Added a SoundFont definition. [${definitionName}]`);
    })().catch((error) => {
      console.error("Failed to add SoundFont definition:", error);
      logger.outputError(`Failed to add SoundFont definition. [${definitionName}]`);
    }).finally(finishSettingsWait);
  };

  const updateDefinition = (name: string | undefined) => {
    const definitionName = logger.validateRequired(name, 2);
    if (definitionName == null) return;

    const soundFont = findDefinition(definitionName);
    if (soundFont == undefined) {
      logger.outputError(`The specified SoundFont definition does not exist. [${definitionName}]`);
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
      soundFont.filePath = path;
      soundFont.pathRef = UserSoundFontPath.createPathRef(path, settings.envs.HOME_DIR);
      soundFont.format = format;
      logger.outputInfo(`Updated a SoundFont definition. [${definitionName}]`);
    })().catch((error) => {
      console.error("Failed to update SoundFont definition:", error);
      logger.outputError(`Failed to update SoundFont definition. [${definitionName}]`);
    }).finally(finishSettingsWait);
  };

  const removeDefinition = (name: string | undefined) => {
    const definitionName = logger.validateRequired(name, 2);
    if (definitionName == null) return;

    const index = findDefinitionIndex(definitionName);
    if (index === -1) {
      logger.outputError(`The specified SoundFont definition does not exist. [${definitionName}]`);
      return;
    }

    settings.userSoundFonts.splice(index, 1);
    logger.outputInfo(`Removed a SoundFont definition. [${definitionName}]`);
    ctx.commit.settings();
    ctx.commit.terminal();
  };

  const listPresets = (name: string | undefined) => {
    const definitionName = logger.validateRequired(name, 2);
    if (definitionName == null) return;

    const soundFont = findDefinition(definitionName);
    if (soundFont == undefined) {
      logger.outputError(`The specified SoundFont definition does not exist. [${definitionName}]`);
      return;
    }

    const filePath = UserSoundFontPath.resolvePath(soundFont, settings);
    const presets = UserSoundFontCache.getPresets(filePath);
    if (!UserSoundFontCache.hasPresetCache(filePath)) {
      logger.outputError(`SoundFont presets are not cached. [${definitionName}]`);
      ctx.commit.terminal();
      return;
    }

    if (presets.length === 0) {
      logger.outputInfo(`No presets were found. [${definitionName}]`);
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
  };
  const existingDefinitionNameReg = ArgumentRegulationFactory.createExistingNameReg(definitionNames);
  const uniqueDefinitionNameReg = ArgumentRegulationFactory.createUniqueNameReg(definitionNames);

  return {
    sector: defaultProps.sector,
    kind: "multi",
    key: "soundfont",
    usage: "Manage external SoundFont definitions.",
    subCommands: [
      {
        key: "list",
        usage: "Displays SoundFont definitions.",
        args: [],
        callback: () => listDefinitions(),
      },
      {
        key: "add",
        usage: "Add a SoundFont definition.",
        args: [{ name: "name", ...uniqueDefinitionNameReg }],
        callback: (args) => addDefinition(args[0]),
      },
      {
        key: "update",
        usage: "Update a SoundFont definition.",
        args: [{ name: "name", ...existingDefinitionNameReg }],
        callback: (args) => updateDefinition(args[0]),
      },
      {
        key: "remove",
        usage: "Remove a SoundFont definition.",
        args: [{ name: "name", ...existingDefinitionNameReg }],
        callback: (args) => removeDefinition(args[0]),
      },
      {
        key: "presets",
        usage: "Displays SoundFont presets.",
        args: [{ name: "name", ...existingDefinitionNameReg }],
        callback: (args) => listPresets(args[0]),
      },
    ],
  };
};

export default createSoundfontCatalog;
