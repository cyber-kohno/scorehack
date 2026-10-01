import type ControlState from "../../store/state/control-state";
import MelodyState from "../../store/state/data/melody-state";

type Context = {
    melody: ControlState.MelodyValue;
    track: MelodyState.ScoreTrack;
};

export type MoveNoteFailureReason = "limit" | "collision" | "invalid-unit";

export type MoveNoteResult =
    | { ok: true }
    | { ok: false; reason: MoveNoteFailureReason };

const createNotePositionUpdater = (ctx: Context) => {
    const { melody, track } = ctx;

    const ok = (): MoveNoteResult => ({ ok: true });
    const fail = (reason: MoveNoteFailureReason): MoveNoteResult => ({
        ok: false,
        reason,
    });

    const getFocusRange = () => {
        if (melody.focusLock === -1) return [melody.focus, melody.focus];
        return melody.focus < melody.focusLock
            ? [melody.focus, melody.focusLock]
            : [melody.focusLock, melody.focus];
    };

    const scaleNoteByUnit = (
        note: MelodyState.Note,
        unit: MelodyState.Note,
    ) => {
        const size = unit.pos;
        if (unit.norm.div > note.norm.div) {
            const rate = unit.norm.div / note.norm.div;
            note.norm.div = unit.norm.div;
            note.norm.tuplets = unit.norm.tuplets;
            note.pos *= rate;
            note.len *= rate;
            note.len += size;
        } else {
            const tuplets = note.norm.tuplets ?? 1;
            const rate = (note.norm.div * tuplets) / unit.norm.div;
            note.len += size * rate;
        }
    };

    const moveNoteByUnit = (
        note: MelodyState.Note,
        unit: MelodyState.Note,
    ) => {
        const dir = unit.pos;
        if (note.norm.div >= unit.norm.div) {
            const tuplets = note.norm.tuplets ?? 1;
            const rate = (note.norm.div * tuplets) / unit.norm.div;
            note.pos += dir * rate;
        } else {
            const rate = unit.norm.div / note.norm.div;
            note.norm.div = unit.norm.div;
            note.pos *= rate;
            note.len *= rate;
            note.pos += dir;
        }
    };

    const moveNoteLen = (note: MelodyState.Note, dir: -1 | 1, baseTail: number) => {
        const nextNote: MelodyState.Note = JSON.parse(JSON.stringify(note));
        scaleNoteByUnit(nextNote, { ...melody.cursor, pos: dir * melody.cursor.len });
        if (nextNote.len <= 0) return fail("limit");

        const nextSide = MelodyState.calcBeatSide(nextNote);
        if (nextSide.pos < 0) return fail("limit");
        if (nextSide.pos + nextSide.len > baseTail) return fail("limit");

        const otherNotes = track.notes.slice();
        otherNotes.splice(melody.focus, 1);
        const isOverlap = otherNotes.find(n => MelodyState.judgeOverlapNotes(n, nextNote)) != undefined;

        if (isOverlap) return fail("collision");

        scaleNoteByUnit(note, { ...melody.cursor, pos: dir * melody.cursor.len });
        MelodyState.normalize(note);
        return ok();
    };

    const moveNotePos = (note: MelodyState.Note, dir: -1 | 1, baseTail: number) => {
        const nextNote: MelodyState.Note = JSON.parse(JSON.stringify(note));
        moveNoteByUnit(nextNote, { ...melody.cursor, pos: dir * melody.cursor.len });
        const nextSide = MelodyState.calcBeatSide(nextNote);
        if (nextSide.pos < 0) return fail("limit");
        if (nextSide.pos + nextSide.len > baseTail) return fail("limit");

        const otherNotes = track.notes.slice();
        otherNotes.splice(melody.focus, 1);
        const isOverlap = otherNotes.find(n => MelodyState.judgeOverlapNotes(n, nextNote)) != undefined;

        if (isOverlap) return fail("collision");

        moveNoteByUnit(note, { ...melody.cursor, pos: dir * melody.cursor.len });
        MelodyState.normalize(note);
        return ok();
    };

    const moveRangePos = (dir: -1 | 1, baseTail: number) => {
        const [start, end] = getFocusRange();
        const criteria = track.notes[melody.focus];
        const notes = track.notes;

        if (criteria == undefined || criteria.norm.tuplets != undefined) return fail("invalid-unit");

        const moveByCriteria = (note: MelodyState.Note) => {
            const temp = JSON.parse(JSON.stringify(note)) as MelodyState.Note;
            moveNoteByUnit(temp, { ...criteria, pos: dir });
            return temp;
        };
        const temp = moveByCriteria(notes[dir === -1 ? start : end]);

        if (dir === -1) {
            if (temp.pos < 0) return fail("limit");
            if (start > 0) {
                const leftNoteSide = MelodyState.calcBeatSide(notes[start - 1]);
                const leftNoteRight = leftNoteSide.pos + leftNoteSide.len;
                const tempNoteLeft = MelodyState.calcBeatSide(temp).pos;
                if (tempNoteLeft < leftNoteRight) return fail("collision");
            }
        } else {
            const side = MelodyState.calcBeatSide(temp);
            const tempRight = side.pos + side.len;
            if (tempRight > baseTail) return fail("limit");

            if (end < notes.length - 1) {
                const rightNoteLeft = MelodyState.calcBeatSide(notes[end + 1]).pos;
                const tempNoteSide = MelodyState.calcBeatSide(temp);
                const tempNoteRight = tempNoteSide.pos + tempNoteSide.len;
                if (tempNoteRight > rightNoteLeft) return fail("collision");
            }
        }

        const hasInvalidTuplet = notes.slice(start, end + 1).find(note => {
            const tuplets = note.norm.tuplets;
            if (note.norm.div !== criteria.norm.div && tuplets != undefined) {
                if (note.pos % tuplets !== 0) return true;
            }
            return false;
        }) != undefined;

        if (hasInvalidTuplet) return fail("invalid-unit");

        track.notes.slice(start, end + 1).forEach((note, i) => {
            moveNoteByUnit(note, { ...criteria, pos: dir });
            if (melody.focus !== start + i) MelodyState.normalize(note);
        });
        return ok();
    };

    const moveSpaceFromCursor = (dir: -1 | 1, baseTail: number) => {
        const cursor = melody.cursor;
        const notes = track.notes;

        if (cursor.norm.tuplets != undefined) return fail("invalid-unit");

        const startIndex = notes.findIndex(note => {
            const cur = MelodyState.calcBeatSide(cursor).pos;
            const target = MelodyState.calcBeatSide(note).pos;
            return cur <= target;
        });

        if (startIndex === -1) return fail("limit");

        const clone = (index: number) => JSON.parse(JSON.stringify(notes[index])) as MelodyState.Note;
        const temp = clone(dir === -1 ? startIndex : notes.length - 1);
        moveNoteByUnit(temp, { ...cursor, pos: dir * cursor.len });

        if (dir === -1) {
            const cur = MelodyState.calcBeatSide(cursor).pos;
            const target = MelodyState.calcBeatSide(temp).pos;
            if (cur > target) return fail("limit");
        } else {
            const tailNoteSide = MelodyState.calcBeatSide(temp);
            const tailNoteRight = tailNoteSide.pos + tailNoteSide.len;
            if (tailNoteRight > baseTail) return fail("limit");
        }

        const hasInvalidTuplet = notes.slice(startIndex).find(note => {
            const tuplets = note.norm.tuplets;
            if (note.norm.div !== cursor.norm.div && tuplets != undefined) {
                if (note.pos % tuplets !== 0) return true;
            }
            return false;
        }) != undefined;

        if (hasInvalidTuplet) return fail("invalid-unit");

        track.notes.slice(startIndex).forEach(note => {
            moveNoteByUnit(note, { ...cursor, pos: dir * cursor.len });
            MelodyState.normalize(note);
        });
        return ok();
    };

    return {
        moveNoteByUnit,
        moveNotePos,
        moveRangePos,
        moveNoteLen,
        scaleNoteByUnit,
        moveSpaceFromCursor,
    };
};

export default createNotePositionUpdater;
