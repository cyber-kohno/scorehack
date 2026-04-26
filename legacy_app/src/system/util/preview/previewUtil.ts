import useReducerMelody from "../../store/reducer/reducerMelody";
import useReducerCache from "../../store/reducer/reducerCache";
import useReducerRef from "../../store/reducer/reducerRef";
import MusicTheory from "../musicTheory";
import SoundFont, { instrument, type InstrumentName } from "soundfont-player";
import StoreMelody from "../../store/props/storeMelody";
import StoreCache from "../../store/props/storeCache";
import FileUtil from "../fileUtil";
import type { StoreProps, StoreUtil } from "../../store/store";
import StorePianoEditor from "../../store/props/arrange/piano/storePianoEditor";
import PianoArrangePreviewUtil from "./arrange/pianoArrangePreviewUtil";
import ArrangeUtil from "../../store/reducer/arrangeUtil";

namespace PreviewUtil {
  /**
   * ノーツを鳴らす時間情報を管理する
   */
  export type SoundTimePlayer = {
    pitchName: string;
    gain: number;
    startMs: number;
    sustainMs: number;
    target: string;
  };
  /**
   * 1トラック分のノーツ情報をサウンドフォントとペアで管理する
   */
  export type TrackPlayer = {
    sf: SoundFont.Player;
    notes: SoundTimePlayer[];
  };

  export type LayerTargetMode =
    | "tl-layer-all"
    | "tl-focus-layer"
    | "ol-layer-all"
    | "ol-focus-layer"
    | "all";
  export type Option = {
    target: LayerTargetMode;
  };

  export interface SoundNote extends StoreMelody.Note {
    velocity: number;
  }
  /**
   * ノーツ情報を再生できる形式に変換して返す。
   * @param baseCaches
   * @param currentLeft
   * @param note
   * @returns
   */
  const convertNoteToPlayer = (
    baseCaches: StoreCache.BaseCache[],
    currentLeft: number,
    note: StoreMelody.Note,
    velocity: number,
  ): PreviewUtil.SoundTimePlayer | null => {
    const side = StoreMelody.calcBeatSide(note);
    const [left, right] = [side.pos, side.pos + side.len];
    // 1拍（全音符→4分音符）に基準に合わせる
    // .map(p => p * 4);
    // console.log(`left: ${left}, right: ${right}`);
    // プレビュー開始位置より前のノーツは除外する
    if (left < currentLeft) return null;

    /** 開始時間（ミリ秒） */
    let startMs = 0;
    const getTime = (len: number, tempo: number) => {
      return (60000 / tempo) * len;
    };
    const addStart = (len: number, tempo: number) => {
      startMs += getTime(len, tempo);
    };
    /** 持続時間（ミリ秒） */
    let sustainMs = 0;

    // ベースリストを走査する
    // console.log(baseBlocks);
    baseCaches.some((base) => {
      /** ベースの終端 */
      const end = base.startBeatNote + base.lengthBeatNote;
      const beatDiv16Cnt = MusicTheory.getBeatDiv16Count(base.scoreBase.ts);
      const beatRate = beatDiv16Cnt / 4;
      const tempo = base.scoreBase.tempo * beatRate;

      // ベース範囲内のノーツである場合
      if (left < end) {
        // ベースのルールで持続時間を確定
        sustainMs = getTime(right - left, tempo);

        // ベースの開始からノーツまでの長さを加算
        addStart(left - base.startBeatNote, tempo);

        // ノーツ以降のベースは走査する必要がないためブレイク
        return 1;
      }

      // ベース終端以降のノーツである場合、ベースの持続時間を加算する
      // const start = currentLet + base.startBeatNote;
      // addStart(side.left - start, tempo);
      addStart(base.lengthBeatNote, tempo);
    });

    // プレビュー開始位置の考慮を、演奏開始時間に反映させる
    baseCaches.some((base) => {
      /** ベースの終端 */
      const end = base.startBeatNote + base.lengthBeatNote;
      const beatDiv16Cnt = MusicTheory.getBeatDiv16Count(base.scoreBase.ts);
      const beatRate = beatDiv16Cnt / 4;
      const tempo = base.scoreBase.tempo * beatRate;

      // ベース範囲内の開始位置である場合
      if (currentLeft < end) {
        // ベースの開始からノーツまでの長さを加算
        addStart(-(currentLeft - base.startBeatNote), tempo);

        // ノーツ以降のベースは走査する必要がないためブレイク
        return 1;
      }

      // ベース終端以降のノーツである場合、ベースの持続時間を加算する
      addStart(-base.lengthBeatNote, tempo);
    });

    const pitchName = MusicTheory.getKey12FullName(note.pitch);
    const gain = 5 * (velocity / 10);
    return {
      startMs,
      gain,
      sustainMs,
      pitchName,
      target: "",
    };
  };

