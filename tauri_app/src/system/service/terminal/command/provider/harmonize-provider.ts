import ArrangeState from "../../../../store/state/data/arrange/arrange-state";
import SoundFontFile from "../../../../infra/audio/soundfont-file";
import UserSoundFontCache from "../../../../infra/audio/user-soundfont-cache";
import UserSoundFontPath from "../../../../infra/audio/user-soundfont-path";
import PlaybackState from "../../../../store/state/playback-state";
import type SettingsState from "../../../../store/state/settings-state";
import { prepareUserSoundFont, UserSoundFontPrepareError } from "../../../playback/user-soundfont-service";
import TerminalCommand from "../../terminal-command";
import useSoundfontLoader from "../../../playback/soundfont-loader";
import useUserSoundfontLoader from "../../../playback/user-soundfont-loader";
import createInstCatalog from "../catalog/inst-catalog";
import createTrackCatalog from "../catalog/track-catalog";
import createVoiceCatalog from "../catalog/voice-catalog";

const createHarmonizeProvider = (ctx: TerminalCommand.Context) => {
  const { control, data, ref, settings, terminal, logger } = ctx;

  const { isLoadSoundFont, loadSoundFont } = useSoundfontLoader();
  const { isLoadUserSoundFont } = useUserSoundfontLoader();

  const { getCurrHarmonizeTrack } = ctx.selectors.outline;

  const lsh = () => {
    const func = terminal.availableFuncs.find((f) => f.funcKey === "lsh");
    if (func == undefined) throw new Error();
    func.callback([]);
  };

  const findUserSoundFont = (name: string) => {
    return settings.userSoundFonts.find((soundFont) => soundFont.name === name);
  };

  const formatTrackSoundFont = (track: ArrangeState.Track) => {
    const instRef = track.instRef;
    if (instRef == undefined) return "";

    switch (instRef.source) {
      case "builtin": return instRef.name;
      case "soundfont": return `${instRef.definitionName} ${SoundFontFile.formatPresetKey(instRef)}`;
    }
  };

  const commands = (): TerminalCommand.Props[] => {
    const defaultProps = TerminalCommand.createDefaultProps("harmonize");
    return [
      createInstCatalog(ctx, "harmonize"),
      createTrackCatalog(ctx, "harmonize"),
      createVoiceCatalog(ctx, "harmonize"),
      {
        ...defaultProps,
        funcKey: "lsh",
        usage: "Displays a list of existing harmony tracks.",
        args: [],
        callback: () => {
          const trackIndex = control.outline.trackIndex;
          const tracks = data.arrange.tracks.map((t, i) => ({
            ...t,
            isActive: trackIndex === i,
          }));
          terminal.outputs.push({
            type: "table",
            table: {
              cols: [
                {
                  headerName: "Index",
                  width: 80,
                  attr: "item",
                  isNumber: true,
                },
                { headerName: "Name", width: 120, attr: "item" },
                { headerName: "Method", width: 100, attr: "def" },
                { headerName: "Soundfont", width: 220, attr: "def" },
                {
                  headerName: "Vol",
                  width: 70,
                  attr: "sentence",
                  isNumber: true,
                },
                { headerName: "Mute", width: 80, attr: "sentence" },
              ],
              table: (() =>
                tracks.map((item, i) => {
                  const active = item.isActive ? "*" : "";
                  return [
                    i.toString(),
                    active + item.name,
                    item.method,
                    formatTrackSoundFont(item),
                    item.volume.toString(),
                    item.isMute ? "*" : "",
                  ];
                }))(),
            },
          });
        },
      },
      {
        ...defaultProps,
        funcKey: "mkh",
        usage: "Create a new harmonize track.",
        args: [{ name: "trackName?: string" }],
        callback: (args) => {
          const tracks = data.arrange.tracks;
          const name = args[0] ?? `track${tracks.length}`;
          tracks.push(ArrangeState.createPianoTrackInitial(name));
          ref.trackArr.push([]);
          ctx.commit.data();
          ctx.commit.ref();
          logger.outputInfo(`Created a new track. [${name}]`);
          lsh();
        },
      },
      {
        ...defaultProps,
        funcKey: "cht",
        usage: "Change the active track by name.",
        args: [
          {
            name: "trackName: string",
            getCandidate: () =>
              data.arrange.tracks.map((ht) => ht.name),
          },
        ],
        callback: (args) => {
          const outline = control.outline;
          const tracks = data.arrange.tracks;
          const arg0 = logger.validateRequired(args[0], 1);
          if (arg0 == null) return;
          const nextIndex = tracks.findIndex((st) => st.name === arg0);
          if (nextIndex === -1) {
            logger.outputError(``);
            return;
          }
          const prev = tracks[outline.trackIndex];
          try {
            if (tracks[nextIndex] == undefined) throw new Error();
            outline.trackIndex = nextIndex;
            logger.outputInfo(`Active track changed. [${prev} ↁE${arg0}]`);
            ctx.commit.control();
            lsh();
          } catch {
            logger.outputError(
              `The destination track does not exist. [${nextIndex}]`,
            );
          }
        },
      },
      {
        ...defaultProps,
        funcKey: "method",
        usage: "Change the arrange method for the active track.",
        args: [
          {
            name: "method: piano | guitar",
            getCandidate: () => [...ArrangeState.ArrangeMedhods],
          },
        ],
        callback: (args) => {
          const arg0 = logger.validateRequired(args[0], 1);
          if (arg0 == null) return;
          if (arg0 !== "piano" && arg0 !== "guitar") {
            logger.outputError(`The specified arrange method does not exist. [${arg0}]`);
            return;
          }

          const track = getCurrHarmonizeTrack();
          const prev = track.method;
          if (prev === arg0) {
            logger.outputInfo(`Arrange method is already selected. [${arg0}]`);
            return;
          }

          track.method = arg0;
          track.relations = [];
          if (arg0 === "piano") {
            track.pianoLib = ArrangeState.createPianoTrackInitial(track.name).pianoLib;
          } else {
            track.guitarLib = ArrangeState.createGuitarTrackInitial(track.name).guitarLib;
          }
          control.outline.arrange = null;

          ctx.commit.control();
          ctx.commit.dataAndRecalculate();
          logger.outputInfo(`Changed arrange method. [${prev} -> ${arg0}]`);
          lsh();
        },
      },
      {
        ...defaultProps,
        funcKey: "sf",
        usage: "Sets the SoundFont for the active track.",
        args: [
          {
            name: "soundfontName: string",
            getCandidate: () => PlaybackState.InstrumentNames,
          },
        ],
        callback: (args) => {
          const arg0 = logger.validateRequired(args[0], 1);
          if (arg0 == null) return;
          try {
            const sfName = PlaybackState.validateSFName(arg0);
            const track = getCurrHarmonizeTrack();
            track.instRef = {
              source: "builtin",
              name: sfName,
            };

            const endProc = () => {
              logger.outputInfo(
                `Set a soundfont as the active track. [${sfName}]`,
              );
              lsh();
            };
            if (!isLoadSoundFont(sfName)) {
              logger.outputInfo(`SoundFont not yet loaded. [${sfName}]`);
              logger.outputInfo(`Loading...`);
              terminal.wait = true;
              loadSoundFont(sfName).then(() => {
                endProc();
                terminal.wait = false;
                ctx.commit.terminal();
                ctx.commit.data();
              });
            } else {
              endProc();
              ctx.commit.data();
            }
          } catch {
            logger.outputError(
              `The specified soundfont does not exist. [${arg0}]`,
            );
          }
        },
      },
      {
        ...defaultProps,
        funcKey: "ufs",
        usage: "Sets a user SoundFont for the active track.",
        args: [
          {
            name: "soundFontName: string",
            getCandidate: () => settings.userSoundFonts.map((soundFont) => soundFont.name),
          },
          {
            name: "bankProgram",
            getCandidate: (args) => {
              const soundFont = findUserSoundFont(args[0]);
              if (soundFont == undefined) return [];
              return UserSoundFontCache.getPresetKeys(UserSoundFontPath.resolvePath(soundFont, settings));
            },
          },
        ],
        callback: (args) => {
          const arg0 = logger.validateRequired(args[0], 1);
          if (arg0 == null) return;

          const arg1 = logger.validateRequired(args[1], 2);
          if (arg1 == null) return;

          const soundFont = findUserSoundFont(arg0);
          if (soundFont == undefined) {
            logger.outputError(`The specified SoundFont definition does not exist. [${arg0}]`);
            return;
          }

          const presetKey = SoundFontFile.parsePresetKey(arg1);
          if (presetKey == null) {
            logger.outputError(`The preset key must be formatted as 000_000. [${arg1}]`);
            return;
          }

          const instRef = {
            source: "soundfont",
            definitionName: arg0,
            bank: presetKey.bank,
            program: presetKey.program,
          } as const;

          terminal.wait = true;
          if (!isLoadUserSoundFont(instRef)) {
            logger.outputInfo(`User SoundFont not yet loaded. [${arg0} ${arg1}]`);
            logger.outputInfo(`Loading...`);
            ctx.commit.terminal();
          }

          (async () => {
            const { preset } = await prepareUserSoundFont(instRef);

            const track = getCurrHarmonizeTrack();
            track.instRef = instRef;
            logger.outputInfo(
              `Set a user SoundFont as the active track. [${arg0} ${arg1} ${preset.name}]`,
            );
            lsh();
          })().catch((error) => {
            console.error("Failed to set user SoundFont:", error);
            if (error instanceof UserSoundFontPrepareError) {
              logger.outputError(error.message);
              return;
            }
            logger.outputError(`Failed to set user SoundFont. [${arg0} ${arg1}]`);
          }).finally(() => {
            terminal.wait = false;
            ctx.commit.data();
            ctx.commit.terminal();
          });
        },
      },
      {
        ...defaultProps,
        funcKey: "notation",
        usage: "Change notation settings.",
        args: [
          {
            name: "property: degree-basis",
            getCandidate: () => ["degree-basis"],
          },
          {
            name: "value: tonality | relative-major",
            getCandidate: (args) => args[0] === "degree-basis"
              ? ["tonality", "relative-major"]
              : [],
          },
        ],
        callback: (args) => {
          const prop = logger.validateRequired(args[0], 1);
          if (prop == null) return;
          const value = logger.validateRequired(args[1], 2);
          if (value == null) return;

          if (prop !== "degree-basis") {
            logger.outputError(`The specified notation property does not exist. [${prop}]`);
            return;
          }
          if (value !== "tonality" && value !== "relative-major") {
            logger.outputError(`The specified degree basis does not exist. [${value}]`);
            return;
          }

          const prev = settings.notation.degreeBasis;
          settings.notation.degreeBasis = value as SettingsState.DegreeBasis;
          ctx.commit.settings();
          logger.outputInfo(`Changed degree basis. [${prev} -> ${value}]`);
        },
      },
      {
        ...defaultProps,
        funcKey: "volume",
        usage: "Adjust volume for the active track.",
        args: [{ name: "value" }],
        callback: (args) => {
          const arg0 = logger.validateRequired(args[0], 1);
          if (arg0 == null) return;
          const arg0Number = logger.validateNumber(arg0, 1);
          if (arg0Number == null) return;
          const track = getCurrHarmonizeTrack();
          const prev = track.volume;
          track.volume = arg0Number;
          logger.outputInfo(`Changed volume. [${prev} ↁE${arg0}]`);
          ctx.commit.data();
        },
      },
    ];
  };
  return {
    commands,
  };
};
export default createHarmonizeProvider;
