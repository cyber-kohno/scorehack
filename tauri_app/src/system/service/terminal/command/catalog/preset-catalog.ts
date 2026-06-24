import TerminalCommand from "../../terminal-command";
import { openLibraryFilePath, saveLibraryFilePath } from "../../../../infra/tauri/dialog";
import type SettingsState from "../../../../store/state/settings-state";
import type PianoEditorState from "../../../../store/state/data/arrange/piano/piano-editor-state";
import CompressedJsonFile from "../../../common/compressed-json-file";
import type ArrangeState from "../../../../store/state/data/arrange/arrange-state";

const createPresetCatalog = (ctx: TerminalCommand.Context): TerminalCommand.Props => {
  const { control, data, logger, settings, terminal } = ctx;
  const defaultProps = TerminalCommand.createDefaultProps("library");
  const actions = ["regist", "list", "overwrite", "apply", "delete", "export", "import"];

  const clone = <T>(value: T): T => {
    return JSON.parse(JSON.stringify(value)) as T;
  };

  const getFileName = (path: string) => {
    const normalized = path.replaceAll("\\", "/");
    const segments = normalized.split("/");
    return segments[segments.length - 1] || path;
  };

  const createRegularPianoBank = (bank: PianoEditorState.Bank): PianoEditorState.Bank => {
    const backingNos = new Set(
      bank.regulars
        .map(regular => regular.backingNo)
        .filter(no => no !== -1),
    );
    const soundsNos = new Set(
      bank.regulars.flatMap(regular => regular.soundsNos),
    );

    const backingPatterns = bank.backingPatterns.filter(pattern => backingNos.has(pattern.no));
    const soundsPatterns = bank.soundsPatterns.filter(pattern => soundsNos.has(pattern.no));

    return {
      backingPatterns: clone(backingPatterns),
      soundsPatterns: clone(soundsPatterns),
      regulars: clone(bank.regulars),
    };
  };

  const findPreset = (name: string) => {
    return settings.library.presets.find(preset => preset.name === name);
  };

  const finishWaiting = () => {
    terminal.wait = false;
    ctx.commit.terminal();
  };

  const nextNo = (patterns: { no: number }[]) => {
    return patterns.reduce((max, pattern) => Math.max(max, pattern.no), -1) + 1;
  };

  const addPianoBackingPattern = (
    source: PianoEditorState.BackingPattern,
    targetLib: PianoEditorState.Bank,
  ) => {
    const sourceBacking = JSON.stringify(source.backing);
    const existing = targetLib.backingPatterns.find(pattern => {
      return JSON.stringify(pattern.backing) === sourceBacking;
    });
    if (existing != undefined) return existing.no;

    const no = nextNo(targetLib.backingPatterns);
    targetLib.backingPatterns.push({
      no,
      backing: clone(source.backing),
      category: clone(source.category),
    });
    return no;
  };

  const addPianoSoundsPattern = (
    source: PianoEditorState.SoundsPattern,
    targetLib: PianoEditorState.Bank,
  ) => {
    const sourceSounds = JSON.stringify(source.sounds);
    const existing = targetLib.soundsPatterns.find(pattern => {
      return JSON.stringify(pattern.sounds) === sourceSounds;
    });
    if (existing != undefined) return existing.no;

    const no = nextNo(targetLib.soundsPatterns);
    targetLib.soundsPatterns.push({
      no,
      sounds: clone(source.sounds),
      category: clone(source.category),
    });
    return no;
  };

  const addPianoRegular = (
    regular: PianoEditorState.Regular,
    targetLib: PianoEditorState.Bank,
  ) => {
    let targetRegular = targetLib.regulars.find(item => item.backingNo === regular.backingNo);
    if (targetRegular == undefined) {
      targetRegular = {
        backingNo: regular.backingNo,
        sortNo: regular.sortNo,
        soundsNos: [],
      };
      targetLib.regulars.push(targetRegular);
    }

    regular.soundsNos.forEach(soundsNo => {
      if (!targetRegular.soundsNos.includes(soundsNo)) {
        targetRegular.soundsNos.push(soundsNo);
      }
    });
  };

  const createPresetFromActiveTrack = (name: string): SettingsState.Preset | null => {
    const track = data.arrange.tracks[control.outline.trackIndex];
    if (track == undefined) throw new Error();
    if (track.method !== "piano") {
      logger.outputError("Preset registration is currently available for piano tracks only.");
      return null;
    }
    if (track.bank.regulars.length === 0) {
      logger.outputError("No regular patterns are registered in the active track library.");
      return null;
    }

    return {
      name,
      method: "piano",
      bank: createRegularPianoBank(track.bank),
    };
  };

  const regist = (name: string) => {
    const exists = settings.library.presets.some(preset => preset.name === name);
    if (exists) {
      logger.outputError(`The specified preset already exists. [${name}]`);
      return;
    }

    const preset = createPresetFromActiveTrack(name);
    if (preset == null) return;

    settings.library.presets.push(preset);
    ctx.commit.settings();
    logger.outputInfo(`Registered library preset. [${name}]`);
  };

  const overwrite = (name: string) => {
    const index = settings.library.presets.findIndex(preset => preset.name === name);
    if (index === -1) {
      logger.outputError(`The specified preset does not exist. [${name}]`);
      return;
    }

    const preset = createPresetFromActiveTrack(name);
    if (preset == null) return;

    settings.library.presets[index] = preset;
    ctx.commit.settings();
    logger.outputInfo(`Overwrote library preset. [${name}]`);
  };

  const deletePreset = (name: string) => {
    const index = settings.library.presets.findIndex(preset => preset.name === name);
    if (index === -1) {
      logger.outputError(`The specified preset does not exist. [${name}]`);
      return;
    }

    settings.library.presets.splice(index, 1);
    ctx.commit.settings();
    logger.outputInfo(`Deleted library preset. [${name}]`);
  };

  const getVoicingCount = (preset: SettingsState.Preset) => {
    switch (preset.method) {
      case "piano":
        return preset.bank.regulars.reduce((total, cur) => total + cur.soundsNos.length, 0);
      case "guitar":
        return preset.bank.voicingPatterns.length;
    }
  };

  const getBackingCount = (preset: SettingsState.Preset) => {
    switch (preset.method) {
      case "piano":
        return preset.bank.backingPatterns.length;
      case "guitar":
        return 1;
    }
  };

  const list = () => {
    const presets = settings.library.presets;
    if (presets.length === 0) {
      logger.outputInfo("No library presets are registered.");
      return;
    }

    terminal.outputs.push({
      type: "table",
      table: {
        cols: [
          { headerName: "Name", width: 280, attr: "def" },
          { headerName: "Method", width: 110, attr: "item" },
          { headerName: "Backings", width: 130, attr: "sentence", isNumber: true },
          { headerName: "Voicings", width: 130, attr: "sentence", isNumber: true },
        ],
        table: presets.map(preset => [
          preset.name,
          preset.method,
          getBackingCount(preset).toString(),
          getVoicingCount(preset).toString(),
        ]),
      },
    });
    ctx.commit.terminal();
  };

  const applyPianoPreset = (
    preset: SettingsState.PianoPreset,
    targetLib: PianoEditorState.Bank,
  ) => {
    preset.bank.regulars.forEach(regular => {
      const backingNo = (() => {
        if (regular.backingNo === -1) return -1;

        const backingPattern = preset.bank.backingPatterns.find(pattern => {
          return pattern.no === regular.backingNo;
        });
        if (backingPattern == undefined) throw new Error();

        return addPianoBackingPattern(backingPattern, targetLib);
      })();

      const soundsNos = regular.soundsNos.map(soundsNo => {
        const soundsPattern = preset.bank.soundsPatterns.find(pattern => {
          return pattern.no === soundsNo;
        });
        if (soundsPattern == undefined) throw new Error();

        return addPianoSoundsPattern(soundsPattern, targetLib);
      });

      addPianoRegular({
        backingNo,
        sortNo: regular.sortNo,
        soundsNos,
      }, targetLib);
    });
  };

  const apply = (name: string) => {
    const preset = findPreset(name);
    if (preset == undefined) {
      logger.outputError(`The specified preset does not exist. [${name}]`);
      return;
    }

    const track = data.arrange.tracks[control.outline.trackIndex];
    if (track == undefined) throw new Error();
    if (track.method !== preset.method) {
      logger.outputError(`The active track method does not match the preset. [${track.method} -> ${preset.method}]`);
      return;
    }

    switch (preset.method) {
      case "piano":
        if (track.method !== "piano") throw new Error();
        applyPianoPreset(preset, track.bank);
        break;
      case "guitar":
        logger.outputError("Guitar library preset apply is not implemented yet.");
        return;
    }

    ctx.commit.data();
    logger.outputInfo(`Applied library preset to the active track. [${name}]`);
  };

  const createLibraryFileFromActiveTrack = (): ArrangeState.TrackBank => {
    const track = data.arrange.tracks[control.outline.trackIndex];
    if (track == undefined) throw new Error();

    switch (track.method) {
      case "piano":
        if (track.bank.regulars.length === 0) {
          logger.outputError("No regular patterns are registered in the active track library.");
          throw new Error("No regular patterns are registered in the active track library.");
        }
        return {
          method: "piano",
          bank: createRegularPianoBank(track.bank),
        };
      case "guitar":
        return {
          method: "guitar",
          bank: clone(track.bank),
        };
    }
  };

  const applyLibraryFile = (libraryFile: ArrangeState.TrackBank) => {
    const track = data.arrange.tracks[control.outline.trackIndex];
    if (track == undefined) throw new Error();
    if (track.method !== libraryFile.method) {
      return false;
    }

    switch (libraryFile.method) {
      case "piano":
        if (track.method !== "piano") throw new Error();
        applyPianoPreset({ name: "", method: "piano", bank: libraryFile.bank }, track.bank);
        break;
      case "guitar":
        logger.outputError("Guitar library file import is not implemented yet.");
        return false;
    }

    ctx.commit.data();
    return true;
  };

  const exportLibrary = () => {
    let libraryFile: ArrangeState.TrackBank;
    try {
      libraryFile = createLibraryFileFromActiveTrack();
    } catch {
      return;
    }

    (async () => {
      logger.outputInfo("Select the file to export.");
      terminal.wait = true;
      const path = await saveLibraryFilePath(settings.envs.SCH_FILE_DIR);
      if (path == null) {
        logger.outputInfo("Library export was canceled.");
        return;
      }

      const exportPath = path.toLowerCase().endsWith(".shl")
        ? path
        : `${path}.shl`;
      await CompressedJsonFile.write(exportPath, libraryFile);
      logger.outputInfo(`Exported library file. [${getFileName(exportPath)}]`);
    })().catch((error) => {
      console.error("Failed to export library file:", error);
      logger.outputError("Failed to export library file.");
    }).finally(finishWaiting);
  };

  const importLibrary = () => {
    (async () => {
      logger.outputInfo("Select the library file to import.");
      terminal.wait = true;
      const path = await openLibraryFilePath(settings.envs.SCH_FILE_DIR);
      if (path == null) {
        logger.outputInfo("Library import was canceled.");
        return;
      }

      const readResult = await CompressedJsonFile.read<ArrangeState.TrackBank>(path);
      switch (readResult.type) {
        case "read-error":
          console.error("Failed to read library file:", readResult.error);
          logger.outputError("Failed to read library file.");
          return;
        case "parse-error":
          console.error("Failed to parse library file:", readResult.error);
          logger.outputError("Failed to parse library file.");
          return;
      }

      try {
        if (applyLibraryFile(readResult.value)) {
          logger.outputInfo(`Imported library file to the active track. [${getFileName(path)}]`);
        } else {
          logger.outputError("Invalid library data.");
        }
      } catch (error) {
        console.error("Invalid library data:", error);
        logger.outputError("Invalid library data.");
      }
    })().catch((error) => {
      console.error("Failed to import library file:", error);
      logger.outputError("Failed to import library file.");
    }).finally(finishWaiting);
  };

  const outputReference = () => {
    terminal.outputs.push({
      type: "table",
      table: {
        cols: [
          { headerName: "Command", width: 170, attr: "def" },
          { headerName: "Usage", width: 420, attr: "sentence" },
        ],
        table: [
          ["regist <name>", "Register the active track library as a global preset."],
          ["list", "Displays global library presets."],
          ["overwrite <name>", "Overwrite a global preset from the active track library."],
          ["apply <name>", "Apply a global preset to the active track library."],
          ["delete <name>", "Delete a global library preset."],
          ["export", "Export the active track library to a file."],
          ["import", "Import a library file into the active track library."],
        ],
      },
    });
    ctx.commit.terminal();
  };

  return {
    ...defaultProps,
    funcKey: "preset",
    usage: "Manage arrange library presets.",
    args: [
      {
        name: "action",
        getCandidate: () => actions,
      },
      {
        name: "name",
        getCandidate: (args) => {
          return ["apply", "overwrite", "delete"].includes(args[0])
            ? settings.library.presets.map(preset => preset.name)
            : [];
        },
      },
    ],
    callback: (args) => {
      const action = args[0];
      if (action == undefined || action === "") {
        outputReference();
        return;
      }

      switch (action) {
        case "regist": {
          const name = logger.validateRequired(args[1], 2);
          if (name == null) return;
          regist(name);
        } break;
        case "list":
          list();
          break;
        case "apply": {
          const name = logger.validateRequired(args[1], 2);
          if (name == null) return;
          apply(name);
        } break;
        case "overwrite": {
          const name = logger.validateRequired(args[1], 2);
          if (name == null) return;
          overwrite(name);
        } break;
        case "delete": {
          const name = logger.validateRequired(args[1], 2);
          if (name == null) return;
          deletePreset(name);
        } break;
        case "export":
          exportLibrary();
          break;
        case "import":
          importLibrary();
          break;
      }
    },
  };
};

export default createPresetCatalog;
