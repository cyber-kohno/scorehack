import RhythmTheory from "../../../domain/theory/rhythm-theory";
import MelodyState from "../../../store/state/data/melody-state";

export type NoteDisplayUnit = "beat" | "eighth" | "sixteenth" | "triplet";

export type NoteDisplayFactor = {
    unit: NoteDisplayUnit;
    length: number;
};

export type NoteDisplayRate = {
    div: number;
    len: number;
};

const isMultiple = (value: number, unit: number) => {
    const rate = value / unit;
    return Math.abs(rate - Math.round(rate)) <= 1e-9;
};

const isAligned = (pos: number, unit: number) => isMultiple(pos, unit);

export const getNoteDisplayUnit = (
    note: MelodyState.Note,
    ts: RhythmTheory.TimeSignature,
): NoteDisplayUnit => {
    if (note.norm.tuplets != undefined) return "triplet";

    const length = MelodyState.calcBeat(note.norm, note.len);
    const pos = MelodyState.calcBeat(note.norm, note.pos);
    const beatLength = RhythmTheory.getBeatDiv16Count(ts) / 4;

    if (isAligned(pos, beatLength) && isMultiple(length, beatLength)) return "beat";
    if (isAligned(pos, 1 / 2) && isMultiple(length, 1 / 2)) return "eighth";
    return "sixteenth";
};

export const getProtrusionHeight = (unit: NoteDisplayUnit) => {
    switch (unit) {
        case "beat": return 28;
        case "eighth": return 14;
        case "sixteenth": return 7;
        case "triplet": return 10;
    }
};

export const getNoteDisplayRate = (
    note: MelodyState.Note,
    ts: RhythmTheory.TimeSignature,
): NoteDisplayRate => {
    switch (getNoteDisplayUnit(note, ts)) {
        case "beat":
            return RhythmTheory.getMelodyInputRates(ts)[2];
        case "eighth":
            return { div: 2, len: 1 };
        case "sixteenth":
            return { div: 4, len: 1 };
        case "triplet":
            return {
                div: note.norm.div,
                len: 1,
            };
    }
};

export const splitNoteDisplayFactors = (
    note: MelodyState.Note,
    ts: RhythmTheory.TimeSignature,
): NoteDisplayFactor[] => {
    const factors: NoteDisplayFactor[] = [];
    let pos = MelodyState.calcBeat(note.norm, note.pos);
    const tail = MelodyState.calcBeat(note.norm, note.pos + note.len);
    const beatLength = RhythmTheory.getBeatDiv16Count(ts) / 4;
    const eighthLength = 1 / 2;
    const sixteenthLength = 1 / 4;
    const unitLength = MelodyState.calcBeat(note.norm, 1);

    let cnt = 0;
    while (pos < tail - 1e-9) {
        if (cnt > 50) throw new Error("cnt exceeded 50.");

        if (note.norm.tuplets != undefined) {
            factors.push({ unit: "triplet", length: unitLength });
            pos += unitLength;
        } else if (isAligned(pos, beatLength) && pos + beatLength <= tail + 1e-9) {
            factors.push({ unit: "beat", length: beatLength });
            pos += beatLength;
        } else if (isAligned(pos, eighthLength) && pos + eighthLength <= tail + 1e-9) {
            factors.push({ unit: "eighth", length: eighthLength });
            pos += eighthLength;
        } else {
            factors.push({ unit: "sixteenth", length: sixteenthLength });
            pos += sixteenthLength;
        }

        cnt++;
    }

    return factors;
};
