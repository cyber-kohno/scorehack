import ChordTheory from "../../domain/theory/chord-theory";
import RhythmTheory from "../../domain/theory/rhythm-theory";
import { describeKey, describePitchInChord, describePitchInKey, pitchClass } from "../../domain/theory/pitch-context";
import { addQ, compareQ, divQ, floorQ, fromNumber, intersectQ, maxQ, minQ, mulQ, noteRangeQ, q, subQ, ZERO_Q, type Q, type QRange } from "../../domain/time/rational";
import type DerivedState from "../../store/state/derived-state";
import type ElementState from "../../store/state/data/element-state";
import DegreeBasis from "../notation/degree-basis";
import { ScoreQueryError, type MusicalPosition, type QueryRange, type Snapshot, type TimedItem } from "./query-types";

type Base = { startQ: Q; endQ: Q; cache: DerivedState.BaseCache };
type Chord = { ref: string; range: QRange; nominalRange: QRange; cache: DerivedState.ChordCache; degree?: ChordTheory.DegreeChord };
type Section = { ref: string; name: string; range: QRange };

export const trackRef = (kind: "score" | "arrange" | "audio", index: number) => `${kind}:${index}`;

/** A semantic projection of the shared derived calculation, with exact boundaries. */
export class MusicTimeline {
    readonly bases: Base[] = [];
    readonly chords: Chord[] = [];
    readonly sections: Section[] = [];
    readonly changes: TimedItem[] = [];
    readonly noteRanges: QRange[][] = [];
    readonly extent: QRange;
    readonly outlineRange: QRange;

    constructor(readonly snapshot: Snapshot) {
        let cursor = ZERO_Q;
        let previousEat = ZERO_Q;
        const baseMap = new Map<number, Base>();
        const enterBase = (baseSeq: number) => {
            const cache = snapshot.derived.baseCaches[baseSeq];
            if (cache === undefined) throw new ScoreQueryError("INVALID_SCORE", "Derived base is missing.");
            if (!baseMap.has(baseSeq)) {
                const previous = this.bases.at(-1);
                if (previous) previous.endQ = cursor;
                const base = { startQ: cursor, endQ: cursor, cache };
                baseMap.set(baseSeq, base);
                this.bases.push(base);
            }
        };
        snapshot.data.elements.forEach((element, index) => {
            const cache = snapshot.derived.elementCaches[index];
            if (!cache) throw new ScoreQueryError("INVALID_SCORE", "Derived element is missing.");
            enterBase(cache.baseSeq);
            if (element.type === "section") {
                const previous = this.sections.at(-1);
                if (previous) previous.range.endQ = cursor;
                this.sections.push({ ref: `section:${index}`, name: (element.data as ElementState.DataSection).name, range: { startQ: cursor, endQ: cursor } });
            } else if (element.type === "chord") {
                const chordCache = snapshot.derived.chordCaches[cache.chordSeq];
                const data = element.data as ElementState.DataChord;
                if (!chordCache || !Number.isFinite(data.beat) || data.beat <= 0) throw new ScoreQueryError("INVALID_SCORE", "Chord duration must be positive.");
                const unit = q(RhythmTheory.getBeatDiv16Count(this.baseAt(cursor).cache.scoreBase.rhythm.ts), 4);
                const nominalEnd = addQ(cursor, mulQ(fromNumber(data.beat), unit));
                const range = { startQ: addQ(cursor, previousEat), endQ: addQ(nominalEnd, divQ(fromNumber(data.eat), q(4))) };
                if (compareQ(range.startQ, range.endQ) >= 0) throw new ScoreQueryError("INVALID_SCORE", "Syncopation produces a non-positive chord span.");
                this.chords.push({ ref: `chord:${chordCache.chordSeq}`, cache: chordCache, degree: data.degree, nominalRange: { startQ: cursor, endQ: nominalEnd }, range });
                cursor = nominalEnd;
                previousEat = divQ(fromNumber(data.eat), q(4));
            } else if (element.type === "modulate" || element.type === "tempo" || element.type === "rhythm") {
                this.changes.push({ kind: element.type, ref: `element:${index}`, range: { startQ: cursor, endQ: cursor }, definition: structuredClone(element.data), resolved: structuredClone(cache.modulate ?? cache.tempo ?? cache.rhythm) });
            }
        });
        if (this.bases.length === 0) throw new ScoreQueryError("INVALID_SCORE", "Score has no initial musical context.");
        this.bases.at(-1)!.endQ = cursor;
        const soundingStart = this.chords.reduce((start, chord) => minQ(start, chord.range.startQ), ZERO_Q);
        const soundingEnd = this.chords.reduce((end, chord) => maxQ(end, chord.range.endQ), ZERO_Q);
        let startQ = soundingStart, endQ = maxQ(cursor, soundingEnd);
        for (const track of snapshot.data.scoreTracks) {
            this.noteRanges.push(track.notes.map(note => {
                if (!Number.isSafeInteger(note.pitch) || note.pitch < 0 || note.pitch > 127) throw new ScoreQueryError("INVALID_SCORE", "Note pitch is invalid.");
                const range = noteRangeQ(note);
                startQ = minQ(startQ, range.startQ);
                endQ = maxQ(endQ, range.endQ);
                return range;
            }));
        }
        this.outlineRange = { startQ: soundingStart, endQ: soundingEnd };
        this.extent = { startQ, endQ };
        if (this.sections.at(-1)) this.sections.at(-1)!.range.endQ = endQ;
    }

