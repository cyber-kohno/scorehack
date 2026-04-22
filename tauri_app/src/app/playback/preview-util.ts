import useReducerMelody from "../melody/melody-reducer";
import {
  adjustOutlineScroll,
  adjustTimelineScrollXFromOutline,
} from "../outline/outline-scroll";
import { getMelodyCursorState } from "../melody/melody-cursor-state";
import MusicTheory from "../../domain/theory/music-theory";
import SoundFont, { type InstrumentName } from "soundfont-player";
import StoreMelody from "../../domain/melody/melody-store";
import StoreCache from "../../state/cache-state/cache-store";
import { base64ToBlob } from "../project-io/project-file-codec";
import type { CommitContext, RootStoreToken } from "../../state/root-store";
import StorePianoEditor from "../../domain/arrange/piano-editor-store";
import PianoArrangePreviewUtil from "./piano-arrange-preview-util";
import {
  getPlaybackBeatFromTime,
  getPlaybackTimeFromBeat,
} from "../../domain/playback/playback-progress";
import {
  type PlaybackOption,
  type PlaybackSoundNote,
  type PlaybackSoundTimePlayer,
  type PlaybackTrackPlayer,
  type PlaybackTrackTargetMode,
} from "../../domain/playback/playback-types";
import { createSoundFontPlayer } from "../../infra/audio/soundfont-player";
import { createProjectDataActions } from "../project-data/project-data-actions";
import { getChordCacheFromBeat } from "../../state/cache-state/cache-store";
import {
  getPlaybackBaseCaches,
  getPlaybackChordCaches,
  getPlaybackElementCaches,
  getPlaybackTailChordCache,
} from "../../state/cache-state/playback-cache";
import { getLoadedSoundFonts } from "../../state/ui-state/playback-ui-store";
import { getPreviewState } from "../../state/session-state/preview-store";
import { getModeState } from "../../state/session-state/mode-store";
import {
  getOutlineFocusState,
  setOutlineFocus,
} from "../../state/session-state/outline-focus-store";
import { getOutlineTrackIndex } from "../../state/session-state/outline-track-store";
import {
  addLoadedSoundFont,
  clearPlaybackAudios,
  pausePlaybackAudios,
  pushPlaybackAudio,
  setLoadedSoundFontPlayer,
  setPlaybackIntervalKeys,
  setPlaybackLastTime,
  setPlaybackLinePos,
  setPlaybackProgressTime,
  setPlaybackTimerKeys,
  stopLoadedSoundFonts,
} from "../../state/session-state/playback-session";
import { findTrackRef } from "../../state/session-state/track-ref-session";
import { getMelodyFocusState } from "../../state/session-state/melody-focus-store";
import { getMelodyTrackIndex } from "../../state/session-state/melody-track-store";

namespace PreviewUtil {
  /**
   * ノート情報を時間ベースの再生情報に変換する。
   */
  export type SoundTimePlayer = PlaybackSoundTimePlayer;
  /**
   * 1トラックぶんの SoundFont プレイヤーと再生ノート群。
   */
  export type TrackPlayer = PlaybackTrackPlayer;
  export type LayerTargetMode = PlaybackTrackTargetMode;
  export type Option = PlaybackOption;
  export interface SoundNote extends PlaybackSoundNote {}

