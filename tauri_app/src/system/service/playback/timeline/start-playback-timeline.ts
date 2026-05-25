import { get } from "svelte/store";
import { controlStore, dataStore, derivedStore, playbackStore, refStore, settingsStore } from "../../../store/global-store";
import useScrollService from "../../common/scroll-service";
import useDerivedSelector from "../../derived/derived-selector";
import useMelodySelector from "../../melody/melody-selector";
import type DerivedState from "../../../store/state/derived-state";
import RhythmTheory from "../../../domain/theory/rhythm-theory";
import MelodyState from "../../../store/state/data/melody-state";
import PianoArrangePlaybackUtil from "../arrange/piano-arrange-playback-util";
import ArrangeState from "../../../store/state/data/arrange/arrange-state";
import PianoEditorState from "../../../store/state/data/arrange/piano/piano-editor-state";
import GuitarArrangePlaybackUtil from "../arrange/guitar-arrange-playback-util";
import GuitarEditorState from "../../../store/state/data/arrange/guitar/guitar-editor-state";
import FilePathRef from "../../../infra/file/file-path-ref";
import { readBinaryFile } from "../../../infra/tauri/fs";
import stopPlaybackTimeline from "./stop-playback-timeline";
import type PlaybackCacheState from "./playback-cache-state";
import convertNoteToPlayer from "./convert-note-to-player";