    baseAt(position: Q): Base {
        return this.bases.findLast(base => compareQ(base.startQ, position) <= 0) ?? this.bases[0];
    }

    position(position: Q): MusicalPosition {
        const base = this.baseAt(position);
        const delta = subQ(position, base.startQ);
        const beatUnitQ = q(RhythmTheory.getBeatDiv16Count(base.cache.scoreBase.rhythm.ts), 4);
        if (compareQ(delta, ZERO_Q) < 0) return { q: position, bar: null, beat: null, offsetInBeatQ: null, beatUnitQ };
        const beatIndex = floorQ(divQ(delta, beatUnitQ));
        const beatsInBar = RhythmTheory.getBarDivBeatCount(base.cache.scoreBase.rhythm.ts);
        return {
            q: position,
            bar: base.cache.startBar + Math.floor(beatIndex / beatsInBar),
            beat: beatIndex % beatsInBar + 1,
            offsetInBeatQ: subQ(delta, mulQ(q(beatIndex), beatUnitQ)),
            beatUnitQ,
        };
    }

    qAtBar(bar: number): Q {
        const base = this.bases.findLast(item => item.cache.startBar <= bar);
        if (!base) throw new ScoreQueryError("INVALID_RANGE", "Bar is outside the score numbering convention.");
        const rhythm = base.cache.scoreBase.rhythm;
        return addQ(base.startQ, mulQ(q(bar - base.cache.startBar), q(RhythmTheory.getBarDivBeatCount(rhythm.ts) * RhythmTheory.getBeatDiv16Count(rhythm.ts), 4)));
    }

    melodySelection() {
        const control = this.snapshot.control.melody;
        if (control.focus === -1) return null;
        const track = this.snapshot.data.scoreTracks[control.trackIndex];
        if (!track) throw new ScoreQueryError("INVALID_SELECTION", "Selected melody track does not exist.");
        const a = Math.min(control.focus, control.focusLock === -1 ? control.focus : control.focusLock);
        const b = Math.max(control.focus, control.focusLock === -1 ? control.focus : control.focusLock);
        if (a < 0 || b >= track.notes.length) throw new ScoreQueryError("INVALID_SELECTION", "Selected note indices are stale.");
        const ranges = this.noteRanges[control.trackIndex].slice(a, b + 1);
        return {
            kind: a === b ? "note" : "notes",
            trackRef: trackRef("score", control.trackIndex),
            indexRange: { from: a, through: b },
            count: b - a + 1,
            noteRefs: Array.from({ length: Math.min(b - a + 1, 128) }, (_, offset) => `note:${control.trackIndex}:${a + offset}`),
            refsComplete: b - a + 1 <= 128,
            range: { startQ: ranges.reduce((v, r) => minQ(v, r.startQ), ranges[0].startQ), endQ: ranges.reduce((v, r) => maxQ(v, r.endQ), ranges[0].endQ) },
        };
    }

