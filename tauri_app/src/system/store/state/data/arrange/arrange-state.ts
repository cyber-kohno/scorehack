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
    pianoLib: PianoEditorState.createInitialLib(),
  });

  export const createGuitarTrackInitial = (name: string): Track => ({
    name,
    method: "guitar",
    volume: 10,
    isMute: false,
    relations: [],
    guitarLib: GuitarEditorState.createInitialLib(),
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

  export type EditorOrigin = "outline" | "library";

  export type Target = {
    scoreBase: ElementState.DataInit;
    beat: DerivedState.BeatCache;
    compiledChord: DerivedState.CompiledChord;
    chordSeq: number;
  };

  export type Track = {
    name: string;
    method: ArrangeMedhod;
    instRef?: TrackInstRef;
    volume: number;
    isMute: boolean;

    relations: Relation[];
    pianoLib?: PianoEditorState.Lib;
    guitarLib?: GuitarEditorState.Lib;
  };

  /**
   * コード要素とアレンジの紐づけを管理するプロパティ
   */
  export interface Relation {
    chordSeq: number;

    /** バッキングパターン */
    bkgPatt: number;
    /** 構成音パターン */
    sndsPatt: number;
  }

  export type DataProps = {
    tracks: Track[];
  };

  export interface Pattern {
    no: number;
  }

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
      // プリセット登録されているパターンは削除しない
      if (isUsePreset(patt)) continue;
      let isRefer = false;

      if (layer.relations.map((r) => r[target]).includes(patt.no)) {
        isRefer = true;
      }
      // 参照が見つからない場合削除
      // console.log(`削除します。${target}- no:[${patts[i].no}]`);
      if (!isRefer) patts.splice(i, 1);
    }
  };
}
export default ArrangeState;
