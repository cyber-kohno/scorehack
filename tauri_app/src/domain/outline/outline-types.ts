import type MusicTheory from "../theory/music-theory";

export type OutlineElementType =
  | "init"
  | "section"
  | "chord"
  | "change"
  | "modulate"
  | "tempo"
  | "ts";

export type OutlineDataInit = {
  ts: MusicTheory.TimeSignature;
  tempo: number;
  tonality: MusicTheory.Tonality;
};

export type OutlineDataSection = {
  name: string;
};

export interface OutlineDataChord {
  beat: number;
  eat: number;
  degree?: MusicTheory.DegreeChord;
}

export interface OutlineKeyChord {
  beat: number;
  eat: number;
  chord?: MusicTheory.KeyChordProps;
  structs?: MusicTheory.StructProps[];
}

export const OUTLINE_MODULATE_METHODS = [
  "domm",
  "parallel",
  "relative",
  "key",
] as const;
export type OutlineModulateMethod = typeof OUTLINE_MODULATE_METHODS[number];

export type OutlineDataModulate = {
  method: OutlineModulateMethod;
  val?: number;
};

export const OUTLINE_DOMM_VALUES = [-3, -2, -1, 0, 1, 2, 3] as const;

export type OutlineTempoRelation = "diff" | "rate" | "abs";
export const OUTLINE_TEMPO_METHODS = ["rate", "addition"] as const;
export type OutlineTempoMethod = typeof OUTLINE_TEMPO_METHODS[number];

export type OutlineDataTempo = {
  method: OutlineTempoMethod;
  val: number;
};

export type OutlineDataTS = {
  newTS: MusicTheory.TimeSignature;
};

export type OutlineElement = {
  type: OutlineElementType;
  data: any;
};

export const OUTLINE_MARGIN_HEAD = 4;
