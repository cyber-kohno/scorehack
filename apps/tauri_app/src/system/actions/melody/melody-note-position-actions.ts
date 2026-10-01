import type { MelodyActionContext } from "./melody-actions";
import type { MoveNoteFailureReason } from "../../service/melody/note-position-updater";
import RhythmTheory from "../../domain/theory/rhythm-theory";
import MelodyState from "../../store/state/data/melody-state";

const createMelodyNotePositionActions = (
    createContext: () => MelodyActionContext,
) => {
    const getFailureMessage = (reason: MoveNoteFailureReason) => {
        switch (reason) {
            case "limit": return "Cannot move: note exceeds the score length.";
            case "collision": return "Cannot move: notes would overlap.";
            case "invalid-unit": return "Cannot move: selected notes cannot be represented by this unit.";
        }
    };

    const showMoveFailureToast = (
        ctx: MelodyActionContext,
        reason: MoveNoteFailureReason,
    ) => {
        ctx.showFocusNoteToast(getFailureMessage(reason));
    };

    const adjustCursorRateForFocusedNote = (
        ctx: MelodyActionContext,
        note: MelodyState.Note,
    ) => {
        const cursor = ctx.melody.cursor;
        if (cursor.norm.tuplets != undefined) return;

        const isBeatAligned = (value: number, beat: number) => {
            const beatCount = value / beat;
            const nearestBeatCount = Math.round(beatCount);
            const diff = Math.abs(beatCount - nearestBeatCount);
            return diff <= 1e-9;
        };

        const notePos = MelodyState.calcBeat(note.norm, note.pos);
        const noteLen = MelodyState.calcBeat(note.norm, note.len);
        const base = ctx.derivedSelector.getBaseFromBeat(notePos);
        const localNotePos = notePos - base.startBeatNote;
        const rates = RhythmTheory.getMelodyInputRates(base.scoreBase.rhythm.ts);
        const currentRate = rates.find(rate =>
            rate.div === cursor.norm.div && rate.len === cursor.len
        );
        if (currentRate != undefined) {
            const currentRateBeat = MelodyState.calcBeat({ div: currentRate.div }, currentRate.len);
            const isNotePosAligned = isBeatAligned(localNotePos, currentRateBeat);
            const isNoteLenAligned = isBeatAligned(noteLen, currentRateBeat);
            if (isNotePosAligned && isNoteLenAligned) return;
        }

        const currentBeat = MelodyState.calcBeat(cursor.norm, cursor.len);
        const nextRate = rates
            .map(rate => ({
                rate,
                beat: MelodyState.calcBeat({ div: rate.div }, rate.len),
            }))
            .filter(item => {
                const isShorterThanCurrent = item.beat <= currentBeat + 1e-9;
                const isNotePosAligned = isBeatAligned(localNotePos, item.beat);
                const isNoteLenAligned = isBeatAligned(noteLen, item.beat);
                return isShorterThanCurrent && isNotePosAligned && isNoteLenAligned;
            })
            .sort((left, right) => right.beat - left.beat)[0]?.rate
            ?? rates[0];

        ctx.melodyUpdater.setCursorRate(nextRate);
    };

    const moveNotePos = (dir: -1 | 1) => {
        const ctx = createContext();
        const note = ctx.melodySelector.getFocusNote();
        const baseTail = ctx.derivedSelector.getBeatNoteTail();

        if (note == undefined) return;

        const moved = ctx.melodyUpdater.moveNotePos(note, dir, baseTail);
        if (!moved.ok) {
            showMoveFailureToast(ctx, moved.reason);
            return;
        }

        adjustCursorRateForFocusedNote(ctx, note);
        ctx.outlineUpdater.syncChordSeqFromNote(note);
        ctx.refUpdater.adjustGridScrollXFromNote(note);
        ctx.refUpdater.adjustOutlineScroll();
        ctx.commitControl();
        ctx.commitData();
    };

    const moveNoteLen = (dir: -1 | 1) => {
        const ctx = createContext();
        const note = ctx.melodySelector.getFocusNote();
        const baseTail = ctx.derivedSelector.getBeatNoteTail();

        if (note == undefined) {
            throw new Error("moveNoteLen requires a focused note.");
        }
        if (ctx.melody.focusLock !== -1) {
            throw new Error("moveNoteLen cannot be used while focus range is active.");
        }

        const moved = ctx.melodyUpdater.moveNoteLen(note, dir, baseTail);
        if (!moved.ok) {
            showMoveFailureToast(ctx, moved.reason);
            return;
        }

        ctx.refUpdater.adjustGridScrollXFromNote(note);
        ctx.commitData();
    };

    const moveRangePos = (dir: -1 | 1) => {
        const ctx = createContext();
        const criteria = ctx.melodySelector.getFocusNote();
        const baseTail = ctx.derivedSelector.getBeatNoteTail();

        if (criteria == undefined) return;

        const moved = ctx.melodyUpdater.moveRangePos(dir, baseTail);
        if (!moved.ok) {
            showMoveFailureToast(ctx, moved.reason);
            return;
        }

        ctx.outlineUpdater.syncChordSeqFromNote(criteria);
        ctx.refUpdater.adjustGridScrollXFromNote(criteria);
        ctx.refUpdater.adjustOutlineScroll();
        ctx.commitControl();
        ctx.commitData();
    };

    const moveSpaceFromCursor = (dir: -1 | 1) => {
        const ctx = createContext();
        const baseTail = ctx.derivedSelector.getBeatNoteTail();

        const moved = ctx.melodyUpdater.moveSpaceFromCursor(dir, baseTail);
        if (!moved.ok) return;

        ctx.melodyUpdater.judgeOverlap();
        ctx.commitControl();
        ctx.commitData();
    };

    return {
        moveNoteLen,
        moveNotePos,
        moveRangePos,
        moveSpaceFromCursor,
    };
};

export default createMelodyNotePositionActions;
