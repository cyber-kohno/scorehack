import useReducerMelody from "../../store/reducer/reducerMelody";
import useReducerCache from "../../store/reducer/reducerCache";
import useReducerRef from "../../store/reducer/reducerRef";
import MusicTheory from "../../../domain/theory/music-theory";
import SoundFont, { instrument, type InstrumentName } from "soundfont-player";
import StoreMelody from "../../store/props/storeMelody";
import StoreCache from "../../store/props/storeCache";
import { base64ToBlob } from "../../../app/project-io/project-file-codec";
import type { StoreProps, StoreUtil } from "../../store/store";
import StorePianoEditor from "../../store/props/arrange/piano/storePianoEditor";
import PianoArrangePreviewUtil from "./arrange/pianoArrangePreviewUtil";
import ArrangeUtil from "../../store/reducer/arrangeUtil";

namespace PreviewUtil {
  /**
   * 繝弱・繝・ｒ魑ｴ繧峨☆譎る俣諠・ｱ繧堤ｮ｡逅・☆繧・
   */
  export type SoundTimePlayer = {
    pitchName: string;
    gain: number;
    startMs: number;
    sustainMs: number;
    target: string;
  };
  /**
   * 1繝医Λ繝・け蛻・・繝弱・繝・ュ蝣ｱ繧偵し繧ｦ繝ｳ繝峨ヵ繧ｩ繝ｳ繝医→繝壹い縺ｧ邂｡逅・☆繧・
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
   * 繝弱・繝・ュ蝣ｱ繧貞・逕溘〒縺阪ｋ蠖｢蠑上↓螟画鋤縺励※霑斐☆縲・
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
    // 1諡搾ｼ亥・髻ｳ隨ｦ竊・蛻・浹隨ｦ・峨↓蝓ｺ貅悶↓蜷医ｏ縺帙ｋ
    // .map(p => p * 4);
    // console.log(`left: ${left}, right: ${right}`);
    // 繝励Ξ繝薙Η繝ｼ髢句ｧ倶ｽ咲ｽｮ繧医ｊ蜑阪・繝弱・繝・・髯､螟悶☆繧・
    if (left < currentLeft) return null;

    /** 髢句ｧ区凾髢難ｼ医Α繝ｪ遘抵ｼ・*/
    let startMs = 0;
    const getTime = (len: number, tempo: number) => {
      return (60000 / tempo) * len;
    };
    const addStart = (len: number, tempo: number) => {
      startMs += getTime(len, tempo);
    };
    /** 謖∫ｶ壽凾髢難ｼ医Α繝ｪ遘抵ｼ・*/
    let sustainMs = 0;

    // 繝吶・繧ｹ繝ｪ繧ｹ繝医ｒ襍ｰ譟ｻ縺吶ｋ
    // console.log(baseBlocks);
    baseCaches.some((base) => {
      /** 繝吶・繧ｹ縺ｮ邨らｫｯ */
      const end = base.startBeatNote + base.lengthBeatNote;
      const beatDiv16Cnt = MusicTheory.getBeatDiv16Count(base.scoreBase.ts);
      const beatRate = beatDiv16Cnt / 4;
      const tempo = base.scoreBase.tempo * beatRate;

      // 繝吶・繧ｹ遽・峇蜀・・繝弱・繝・〒縺ゅｋ蝣ｴ蜷・
      if (left < end) {
        // 繝吶・繧ｹ縺ｮ繝ｫ繝ｼ繝ｫ縺ｧ謖∫ｶ壽凾髢薙ｒ遒ｺ螳・
        sustainMs = getTime(right - left, tempo);

        // 繝吶・繧ｹ縺ｮ髢句ｧ九°繧峨ヮ繝ｼ繝・∪縺ｧ縺ｮ髟ｷ縺輔ｒ蜉邂・
        addStart(left - base.startBeatNote, tempo);

        // 繝弱・繝・ｻ･髯阪・繝吶・繧ｹ縺ｯ襍ｰ譟ｻ縺吶ｋ蠢・ｦ√′縺ｪ縺・◆繧√ヶ繝ｬ繧､繧ｯ
        return 1;
      }

      // 繝吶・繧ｹ邨らｫｯ莉･髯阪・繝弱・繝・〒縺ゅｋ蝣ｴ蜷医√・繝ｼ繧ｹ縺ｮ謖∫ｶ壽凾髢薙ｒ蜉邂励☆繧・
      // const start = currentLet + base.startBeatNote;
      // addStart(side.left - start, tempo);
      addStart(base.lengthBeatNote, tempo);
    });

