import Layout from "../../layout/layout-constant";
import RhythmTheory from "../../domain/theory/rhythm-theory";
import TonalityTheory from "../../domain/theory/tonality-theory";
import MelodyState from "../../store/state/data/melody-state";
import type ControlState from "../../store/state/control-state";
import type DataState from "../../store/state/data/data-state";
import type DerivedState from "../../store/state/derived-state";

type Context = {
    control: ControlState.Value;
    data: DataState.Value;
};

const createMelodyUpdater = (ctx: Context) => {
    const { data } = ctx;
    const melody = ctx.control.melody;
    const track = data.scoreTracks[melody.trackIndex] as MelodyState.ScoreTrack;

    const getFocusNote = () => {
        return track.notes[melody.focus];
    };

    const syncCursorFromElementSeq = (derived: DerivedState.Value) => {
        const focus = ctx.control.outline.focus;
        const elementCache = derived.elementCaches[focus];
        const { lastChordSeq, chordSeq } = elementCache;
        let pos = 0;

        // 先頭以降の要素
        if (lastChordSeq !== -1) {
            const chordCache = derived.chordCaches[lastChordSeq];

            pos = chordCache.startBeatNote;
            // コード要素
            if (chordSeq === -1) pos += chordCache.lengthBeatNote;
        }

        const cursor = melody.cursor;
        const baseCache = derived.baseCaches[elementCache.baseSeq];
        const rate = RhythmTheory.getMelodyInputRates(baseCache.scoreBase.ts)[2];

        cursor.norm.div = rate.div;
        cursor.norm.tuplets = undefined;
        cursor.pos = pos / MelodyState.calcBeat(cursor.norm, 1);
        cursor.len = rate.len;
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

    const changeCursorDiv = (div: number) => {
        const cursor = melody.cursor;
        const prev = cursor.norm.div;
        const rate = div / prev;
        cursor.norm.div = div;
        cursor.norm.tuplets = undefined;
        cursor.pos = Math.floor(cursor.pos * rate);
    };

    const changeCursorRate = (rate: { div: number; len: number }) => {
        changeCursorDiv(rate.div);
        melody.cursor.len = rate.len;
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

    const copyNotes = () => {
        const [start, end] = getFocusRange();
        const notes = track.notes.filter((_, i) => {
            return i >= start && i <= end;
        });
        melody.clipboard.notes = JSON.parse(JSON.stringify(notes));
    };

    const sortTrackNotes = (track: MelodyState.ScoreTrack) => {
        track.notes.sort((a, b) => {
            const [aX, bX] = [a, b].map(n => MelodyState.calcBeatSide(n).pos);
            return aX - bX;
        });
    };

    const pasteClipboardNotes = () => {
        const clipNotes = melody.clipboard.notes;
        if (clipNotes == null || clipNotes.length === 0) return;

        const criteria: MelodyState.Note = JSON.parse(JSON.stringify(clipNotes[0]));
        const cursor = melody.cursor;
        criteria.pos *= -1;
        clipNotes.forEach(note => {
            moveNoteByUnit(note, criteria);
            moveNoteByUnit(note, cursor);
            track.notes.push(note);
        });
        sortTrackNotes(track);

        const focusIndex = track.notes.findIndex(note => note == clipNotes[0]);
        melody.focus = focusIndex;
        melody.focusLock = focusIndex + clipNotes.length - 1;
        melody.clipboard.notes = null;
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

    const moveNoteLen = (note: MelodyState.Note, dir: -1 | 1) => {
        const nextNote: MelodyState.Note = JSON.parse(JSON.stringify(note));
        scaleNoteByUnit(nextNote, { ...melody.cursor, pos: dir * melody.cursor.len });
        if (nextNote.len <= 0) return false;

        const otherNotes = track.notes.slice();
        otherNotes.splice(melody.focus, 1);
        const isOverlap = otherNotes.find(n => MelodyState.judgeOverlapNotes(n, nextNote)) != undefined;

        if (isOverlap) return false;

        scaleNoteByUnit(note, { ...melody.cursor, pos: dir * melody.cursor.len });
        MelodyState.normalize(note);
        return true;
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

    /**
     * unit の単位、長さ（pos）分だけ、ノーツ（note）を移動する
     * @param note 移動対象のノーツ
     * @param unit 移動する単位と長さ
     */
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

    const moveNotePos = (note: MelodyState.Note, dir: -1 | 1, baseTail: number) => {
        const nextNote: MelodyState.Note = JSON.parse(JSON.stringify(note));
        moveNoteByUnit(nextNote, { ...melody.cursor, pos: dir * melody.cursor.len });
        const nextSide = MelodyState.calcBeatSide(nextNote);
        if (nextSide.pos < 0) return false;
        if (nextSide.pos + nextSide.len > baseTail) return false;

        const otherNotes = track.notes.slice();
        otherNotes.splice(melody.focus, 1);
        const isOverlap = otherNotes.find(n => MelodyState.judgeOverlapNotes(n, nextNote)) != undefined;

        if (isOverlap) return false;

        moveNoteByUnit(note, { ...melody.cursor, pos: dir * melody.cursor.len });
        MelodyState.normalize(note);
        return true;
    };

    const moveRangePos = (dir: -1 | 1, baseTail: number) => {
        const [start, end] = getFocusRange();
        const criteria = track.notes[melody.focus];
        const notes = track.notes;

        // 基準が連符の場合移動しない
        if (criteria == undefined || criteria.norm.tuplets != undefined) return false;

        const moveByCriteria = (note: MelodyState.Note) => {
            const temp = JSON.parse(JSON.stringify(note)) as MelodyState.Note;
            moveNoteByUnit(temp, { ...criteria, pos: dir });
            return temp;
        };
        const temp = moveByCriteria(notes[dir === -1 ? start : end]);

        // 移動可否チェック
        if (dir === -1) {
            if (temp.pos < 0) return false;
            if (start > 0) {
                const leftNoteSide = MelodyState.calcBeatSide(notes[start - 1]);
                const leftNoteRight = leftNoteSide.pos + leftNoteSide.len;
                const tempNoteLeft = MelodyState.calcBeatSide(temp).pos;
                if (tempNoteLeft < leftNoteRight) return false;
            }
        } else {
            const side = MelodyState.calcBeatSide(temp);
            const tempRight = side.pos + side.len;
            if (tempRight > baseTail) return false;

            if (end < notes.length - 1) {
                const rightNoteLeft = MelodyState.calcBeatSide(notes[end + 1]).pos;
                const tempNoteSide = MelodyState.calcBeatSide(temp);
                const tempNoteRight = tempNoteSide.pos + tempNoteSide.len;
                if (tempNoteRight > rightNoteLeft) return false;
            }
        }

        // カーソルの単位と違う連符がある場合、移動できない
        const hasInvalidTuplet = notes.slice(start, end + 1).find(note => {
            const tuplets = note.norm.tuplets;
            if (note.norm.div !== criteria.norm.div && tuplets != undefined) {
                if (note.pos % tuplets !== 0) return true;
            }
            return false;
        }) != undefined;

        if (hasInvalidTuplet) return false;

        // 全てのノートを移動する
        track.notes.slice(start, end + 1).forEach((note, i) => {
            moveNoteByUnit(note, { ...criteria, pos: dir });
            // フォーカスノート以外はノーマライズする
            if (melody.focus !== start + i) MelodyState.normalize(note);
        });
        return true;
    };

    const moveSpaceFromCursor = (dir: -1 | 1, baseTail: number) => {
        const cursor = melody.cursor;
        const notes = track.notes;

        // カーソルが連符である場合、移動できない。
        if (cursor.norm.tuplets != undefined) return false;

        /** カーソルよりも右にあるノーツのインデックスを取得 */
        const startIndex = notes.findIndex(note => {
            const cur = MelodyState.calcBeatSide(cursor).pos;
            const target = MelodyState.calcBeatSide(note).pos;
            return cur <= target;
        });

        if (startIndex === -1) return false;

        const clone = (index: number) => JSON.parse(JSON.stringify(notes[index])) as MelodyState.Note;
        const temp = clone(dir === -1 ? startIndex : notes.length - 1);
        moveNoteByUnit(temp, { ...cursor, pos: dir * cursor.len });

        // 空間を縮める場合は、カーソルより左に超えないかチェックする
        if (dir === -1) {
            const cur = MelodyState.calcBeatSide(cursor).pos;
            const target = MelodyState.calcBeatSide(temp).pos;
            if (cur > target) return false;
        } else {
            const tailNoteSide = MelodyState.calcBeatSide(temp);
            const tailNoteRight = tailNoteSide.pos + tailNoteSide.len;
            if (tailNoteRight > baseTail) return false;
        }

        // カーソルの単位と違う連符がある場合、移動できない
        const hasInvalidTuplet = notes.slice(startIndex).find(note => {
            const tuplets = note.norm.tuplets;
            if (note.norm.div !== cursor.norm.div && tuplets != undefined) {
                if (note.pos % tuplets !== 0) return true;
            }
            return false;
        }) != undefined;

        if (hasInvalidTuplet) return false;

        // 全てのノートを移動する
        track.notes.slice(startIndex).forEach(note => {
            moveNoteByUnit(note, { ...cursor, pos: dir * cursor.len });
            MelodyState.normalize(note);
        });
        return true;
    };

    return {
        addNote,
        addNoteFromCursor,
        addNoteFromFocus,
        changeFocusNoteDiv,
        clearFocusLock,
        lockFocusIfNeeded,
        copyNotes,
        createNextNoteFromFocus,
        focusOutNoteSide,
        focusNext,
        focusInNearNote,
        getFocusRange,
        judgeOverlap,
        changeCursorDiv,
        changeCursorRate,
        setCursorRate,
        changeCursorTuplets,
        moveFocus,
        moveNoteByUnit,
        moveNotePos,
        moveRangePos,
        moveRangePitch,
        moveRangePitchInScale,
        movePitch,
        movePitchInScale,
        moveCursor,
        movePitchFocusRange,
        moveNoteLen,
        scaleNoteByUnit,
        moveSpaceFromCursor,
        pasteClipboardNotes,
        removeNotes,
        setNoOverlap,
        syncCursorFromElementSeq,
    };
};

export default createMelodyUpdater;
