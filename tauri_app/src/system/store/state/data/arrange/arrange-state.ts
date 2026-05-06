import type DerivedState from "../../derived-state";
import type ElementState from "../element-state";
import PianoEditorState from "./piano/piano-editor-state";

namespace ArrangeState {

  export const ArrangeMedhods = ["piano", "guitar"] as const;
  export type ArrangeMedhod = (typeof ArrangeMedhods)[number];

  export const createPianoTrackInitial = (name: string): Track => ({
    name,
    method: "piano",
    soundFont: "",
    volume: 10,
    isMute: false,
    relations: [],
    pianoLib: PianoEditorState.createInitialLib(),
  });

  export const INITIAL: DataProps = {
    tracks: [createPianoTrackInitial("track0")],
  };

  export type EditorProps = {
    method: ArrangeState.ArrangeMedhod;
    target: Target;
    editor?: any;
    finder?: any;
  };

  export type Target = {
    scoreBase: ElementState.DataInit;
    beat: DerivedState.BeatCache;
    compiledChord: DerivedState.CompiledChord;
    chordSeq: number;
  };

  export type Track = {
    name: string;
    method: ArrangeMedhod;
    soundFont: string;
    volume: number;
    isMute: boolean;

    relations: Relation[];
    pianoLib?: PianoEditorState.Lib;
  };

  /**
   * 繧ｳ繝ｼ繝芽ｦ∫ｴ縺ｨ繧｢繝ｬ繝ｳ繧ｸ縺ｮ邏舌▼縺代ｒ邂｡逅・☆繧九・繝ｭ繝代ユ繧｣
   */
  export interface Relation {
    chordSeq: number;

    /** 繝舌ャ繧ｭ繝ｳ繧ｰ繝代ち繝ｼ繝ｳ */
    bkgPatt: number;
    /** 讒区・髻ｳ繝代ち繝ｼ繝ｳ */
    sndsPatt: number;
  }

  export type DataProps = {
    tracks: Track[];
  };

  export interface Pattern {
    no: number;
  }

  /**
   * 蛻ｩ逕ｨ縺励※縺・↑縺・ヱ繧ｿ繝ｼ繝ｳ縺ｮ蜑企勁
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
      // 繝励Μ繧ｻ繝・ヨ逋ｻ骭ｲ縺輔ｌ縺ｦ縺・ｋ繝代ち繝ｼ繝ｳ縺ｯ蜑企勁縺励↑縺・
      if (isUsePreset(patt)) continue;
      let isRefer = false;

      if (layer.relations.map((r) => r[target]).includes(patt.no)) {
        isRefer = true;
      }
      // 蜿ら・縺瑚ｦ九▽縺九ｉ縺ｪ縺・ｴ蜷亥炎髯､
      // console.log(`蜑企勁縺励∪縺吶・{target}- no:[${patts[i].no}]`);
      if (!isRefer) patts.splice(i, 1);
    }
  };
}
export default ArrangeState;