  export const useReducer = (lastStore: StoreProps) => {
    const isLoadSoundFont = (sfName: InstrumentName) => {
      const items = lastStore.preview.sfItems;
      return items.find((c) => c.instrumentName === sfName) != undefined;
    };
    const loadSoundFont = async (sfName: InstrumentName) => {
      const items = lastStore.preview.sfItems;
      items.push({ instrumentName: sfName });
      const player = await SoundFont.instrument(new AudioContext(), sfName);
      const item = items.find((sf) => sf.instrumentName === sfName);
      if (item == undefined) throw new Error();
      item.player = player;
    };
    return {
      isLoadSoundFont,
      loadSoundFont,
    };
  };

  export const useUpdater = (storeUtil: StoreUtil) => {
    const { lastStore, commit } = storeUtil;

    const startTest = (option: Option) => {
      const { outline, melody } = lastStore.control;
      const { chordCaches, elementCaches } = lastStore.cache;
      const { elements, scoreTracks, audioTracks } = lastStore.data;
      const baseCaches = lastStore.cache.baseCaches;
      const preview = lastStore.preview;
      const { getChordFromBeat } = useReducerCache(lastStore);

      const { getCurrScoreTrack } = useReducerMelody(lastStore);
      const reducerArrange = ArrangeUtil.useReducer(lastStore);
      const { adjustGridScrollXFromOutline, adjustOutlineScroll } =
        useReducerRef(lastStore);

      const containsLayer = (...targets: LayerTargetMode[]) => {
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
        switch (lastStore.control.mode) {
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
            const timelineLeft = StoreMelody.calcBeat(note.norm, note.pos);
            const curChord = chordCaches[elementCaches[elementSeq].chordSeq];
            return [curChord.startBeat, timelineLeft];
          }
        }
      })();

      const trackPlayList: TrackPlayer[] = [];

      // メロディのノートを収集
      if (!containsLayer("ol-focus-layer", "ol-layer-all")) {
        scoreTracks.forEach((track, i) => {
          if (option.target === "tl-focus-layer") {
            if (melody.trackIndex !== i) return 1;
          }
          // ミュートもしくは音源未設定の場合コンティニュー
          if (track.isMute || track.soundFont === "") return 1;

          const trackScore = track as StoreMelody.ScoreTrack;

          const sf = preview.sfItems.find(
            (sf) => sf.instrumentName === trackScore.soundFont,
          );
          if (sf == undefined || sf.player == undefined) throw new Error();

          const notes: SoundTimePlayer[] = [];
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

          const layerAudio = track as StoreMelody.AudioTrack;
          // 音源未設定の場合コンティニュー
          if (layerAudio.source === "") return 1;

          // console.log(layerAudio.source);
          const blob = FileUtil.base64ToBlob(layerAudio.source, "audio/mp3");
          const url = URL.createObjectURL(blob);
          const audio = new Audio(url);

          preview.audios.push({
            element: audio,
            referIndex: i,
          });
        });
      }

