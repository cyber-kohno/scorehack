import type { OutlineDataInit } from "../outline/outline-types";
import type StoreCache from "../../state/cache-state/cache-store";
import type StorePianoEditor from "./piano-editor-store";

namespace ArrangeStore {
  export const ArrangeMedhods = ["piano", "guitar"] as const;
  export type ArrangeMedhod = (typeof ArrangeMedhods)[number];

  export const INITIAL: DataProps = {
    tracks: [],
  };

  export type EditorProps = {
    method: ArrangeStore.ArrangeMedhod;
    target: Target;
    editor?: any;
    finder?: any;
  };

  export type Target = {
    scoreBase: OutlineDataInit;
    beat: StoreCache.BeatCache;
    compiledChord: StoreCache.CompiledChord;
    chordSeq: number;
  };

  export type Track = {
    name: string;
    method: ArrangeMedhod;
    soundFont: string;
    volume: number;
    isMute: boolean;
    relations: Relation[];
    pianoLib?: StorePianoEditor.Lib;
  };

  export interface Relation {
    chordSeq: number;
    bkgPatt: number;
    sndsPatt: number;
  }

  export type DataProps = {
    tracks: Track[];
  };

  export interface Pattern {
    no: number;
  }

  export const deleteUnreferPattern = (
    target: "bkgPatt" | "sndsPatt",
    patts: Pattern[],
    isUsePreset: (patt: Pattern) => boolean,
    layer: Track,
  ) => {
    for (let i = patts.length - 1; i >= 0; i--) {
      const patt = patts[i];
      if (isUsePreset(patt)) continue;
      let isRefer = false;

      if (layer.relations.map((r) => r[target]).includes(patt.no)) {
        isRefer = true;
      }
      if (!isRefer) patts.splice(i, 1);
    }
  };
}

export default ArrangeStore;
