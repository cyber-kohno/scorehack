import FileUtil from "../../../../infra/file/fileUtil";
import FilePathRef from "../../../../infra/file/file-path-ref";
import SoundFontFile from "../../../../infra/audio/soundfont-file";
import UserSoundFontCache from "../../../../infra/audio/user-soundfont-cache";
import UserSoundFontPath from "../../../../infra/audio/user-soundfont-path";
import type MelodyState from "../../../../store/state/data/melody-state";
import PlaybackState from "../../../../store/state/playback-state";
import useScrollService from "../../../common/scroll-service";
import { prepareUserSoundFont, UserSoundFontPrepareError } from "../../../playback/user-soundfont-service";
import TerminalCommand from "../../terminal-command";
import useSoundfontLoader from "../../../playback/soundfont-loader";
import useUserSoundfontLoader from "../../../playback/user-soundfont-loader";
import createInstCatalog from "../catalog/inst-catalog";
import createTrackCatalog from "../catalog/track-catalog";
import createVoiceCatalog from "../catalog/voice-catalog";

const createMelodyProvider = (ctx: TerminalCommand.Context) => {
    const { control, data, ref, settings, terminal, logger } = ctx;
    const { getCurrScoreTrack } = ctx.selectors.melody;
    const { isLoadSoundFont, loadSoundFont } = useSoundfontLoader();
    const { isLoadUserSoundFont } = useUserSoundfontLoader();

    const commands = (): TerminalCommand.Props[] => {

        const defaultProps = TerminalCommand.createDefaultProps('melody');
        const fileUtil = FileUtil.getUtil();

        const {resetScoreTrackRef} = useScrollService();

        const lss = () => {
            const func = terminal.availableFuncs.find(f => f.funcKey === 'lss');
            if (func == undefined) throw new Error();
            func.callback([]);
        }
        const lsa = () => {
            const func = terminal.availableFuncs.find(f => f.funcKey === 'lsa');
            if (func == undefined) throw new Error();
            func.callback([]);
        }
        const findUserSoundFont = (name: string) => {
            return settings.userSoundFonts.find((soundFont) => soundFont.name === name);
        };
        const formatTrackSoundFont = (track: MelodyState.ScoreTrack) => {
            const ref = track.instRef;
            if (ref == undefined) return "";
            switch (ref.source) {
                case "builtin": return ref.name;
                case "soundfont": {
                    return `${ref.definitionName} ${SoundFontFile.formatPresetKey(ref)}`;
                }
            }
        };
        return [
            createInstCatalog(ctx, "melody"),
            createTrackCatalog(ctx, "melody"),
            createVoiceCatalog(ctx, "melody"),
            {
                ...defaultProps,
                funcKey: 'lss',
                usage: 'Displays a list of existing score tracks.',
                args: [],
                callback: () => {
                    const trackIndex = control.melody.trackIndex;
                    const tracks = data.scoreTracks.map((t, i) => ({ ...t, isActive: trackIndex === i }));
                    terminal.outputs.push({
                        type: 'table',
                        table: {
                            cols: [
                                { headerName: 'Index', width: 80, attr: 'item', isNumber: true },
                                { headerName: 'Name', width: 120, attr: 'item' },
                                { headerName: 'Soundfont', width: 220, attr: 'def' },
                                { headerName: 'Vol', width: 80, attr: 'sentence', isNumber: true },
                                { headerName: 'Mute', width: 80, attr: 'sentence' },
                                { headerName: 'Notes', width: 80, attr: 'sentence', isNumber: true },
                            ],
                            table: (() => tracks.map((item, i) => {
                                const active = item.isActive ? '*' : '';
                                return [
                                    i.toString(),
                                    active + item.name,
                                    formatTrackSoundFont(item),
                                    item.volume.toString(),
                                    item.isMute ? '*' : '',
                                    item.notes.length.toString()
                                ]
                            }))()
                        }
                    });
                }
            },
            {
                ...defaultProps,
                funcKey: 'lsa',
                usage: 'Displays a list of existing audio tracks.',
                args: [],
                callback: () => {
                    const trackIndex = control.melody.trackIndex;
                    const tracks = data.audioTracks.map((t, i) => ({ ...t, isActive: trackIndex === i }));
                    terminal.outputs.push({
                        type: 'table',
                        table: {
                            cols: [
                                { headerName: 'Index', width: 80, attr: 'item', isNumber: true },
                                { headerName: 'Name', width: 120, attr: 'item' },
                                { headerName: 'File', width: 220, attr: 'resource' },
                                { headerName: 'Vol', width: 80, attr: 'sentence', isNumber: true },
                                { headerName: 'Mute', width: 80, attr: 'sentence' },
                                { headerName: 'Adjust', width: 80, attr: 'sentence', isNumber: true },
                            ],
                            table: (() => tracks.map((item, i) => {
                                return [
                                    i.toString(),
                                    item.name,
                                    item.pathRef == undefined ? "" : FilePathRef.formatPathRef(item.pathRef),
                                    item.volume.toString(),
                                    item.isMute ? '*' : '',
                                    item.adjust.toString()
                                ]
                            }))()
                        }
                    });
                }
            },
            {
                ...defaultProps,
                funcKey: 'mks',
                usage: 'Create a new score track.',
                args: [{ name: 'trackName?: string' }],
                callback: (args) => {
                    const tracks = data.scoreTracks;
                    const name = args[0] ?? `track${tracks.length}`;
                    tracks.push({
                        name,
                        isMute: false,
                        volume: 10,
                        notes: []
                    });
                    ref.trackArr.push([]);
                    ref.noteRefs.push([]);
                    logger.outputInfo(`Created a new track. [${name}]`);
                    ctx.commit.data();
                    ctx.commit.ref();
                    lss();
                }
            },
            {
                ...defaultProps,
                funcKey: 'mka',
                usage: 'Create a new audio track.',
                args: [{ name: 'audioName?: string' }],
                callback: (args) => {
                    const audios = data.audioTracks;
                    const name = args[0] ?? `audio${audios.length}`;
                    audios.push({
                        name,
                        isMute: false,
                        volume: 10,
                        adjust: 0,
                    });
                    ref.trackArr.push([]);
                    logger.outputInfo(`Created a new audio. [${name}]`);
                    ctx.commit.data();
                    ctx.commit.ref();
                    lsa();
                }
            },
            {
                ...defaultProps,
                funcKey: 'aul',
                usage: 'Upload an audio file.',
                args: [
                    { name: 'name', getCandidate: () => data.audioTracks.map(a => a.name) }
                ],
                callback: (args) => {
                    const arg0 = logger.validateRequired(args[0], 1);
                    if (arg0 == null) return;
                    const audio = data.audioTracks.find(a => a.name === arg0);
                    if (audio == undefined) {
                        logger.outputError(`The specified audio track does not exist. [${arg0}]`)
                        return;
                    }
                    terminal.wait = true;
                    fileUtil.loadMp3(audio,
                        (handle) => {
                            logger.outputInfo(`The audio file was successfully uploaded. [${handle.name}]`);
                            terminal.wait = false;
                            lsa();
                            ctx.commit.data();
                            ctx.commit.terminal();
                        }, () => {
                            logger.outputInfo('File upload canceled.');
                            terminal.wait = false;
                            ctx.commit.data();
                            ctx.commit.terminal();
                        });
                }
            },
            {
                ...defaultProps,
                funcKey: 'rms',
                usage: 'Deletes the music track.',
                args: [],
                callback: (args) => {
                    const tracks = data.scoreTracks;
                    const melody = control.melody;
                    let delIndex = melody.trackIndex;
                    const arg0 = logger.validateRequired(args[0], 1);
                    if (arg0 == null) return;
                    const arg0Number = logger.validateNumber(arg0, 1);
                    if (arg0Number == null) return;
                    delIndex = arg0Number;
                    if (tracks.length === 1) {
                        logger.outputError('You cannot delete all tracks.')
                        return;
                    }
                    const name = tracks[delIndex].name;
                    tracks.splice(delIndex, 1);
                    ref.trackArr.splice(delIndex, 1);
                    ref.noteRefs.splice(delIndex, 1);
                    // 蜈磯ｭ莉･螟悶′驕ｸ謚槭＆繧後※縺・ｋ蝣ｴ蜷医°縺､縲√い繧ｯ繝・ぅ繝悶ｈ繧贋ｸ翫′蜑企勁縺輔ｌ蝣ｴ蜷・
                    if (delIndex > 0 && delIndex <= melody.trackIndex) melody.trackIndex--;
                    logger.outputInfo(`Track deleted. [${name}].`);
                    ctx.commit.data();
                    ctx.commit.ref();
                    ctx.commit.control();
                }
            },
            // {
            //     ...defaultProps,
            //     funcKey: 'chi',
            //     usage: 'Change the active track by index.',
            //     args: [{
            //         name: 'trackIndex: number',
            //         getCandidate: () => lastStore.data.scoreTracks.map((_, i) => i.toString())
            //     }],
            //     callback: (args) => {
            //         const melody = lastStore.control.melody;
            //         const arg0 = logger.validateRequired(args[0], 1);
            //         if (arg0 == null) return;
            //         const nextIndex = logger.validateNumber(arg0, 1);
            //         if (nextIndex == null) return;
            //         const prev = melody.trackIndex;
            //         try {
            //             changeScoreTrack(nextIndex);
            //             logger.outputInfo(`Active track changed. [${prev} 竊・${nextIndex}]`);
            //             reducer.updateTarget();
            //             lss();
            //         } catch {
            //             logger.outputError(`The destination track does not exist. [${nextIndex}]`);
            //         }
            //     }
            // },
            {
                ...defaultProps,
                funcKey: 'chs',
                usage: 'Change the active track by name.',
                args: [{
                    name: 'trackName: string',
                    getCandidate: () => data.scoreTracks.map(st => st.name)
                }],
                callback: (args) => {
                    const melody = control.melody;
                    const tracks = data.scoreTracks;
                    const arg0 = logger.validateRequired(args[0], 1);
                    if (arg0 == null) return;
                    const nextIndex = tracks.findIndex(st => st.name === arg0);
                    if (nextIndex === -1) {
                        logger.outputError(``);
                        return;
                    }
                    const prev = tracks[melody.trackIndex];
                    try {
                        if (tracks[nextIndex] == undefined) throw new Error();
                        melody.trackIndex = nextIndex;
                        logger.outputInfo(`Active track changed. [${prev} 竊・${arg0}]`);
                        terminal.target = `melody\\${tracks[nextIndex].name}`;
                        ctx.commit.control();
                        ctx.commit.terminal();
                        resetScoreTrackRef();
                        lss();
                    } catch {
                        logger.outputError(`The destination track does not exist. [${nextIndex}]`);
                    }
                }
            },
            {
                ...defaultProps,
                funcKey: 'sf',
                usage: 'Sets the SoundFont for the active track.',
                args: [{ name: 'soundfontName: string', getCandidate: () => PlaybackState.InstrumentNames }],
                callback: (args) => {
                    const arg0 = logger.validateRequired(args[0], 1);
                    if (arg0 == null) return;
                    try {
                        const sfName = PlaybackState.validateSFName(arg0);
                        const track = getCurrScoreTrack();
                        track.instRef = {
                            source: "builtin",
                            name: sfName,
                        };

                        const endProc = () => {
                            logger.outputInfo(`Set a soundfont as the active track. [${sfName}]`);
                            lss();
                        }
                        if (!isLoadSoundFont(sfName)) {
                            logger.outputInfo(`SoundFont not yet loaded. [${sfName}]`);
                            logger.outputInfo(`Loading...`);
                            terminal.wait = true;
                            loadSoundFont(sfName).then(() => {
                                endProc();
                                terminal.wait = false;
                                ctx.commit.data();
                                ctx.commit.terminal();
                            });
                        } else {
                            endProc();
                            ctx.commit.data();
                        }
                    } catch {
                        logger.outputError(`The specified soundfont does not exist. [${arg0}]`);
                    }
                }
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

                        const track = getCurrScoreTrack();
                        track.instRef = instRef;
                        logger.outputInfo(
                            `Set a user SoundFont as the active track. [${arg0} ${arg1} ${preset.name}]`,
                        );
                        lss();
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
            // {
            //     ...defaultProps,
            //     funcKey: 'shf',
            //     usage: 'Search available soundfonts.',
            //     args: [{ name: 'soundfontName: string', getCandidate: () => StorePreview.InstrumentNames }],
            //     callback: (args) => {
            //         const arg0 = logger.validateRequired(args[0], 1);
            //         if (arg0 == null) return;
            //         const items = StorePreview.InstrumentNames
            //             .filter(n => {
            //                 const v = arg0;
            //                 if (v == undefined) return true;
            //                 else return n.indexOf(v) !== -1;
            //             })
            //             .map(def => {
            //                 const isLoad = lastStore.preview.sfItems.find(sf => sf.instrumentName === def);
            //                 return {
            //                     def, isLoad
            //                 }
            //             });
            //         terminal.outputs.push({
            //             type: 'table',
            //             table: {
            //                 cols: [
            //                     { headerName: 'Def', width: 500, attr: 'def' },
            //                     { headerName: 'Load', width: 80, attr: 'sentence' },
            //                 ],
            //                 table: (() => items.map(item => [
            //                     item.def,
            //                     item.isLoad ? '*' : ''
            //                 ]))()
            //             }
            //         });
            //     }
            // },
        ];
    };
    return {
        commands
    };
}
export default createMelodyProvider;
