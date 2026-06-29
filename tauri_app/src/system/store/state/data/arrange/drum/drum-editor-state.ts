import RhythmTheory from "../../../../../domain/theory/rhythm-theory";
import type DerivedState from "../../../derived-state";
import ArrangeState from "../arrange-state";

namespace DrumEditorState {
  export type Phase = "preset" | "edit" | "playback";
  export type Control = "criteria" | "col" | "record" | "hits";
  export type CriteriaDiv = 1 | 2 | 3 | 4 | 6;
  export type SplitDiv = 2 | 3 | 4;
  export type MarkKind =
    | "dot"
    | "dot-line"
    | "cross"
    | "circle-cross"
    | "circle"
    | "large-cross";

  export const MarkKinds: MarkKind[] = [
    "dot",
    "dot-line",
    "cross",
    "circle-cross",
    "circle",
    "large-cross",
  ];

  export const DefaultMarkKind: MarkKind = "dot";

  export type Mapping = {
    key: string;
    pitch: number;
    markKind: MarkKind;
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

  export type EditorPatternData = {
    records: Record[];
    criteriaDiv: CriteriaDiv;
    colDivs: ColDiv[];
    hits: Hit[];
  };

  export type PatternData = {
    records: Record[];
    criteriaDiv: CriteriaDiv;
    colDivs: ColDiv[];
    hits: string[];
  };

  export interface Value extends EditorPatternData {
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

  export const createInitialPatternData = (): EditorPatternData => ({
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

  export const createPatternDataEditorProps = (pattern: PatternData): EditorPatternData => ({
    records: JSON.parse(JSON.stringify(pattern.records)),
    criteriaDiv: pattern.criteriaDiv,
    colDivs: JSON.parse(JSON.stringify(pattern.colDivs)),
    hits: pattern.hits.map(convHitInfo),
  });

  export const getEditorProps = (
    chordSeq: number,
    track: ArrangeState.DrumTrack,
  ): Value => {
    const editor = createInitialProps();
    const relation = track.relations.find((item) => item.chordSeq === chordSeq);
    if (relation == undefined || relation.sndsPatt === -1) return editor;

    const pattern = track.bank.patterns.find((item) => item.no === relation.sndsPatt);
    if (pattern == undefined) throw new Error("Drum pattern must exist.");

    Object.assign(editor, createPatternDataEditorProps(pattern.pattern));
    editor.cursorY = editor.records.length > 0 ? 0 : -1;
    editor.lastSource = createSnapshot(editor);
    return editor;
  };

  export const createInitialBank = (): Bank => ({
    mappings: [],
    patterns: [],
    regulars: [],
  });

  export const convHitInfo = (src: string): Hit => {
    const items = src.split(".").map((value) => Number(value));
    const [colIndex, recordIndex] = items;
    const velocity = items.length >= 3 ? items[2] : 10;
    return { colIndex, recordIndex, velocity };
  };

  export const formatHitItem = (hit: Hit) => {
    const base = `${hit.colIndex}.${hit.recordIndex}`;
    if (hit.velocity === 10) return base;
    return `${base}.${hit.velocity}`;
  };

  export const createPatternData = (editor: Value): PatternData => {
    const records = JSON.parse(JSON.stringify(editor.records)) as Record[];
    const colDivs = JSON.parse(JSON.stringify(editor.colDivs)) as ColDiv[];
    const hits = editor.hits
      .filter((hit) => {
        return (
          hit.colIndex >= 0 &&
          hit.recordIndex >= 0 &&
          hit.recordIndex <= records.length - 1
        );
      })
      .sort((a, b) => {
        if (a.recordIndex !== b.recordIndex) return a.recordIndex - b.recordIndex;
        return a.colIndex - b.colIndex;
      })
      .map(formatHitItem);

    return {
      records,
      criteriaDiv: editor.criteriaDiv,
      colDivs,
      hits,
    };
  };

  export const createSnapshot = (editor: Value) => {
    return JSON.stringify(createPatternData(editor));
  };

  export const registPattern = (
    category: PatternCategory,
    pattern: PatternData,
    bank: Bank,
  ) => {
    const src = JSON.stringify(pattern);
    let savedPattern = bank.patterns.find((current) => {
      return JSON.stringify(current.pattern) === src;
    });

    if (savedPattern == undefined) {
      const maxNo = bank.patterns.reduce(
        (max, current) => Math.max(max, current.no),
        -1,
      );
      savedPattern = {
        no: maxNo + 1,
        pattern: JSON.parse(src),
        category: JSON.parse(JSON.stringify(category)),
      };
      bank.patterns.push(savedPattern);
    }

    return savedPattern.no;
  };

  export const isRegular = (bank: Bank, patternNo: number) => {
    return bank.regulars.some((regular) => regular.patternNo === patternNo);
  };

  export const deleteUnreferUnit = (track: ArrangeState.DrumTrack) => {
    const drumBank = track.bank;
    ArrangeState.deleteUnreferPattern(
      "sndsPatt",
      drumBank.patterns,
      (pattern) => isRegular(drumBank, pattern.no),
      track,
    );
  };

  export const getArrangePatternFromRelation = (
    chordSeq: number,
    track: ArrangeState.DrumTrack,
  ): Unit | undefined => {
    const relation = track.relations.find((r) => r.chordSeq === chordSeq);
    if (relation == undefined || relation.sndsPatt === -1) return undefined;

    const pattern = track.bank.patterns.find((patt) => patt.no === relation.sndsPatt);
    if (pattern == undefined) throw new Error("Drum pattern must exist.");

    return {
      mappings: track.bank.mappings,
      pattern: pattern.pattern,
    };
  };

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
