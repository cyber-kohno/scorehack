import type { OutlineDataChord } from "../../domain/outline/outline-types";
import MusicTheory from "../../domain/theory/music-theory";
import type { OutlineActions } from "./outline-actions";

export const setOutlineChordDegreeFromScaleIndex = (
  outlineActions: OutlineActions,
  chordData: OutlineDataChord,
  scaleIndex: number,
) => {
  const diatonic = MusicTheory.getDiatonicDegreeChord("major", scaleIndex);
  outlineActions.setChordData({
    ...chordData,
    degree: diatonic,
  });
};

export const modOutlineChordSymbol = (
  chordData: OutlineDataChord,
  dir: "prev" | "next" | "lower" | "upper",
) => {
  if (chordData.degree == undefined) return false;

  const symbol = chordData.degree.symbol;
  const symbolProps = MusicTheory.getSymbolProps(symbol);

  let nextSymbol: MusicTheory.ChordSymol | undefined = undefined;
  switch (dir) {
    case "prev":
      nextSymbol = MusicTheory.getSameLevelSymbol(symbol, -1);
      break;
    case "next":
      nextSymbol = MusicTheory.getSameLevelSymbol(symbol, 1);
      break;
    case "lower":
      nextSymbol = symbolProps.lower;
      break;
    case "upper":
      nextSymbol = symbolProps.upper;
      break;
  }

  if (nextSymbol == undefined) return false;
  chordData.degree.symbol = nextSymbol;
  return true;
};

export const modOutlineChordKey = (
  chordData: OutlineDataChord,
  dir: -1 | 1,
) => {
  let isBlank = false;
  if (chordData.degree == undefined) {
    chordData.degree = MusicTheory.getDiatonicDegreeChord("major", 0);
    isBlank = true;
  }

  let nextIndex = MusicTheory.getDegree12Index(chordData.degree);
  if (!isBlank) nextIndex += dir;

  if (!isBlank && (nextIndex < 0 || nextIndex > 11)) return false;

  const degree12 = MusicTheory.getDegree12Props(nextIndex, dir === -1);
  chordData.degree = {
    symbol: chordData.degree.symbol,
    ...degree12,
  };
  return true;
};

export const modOutlineChordBeat = (
  chordData: OutlineDataChord,
  dir: -1 | 1,
) => {
  const nextBeat = chordData.beat + dir;
  if (nextBeat < 1 || nextBeat > 4) return false;
  chordData.beat = nextBeat;
  return true;
};

export const modOutlineChordEat = (
  chordData: OutlineDataChord,
  dir: -1 | 1,
) => {
  const nextEat = chordData.eat + dir;
  if (nextEat < -2 || nextEat > 2) return false;
  chordData.eat = nextEat;
  return true;
};
