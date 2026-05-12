export const ROOT_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;

export const CHORD_SYMBOLS = [
  '', 'm', 'sus4', 'sus2', 'dim', 'aug', 'm-5',
  '7', 'm7', 'M7', 'mmaj7', '7sus4', 'dim7', 'aug7', '6', 'm6', 'add9', 'madd9',
  '9', 'm9', 'M9',
  '11', 'm11',
  '13', 'm13'
] as const;

export type RootNote = (typeof ROOT_NOTES)[number];
export type ChordSymbol = (typeof CHORD_SYMBOLS)[number];
export type IntervalRelationName =
  | 'p1'
  | 'm2'
  | 'M2'
  | 'm3'
  | 'M3'
  | 'p4'
  | 'd5'
  | 'p5'
  | 'a5'
  | 'm6'
  | 'M6'
  | 'd7'
  | 'm7'
  | 'M7';

export type SymbolProps = {
  structs: IntervalRelationName[];
  lower?: ChordSymbol;
  upper?: ChordSymbol;
};

export type GuitarString = {
  number: number;
  openMidi: number;
  openNote: string;
};

export const MAX_FRET = 12;

export const STANDARD_TUNING: GuitarString[] = [
  { number: 6, openMidi: 40, openNote: 'E2' },
  { number: 5, openMidi: 45, openNote: 'A2' },
  { number: 4, openMidi: 50, openNote: 'D3' },
  { number: 3, openMidi: 55, openNote: 'G3' },
  { number: 2, openMidi: 59, openNote: 'B3' },
  { number: 1, openMidi: 64, openNote: 'E4' }
];

export const getIntervalFromRelation = (name: IntervalRelationName) => {
  switch (name) {
    case 'p1': return 0;
    case 'm2': return 1;
    case 'M2': return 2;
    case 'm3': return 3;
    case 'M3': return 4;
    case 'p4': return 5;
    case 'd5': return 6;
    case 'p5': return 7;
    case 'a5': return 8;
    case 'm6': return 8;
    case 'M6': return 9;
    case 'd7': return 9;
    case 'm7': return 10;
    case 'M7': return 11;
  }
};

export const getSymbolProps = (symbol: ChordSymbol): SymbolProps => {
  switch (symbol) {
    case '': return { structs: ['p1', 'M3', 'p5'], upper: '7' };
    case 'm': return { structs: ['p1', 'm3', 'p5'], upper: 'm7' };
    case 'sus4': return { structs: ['p1', 'p4', 'p5'], upper: '7sus4' };
    case 'sus2': return { structs: ['p1', 'M2', 'p5'] };
    case 'm-5': return { structs: ['p1', 'm3', 'd5'] };
    case 'dim': return { structs: ['p1', 'm3', 'd5'], upper: 'dim7' };
    case 'aug': return { structs: ['p1', 'M3', 'a5'], upper: 'aug7' };
    case '7': return { structs: ['p1', 'M3', 'p5', 'm7'], lower: '', upper: '9' };
    case 'M7': return { structs: ['p1', 'M3', 'p5', 'M7'], lower: '', upper: 'M9' };
    case 'm7': return { structs: ['p1', 'm3', 'p5', 'm7'], lower: 'm', upper: 'm9' };
    case 'mmaj7': return { structs: ['p1', 'm3', 'p5', 'M7'], lower: 'm' };
    case '7sus4': return { structs: ['p1', 'p4', 'p5', 'm7'], lower: 'sus4' };
    case 'dim7': return { structs: ['p1', 'm3', 'd5', 'd7'], lower: 'dim' };
    case 'aug7': return { structs: ['p1', 'M3', 'a5', 'm7'], lower: 'aug' };
    case '6': return { structs: ['p1', 'M3', 'p5', 'M6'] };
    case 'm6': return { structs: ['p1', 'm3', 'p5', 'M6'] };
    case 'add9': return { structs: ['p1', 'M3', 'p5', 'M2'], lower: '' };
    case 'madd9': return { structs: ['p1', 'm3', 'p5', 'M2'], lower: '' };
    case '9': return { structs: ['p1', 'M3', 'p5', 'm7', 'M2'], lower: '7', upper: '11' };
    case 'm9': return { structs: ['p1', 'm3', 'p5', 'm7', 'M2'], lower: 'm7', upper: 'm11' };
    case 'M9': return { structs: ['p1', 'M3', 'p5', 'M7', 'M2'], lower: 'M7' };
    case '11': return { structs: ['p1', 'M3', 'p5', 'm7', 'M2', 'p4'], lower: '9', upper: '13' };
    case 'm11': return { structs: ['p1', 'm3', 'p5', 'm7', 'M2', 'p4'], lower: 'm9', upper: 'm13' };
    case '13': return { structs: ['p1', 'M3', 'p5', 'm7', 'M2', 'p4', 'M6'], lower: '11' };
    case 'm13': return { structs: ['p1', 'm3', 'p5', 'm7', 'M2', 'p4', 'M6'], lower: 'm11' };
  }
};

export const noteNameFromMidi = (midi: number) => {
  const pitchClass = midi % 12;
  const octave = Math.floor(midi / 12) - 1;

  return `${ROOT_NOTES[pitchClass]}${octave}`;
};

export const pitchClassFromNote = (note: RootNote) => ROOT_NOTES.indexOf(note);

export const getChordPitchClasses = (root: RootNote, symbol: ChordSymbol) => {
  const rootPitchClass = pitchClassFromNote(root);
  const props = getSymbolProps(symbol);

  return props.structs.map((relation) => (rootPitchClass + getIntervalFromRelation(relation)) % 12);
};

export const getChordNoteNames = (root: RootNote, symbol: ChordSymbol) => {
  return getChordPitchClasses(root, symbol).map((pitchClass) => ROOT_NOTES[pitchClass]);
};

export const isChordTone = (midi: number, pitchClasses: number[]) => {
  return pitchClasses.includes(midi % 12);
};
