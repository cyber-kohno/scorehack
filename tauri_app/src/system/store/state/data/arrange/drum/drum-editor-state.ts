import type RhythmTheory from "../../../../../domain/theory/rhythm-theory";
import type ArrangeState from "../arrange-state";

namespace DrumEditorState {
  export type Phase = "preset" | "edit" | "playback";
  export type Control = "criteria" | "col" | "record" | "hits";
  export type CriteriaDiv = 1 | 2 | 4;
  export type SplitDiv = 2 | 3 | 4;

  export type Mapping = {
    key: string;
    pitch: number;
    name?: string;
  };

  export type Record = {
    key: string;
  };

  export type ColDiv = {
    index: number;
    div: SplitDiv;
  };

  export type Hit = {
    colIndex: number;
    recordIndex: number;
    velocity: number;
  };

  export type PatternCategory = {
    tsGroup: RhythmTheory.TimeSignature[];
    beat: number;
    eatHead?: number;
    eatTail?: number;
  };

  export type PatternData = {
    records: Record[];
    criteriaDiv: CriteriaDiv;
    colDivs: ColDiv[];
    hits: Hit[];
  };

  export interface Value extends PatternData {
    phase: Phase;
    control: Control;
    cursorX: number;
    cursorY: number;
    lastSource: string;
  }

  export interface Pattern extends ArrangeState.Pattern {
    pattern: PatternData;
    category: PatternCategory;
  }

  export type Regular = {
    patternNo: number;
    sortNo: number;
  };

  export type Bank = {
    mappings: Mapping[];
    patterns: Pattern[];
    regulars: Regular[];
  };

  export interface Unit {
    mappings: Mapping[];
    pattern: PatternData;
  }

  export const createInitialPatternData = (): PatternData => ({
    records: [],
    criteriaDiv: 1,
    colDivs: [],
    hits: [],
  });

  export const createInitialProps = (): Value => ({
    ...createInitialPatternData(),
    phase: "edit",
    control: "criteria",
    cursorX: 0,
    cursorY: -1,
    lastSource: "",
  });

  export const createInitialBank = (): Bank => ({
    mappings: [],
    patterns: [],
    regulars: [],
  });
}

export default DrumEditorState;