  /**
   * ノートを再生可能な時間情報へ変換する。
   * currentLeft より前にあるノートは再生対象にしない。
   */
  const convertNoteToPlayer = (
    baseCaches: StoreCache.BaseCache[],
    currentLeft: number,
    note: StoreMelody.Note,
    velocity: number,
  ): PlaybackSoundTimePlayer | null => {
    const side = StoreMelody.calcBeatSide(note);
    const [left, right] = [side.pos, side.pos + side.len];
    if (left < currentLeft) return null;

    let startMs = 0;
    const getTime = (len: number, tempo: number) => {
      return (60000 / tempo) * len;
    };
    const addStart = (len: number, tempo: number) => {
      startMs += getTime(len, tempo);
    };
    let sustainMs = 0;

    // ノート開始位置から、実際の発音開始時刻と発音長を計算する。
    baseCaches.some((base) => {
      const end = base.startBeatNote + base.lengthBeatNote;
      const beatDiv16Cnt = MusicTheory.getBeatDiv16Count(base.scoreBase.ts);
      const beatRate = beatDiv16Cnt / 4;
      const tempo = base.scoreBase.tempo * beatRate;

      if (left < end) {
        sustainMs = getTime(right - left, tempo);
        addStart(left - base.startBeatNote, tempo);
        return true;
      }

      addStart(base.lengthBeatNote, tempo);
      return false;
    });

    // currentLeft を基準に、再生開始時刻を左へ詰める。
    baseCaches.some((base) => {
      const end = base.startBeatNote + base.lengthBeatNote;
      const beatDiv16Cnt = MusicTheory.getBeatDiv16Count(base.scoreBase.ts);
      const beatRate = beatDiv16Cnt / 4;
      const tempo = base.scoreBase.tempo * beatRate;

      if (currentLeft < end) {
        addStart(-(currentLeft - base.startBeatNote), tempo);
        return true;
      }

      addStart(-base.lengthBeatNote, tempo);
      return false;
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

  export const useReducer = (rootStoreToken: RootStoreToken) => {
    void rootStoreToken;
    const isLoadSoundFont = (sfName: InstrumentName) => {
      const items = getLoadedSoundFonts();
      return items.find((c) => c.instrumentName === sfName) != undefined;
    };
    const loadSoundFont = async (sfName: InstrumentName) => {
      addLoadedSoundFont(sfName);
      const player = await createSoundFontPlayer(sfName);
      setLoadedSoundFontPlayer(sfName, player);
    };
    return {
      isLoadSoundFont,
      loadSoundFont,
    };
  };

  export const useUpdater = (commitContext: CommitContext) => {
    const { lastStore: rootStoreToken, commit } = commitContext;
    const { getOutlineElements, getScoreTracks, getAudioTracks, getArrangeData } =
      createProjectDataActions(rootStoreToken);
    const chordCaches = getPlaybackChordCaches(rootStoreToken);
    const elementCaches = getPlaybackElementCaches(rootStoreToken);
    const baseCaches = getPlaybackBaseCaches(rootStoreToken);

    const startTest = (option: Option) => {
      const melodyFocus = getMelodyFocusState();
      const elements = getOutlineElements();
      const scoreTracks = getScoreTracks();
      const audioTracks = getAudioTracks();
      const preview = getPreviewState();
      const { getCurrScoreTrack } = useReducerMelody(rootStoreToken);

      const containsLayer = (...targets: LayerTargetMode[]) => {
        return targets.includes(option.target);
      };

      // 現在 focus から、実際に再生可能な chord element まで進める。
      let elementSeq = getOutlineFocusState().focus;
      const isChordElement = () => {
        return elementCaches[elementSeq].type === "chord";
      };
      while (!isChordElement() && elementSeq < elementCaches.length - 1) {
        elementSeq++;
      }
      if (!isChordElement()) return;

      // outline 基準の開始位置と、timeline 基準の開始位置をモード別に決める。
      const [outlineStart, timelineStart] = (() => {
        switch (getModeState()) {
          case "harmonize": {
            const curChord = chordCaches[elementCaches[elementSeq].chordSeq];
            return [curChord.startBeat, curChord.startBeatNote] as const;
          }
          case "melody": {
            const note =
              melodyFocus.focus === -1
                ? getMelodyCursorState(rootStoreToken)
                : getCurrScoreTrack().notes[melodyFocus.focus];
            const timelineLeft = StoreMelody.calcBeat(note.norm, note.pos);
            const curChord = chordCaches[elementCaches[elementSeq].chordSeq];
            return [curChord.startBeat, timelineLeft] as const;
          }
        }
      })();

      const trackPlayList: PlaybackTrackPlayer[] = [];

      // melody / audio 側の再生キューを作る。
      if (!containsLayer("ol-focus-layer", "ol-layer-all")) {
        scoreTracks.forEach((track, i) => {
          if (option.target === "tl-focus-layer" && getMelodyTrackIndex() !== i) {
            return;
          }
          if (track.isMute || track.soundFont === "") return;

          const trackScore = track as StoreMelody.ScoreTrack;
          const sf = preview.sfItems.find((sf) => sf.instrumentName === trackScore.soundFont);
          if (sf == undefined || sf.player == undefined) throw new Error();

          const notes: PlaybackSoundTimePlayer[] = [];
          trackPlayList.push({ sf: sf.player, notes });
          trackScore.notes.forEach((note, j) => {
            const playInfo = convertNoteToPlayer(
              baseCaches,
              timelineStart,
              note,
              track.volume,
            );
            if (playInfo == null) return;
            playInfo.target = `${i}.${j}`;
            notes.push(playInfo);
          });
        });

        audioTracks.forEach((track, i) => {
          if (option.target === "tl-focus-layer" && getMelodyTrackIndex() !== i) {
            return;
          }
          if (track.isMute) return;

          const layerAudio = track as StoreMelody.AudioTrack;
          if (layerAudio.source === "") return;

          const blob = base64ToBlob(layerAudio.source, "audio/mp3");
          const url = URL.createObjectURL(blob);
          const audio = new Audio(url);
          pushPlaybackAudio(audio, i);
        });
      }

      // arrange 側の再生キューを作る。
      if (!containsLayer("tl-focus-layer", "tl-layer-all")) {
        const arrange = getArrangeData();
        arrange.tracks.forEach((track, trackIndex) => {
          if (option.target === "ol-focus-layer" && getOutlineTrackIndex() !== trackIndex) {
            return;
          }
          if (track.isMute || track.soundFont === "") return;

          const sf = preview.sfItems.find((sf) => sf.instrumentName === track.soundFont);
          if (sf == undefined || sf.player == undefined) throw new Error();

          const notePlayers: PlaybackSoundTimePlayer[] = [];
          trackPlayList.push({ sf: sf.player, notes: notePlayers });

          switch (track.method) {
            case "piano": {
              // chord ごとに relation からパターンを引き、ノート列へ展開する。
              chordCaches.forEach((chordCache) => {
                const chordSeq = chordCache.chordSeq;
                const arrPattern = StorePianoEditor.getArrangePatternFromRelation(
                  chordSeq,
                  track,
                );
                if (arrPattern == undefined) return;
                const baseCache = baseCaches[chordCache.baseSeq];

                if (chordCache.startBeat < outlineStart) return;
                const compiledChord = chordCache.compiledChord;
                if (compiledChord == undefined) return;
                const chord = compiledChord.chord;

                const notes = PianoArrangePreviewUtil.convertPatternToNotes(arrPattern, chord);
                const beatDiv16Cnt = MusicTheory.getBeatDiv16Count(baseCache.scoreBase.ts);
                const beatRate = beatDiv16Cnt / 4;
                const startBeat = chordCache.startBeat * beatRate + chordCache.beat.eatHead / 4;

                notes.forEach((note) => {
                  const targetNote = StoreMelody.calcAddBeat(note, startBeat);
                  const playInfo = convertNoteToPlayer(
                    baseCaches,
                    timelineStart,
                    targetNote,
                    track.volume,
                  );
                  if (playInfo == null) return;
                  notePlayers.push(playInfo);
                });
              });
              break;
            }
          }
        });
      }

      setPlaybackTimerKeys([]);
      setPlaybackIntervalKeys([]);

      const getTimerKeys = () => preview.timerKeys as number[];
      const getIntervalKeys = () => preview.intervalKeys as number[];

      // 開始・終了時刻を決める。
      const startTime = getPlaybackTimeFromBeat(baseCaches, timelineStart);
      const endTime = (() => {
        const tailChordCache = getPlaybackTailChordCache(rootStoreToken);
        if (tailChordCache == undefined) return 0;
        return tailChordCache.startTime + tailChordCache.sustainTime;
      })();

      // ノート再生の timeout を積む。
      trackPlayList.forEach((tp) => {
        tp.notes.forEach((np) => {
          const key = setTimeout(() => {
            const susSec = np.sustainMs / 1000;
            tp.sf.play(np.pitchName, 0, { gain: np.gain, duration: susSec });
            const [refTrIdx, refNtIndx] = np.target.split(".").map((t) => Number(t));
            const ref = findTrackRef(refTrIdx, refNtIndx)?.ref;
            if (ref != undefined) {
              ref.style.height = "200px";
              setTimeout(() => {
                ref.style.height = "0";
              }, np.sustainMs);
            }
          }, np.startMs);
          getTimerKeys().push(key);
        });
      });

      // audio トラック再生の timeout を積む。
      audioTracks.forEach((track, i) => {
        const audio = preview.audios[i];
        let lateTime = 0;
        const adjustTime = track.adjust + preview.progressTime;
        if (adjustTime < 0) {
          lateTime = -adjustTime;
        } else if (adjustTime > 0) {
          audio.element.currentTime = adjustTime / 1000;
        }
        const key = setTimeout(() => {
          audio.element.play();
        }, lateTime);
        getTimerKeys().push(key);
      });

      const autoStopTime = endTime - startTime;
      setPlaybackProgressTime(startTime);
      setPlaybackLastTime(Date.now());

      // 再生中は progress と linePos を更新し、必要なら outline focus も追従させる。
      const intervalKey = setInterval(() => {
        const nowTime = Date.now();
        setPlaybackProgressTime(preview.progressTime + (nowTime - preview.lastTime));
        setPlaybackLastTime(nowTime);

        const posBeat = getPlaybackBeatFromTime(baseCaches, preview.progressTime);
        setPlaybackLinePos(posBeat);

        const chord = getChordCacheFromBeat(rootStoreToken, posBeat);
        if (chord == undefined) return;

        if (getOutlineFocusState().focus !== chord.elementSeq) {
          setOutlineFocus(chord.elementSeq);
          adjustTimelineScrollXFromOutline(rootStoreToken);
          adjustOutlineScroll(rootStoreToken);
        }

        commit();
      }, 50);

      getIntervalKeys().push(intervalKey);

      // 自動停止タイマー。
      const endKey = setTimeout(() => {
        stopTest();
      }, autoStopTime);
      getTimerKeys().push(endKey);
    };

    const stopTest = () => {
      const { syncCursorFromElementSeq } = useReducerMelody(rootStoreToken);

      // 再生用 timer / interval を全停止して、描画状態も初期化する。
      const preview = getPreviewState();
      if (preview.timerKeys == null) {
        throw new Error("preview.timerKeys must not be null.");
      }
      preview.timerKeys.forEach((key) => {
        clearTimeout(key);
      });
      setPlaybackTimerKeys(null);
      if (preview.intervalKeys != null) {
        preview.intervalKeys.forEach((key) => {
          clearInterval(key);
        });
        setPlaybackIntervalKeys(null);
      }
      setPlaybackLinePos(-1);
      stopLoadedSoundFonts();
      pausePlaybackAudios();
      clearPlaybackAudios();

      // melody モードでは、停止時にカーソルを現在 element に同期し直す。
      if (getModeState() === "melody") {
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

