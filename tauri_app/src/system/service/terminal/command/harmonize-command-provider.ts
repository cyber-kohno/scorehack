import ArrangeState from "../../../store/state/data/arrange/arrange-state";
import SoundFontFile from "../../../infra/audio/soundfont-file";
import UserSoundFontCache from "../../../infra/audio/user-soundfont-cache";
import UserSoundFontPath from "../../../infra/audio/user-soundfont-path";
import PlaybackState from "../../../store/state/playback-state";
import { prepareUserSoundFont, UserSoundFontPrepareError } from "../../playback/user-soundfont-service";
import TerminalCommand from "../terminal-command";
import useSoundfontLoader from "../../playback/soundfont-loader";

const createHarmonizeCommands = (ctx: TerminalCommand.Context) => {
  const { control, data, ref, settings, terminal, logger } = ctx;

  const { isLoadSoundFont, loadSoundFont } = useSoundfontLoader();

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
    const soundFontRef = track.soundFontRef;
    if (soundFontRef == undefined) return track.soundFont;

    switch (soundFontRef.source) {
      case "builtin": return soundFontRef.name;
      case "user": return `${soundFontRef.definitionName} ${SoundFontFile.formatPresetKey(soundFontRef)}`;
    }
  };

  const list = (): TerminalCommand.Props[] => {
    const defaultProps = TerminalCommand.createDefaultProps("harmonize");
    return [
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
                    item.isMute ? "●" : "",
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
            logger.outputInfo(`Active track changed. [${prev} → ${arg0}]`);
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
            track.soundFont = sfName;
            track.soundFontRef = {
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

          terminal.wait = true;
          (async () => {
            const soundFontRef = {
              source: "user",
              definitionName: arg0,
              bank: presetKey.bank,
              program: presetKey.program,
            } as const;
            const { preset } = await prepareUserSoundFont(soundFontRef);

            const track = getCurrHarmonizeTrack();
            track.soundFont = "";
            track.soundFontRef = soundFontRef;
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
          logger.outputInfo(`Changed volume. [${prev} → ${arg0}]`);
          ctx.commit.data();
        },
      },
    ];
  };
  return {
    list,
  };
};
export default createHarmonizeCommands;
