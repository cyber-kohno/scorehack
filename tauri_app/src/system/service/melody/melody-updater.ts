import Layout from "../../layout/layout-constant";
import RhythmTheory from "../../domain/theory/rhythm-theory";
import TonalityTheory from "../../domain/theory/tonality-theory";
import MelodyState from "../../store/state/data/melody-state";
import type ControlState from "../../store/state/control-state";
import type DataState from "../../store/state/data/data-state";
import type DerivedState from "../../store/state/derived-state";
import createNoteClipboardUpdater from "./note-clipboard-updater";
import createNoteComposeUpdater from "./note-compose-updater";
import createNotePositionUpdater from "./note-position-updater";

type Context = {
    control: ControlState.Value;
    data: DataState.Value;
};

const createMelodyUpdater = (ctx: Context) => {
    const { data } = ctx;
    const melody = ctx.control.melody;
    const track = data.scoreTracks[melody.trackIndex] as MelodyState.ScoreTrack;
    const noteComposeUpdater = createNoteComposeUpdater({ melody, track });
    const notePositionUpdater = createNotePositionUpdater({ melody, track });
    const noteClipboardUpdater = createNoteClipboardUpdater({
        melody,
        track,
        moveNoteByUnit: notePositionUpdater.moveNoteByUnit,
    });

    const isNearInteger = (value: number) => {
        return Math.abs(value - Math.round(value)) < 0.000001;
    };

    const getChordHeadBeatNote = (
        chordCache: DerivedState.ChordCache,
        baseCache: DerivedState.BaseCache,
    ) => {
        const beatDiv16Cnt = RhythmTheory.getBeatDiv16Count(baseCache.scoreBase.rhythm.ts);
        const beatRate = beatDiv16Cnt / 4;

        return chordCache.startBeatNote + (chordCache.beat.eatHead / beatDiv16Cnt) * beatRate;
    };

    const setCursorFromBeatNote = (
        pos: number,
        ts: RhythmTheory.TimeSignature,
    ) => {
        const cursor = melody.cursor;
        const rates = RhythmTheory.getMelodyInputRates(ts);
        const rate = [...rates]
            .reverse()
            .find((rate) => isNearInteger(pos / MelodyState.calcBeat({ div: rate.div }, 1)))
            ?? rates[0];
        const unitBeat = MelodyState.calcBeat({ div: rate.div }, 1);
        const normalizedPos = pos / unitBeat;

        if (!isNearInteger(normalizedPos)) {
            throw new Error(`Cannot represent cursor position. [${pos}]`);
        }

        cursor.norm.div = rate.div;
        cursor.norm.tuplets = undefined;
        cursor.pos = Math.round(normalizedPos);
        cursor.len = rate.len;
        MelodyState.normalize(cursor);
    };

    const getFocusNote = () => {
        return track.notes[melody.focus];
    };

    const syncCursorFromElementSeq = (derived: DerivedState.Value) => {
        const focus = ctx.control.outline.focus;
        const elementCache = derived.elementCaches[focus];
        const { lastChordSeq, chordSeq } = elementCache;
        let pos = 0;

        // 先頭以降�E要素
        if (lastChordSeq !== -1) {
            const chordCache = derived.chordCaches[lastChordSeq];
            const baseCache = derived.baseCaches[chordCache.baseSeq];

            pos = getChordHeadBeatNote(chordCache, baseCache);
            // コード要素
            if (chordSeq === -1) pos += chordCache.lengthBeatNote;
        }

        const baseCache = derived.baseCaches[elementCache.baseSeq];

        setCursorFromBeatNote(pos, baseCache.scoreBase.rhythm.ts);
        melody.focus = -1;
    };

    const movePitch = (note: MelodyState.Note, dir: number) => {
        const max = Layout.pitch.NUM - 1;
        let pitch = note.pitch + dir;
        if (pitch < 0) pitch = 0;
        if (pitch > max) pitch = max;
        note.pitch = pitch;
    };

    const movePitchInScale = (
        note: MelodyState.Note,
        tonality: TonalityTheory.Tonality,
        dir: -1 | 1,
    ) => {
        const max = Layout.pitch.NUM - 1;
        let pitch = note.pitch;
        while (true) {
            pitch += dir;
            const isScale = TonalityTheory.isScale(pitch, tonality);
            if (isScale) break;
        }
        if (pitch < 0) pitch = 0;
        if (pitch > max) pitch = max;
        note.pitch = pitch;
    };

    const moveCursor = (dir: -1 | 1) => {
        melody.cursor.pos += dir * melody.cursor.len;
    };
    const adjustCursorRateForTimeSignature = (ts: RhythmTheory.TimeSignature) => {
        const cursor = melody.cursor;
        if (cursor.norm.tuplets != undefined) return;

        const rates = RhythmTheory.getMelodyInputRates(ts);
        const currentRate = rates.find(rate =>
            rate.div === cursor.norm.div && rate.len === cursor.len
        );
        if (currentRate != undefined) return;

        const cursorBeat = MelodyState.calcBeat(cursor.norm, cursor.pos);
        const cursorLenBeat = MelodyState.calcBeat(cursor.norm, cursor.len);
        const nextRate = rates
            .map(rate => ({
                rate,
                beat: MelodyState.calcBeat({ div: rate.div }, rate.len),
            }))
            .sort((left, right) => {
                const leftDiff = Math.abs(left.beat - cursorLenBeat);
                const rightDiff = Math.abs(right.beat - cursorLenBeat);
                if (Math.abs(leftDiff - rightDiff) > 1e-9) return leftDiff - rightDiff;
                return right.beat - left.beat;
            })[0]?.rate;

        if (nextRate == undefined) return;

        const nextUnitBeat = MelodyState.calcBeat({ div: nextRate.div }, 1);
        const nextPos = cursorBeat / nextUnitBeat;
        if (!isNearInteger(nextPos)) return;

        cursor.norm.div = nextRate.div;
        cursor.norm.tuplets = undefined;
        cursor.pos = Math.round(nextPos);
        cursor.len = nextRate.len;
    };

    const changeCursorDiv = (div: number) => {
        const cursor = melody.cursor;
        const prev = cursor.norm.div;
        const rate = div / prev;
        cursor.norm.div = div;
        cursor.norm.tuplets = undefined;
        cursor.pos = Math.floor(cursor.pos * rate);
    };

    const changeCursorRate = (rate: { div: number; len: number }, baseStartBeatNote: number) => {
        const cursor = melody.cursor;
        const currentBeat = MelodyState.calcBeat(cursor.norm, cursor.pos);
        const unitBeat = MelodyState.calcBeat({ div: rate.div }, 1);
        const rawLocalPos = (currentBeat - baseStartBeatNote) / unitBeat;
        const localPos = Math.floor((rawLocalPos + 1e-9) / rate.len) * rate.len;
        const pos = Math.round(baseStartBeatNote / unitBeat) + localPos;

        cursor.norm.div = rate.div;
        cursor.norm.tuplets = undefined;
        cursor.pos = pos;
        cursor.len = rate.len;
    };

    const setCursorRate = (rate: { div: number; len: number }) => {
        melody.cursor.norm.div = rate.div;
        melody.cursor.norm.tuplets = undefined;
        melody.cursor.len = rate.len;
    };

    const changeCursorTuplets = (tuplets: number) => {
        const cursor = melody.cursor;
        if (![1, 2].includes(cursor.norm.div)) return;
        const prev = cursor.norm.tuplets ?? 1;
        const nextTuplets = prev === tuplets ? 1 : tuplets;
        const rate = nextTuplets / prev;
        cursor.norm.tuplets = nextTuplets;
        cursor.pos = Math.floor(cursor.pos * rate);

        if (cursor.norm.tuplets === 1) cursor.norm.tuplets = undefined;
    };

    const judgeOverlap = () => {
        const overlapNote = track.notes.find(n => {
            return MelodyState.judgeOverlapNotes(n, melody.cursor);
        });
        melody.isOverlap = overlapNote != undefined;
    };

    const addNote = (
        track: MelodyState.ScoreTrack,
        note: MelodyState.Note,
    ) => {
        track.notes.push(note);
        track.notes.sort((n1, n2) => {
            const [n1Pos, n2Pos] = [n1, n2].map(n => MelodyState.calcBeat(n.norm, n.pos));
            return n1Pos - n2Pos;
        });
    };

    const addNoteFromCursor = (baseTail: number) => {
        const side = MelodyState.calcBeatSide(melody.cursor);
        if (side.pos + side.len > baseTail) return false;

        addNote(track, JSON.parse(JSON.stringify(melody.cursor)));
        return true;
    };

    const createNextNoteFromFocus = (note: MelodyState.Note) => {
        const norm = { ...melody.cursor.norm };
        const unitBeat = MelodyState.calcBeat(norm, 1);
        const startBeat = MelodyState.calcBeat(note.norm, note.pos + note.len);
        const rawPos = startBeat / unitBeat;
        const pos = Math.round(rawPos);

        if (Math.abs(rawPos - pos) > 1e-9) return undefined;

        const nextNote: MelodyState.Note = {
            norm,
            pos,
            len: melody.cursor.len,
            pitch: note.pitch,
        };
        return nextNote;
    };

    const addNoteFromFocus = (note: MelodyState.Note, baseTail: number) => {
        const nextNote = createNextNoteFromFocus(note);
        if (nextNote == undefined) return false;

        const nextSide = MelodyState.calcBeatSide(nextNote);
        if (nextSide.pos + nextSide.len > baseTail) return false;

        const isOverlap = track.notes.find(n => {
            return MelodyState.judgeOverlapNotes(n, nextNote);
        }) != undefined;

        if (isOverlap) return false;

        addNote(track, nextNote);
        MelodyState.normalize(note);
        focusNext();
        return true;
    };

    const focusNext = () => {
        melody.focus++;
    };

    const focusInNearNote = (dir: -1 | 1) => {
        const cursorPos = MelodyState.calcBeat(melody.cursor.norm, melody.cursor.pos);
        const notes = track.notes;
        const targetNotes = dir === -1 ? notes.slice().reverse() : notes;
        const matchIndex = targetNotes.findIndex(n => {
            const side = MelodyState.calcBeatSide(n);
            const [left, right] = [side.pos, side.pos + side.len];
            return dir === -1 ? cursorPos > left : cursorPos < right;
        });

        if (matchIndex !== -1) {
            melody.focus = dir === -1 ? notes.length - 1 - matchIndex : matchIndex;
        }
    };

    const moveFocus = (dir: -1 | 1) => {
        const prev = track.notes[melody.focus];
        melody.focus += dir;
        if (prev != undefined) MelodyState.normalize(prev);
    };

    const clearFocusLock = () => {
        melody.focusLock = -1;
    };

    const lockFocusIfNeeded = () => {
        if (melody.focusLock === -1) melody.focusLock = melody.focus;
    };

    const setNoOverlap = () => {
        melody.isOverlap = false;
    };

    const getFocusRange = () => {
        if (melody.focusLock === -1) return [melody.focus, melody.focus];
        return melody.focus < melody.focusLock
            ? [melody.focus, melody.focusLock]
            : [melody.focusLock, melody.focus];
    };

    const movePitchFocusRange = (start: number, end: number, dir: number) => {
        track.notes.slice(start, end + 1).forEach(n => {
            n.pitch += dir;
        });
    };

    const moveRangePitch = (dir: number) => {
        const [start, end] = getFocusRange();
        const targets = track.notes.slice(start, end + 1);
        const canMove = targets.find(target => {
            return !MelodyState.validatePitch(target.pitch + dir);
        }) == undefined;

        if (!canMove) return false;

        movePitchFocusRange(start, end, dir);
        return true;
    };

    const moveRangePitchInScale = (tonality: TonalityTheory.Tonality, dir: -1 | 1) => {
        const [start, end] = getFocusRange();
        const targets = track.notes.slice(start, end + 1);
        const canMove = targets.find(target => {
            const nextNote = JSON.parse(JSON.stringify(target)) as MelodyState.Note;
            movePitchInScale(nextNote, tonality, dir);
            return !MelodyState.validatePitch(nextNote.pitch);
        }) == undefined;

        if (!canMove) return false;

        targets.forEach(target => {
            movePitchInScale(target, tonality, dir);
        });
        return true;
    };

    const focusOutNoteSide = (note: MelodyState.Note, dir: -1 | 1) => {
        const cursor = melody.cursor;
        const sideBeat = MelodyState.calcBeat(note.norm, note.pos + (dir === 1 ? note.len : 0));
        const cursorLenBeat = MelodyState.calcBeat(cursor.norm, cursor.len);
        const norm = { ...cursor.norm };

        for (let i = 0; i < 8; i++) {
            const unitBeat = MelodyState.calcBeat(norm, 1);
            const rawPos = sideBeat / unitBeat;
            const rawLen = cursorLenBeat / unitBeat;
            const pos = Math.round(rawPos);
            const len = Math.round(rawLen);

            if (Math.abs(rawPos - pos) <= 1e-9 && Math.abs(rawLen - len) <= 1e-9) {
                cursor.norm = norm;
                cursor.pos = pos;
                cursor.len = len;
                break;
            }

            norm.div *= 2;
        }
        melody.focus = -1;
        MelodyState.normalize(note);
    };

    const removeNotes = (start: number, end: number) => {
        track.notes.splice(start, end - start + 1);
    };

    const setNotePron = (note: MelodyState.VocalNote, value: string) => {
        const nextValue = value.trim();
        if (nextValue.length === 0) {
            delete note.pron;
            return;
        }

        note.pron = nextValue;
    };

    const changeFocusNoteDiv = (
        note: MelodyState.Note,
        div: number,
    ) => {
        const prev = note.norm.div;
        const rate = div / prev;
        const pos = note.pos * rate;
        const len = note.len * rate;
        if (!Number.isInteger(pos) || !Number.isInteger(len)) return;

        note.norm.div = div;
        note.pos = pos;
        note.len = len;
    };

    return {
        addNote,
        addNoteFromCursor,
        addNoteFromFocus,
        changeFocusNoteDiv,
        clearFocusLock,
        lockFocusIfNeeded,
        createNextNoteFromFocus,
        focusOutNoteSide,
        focusNext,
        focusInNearNote,
        getFocusRange,
        judgeOverlap,
        changeCursorDiv,
        changeCursorRate,
        adjustCursorRateForTimeSignature,
        setCursorRate,
        ...noteComposeUpdater,
        ...notePositionUpdater,
        ...noteClipboardUpdater,
        changeCursorTuplets,
        moveFocus,
        moveRangePitch,
        moveRangePitchInScale,
        movePitch,
        movePitchInScale,
        moveCursor,
        movePitchFocusRange,
        removeNotes,
        setNotePron,
        setNoOverlap,
        syncCursorFromElementSeq,
        setCursorFromBeatNote,
    };
};

export default createMelodyUpdater;