    outlineSelection() {
        const control = this.snapshot.control.outline;
        if (control.focus === -1) return null;
        const from = Math.min(control.focus, control.focusLock === -1 ? control.focus : control.focusLock);
        const through = Math.max(control.focus, control.focusLock === -1 ? control.focus : control.focusLock);
        if (from < 0 || through >= this.snapshot.data.elements.length) throw new ScoreQueryError("INVALID_SELECTION", "Selected outline indices are stale.");
        const spans = this.chords.filter(chord => chord.cache.elementSeq >= from && chord.cache.elementSeq <= through).map(chord => chord.range);
        if (from === through) {
            const section = this.sections.find(item => item.ref === `section:${from}`);
            if (section) spans.push(section.range);
        }
        const range = spans.length === 0 ? null : {
            startQ: spans.reduce((v, r) => minQ(v, r.startQ), spans[0].startQ),
            endQ: spans.reduce((v, r) => maxQ(v, r.endQ), spans[0].endQ),
        };
        return { kind: "outline", indexRange: { from, through }, count: through - from + 1,
            elementRefs: Array.from({ length: Math.min(through - from + 1, 128) }, (_, i) => `element:${from + i}`), refsComplete: through - from + 1 <= 128, range };
    }

    resolveRange(input: QueryRange): QRange {
        let result: QRange | null | undefined;
        switch (input.kind) {
            case "all": result = this.extent; break;
            case "q": result = { startQ: q(input.startQ.numerator, input.startQ.denominator), endQ: q(input.endQ.numerator, input.endQ.denominator) }; break;
            case "bars": result = { startQ: this.qAtBar(input.fromBar), endQ: this.qAtBar(input.throughBar + 1) }; break;
            case "section": result = this.sections.find(item => item.ref === input.sectionRef)?.range; break;
            case "chord": result = this.chords.find(item => item.ref === input.chordRef)?.range; break;
            case "selection": result = input.source === "melody" ? this.melodySelection()?.range : this.outlineSelection()?.range; break;
        }
        if (!result) throw new ScoreQueryError(input.kind === "selection" ? "NO_SELECTION_RANGE" : "INVALID_REFERENCE", "No time range resolves from this target in the snapshot.");
        if (compareQ(result.startQ, result.endQ) >= 0) throw new ScoreQueryError("EMPTY_RANGE", "Requested range has no duration.");
        return structuredClone(result);
    }

    expandRange(range: QRange, context?: { beforeBars: number; afterBars: number }): QRange {
        let { startQ, endQ } = range;
        if (context?.beforeBars) startQ = minQ(startQ, this.qAtBar(Math.max(1, (this.position(startQ).bar ?? 1) - context.beforeBars)));
        if (context?.afterBars) {
            const end = this.position(endQ);
            const nextBar = (end.bar ?? 1) + (end.beat === 1 && compareQ(end.offsetInBeatQ!, ZERO_Q) === 0 ? 0 : 1);
            endQ = maxQ(endQ, this.qAtBar(nextBar + context.afterBars));
        }
        return { startQ, endQ };
    }