    // 繝励Ξ繝薙Η繝ｼ髢句ｧ倶ｽ咲ｽｮ縺ｮ閠・・繧偵∵ｼ泌･城幕蟋区凾髢薙↓蜿肴丐縺輔○繧・
    baseCaches.some((base) => {
      /** 繝吶・繧ｹ縺ｮ邨らｫｯ */
      const end = base.startBeatNote + base.lengthBeatNote;
      const beatDiv16Cnt = MusicTheory.getBeatDiv16Count(base.scoreBase.ts);
      const beatRate = beatDiv16Cnt / 4;
      const tempo = base.scoreBase.tempo * beatRate;

      // 繝吶・繧ｹ遽・峇蜀・・髢句ｧ倶ｽ咲ｽｮ縺ｧ縺ゅｋ蝣ｴ蜷・
      if (currentLeft < end) {
        // 繝吶・繧ｹ縺ｮ髢句ｧ九°繧峨ヮ繝ｼ繝・∪縺ｧ縺ｮ髟ｷ縺輔ｒ蜉邂・
        addStart(-(currentLeft - base.startBeatNote), tempo);

        // 繝弱・繝・ｻ･髯阪・繝吶・繧ｹ縺ｯ襍ｰ譟ｻ縺吶ｋ蠢・ｦ√′縺ｪ縺・◆繧√ヶ繝ｬ繧､繧ｯ
        return 1;
      }

      // 繝吶・繧ｹ邨らｫｯ莉･髯阪・繝弱・繝・〒縺ゅｋ蝣ｴ蜷医√・繝ｼ繧ｹ縺ｮ謖∫ｶ壽凾髢薙ｒ蜉邂励☆繧・
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
      // 繧ｳ繝ｼ繝芽ｦ∫ｴ縺ｧ縺ｪ縺・ｴ蜷医∵ｬ｡縺ｮ繧ｳ繝ｼ繝芽ｦ∫ｴ縺ｾ縺ｧ騾ｲ繧√ｋ
      while (!isChordElement() && elementSeq < elementCaches.length - 1) {
        elementSeq++;
      }

      // 譛蠕後∪縺ｧ襍ｰ譟ｻ縺励※繧ゅさ繝ｼ繝芽ｦ∫ｴ縺瑚ｦ九▽縺九ｉ縺ｪ縺九▲縺溷ｴ蜷医・蜀咲函縺励↑縺・・
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

      // 繝｡繝ｭ繝・ぅ縺ｮ繝弱・繝医ｒ蜿朱寔
      if (!containsLayer("ol-focus-layer", "ol-layer-all")) {
        scoreTracks.forEach((track, i) => {
          if (option.target === "tl-focus-layer") {
            if (melody.trackIndex !== i) return 1;
          }
          // 繝溘Η繝ｼ繝医ｂ縺励￥縺ｯ髻ｳ貅先悴險ｭ螳壹・蝣ｴ蜷医さ繝ｳ繝・ぅ繝九Η繝ｼ
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
          // 繝弱・繝域ュ蝣ｱ縺ｮ霑ｽ蜉
          trackScore.notes.forEach((note, j) => {
            // console.log(note);
            /** 蜀咲函諠・ｱ */
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
          // 繝溘Η繝ｼ繝医・蝣ｴ蜷医さ繝ｳ繝・ぅ繝九Η繝ｼ
          if (track.isMute) return 1;

          const layerAudio = track as StoreMelody.AudioTrack;
          // 髻ｳ貅先悴險ｭ螳壹・蝣ｴ蜷医さ繝ｳ繝・ぅ繝九Η繝ｼ
          if (layerAudio.source === "") return 1;

          // console.log(layerAudio.source);
          const blob = base64ToBlob(layerAudio.source, "audio/mp3");
          const url = URL.createObjectURL(blob);
          const audio = new Audio(url);

          preview.audios.push({
            element: audio,
            referIndex: i,
          });
        });
      }

      // 繧｢繝ｬ繝ｳ繧ｸ縺ｮ繝弱・繝医ｒ蜿朱寔
      if (!containsLayer("tl-focus-layer", "tl-layer-all")) {
        const arrange = lastStore.data.arrange;
        const { chordCaches, baseCaches } = lastStore.cache;
        arrange.tracks.forEach((track, trackIndex) => {
          if (option.target === "ol-focus-layer") {
            if (outline.trackIndex !== trackIndex) return 1;
          }
          // 繝溘Η繝ｼ繝医ｂ縺励￥縺ｯ髻ｳ貅先悴險ｭ螳壹・蝣ｴ蜷医さ繝ｳ繝・ぅ繝九Η繝ｼ
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
                // 繧ｳ繝ｼ繝芽ｦ∫ｴ繧定ｵｰ譟ｻ縺吶ｋ
                chordCaches.forEach((chordCache, i) => {
                  const chordSeq = chordCache.chordSeq;
                  /** 繧｢繝ｬ繝ｳ繧ｸ繝代ち繝ｼ繝ｳ */
                  const arrPattern =
                    StorePianoEditor.getArrangePatternFromRelation(
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
                  const notes = PianoArrangePreviewUtil.convertPatternToNotes(
                    arrPattern,
                    chord,
                  );

                  const beatDiv16Cnt = MusicTheory.getBeatDiv16Count(
                    baseCache.scoreBase.ts,
                  );
                  const beatRate = beatDiv16Cnt / 4;
                  // 繧ｳ繝ｼ繝峨ヶ繝ｭ繝・け髢句ｧ倶ｽ咲ｽｮ繧貞刈邂・
                  const startBeat =
                    chordCache.startBeat * beatRate +
                    chordCache.beat.eatHead / 4;

                  notes.forEach((note) => {
                    // 繝代ち繝ｼ繝ｳ縺ｮ繝弱・繝・↓蜊倅ｽ阪ｒ謠・∴縺ｦ繧ｳ繝ｼ繝峨ヶ繝ｭ繝・け縺ｮ髢句ｧ倶ｽ咲ｽｮ繧貞刈邂励☆繧・
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

      // 髢句ｧ九・諡阪°繧画凾髢薙ｒ蜿門ｾ・
      const startTime = getTimeFromPosBeat(baseCaches, timelineStart);

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

      // 繧ｪ繝ｼ繝・ぅ繧ｪ繝輔ぃ繧､繝ｫ繧貞・逕・
      audioTracks.forEach((track, i) => {
        const audio = preview.audios[i];
        let lateTime = 0;
        const adjustTime = track.adjust + preview.progressTime;
        if (adjustTime < 0) {
          lateTime = -adjustTime;
        } else if (adjustTime > 0) {
          const fastTime = adjustTime;
          // 繝溘Μ遘抵ｼ・s・俄・遘貞腰菴搾ｼ・・峨↓螟画鋤縺吶ｋ
          audio.element.currentTime = fastTime / 1000;
        }
        const key = setTimeout(() => {
          audio.element.play();
        }, lateTime);
        getTimerKeys().push(key);
      });
      // console.log(getTimerKeys());

      // 繝励Ξ繝薙Η繝ｼ繧定・蜍募●豁｢縺吶ｋ邨らｫｯ縺ｮ譎る俣・医Α繝ｪ遘抵ｼ・
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
      }, 50); // 50繝溘Μ遘偵＃縺ｨ縺ｫ逕ｻ髱｢繧呈峩譁ｰ

      getIntervalKeys().push(intervalKey);

      // 蜈ｨ縺ｦ縺ｮ繝弱・繝医ｒ蜀咲函縺礼ｵゅ∴縺溘ｉ豁｢繧√ｋ
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
     * 邨碁℃譎る俣縺九ｉ諡阪・繧ｸ繧ｷ繝ｧ繝ｳ繧貞叙蠕励＠縺ｦ霑斐☆縲・
     * @param baseCaches
     * @param time 邨碁℃譎る俣
     * @returns 諡阪・繧ｸ繧ｷ繝ｧ繝ｳ
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
        // 繝悶Ο繝・け蜀・↓蜿弱∪縺｣縺ｦ縺・ｌ縺ｰ縲√ヶ繝ｭ繝・け蜀・・邨碁℃譎る俣・翫ユ繝ｳ繝昴ｒ蜉邂・
        if (time < end) {
          beat += ((time - start) / 60000) * tempo;
          return 1;
        }
        // 繝悶Ο繝・け繧定ｶ・∴縺ｦ縺・◆蝣ｴ蜷医√ヶ繝ｭ繝・け遽・峇縺ｮ譎る俣・翫ユ繝ｳ繝昴ｒ蜉邂励＠縺ｦ谺｡縺ｮ繝悶Ο繝・け縺ｸ
        beat += (base.sustainTime / 60000) * tempo;
      });
      // console.log(`----------------time:${Math.floor(time)}`);
      return beat;
    };

    const stopTest = () => {
      const { syncCursorFromElementSeq } = useReducerMelody(lastStore);

      const preview = lastStore.preview;
      if (preview.timerKeys == null)
        throw new Error("preview.timerKeys must not be null.");
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

      // 繝｡繝ｭ繝・ぅ繝｢繝ｼ繝画凾縺ｯ繧ｫ繝ｼ繧ｽ繝ｫ繧貞酔譛・
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

