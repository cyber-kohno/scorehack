import { getNoteDisplayRate } from "../../component/melody/score/note-display-util";
import MelodyState from "../../store/state/data/melody-state";
import type { MelodyActionContext } from "./melody-actions";

const createMelodyNoteComposeActions = (
    createContext: () => MelodyActionContext,
) => {
    const getFocusNoteDisplayRate = (
        ctx: MelodyActionContext,
        note: MelodyState.Note,
    ) => {
        const pos = MelodyState.calcBeat(note.norm, note.pos);
        const base = ctx.derivedSelector.getBaseFromBeat(pos);
        return getNoteDisplayRate(note, base.scoreBase.rhythm.ts, base.startBeatNote);
    };

    const changeFocusNoteDiv = (div: number) => {
        const ctx = createContext();
        const note = ctx.melodySelector.getFocusNote();

        if (note == undefined) return;

        ctx.melodyUpdater.changeFocusNoteDiv(note, div);
        ctx.commitData();
    };

    const splitFocusNote = () => {
        const ctx = createContext();
        const note = ctx.melodySelector.getFocusNote();
        if (note == undefined || ctx.melody.focusLock !== -1) return;

        const split = ctx.melodyUpdater.splitFocusNote();
        if (!split) return;

        const focusNote = ctx.melodySelector.getFocusNote();
        if (focusNote != undefined) {
            ctx.outlineUpdater.syncChordSeqFromNote(focusNote);
            ctx.refUpdater.adjustOutlineScroll();
            ctx.refUpdater.adjustGridScrollXFromNote(focusNote);
            ctx.refUpdater.adjustGridScrollYFromCursor(focusNote);
        }
        ctx.commitControl();
        ctx.commitData();
    };

    const mergeFocusNotes = () => {
        const ctx = createContext();
        if (ctx.melody.focusLock === -1) return;

        const merged = ctx.melodyUpdater.mergeFocusNotes();
        if (!merged) {
            ctx.showFocusNoteToast("Cannot merge: selected notes must be adjacent and have the same pitch.");
            return;
        }

        const focusNote = ctx.melodySelector.getFocusNote();
        if (focusNote != undefined) {
            ctx.melodyUpdater.setCursorRate(getFocusNoteDisplayRate(ctx, focusNote));
            ctx.outlineUpdater.syncChordSeqFromNote(focusNote);
            ctx.refUpdater.adjustOutlineScroll();
            ctx.refUpdater.adjustGridScrollXFromNote(focusNote);
            ctx.refUpdater.adjustGridScrollYFromCursor(focusNote);
        }
        ctx.commitControl();
        ctx.commitData();
    };

    const splitOrMergeFocusNotes = () => {
        const ctx = createContext();
        if (ctx.melody.focusLock === -1) {
            splitFocusNote();
            return;
        }
        mergeFocusNotes();
    };

    return {
        changeFocusNoteDiv,
        splitOrMergeFocusNotes,
    };
};

export default createMelodyNoteComposeActions;