    chordItem(chord: Chord, harmonic: boolean): TimedItem {
        const base = this.snapshot.derived.baseCaches[chord.cache.baseSeq];
        const tonality = base.scoreBase.tonality;
        const compiled = chord.cache.compiledChord;
        return {
            kind: "chord", ref: chord.ref, elementRef: `element:${chord.cache.elementSeq}`,
            range: chord.range, nominalRange: chord.nominalRange,
            start: this.position(chord.range.startQ), end: this.position(chord.range.endQ),
            beat: structuredClone(chord.cache.beat), status: compiled ? "assigned" : "unassigned",
            degree: chord.degree ? ChordTheory.getDegreeChordName(chord.degree) : null,
            displayDegree: chord.degree ? ChordTheory.getDegreeChordName(DegreeBasis.toDisplayDegree(chord.degree, tonality, this.snapshot.settings.notation.degreeBasis)) : null,
            absoluteChord: compiled ? ChordTheory.getKeyChordName(compiled.chord) : null,
            key: describeKey(tonality), displayKey: describeKey(DegreeBasis.getDisplayTonality(tonality, this.snapshot.settings.notation.degreeBasis)),
            ...(harmonic && compiled ? { rootPitchClass: pitchClass(compiled.chord.key12), bassPitchClass: pitchClass(compiled.chord.on?.key12 ?? compiled.chord.key12), components: compiled.structs.map(s => ({ pitchClass: pitchClass(s.key12), relation: s.relation })) } : {}),
            warnings: structuredClone(chord.cache.error),
        };
    }

    outlineItems(range: QRange, harmonic: boolean): TimedItem[] {
        return [
            ...this.chords.filter(chord => intersectQ(chord.range, range)).map(chord => this.chordItem(chord, harmonic)),
            ...this.sections.filter(section => intersectQ(section.range, range)).map(section => ({ kind: "section", ...section })),
            ...this.changes.filter(change => compareQ(change.range.startQ, range.startQ) >= 0 && compareQ(change.range.startQ, range.endQ) < 0),
        ];
    }

    noteContexts(pitch: number, range: QRange) {
        const boundaries = [range.startQ, range.endQ,
            ...this.bases.map(base => base.startQ),
            ...this.chords.flatMap(chord => [chord.range.startQ, chord.range.endQ]),
            ...this.sections.flatMap(section => [section.range.startQ, section.range.endQ]),
        ].filter(pos => compareQ(pos, range.startQ) >= 0 && compareQ(pos, range.endQ) <= 0).sort(compareQ);
        const unique = boundaries.filter((pos, i) => i === 0 || compareQ(pos, boundaries[i - 1]) !== 0);
        return unique.slice(0, -1).map((startQ, index) => {
            const key = this.baseAt(startQ).cache.scoreBase.tonality;
            const chords = this.chords.filter(chord => compareQ(chord.range.startQ, startQ) <= 0 && compareQ(startQ, chord.range.endQ) < 0);
            return {
                range: { startQ, endQ: unique[index + 1] }, key: describeKey(key), ...describePitchInKey(pitch, key),
                displayDegree: DegreeBasis.getScaleDegreeLabel(pitch, key, this.snapshot.settings.notation.degreeBasis),
                sectionRefs: this.sections.filter(section => compareQ(section.range.startQ, startQ) <= 0 && compareQ(startQ, section.range.endQ) < 0).map(section => section.ref),
                harmonyStatus: chords.length === 0 ? "outside-outline" : chords.every(chord => chord.cache.compiledChord === undefined) ? "unassigned" : "assigned",
                chords: chords.map(chord => ({ chordRef: chord.ref, key: describeKey(this.snapshot.derived.baseCaches[chord.cache.baseSeq].scoreBase.tonality),
                    absoluteChord: chord.cache.compiledChord ? ChordTheory.getKeyChordName(chord.cache.compiledChord.chord) : null,
                    relation: chord.cache.compiledChord ? describePitchInChord(pitch, chord.cache.compiledChord.chord) : null })),
            };
        });
    }
}