      // アレンジのノートを収集
      if (!containsLayer("tl-focus-layer", "tl-layer-all")) {
        const arrange = lastStore.data.arrange;
        const { chordCaches, baseCaches } = lastStore.cache;
        arrange.tracks.forEach((track, trackIndex) => {
          if (option.target === "ol-focus-layer") {
            if (outline.trackIndex !== trackIndex) return 1;
          }
          // ミュートもしくは音源未設定の場合コンティニュー
          if (track.isMute || track.soundFont === "") return 1;

          const sf = preview.sfItems.find(
            (sf) => sf.instrumentName === track.soundFont,
          );
          if (sf == undefined || sf.player == undefined) throw new Error();

          const notePlayers: SoundTimePlayer[] = [];
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
                    StorePianoEditor.getArrangePatternFromRelation(
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
                  const notes = PianoArrangePreviewUtil.convertPatternToNotes(
                    arrPattern,
                    chord,
                  );

                  const beatDiv16Cnt = MusicTheory.getBeatDiv16Count(
                    baseCache.scoreBase.ts,
                  );
                  const beatRate = beatDiv16Cnt / 4;
                  // コードブロック開始位置を加算
                  const startBeat =
                    chordCache.startBeat * beatRate +
                    chordCache.beat.eatHead / 4;

                  notes.forEach((note) => {
                    // パターンのノーツに単位を揃えてコードブロックの開始位置を加算する
                    const targetNote = StoreMelody.calcAddBeat(note, startBeat);
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

      preview.timerKeys = [];
      preview.intervalKeys = [];

      const getTimerKeys = () => preview.timerKeys as number[];
      const getIntervalKeys = () => preview.intervalKeys as number[];

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
            const ref = lastStore.ref.trackArr[refTrIdx].find(
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
        const audio = preview.audios[i];
        let lateTime = 0;
        const adjustTime = track.adjust + preview.progressTime;
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

      preview.progressTime = startTime;

      preview.lastTime = Date.now();

      const intervalKey = setInterval(() => {
        const nowTime = Date.now();
        // console.log(nowTime);
        preview.progressTime += nowTime - preview.lastTime;
        // console.log(cache.progressTime);
        preview.lastTime = nowTime;

        const posBeat = getPosBeatFromTime(baseCaches, preview.progressTime);
        // console.log(`posBeat: ${posBeat}`);
        preview.linePos = posBeat;

        const chord = getChordFromBeat(posBeat);

        if (outline.focus !== chord.elementSeq) {
          outline.focus = chord.elementSeq;
          adjustGridScrollXFromOutline();
          adjustOutlineScroll();
        }

        commit();
      }, 50); // 50ミリ秒ごとに画面を更新

      getIntervalKeys().push(intervalKey);

      // 全てのノートを再生し終えたら止める
      const endKey = setTimeout(() => {
        stopTest();
      }, autoStopTime);
      preview.timerKeys.push(endKey);
    };

    const getTimeFromPosBeat = (
      baseCaches: StoreCache.BaseCache[],
      left: number,
    ) => {
      let time = 0;
      baseCaches.some((base) => {
        const beatDiv16Cnt = MusicTheory.getBeatDiv16Count(base.scoreBase.ts);
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
      baseCaches: StoreCache.BaseCache[],
      time: number,
    ) => {
      let beat = 0;
      baseCaches.some((base) => {
        const beatDiv16Cnt = MusicTheory.getBeatDiv16Count(base.scoreBase.ts);
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

    const stopTest = () => {
      const { syncCursorFromElementSeq } = useReducerMelody(lastStore);

      const preview = lastStore.preview;
      if (preview.timerKeys == null)
        throw new Error("cache.timerKeysがnullであってはならない。");
      preview.timerKeys.forEach((key) => {
        // console.log(`clear timerKeys: [${key}]`);
        clearTimeout(key);
      });
      preview.timerKeys = null;
      if (preview.intervalKeys != null) {
        preview.intervalKeys.forEach((key) => {
          // console.log(`clear intervalKeys: [${key}]`);
          clearInterval(key);
        });
        preview.intervalKeys = null;
      }
      preview.linePos = -1;
      preview.sfItems.forEach((sf) => {
        if (sf.player) sf.player.stop();
      });

      preview.audios.forEach((audio) => audio.element.pause());
      preview.audios.length = 0;

      // メロディモード時はカーソルを同期
      if (lastStore.control.mode === "melody") {
        syncCursorFromElementSeq();
      }
      commit();
    };

    return {
      startTest,
      stopTest,
    };
  };
}
export default PreviewUtil;
