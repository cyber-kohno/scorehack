import RhythmTheory from "../../../../../domain/theory/rhythm-theory";
import type DerivedState from "../../../derived-state";
import type ArrangeState from "../arrange-state";

namespace DrumEditorState {
  export type Phase = "preset" | "edit" | "playback";
  export type Control = "criteria" | "col" | "record" | "hits";
  export type CriteriaDiv = 1 | 2 | 3 | 4 | 6;
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

  const formatSixteenthDuration = (duration: number) => {
    switch (duration) {
      case 6: return "4n.";
      case 4: return "4n";
      case 3: return "8n.";
      case 2: return "8n";
      case 1: return "16n";
    }
    return `${duration}/16`;
  };

  export const getAvailableCriteriaDivs = (
    ts: RhythmTheory.TimeSignature,
  ): CriteriaDiv[] => {
    switch (RhythmTheory.getBeatDiv16Count(ts)) {
      case 4: return [1, 2, 4];
      case 6: return [1, 3, 6];
    }
    return [1];
  };

  export const getCriteriaDivLabel = (
    div: CriteriaDiv,
    ts: RhythmTheory.TimeSignature,
  ) => {
    const beatDiv16Count = RhythmTheory.getBeatDiv16Count(ts);
    return formatSixteenthDuration(beatDiv16Count / div);
  };

  export const getMinCriteriaDiv = (
    beat: DerivedState.BeatCache,
    ts: RhythmTheory.TimeSignature,
  ): CriteriaDiv => {
    const divs = getAvailableCriteriaDivs(ts);
    const eatHead = Math.abs(beat.eatHead);
    const eatTail = Math.abs(beat.eatTail);
    const beatDiv16Count = RhythmTheory.getBeatDiv16Count(ts);

    return divs.find((div) => {
      const unit = beatDiv16Count / div;
      return eatHead % unit === 0 && eatTail % unit === 0;
    }) ?? divs[divs.length - 1] ?? 1;
  };

  export const getEffectiveCriteriaDiv = (
    div: CriteriaDiv,
    beat: DerivedState.BeatCache,
    ts: RhythmTheory.TimeSignature,
  ): CriteriaDiv => {
    const divs = getAvailableCriteriaDivs(ts);
    const minDiv = getMinCriteriaDiv(beat, ts);
    if (divs.includes(div) && div >= minDiv) return div;
    return divs.find(item => item >= minDiv) ?? minDiv;
  };

  export const getColumnCount = (
    div: CriteriaDiv,
    beat: DerivedState.BeatCache,
    ts: RhythmTheory.TimeSignature,
  ) => {
    const totalSixteenth = beat.num * RhythmTheory.getBeatDiv16Count(ts) - beat.eatHead + beat.eatTail;
    return Math.max(0, Math.ceil((totalSixteenth * div) / RhythmTheory.getBeatDiv16Count(ts)));
  };
}

export default DrumEditorState;