const startPlaybackTimeline = async (option: PlaybackCacheState.Option) => {
    const controlStoreValue = get(controlStore);
    const { outline, melody } = controlStoreValue;
    const { chordCaches, elementCaches, baseCaches } = get(derivedStore);
    const refStoreValue = get(refStore);
    const dataStoreValue = get(dataStore);
    const settings = get(settingsStore);
    const { scoreTracks, audioTracks, arrange } = dataStoreValue;
    const playback = get(playbackStore);
    const { getChordFromBeat } = useDerivedSelector(get(derivedStore), get(controlStore));

    const { getCurrScoreTrack } = useMelodySelector({ control: get(controlStore), data: get(dataStore) });
    const { adjustGridScrollXFromOutline, adjustOutlineScroll } = useScrollService();

    const updatePlayback = () => playbackStore.set({ ...playback });
    const updateControl = () => controlStore.set({ ...controlStoreValue });
    const containsLayer = (...targets: PlaybackCacheState.LayerTargetMode[]) => {
        return targets.includes(option.target);
    };

    let elementSeq = outline.focus;
    const isChordElement = () => {
        return elementCaches[elementSeq].type === "chord";
    };
    // 繧ｳ繝ｼ繝芽ｦ∫ｴ縺ｧ縺ｪ縺・ｴ蜷医∵ｬ｡縺ｮ繧ｳ繝ｼ繝芽ｦ∫ｴ縺ｾ縺ｧ騾ｲ繧√ｋ
    while (!isChordElement() && elementSeq < elementCaches.length - 1) {
        elementSeq++;
    }

    // 譛蠕後∪縺ｧ襍ｰ譟ｻ縺励※繧ゅさ繝ｼ繝芽ｦ∫ｴ縺瑚ｦ九▽縺九ｉ縺ｪ縺九▲縺溷ｴ蜷医・蜀咲函縺励↑縺・・
    if (!isChordElement()) return;

    const [outlineStart, timelineStart] = (() => {
        switch (controlStoreValue.mode) {
            case "harmonize": {
                const curChord = chordCaches[elementCaches[elementSeq].chordSeq];
                const startBeat = curChord.startBeat;
                const startBeatNote = curChord.startBeatNote;
                return [startBeat, startBeatNote];
            }
            case "melody": {
                const note =
                    melody.focus === -1
                        ? melody.cursor
                        : getCurrScoreTrack().notes[melody.focus];
                const timelineLeft = MelodyState.calcBeat(note.norm, note.pos);
                const curChord = chordCaches[elementCaches[elementSeq].chordSeq];
                return [curChord.startBeat, timelineLeft];
            }
        }
    })();

    const trackPlayList: PlaybackCacheState.TrackPlayer[] = [];
    const findScoreTrackPlayer = (track: MelodyState.ScoreTrack) => {
        const ref = track.instRef;
        if (ref?.source === "soundfont") {
            return playback.userSfItems.find((sf) => {
                return sf.definitionName === ref.definitionName
                    && sf.bank === ref.bank
                    && sf.program === ref.program;
            })?.player;
        }

        const instrumentName = ref?.source === "builtin" ? ref.name : "";
        if (instrumentName === "") return undefined;
        return playback.sfItems.find((sf) => sf.instrumentName === instrumentName)?.player;
    };
    const findArrangeTrackPlayer = (track: ArrangeState.Track) => {
        const ref = track.instRef;
        if (ref?.source === "soundfont") {
            return playback.userSfItems.find((sf) => {
                return sf.definitionName === ref.definitionName
                    && sf.bank === ref.bank
                    && sf.program === ref.program;
            })?.player;
        }

        const instrumentName = ref?.source === "builtin" ? ref.name : "";
        if (instrumentName === "") return undefined;
        return playback.sfItems.find((sf) => sf.instrumentName === instrumentName)?.player;
    };

    // 繝｡繝ｭ繝・ぅ縺ｮ繝弱・繝医ｒ蜿朱寔
    if (!containsLayer("ol-focus-layer", "ol-layer-all")) {
        scoreTracks.forEach((track, i) => {
            if (option.target === "tl-focus-layer") {
                if (melody.trackIndex !== i) return 1;
            }
            // 繝溘Η繝ｼ繝医ｂ縺励￥縺ｯ髻ｳ貅先悴險ｭ螳壹・蝣ｴ蜷医さ繝ｳ繝・ぅ繝九Η繝ｼ
            if (track.isMute) return 1;

            const trackScore = track as MelodyState.ScoreTrack;

            const player = findScoreTrackPlayer(trackScore);
            if (player == undefined) return 1;

            const notes: PlaybackCacheState.SoundTimePlayer[] = [];
            trackPlayList.push({
                sf: player,
                notes,
            });
            // 繝弱・繝域ュ蝣ｱ縺ｮ霑ｽ蜉
            trackScore.notes.forEach((note, j) => {
                // console.log(note);
                /** 蜀咲函諠・ｱ */
                const playInfo = convertNoteToPlayer(
                    baseCaches,
                    timelineStart,
                    note,
                    track.volume,
                    settings.playback.swing,
                );
                if (playInfo == null) return 1;
                playInfo.target = `${i}.${j}`;
                notes.push(playInfo);
            });
        });

        for (let i = 0; i < audioTracks.length; i++) {
            const track = audioTracks[i];
            if (option.target === "tl-focus-layer") {
                if (melody.trackIndex !== i) continue;
            }
            // ???????????????????????
            if (track.isMute) continue;

            if (track.pathRef == undefined) continue;

            const path = FilePathRef.resolvePath(track.pathRef, settings.envs.HOME_DIR);
            if (path === "") continue;

            try {
                const bytes = await readBinaryFile(path);
                const blob = new Blob([bytes]);
                const objectUrl = URL.createObjectURL(blob);
                const audio = new Audio(objectUrl);
                audio.volume = Math.max(0, Math.min(1, track.volume / 10));

                playback.audios.push({
                    element: audio,
                    referIndex: i,
                    objectUrl,
                });
            } catch (error) {
                console.error("Failed to load audio track:", error);
            }
        }
    }

    // 繧｢繝ｬ繝ｳ繧ｸ縺ｮ繝弱・繝医ｒ蜿朱寔
    if (!containsLayer("tl-focus-layer", "tl-layer-all")) {
        arrange.tracks.forEach((track, trackIndex) => {
            if (option.target === "ol-focus-layer") {
                if (outline.trackIndex !== trackIndex) return 1;
            }
            // 繝溘Η繝ｼ繝医ｂ縺励￥縺ｯ髻ｳ貅先悴險ｭ螳壹・蝣ｴ蜷医さ繝ｳ繝・ぅ繝九Η繝ｼ
            if (track.isMute) return 1;

            const player = findArrangeTrackPlayer(track);
            if (player == undefined) return 1;

            const notePlayers: PlaybackCacheState.SoundTimePlayer[] = [];
            trackPlayList.push({
                sf: player,
                notes: notePlayers,
            });

            switch (track.method) {
                case "piano":
                    {
                        // 繧ｳ繝ｼ繝芽ｦ∫ｴ繧定ｵｰ譟ｻ縺吶ｋ
                        chordCaches.forEach((chordCache, i) => {
                            const chordSeq = chordCache.chordSeq;
                            /** 繧｢繝ｬ繝ｳ繧ｸ繝代ち繝ｼ繝ｳ */
                            const arrPattern =
                                PianoEditorState.getArrangePatternFromRelation(
                                    chordSeq,
                                    track,
                                );
                            // 繧｢繝ｬ繝ｳ繧ｸ縺悟牡繧雁ｽ薙※繧峨ｌ縺ｦ縺・↑縺・ｴ蜷医√％縺ｮ繝医Λ繝・け縺ｯ蜃ｦ逅・＠縺ｪ縺・・
                            if (arrPattern == undefined) return 1;
                            const baseCache = baseCaches[chordCache.baseSeq];

                            // 繝輔か繝ｼ繧ｫ繧ｹ繧医ｊ蜑阪・繧ｳ繝ｼ繝峨・繧ｳ繝ｳ繝・ル繝･繝ｼ
                            if (chordCache.startBeat < outlineStart) return 1;
                            const compiledChord = chordCache.compiledChord;
                            if (compiledChord == undefined) return 1;
                            const chord = compiledChord.chord;

                            /** 繧｢繝ｬ繝ｳ繧ｸ繝代ち繝ｼ繝ｳ繧偵ヮ繝ｼ繝・↓螟画鋤 */
                            const notes = PianoArrangePlaybackUtil.convertPatternToNotes(
                                arrPattern,
                                chord,
                                { sustainBeat: chordCache.lengthBeatNote },
                            );

                            const beatDiv16Cnt = RhythmTheory.getBeatDiv16Count(
                                baseCache.scoreBase.rhythm.ts,
                            );
                            const beatRate = beatDiv16Cnt / 4;
                            // 繧ｳ繝ｼ繝峨ヶ繝ｭ繝・け髢句ｧ倶ｽ咲ｽｮ繧貞刈邂・
                            const startBeat =
                                chordCache.startBeat * beatRate +
                                (chordCache.beat.eatHead / beatDiv16Cnt) * beatRate;

                            notes.forEach((note) => {
                                // 繝代ち繝ｼ繝ｳ縺ｮ繝弱・繝・↓蜊倅ｽ阪ｒ謠・∴縺ｦ繧ｳ繝ｼ繝峨ヶ繝ｭ繝・け縺ｮ髢句ｧ倶ｽ咲ｽｮ繧貞刈邂励☆繧・
                                const targetNote = MelodyState.calcAddBeat(note, startBeat);
                                const playInfo = convertNoteToPlayer(
                                    baseCaches,
                                    timelineStart,
                                    targetNote,
                                    track.volume,
                                    settings.playback.swing,
                                );
                                if (playInfo == null) return 1;
                                // console.log(`start:${playInfo.startMs}, sustain:${playInfo.sustainMs}`);
                                notePlayers.push(playInfo);
                            });
                        });
                    }
                    break;
                case "guitar":
                    {
                        chordCaches.forEach((chordCache, i) => {
                            const chordSeq = chordCache.chordSeq;
                            const arrPattern =
                                GuitarEditorState.getArrangePatternFromRelation(
                                    chordSeq,
                                    track,
                                );
                            if (arrPattern == undefined) return 1;
                            const baseCache = baseCaches[chordCache.baseSeq];

                            if (chordCache.startBeat < outlineStart) return 1;

                            const notes = GuitarArrangePlaybackUtil.convertPatternToNotes(
                                arrPattern,
                                {
                                    sustainBeat: chordCache.lengthBeatNote,
                                    stroke: GuitarEditorState.createDefaultStrokeProps(),
                                },
                            );

                            const beatDiv16Cnt = RhythmTheory.getBeatDiv16Count(
                                baseCache.scoreBase.rhythm.ts,
                            );
                            const beatRate = beatDiv16Cnt / 4;
                            const startBeat =
                                chordCache.startBeat * beatRate +
                                (chordCache.beat.eatHead / beatDiv16Cnt) * beatRate;

                            notes.forEach((note) => {
                                const targetNote = MelodyState.calcAddBeat(note, startBeat);
                                const playInfo = convertNoteToPlayer(
                                    baseCaches,
                                    timelineStart,
                                    targetNote,
                                    track.volume,
                                                                    settings.playback.swing,
                                );
                                if (playInfo == null) return 1;
                                notePlayers.push(playInfo);
                            });
                        });
                    }
                    break;
            }
        });
    }

    playback.timerKeys = [];
    playback.intervalKeys = [];

    const getTimerKeys = () => playback.timerKeys as number[];
    const getIntervalKeys = () => playback.intervalKeys as number[];

    // 髢句ｧ九・諡阪°繧画凾髢薙ｒ蜿門ｾ・
    const startTime = getTimeFromPosBeat(baseCaches, timelineStart, settings.playback.swing);

    const endTime = (() => {
        const tailChordCache = chordCaches[chordCaches.length - 1];

        if (chordCaches == undefined) return 0;

        return tailChordCache.startTime + tailChordCache.sustainTime;
    })();

    // 蜿朱寔縺励◆繝弱・繝・・髻ｳ繧貞・逕・
    trackPlayList.forEach((tp) => {
        tp.notes.forEach((np) => {
            const startMs = np.startMs;
            // console.log(`pitch:${np.pitchName}, ms:${np.startMs}, sus:${np.sustainMs}`);
            const key = setTimeout(() => {
                // console.log(tp);
                // 繝溘Μ遘偵ｒ繧ｵ繧ｦ繝ｳ繝峨ヵ繧ｩ繝ｳ繝医・譎る俣蝓ｺ貅厄ｼ育ｧ抵ｼ峨↓蜷医ｏ縺帙ｋ
                const susSec = np.sustainMs / 1000;
                tp.sf.play(np.pitchName, 0, { gain: np.gain, duration: susSec });
                const [refTrIdx, refNtIndx] = np.target
                    .split(".")
                    .map((t) => Number(t));
                const ref = refStoreValue.trackArr[refTrIdx].find(
                    (r) => r.seq === refNtIndx,
                )?.ref;
                if (ref != undefined) {
                    ref.style.height = "200px";
                    setTimeout(() => {
                        ref.style.height = "0";
                    }, np.sustainMs);
                }
            }, startMs);
            getTimerKeys().push(key);

            // const tail = startMs + np.sustainMs;
            // if (endTime < tail) endTime = tail;
        });
    });

    // 繧ｪ繝ｼ繝・ぅ繧ｪ繝輔ぃ繧､繝ｫ繧貞・逕・
    playback.audios.forEach((audio) => {
        const track = audioTracks[audio.referIndex];
        if (track == undefined) return;

        let lateTime = 0;
        const adjustTime = startTime - track.adjust;
        if (adjustTime < 0) {
            lateTime = -adjustTime;
        } else if (adjustTime > 0) {
            const fastTime = adjustTime;
            // 繝溘Μ遘抵ｼ・s・俄・遘貞腰菴搾ｼ・・峨↓螟画鋤縺吶ｋ
            audio.element.currentTime = fastTime / 1000;
        }
        const key = setTimeout(() => {
            void audio.element.play().catch((error) => {
                console.warn("Audio playback was interrupted:", error);
            });
        }, lateTime);
        getTimerKeys().push(key);
    });
    // console.log(getTimerKeys());

    // 繝励Ξ繝薙Η繝ｼ繧定・蜍募●豁｢縺吶ｋ邨らｫｯ縺ｮ譎る俣・医Α繝ｪ遘抵ｼ・
    const autoStopTime = endTime - startTime;

    playback.progressTime = startTime;

    playback.lastTime = Date.now();

    const intervalKey = setInterval(() => {
        const nowTime = Date.now();
        // console.log(nowTime);
        playback.progressTime += nowTime - playback.lastTime;
        // console.log(cache.progressTime);
        playback.lastTime = nowTime;

        const posBeat = getPosBeatFromTime(baseCaches, playback.progressTime, settings.playback.swing);
        // console.log(`posBeat: ${posBeat}`);
        playback.linePos = posBeat;

        const chord = getChordFromBeat(posBeat);

        if (outline.focus !== chord.elementSeq) {
            outline.focus = chord.elementSeq;
            adjustGridScrollXFromOutline();
            adjustOutlineScroll();
        }

        updatePlayback();
        updateControl();
    }, 50); // 50繝溘Μ遘偵＃縺ｨ縺ｫ逕ｻ髱｢繧呈峩譁ｰ

    getIntervalKeys().push(intervalKey);

    // 蜈ｨ縺ｦ縺ｮ繝弱・繝医ｒ蜀咲函縺礼ｵゅ∴縺溘ｉ豁｢繧√ｋ
    const endKey = setTimeout(() => {
        stopPlaybackTimeline();
    }, autoStopTime);
    playback.timerKeys.push(endKey);
};

