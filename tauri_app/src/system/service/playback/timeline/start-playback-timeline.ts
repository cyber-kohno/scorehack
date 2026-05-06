import { get } from "svelte/store";
import { controlStore, dataStore, derivedStore, playbackStore, refStore } from "../../../store/global-store";
import useScrollService from "../../common/scroll-service";
import useDerivedSelector from "../../derived/derived-selector";
import useMelodySelector from "../../melody/melody-selector";
import type DerivedState from "../../../store/state/derived-state";
import RhythmTheory from "../../../domain/theory/rhythm-theory";
import MelodyState from "../../../store/state/data/melody-state";
import PianoArrangePlaybackUtil from "../arrange/piano-arrange-playback-util";
import PianoEditorState from "../../../store/state/data/arrange/piano/piano-editor-state";
import FileUtil from "../../../infra/file/fileUtil";
import stopPlaybackTimeline from "./stop-playback-timeline";
import type PlaybackCacheState from "./playback-cache-state";
import convertNoteToPlayer from "./convert-note-to-player";

const startPlaybackTimeline = (option: PlaybackCacheState.Option) => {
    const controlStoreValue = get(controlStore);
    const { outline, melody } = controlStoreValue;
    const { chordCaches, elementCaches, baseCaches } = get(derivedStore);
    const refStoreValue = get(refStore);
    const dataStoreValue = get(dataStore);
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
    // コード要素でない場合、次のコード要素まで進める
    while (!isChordElement() && elementSeq < elementCaches.length - 1) {
        elementSeq++;
    }

    // 最後まで走査してもコード要素が見つからなかった場合は再生しない。
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

    // メロディのノートを収集
    if (!containsLayer("ol-focus-layer", "ol-layer-all")) {
        scoreTracks.forEach((track, i) => {
            if (option.target === "tl-focus-layer") {
                if (melody.trackIndex !== i) return 1;
            }
            // ミュートもしくは音源未設定の場合コンティニュー
            if (track.isMute || track.soundFont === "") return 1;

            const trackScore = track as MelodyState.ScoreTrack;

            const sf = playback.sfItems.find(
                (sf) => sf.instrumentName === trackScore.soundFont,
            );
            if (sf == undefined || sf.player == undefined) throw new Error();

            const notes: PlaybackCacheState.SoundTimePlayer[] = [];
            trackPlayList.push({
                sf: sf.player,
                notes,
            });
            // ノート情報の追加
            trackScore.notes.forEach((note, j) => {
                // console.log(note);
                /** 再生情報 */
                const playInfo = convertNoteToPlayer(
                    baseCaches,
                    timelineStart,
                    note,
                    track.volume,
                );
                if (playInfo == null) return 1;
                playInfo.target = `${i}.${j}`;
                notes.push(playInfo);
            });
        });

        audioTracks.forEach((track, i) => {
            if (option.target === "tl-focus-layer") {
                if (melody.trackIndex !== i) return 1;
            }
            // ミュートの場合コンティニュー
            if (track.isMute) return 1;

            const layerAudio = track as MelodyState.AudioTrack;
            // 音源未設定の場合コンティニュー
            if (layerAudio.source === "") return 1;

            // console.log(layerAudio.source);
            const blob = FileUtil.base64ToBlob(layerAudio.source, "audio/mp3");
            const url = URL.createObjectURL(blob);
            const audio = new Audio(url);

            playback.audios.push({
                element: audio,
                referIndex: i,
            });
        });
    }

    // アレンジのノートを収集
    if (!containsLayer("tl-focus-layer", "tl-layer-all")) {
        arrange.tracks.forEach((track, trackIndex) => {
            if (option.target === "ol-focus-layer") {
                if (outline.trackIndex !== trackIndex) return 1;
            }
            // ミュートもしくは音源未設定の場合コンティニュー
            if (track.isMute || track.soundFont === "") return 1;

            const sf = playback.sfItems.find(
                (sf) => sf.instrumentName === track.soundFont,
            );
            if (sf == undefined || sf.player == undefined) throw new Error();

            const notePlayers: PlaybackCacheState.SoundTimePlayer[] = [];
            trackPlayList.push({
                sf: sf.player,
                notes: notePlayers,
            });

            switch (track.method) {
                case "piano":
                    {
                        // コード要素を走査する
                        chordCaches.forEach((chordCache, i) => {
                            const chordSeq = chordCache.chordSeq;
                            /** アレンジパターン */
                            const arrPattern =
                                PianoEditorState.getArrangePatternFromRelation(
                                    chordSeq,
                                    track,
                                );
                            // アレンジが割り当てられていない場合、このトラックは処理しない。
                            if (arrPattern == undefined) return 1;
                            const baseCache = baseCaches[chordCache.baseSeq];

                            // フォーカスより前のコードはコンテニュー
                            if (chordCache.startBeat < outlineStart) return 1;
                            const compiledChord = chordCache.compiledChord;
                            if (compiledChord == undefined) return 1;
                            const chord = compiledChord.chord;

                            /** アレンジパターンをノーツに変換 */
                            const notes = PianoArrangePlaybackUtil.convertPatternToNotes(
                                arrPattern,
                                chord,
                                { sustainBeat: chordCache.lengthBeatNote },
                            );

                            const beatDiv16Cnt = RhythmTheory.getBeatDiv16Count(
                                baseCache.scoreBase.ts,
                            );
                            const beatRate = beatDiv16Cnt / 4;
                            // コードブロック開始位置を加算
                            const startBeat =
                                chordCache.startBeat * beatRate +
                                (chordCache.beat.eatHead / beatDiv16Cnt) * beatRate;

                            notes.forEach((note) => {
                                // パターンのノーツに単位を揃えてコードブロックの開始位置を加算する
                                const targetNote = MelodyState.calcAddBeat(note, startBeat);
                                const playInfo = convertNoteToPlayer(
                                    baseCaches,
                                    timelineStart,
                                    targetNote,
                                    track.volume,
                                );
                                if (playInfo == null) return 1;
                                // console.log(`start:${playInfo.startMs}, sustain:${playInfo.sustainMs}`);
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

    // 開始の拍から時間を取得
    const startTime = getTimeFromPosBeat(baseCaches, timelineStart);

    const endTime = (() => {
        const tailChordCache = chordCaches[chordCaches.length - 1];

        if (chordCaches == undefined) return 0;

        return tailChordCache.startTime + tailChordCache.sustainTime;
    })();

    // 収集したノーツの音を再生
    trackPlayList.forEach((tp) => {
        tp.notes.forEach((np) => {
            const startMs = np.startMs;
            // console.log(`pitch:${np.pitchName}, ms:${np.startMs}, sus:${np.sustainMs}`);
            const key = setTimeout(() => {
                // console.log(tp);
                // ミリ秒をサウンドフォントの時間基準（秒）に合わせる
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

    // オーディオファイルを再生
    audioTracks.forEach((track, i) => {
        const audio = playback.audios[i];
        let lateTime = 0;
        const adjustTime = track.adjust + playback.progressTime;
        if (adjustTime < 0) {
            lateTime = -adjustTime;
        } else if (adjustTime > 0) {
            const fastTime = adjustTime;
            // ミリ秒（ms）→秒単位（s）に変換する
            audio.element.currentTime = fastTime / 1000;
        }
        const key = setTimeout(() => {
            audio.element.play();
        }, lateTime);
        getTimerKeys().push(key);
    });
    // console.log(getTimerKeys());

    // プレビューを自動停止する終端の時間（ミリ秒）
    const autoStopTime = endTime - startTime;

    playback.progressTime = startTime;

    playback.lastTime = Date.now();

    const intervalKey = setInterval(() => {
        const nowTime = Date.now();
        // console.log(nowTime);
        playback.progressTime += nowTime - playback.lastTime;
        // console.log(cache.progressTime);
        playback.lastTime = nowTime;

        const posBeat = getPosBeatFromTime(baseCaches, playback.progressTime);
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
    }, 50); // 50ミリ秒ごとに画面を更新

    getIntervalKeys().push(intervalKey);

    // 全てのノートを再生し終えたら止める
    const endKey = setTimeout(() => {
        stopPlaybackTimeline();
    }, autoStopTime);
    playback.timerKeys.push(endKey);
};

const getTimeFromPosBeat = (
    baseCaches: DerivedState.BaseCache[],
    left: number,
) => {
    let time = 0;
    baseCaches.some((base) => {
        const beatDiv16Cnt = RhythmTheory.getBeatDiv16Count(base.scoreBase.ts);
        const beatRate = beatDiv16Cnt / 4;
        let tempo = base.scoreBase.tempo * beatRate;

        const start = base.startBeatNote;
        const end = start + base.lengthBeatNote;
        if (left < end) {
            time += (60000 / tempo) * (left - start);
            return 1;
        }
        time += (60000 / tempo) * base.lengthBeatNote;
    });
    return time;
};

/**
 * 経過時間から拍ポジションを取得して返す。
 * @param baseCaches
 * @param time 経過時間
 * @returns 拍ポジション
 */
const getPosBeatFromTime = (
    baseCaches: DerivedState.BaseCache[],
    time: number,
) => {
    let beat = 0;
    baseCaches.some((base) => {
        const beatDiv16Cnt = RhythmTheory.getBeatDiv16Count(base.scoreBase.ts);
        const beatRate = beatDiv16Cnt / 4;
        let tempo = base.scoreBase.tempo * beatRate;

        const start = base.startTime;
        const end = start + base.sustainTime;
        // console.log(`start:${Math.floor(start)}, end:${Math.floor(end)}`);
        // ブロック内に収まっていれば、ブロック内の経過時間＊テンポを加算
        if (time < end) {
            beat += ((time - start) / 60000) * tempo;
            return 1;
        }
        // ブロックを超えていた場合、ブロック範囲の時間＊テンポを加算して次のブロックへ
        beat += (base.sustainTime / 60000) * tempo;
    });
    // console.log(`----------------time:${Math.floor(time)}`);
    return beat;
};
export default startPlaybackTimeline;
