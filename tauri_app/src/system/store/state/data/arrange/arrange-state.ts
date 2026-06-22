import type DerivedState from "../../derived-state";
import type ElementState from "../element-state";
import type { TrackInstRef } from "../track-inst-ref";
import GuitarEditorState from "./guitar/guitar-editor-state";
import PianoEditorState from "./piano/piano-editor-state";

namespace ArrangeState {

  export const ArrangeMedhods = ["piano", "guitar"] as const;
  export type ArrangeMedhod = (typeof ArrangeMedhods)[number];

  export const createPianoTrackInitial = (name: string): Track => ({
    name,
    method: "piano",
    volume: 10,
    isMute: false,
    relations: [],
    bank: PianoEditorState.createInitialBank(),
  });

  export const createGuitarTrackInitial = (name: string): Track => ({
    name,
    method: "guitar",
    volume: 10,
    isMute: false,
    relations: [],
    bank: GuitarEditorState.createInitialBank(),
  });

  export const createInitial = (): DataProps => ({
    tracks: [createPianoTrackInitial("track0")],
  });

  export type EditorProps = {
    method: ArrangeState.ArrangeMedhod;
    origin: EditorOrigin;
    target: Target;
    editor?: any;
    finder?: any;
  };

  export type EditorOrigin =
    | {
      type: "chord-block";
    }
    | {
      type: "library";
      mode: LibraryEditorMode;
      backingNo: number;
      soundsNo: number;
    };

  export type LibraryEditorMode =
    | "edit-backing"
    | "edit-sounds"
    | "add-backing"
    | "add-sounds";

  export type Target = {
    scoreBase: ElementState.DataInit;
    beat: DerivedState.BeatCache;
    compiledChord: DerivedState.CompiledChord;
    chordSeq: number;
  };

  export type TrackBase = {
    name: string;
    instRef?: TrackInstRef;
    volume: number;
    isMute: boolean;

    relations: Relation[];
  };

  export type PianoTrackBank = {
    method: "piano";
    bank: PianoEditorState.Bank;
  };

  export type GuitarTrackBank = {
    method: "guitar";
    bank: GuitarEditorState.Bank;
  };

  export type TrackBank = PianoTrackBank | GuitarTrackBank;

  export type PianoTrack = TrackBase & PianoTrackBank;

  export type GuitarTrack = TrackBase & GuitarTrackBank;

  export type Track = PianoTrack | GuitarTrack;

  /**
   * コード要素とアレンジの紐づけを管理するプロパティ
   */
  export interface Relation {
    chordSeq: number;

    /** バッキングパターン連番 */
    bkgPatt: number;
    /** 構成音パターン連番 */
    sndsPatt: number;
  }

  export type DataProps = {
    tracks: Track[];
  };

  export interface Pattern {
    no: number;
  }

  export const isPatternReferenced = (
    target: "bkgPatt" | "sndsPatt",
    pattNo: number,
    track: Track,
  ) => {
    if (pattNo === -1) return false;
    return track.relations.some((relation) => relation[target] === pattNo);
  };

  /**
   * 利用していないパターンの削除
   * @param target
   * @param patts
   * @param isUsePreset
   * @param layers
   */
  export const deleteUnreferPattern = (
    target: "bkgPatt" | "sndsPatt",
    patts: Pattern[],
    isUsePreset: (patt: Pattern) => boolean,
    layer: Track,
  ) => {
    for (let i = patts.length - 1; i >= 0; i--) {
      const patt = patts[i];
      // プリセットに使われているパターンは削除対象外
      if (isUsePreset(patt)) continue;
      let isRefer = false;

      if (layer.relations.map((r) => r[target]).includes(patt.no)) {
        isRefer = true;
      }
      // 参照が存在しない場合は削除する
      if (!isRefer) patts.splice(i, 1);
    }
  };
}
export default ArrangeState;
