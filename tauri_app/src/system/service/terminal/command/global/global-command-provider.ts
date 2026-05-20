import FileUtil from "../../../../infra/file/fileUtil";
import { get } from "svelte/store";
import { dataStore, derivedStore } from "../../../../store/global-store";
import UserSoundFontCache from "../../../../infra/audio/user-soundfont-cache";
import UserSoundFontPath from "../../../../infra/audio/user-soundfont-path";
import SettingsFile from "../../../../infra/settings/settings-file";
import { openDirectoryPath, openSoundFontFilePath } from "../../../../infra/tauri/dialog";
import type DataState from "../../../../store/state/data/data-state";
import type { TrackSoundFontRef } from "../../../../store/state/data/track-soundfont-ref";
import PlaybackState from "../../../../store/state/playback-state";
import SettingsState from "../../../../store/state/settings-state";
import { formatUserSoundFontRef, prepareUserSoundFont, UserSoundFontPrepareError, type UserTrackSoundFontRef } from "../../../playback/user-soundfont-service";
import TerminalCommand from "../../terminal-command";
import useSoundfontLoader from "../../../playback/soundfont-loader";
import createRfsCommand from "./rfs-command";
import MusicXmlExporter from "../../../export/musicxml-exporter";

const createGlobalCommands = (ctx: TerminalCommand.Context) => {
  const { logger, settings, terminal } = ctx;
  const { isLoadSoundFont, loadSoundFont } = useSoundfontLoader();

  const fileUtil = FileUtil.getUtil();
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

  const saveTargets = ["project", "settings"];
  const exportTargets = ["musicxml"];

  const isUserSoundFontRef = (ref: TrackSoundFontRef | undefined): ref is UserTrackSoundFontRef => {
    return ref?.source === "user";
  };

  const collectUserSoundFontRefs = (scoreData: DataState.Value) => {
    const refs = [
      ...scoreData.scoreTracks.map((track) => track.soundFontRef),
      ...scoreData.arrange.tracks.map((track) => track.soundFontRef),
    ].filter(isUserSoundFontRef);

    const uniqueRefs = new Map<string, UserTrackSoundFontRef>();
    refs.forEach((ref) => {
      uniqueRefs.set(`${ref.definitionName}:${ref.bank}:${ref.program}`, ref);
    });
    return [...uniqueRefs.values()];
  };

  const list = (props: {
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
      {
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

          if (target === "settings") {
            terminal.wait = true;
            (async () => {
              await SettingsFile.saveSettings(settings);
              logger.outputInfo("Settings saved successfully.");
            })().catch((error) => {
              console.error("Failed to save settings:", error);
              logger.outputError("Failed to save settings.");
            }).finally(() => {
              terminal.wait = false;
              ctx.commit.terminal();
            });
            return;
          }

          if (target !== "project") {
            logger.outputError(`Unknown save target. [${target}]`);
            ctx.commit.terminal();
            return;
          }

          logger.outputInfo("Select the file to save.");
          terminal.wait = true;
          fileUtil.saveScoreFile({
            defaultDirectory: settings.envs.SCH_FILE_DIR,
            success: (handle) => {
              logger.outputInfo(`File saved successfully. [${handle.name}]`);
              terminal.wait = false;
              ctx.commit.terminal();
            },
            cancel() {
              logger.outputInfo("File saveing was canceled.");
              terminal.wait = false;
              ctx.commit.terminal();
            },
          });
        },
      },
      {
        ...defaultProps,
        funcKey: "export",
        usage: "Export the active data to an external file format.",
        args: [
          {
            name: "format: string",
            getCandidate: () => exportTargets,
          },
        ],
        callback: (args) => {
          const format = logger.validateRequired(args[0], 1);
          if (format == null) return;

          if (format !== "musicxml") {
            logger.outputError(`Unknown export format. [${format}]`);
            ctx.commit.terminal();
            return;
          }

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
              terminal.wait = false;
              ctx.commit.terminal();
            },
            cancel: () => {
              logger.outputInfo("MusicXML export was canceled.");
              terminal.wait = false;
              ctx.commit.terminal();
            },
          });
        },
      },
      {
        ...defaultProps,
        funcKey: "load",
        usage: "Loads music score data.",
        args: [],
        callback: () => {
          terminal.wait = true;
          fileUtil.loadScoreFile(
            (handle) => {
              logger.outputInfo(`File load successfully. [${handle.name}]`);
              const loadedData = get(dataStore);
              const sfNames = Array.from(
                new Set(
                  [
                    ...loadedData.scoreTracks.map((track) => track.soundFont),
                    ...loadedData.arrange.tracks.map((track) => track.soundFont),
                  ].filter((sfName) => sfName !== ""),
                ),
              ).map((sfName) => PlaybackState.validateSFName(sfName));
              const userSoundFontRefs = collectUserSoundFontRefs(loadedData);

              (async () => {
                for (const sfName of sfNames) {
                  if (isLoadSoundFont(sfName)) continue;
                  logger.outputInfo(`Loading... [${sfName}]`);
                  ctx.commit.terminal();
                  await loadSoundFont(sfName);
                }
                for (const soundFontRef of userSoundFontRefs) {
                  logger.outputInfo(`Loading... [${formatUserSoundFontRef(soundFontRef)}]`);
                  ctx.commit.terminal();
                  try {
                    const { preset } = await prepareUserSoundFont(soundFontRef);
                    logger.outputInfo(`User SoundFont loaded. [${formatUserSoundFontRef(soundFontRef)} ${preset.name}]`);
                  } catch (error) {
                    console.error("Failed to load user SoundFont:", error);
                    if (error instanceof UserSoundFontPrepareError) {
                      logger.outputError(error.message);
                    } else {
                      logger.outputError(`Failed to load user SoundFont. [${formatUserSoundFontRef(soundFontRef)}]`);
                    }
                  }
                  ctx.commit.terminal();
                }
                return;
              })().then(() => {
                logger.outputInfo(`Soundfont load successfully`);
                terminal.wait = false;
                ctx.commit.terminal();
              }).catch((error) => {
                console.error("Failed to load SoundFont:", error);
                logger.outputError("Failed to load SoundFont.");
                terminal.wait = false;
                ctx.commit.terminal();
              });
              ctx.commit.terminal();
            },
            () => {
              logger.outputInfo("File loading was canceled.");
              terminal.wait = false;
              ctx.commit.terminal();
            },
            settings.envs.SCH_FILE_DIR,
          );
        },
      },
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
      createRfsCommand(ctx),
    ];
  };
  return {
    list,
  };
};

export default createGlobalCommands;
