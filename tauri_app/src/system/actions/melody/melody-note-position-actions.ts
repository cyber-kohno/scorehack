import type { MelodyActionContext } from "./melody-actions";
import type { MoveNoteFailureReason } from "../../service/melody/note-position-updater";

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