const getTimeFromPosBeat = (
    baseCaches: DerivedState.BaseCache[],
    left: number,
    swing: RhythmTheory.SwingRatios,
) => {
    let time = 0;
    baseCaches.some((base) => {
        const beatDiv16Cnt = RhythmTheory.getBeatDiv16Count(base.scoreBase.rhythm.ts);
        const beatRate = beatDiv16Cnt / 4;
        const msPerBeatNote = 60000 / (base.scoreBase.tempo * beatRate);

        const start = base.startBeatNote;
        const end = start + base.lengthBeatNote;
        if (left < end) {
            const len = RhythmTheory.getSwungBeatNoteDuration(
                base.scoreBase.rhythm,
                swing,
                start,
                left - start,
            );
            time += msPerBeatNote * len;
            return 1;
        }
        const len = RhythmTheory.getSwungBeatNoteDuration(
            base.scoreBase.rhythm,
            swing,
            start,
            base.lengthBeatNote,
        );
        time += msPerBeatNote * len;
    });
    return time;
};
/**
 * 邨碁℃譎る俣縺九ｉ諡阪・繧ｸ繧ｷ繝ｧ繝ｳ繧貞叙蠕励＠縺ｦ霑斐☆縲・
 * @param baseCaches
 * @param time 邨碁℃譎る俣
 * @returns 諡阪・繧ｸ繧ｷ繝ｧ繝ｳ
 */
const getPosBeatFromTime = (
    baseCaches: DerivedState.BaseCache[],
    time: number,
    swing: RhythmTheory.SwingRatios,
) => {
    let beat = 0;
    baseCaches.some((base) => {
        const beatDiv16Cnt = RhythmTheory.getBeatDiv16Count(base.scoreBase.rhythm.ts);
        const beatRate = beatDiv16Cnt / 4;
        const msPerBeatNote = 60000 / (base.scoreBase.tempo * beatRate);

        const start = base.startTime;
        const end = start + base.sustainTime;
        if (time < end) {
            beat += RhythmTheory.getBeatNoteOffsetFromSwungDuration(
                base.scoreBase.rhythm,
                swing,
                base.startBeatNote,
                (time - start) / msPerBeatNote,
            );
            return 1;
        }
        beat += RhythmTheory.getBeatNoteOffsetFromSwungDuration(
            base.scoreBase.rhythm,
            swing,
            base.startBeatNote,
            base.sustainTime / msPerBeatNote,
        );
    });
    return beat;
};
export default startPlaybackTimeline;








