import { get } from "svelte/store";
import PlaybackCacheState from "../../service/playback/timeline/playback-cache-state";
import useScrollService from "../../service/common/scroll-service";
import useDerivedSelector from "../../service/derived/derived-selector";
import RhythmTheory from "../../domain/theory/rhythm-theory";
import createOutlineUpdater from "../../service/outline/outline-updater";
import { controlStore, dataStore, derivedStore, refStore, settingsStore, terminalStore } from "../../store/global-store";
import MelodyState from "../../store/state/data/melody-state";
import createMelodyUpdater from "../../service/melody/melody-updater";
import useMelodySelector from "../../service/melody/melody-selector";
import { getNoteDisplayRate } from "../../component/melody/score/note-display-util";
import ScoreHistory from "../../infra/tauri/history/score-history";

const createContext = () => {
    const control = get(controlStore);
    const data = get(dataStore);
    const derived = get(derivedStore);
    const ref = get(refStore);
    const settings = get(settingsStore);
    const terminal = get(terminalStore);
    const melody = control.melody;

    const melodySelector = useMelodySelector({ control, data });
    const playbackPitch = (pitch: number) => {
        PlaybackCacheState.playbackSF(melodySelector.getCurrScoreTrack(), pitch);
    };

    return {
        control,
        data,
        settings,
        melody,
        derivedSelector: useDerivedSelector(derived, control),
        melodySelector,
        melodyUpdater: createMelodyUpdater({ control, data }),
        outlineUpdater: createOutlineUpdater({ control, data, derived }),
        refUpdater: useScrollService({
            control,
            data,
            derived,
            ref,
            settings,
            terminal,
            commitRef: () => refStore.set({ ...ref }),
        }),
        playbackPitch,
        commitControl: () => controlStore.set({ ...control }),
        commitData: () => {
            dataStore.set({ ...data });
            ScoreHistory.add();
        },
    };
};

const createMelodyActions = () => {

    const getFocusNoteDisplayRate = (
        ctx: ReturnType<typeof createContext>,
        note: MelodyState.Note,
    ) => {
        const pos = MelodyState.calcBeat(note.norm, note.pos);
        const base = ctx.derivedSelector.getBaseFromBeat(pos);
        return getNoteDisplayRate(note, base.scoreBase.ts);
    };
    const moveCursorPitch = (dir: number) => {
        const ctx = createContext();
        const cursor = ctx.melody.cursor;

        ctx.melodyUpdater.movePitch(cursor, dir);
        ctx.playbackPitch(cursor.pitch);
        ctx.refUpdater.adjustGridScrollYFromCursor(cursor);
        ctx.commitControl();
    };

    const moveCursor = (dir: -1 | 1) => {
        const ctx = createContext();
        const cursor = ctx.melody.cursor;
        const nextPos = cursor.pos + dir * cursor.len;
        const [tempPos, tempLen] = [nextPos, cursor.len].map(size =>
            MelodyState.calcBeat(cursor.norm, size)
        );
        const tailBeatNote = ctx.derivedSelector.getBeatNoteTail();

        if (tempPos < 0 || tempPos + tempLen > tailBeatNote) return;

        ctx.melodyUpdater.moveCursor(dir);
        ctx.refUpdater.adjustGridScrollXFromNote(cursor);
        ctx.outlineUpdater.syncChordSeqFromNote(cursor);
        ctx.refUpdater.adjustOutlineScroll();
        ctx.melodyUpdater.judgeOverlap();
        ctx.commitControl();
    };

    const addNoteFromCursor = () => {
        const ctx = createContext();
        const track = ctx.melodySelector.getCurrScoreTrack();
        const baseTail = ctx.derivedSelector.getBeatNoteTail();

        if (ctx.melody.isOverlap) return;

        const added = ctx.melodyUpdater.addNoteFromCursor(baseTail);
        if (!added) return;

        ctx.melodyUpdater.focusInNearNote(1);

        const note = track.notes[ctx.melody.focus];
        if (note == undefined) return;

        ctx.outlineUpdater.syncChordSeqFromNote(note);
        ctx.refUpdater.adjustGridScrollXFromNote(note);
        ctx.refUpdater.adjustGridScrollYFromCursor(note);
        ctx.playbackPitch(note.pitch);
        ctx.commitControl();
        ctx.commitData();
    };

    const changeCursorDiv = (div: number) => {
        const ctx = createContext();

        ctx.melodyUpdater.changeCursorDiv(div);
        ctx.melodyUpdater.judgeOverlap();
        ctx.commitControl();
    };

    const changeCursorRate = (index: number) => {
        const ctx = createContext();
        const cursor = ctx.melody.cursor;
        const focusNote = ctx.melodySelector.getFocusNote();
        const target = focusNote ?? cursor;
        const targetPos = MelodyState.calcBeat(target.norm, target.pos);
        const base = ctx.derivedSelector.getBaseFromBeat(targetPos);
        const rate = RhythmTheory.getMelodyInputRates(base.scoreBase.ts)[index];

        if (rate == undefined) return;

        if (focusNote == undefined) {
            ctx.melodyUpdater.changeCursorRate(rate);
        } else {
            const maxRate = getFocusNoteDisplayRate(ctx, focusNote);
            const rateBeat = MelodyState.calcBeat({ div: rate.div }, rate.len);
            const maxRateBeat = MelodyState.calcBeat({ div: maxRate.div }, maxRate.len);
            if (rateBeat > maxRateBeat + 1e-9) return;

            ctx.melodyUpdater.setCursorRate(rate);
        }
        ctx.melodyUpdater.judgeOverlap();
        ctx.commitControl();
    };

    const changeCursorTuplets = (tuplets: number) => {
        const ctx = createContext();

        ctx.melodyUpdater.changeCursorTuplets(tuplets);
        ctx.melodyUpdater.judgeOverlap();
        ctx.commitControl();
    };

    const focusInNearNote = (dir: -1 | 1) => {
        const ctx = createContext();

        ctx.melodyUpdater.focusInNearNote(dir);

        const note = ctx.melodySelector.getFocusNote();
        if (note == undefined) return;

        ctx.melodyUpdater.setCursorRate(getFocusNoteDisplayRate(ctx, note));
        ctx.outlineUpdater.syncChordSeqFromNote(note);
        ctx.refUpdater.adjustGridScrollXFromNote(note);
        ctx.refUpdater.adjustGridScrollYFromCursor(note);
        ctx.commitControl();
    };

    const focusOutNoteSide = (dir: -1 | 1) => {
        const ctx = createContext();
        const note = ctx.melodySelector.getFocusNote();

        if (note == undefined) {
            throw new Error("focusOutNoteSide requires a focused note.");
        }

        ctx.melodyUpdater.focusOutNoteSide(note, dir);
        ctx.melodyUpdater.clearFocusLock();
        ctx.melodyUpdater.judgeOverlap();

        const cursor = ctx.melody.cursor;
        ctx.outlineUpdater.syncChordSeqFromNote(cursor);
        ctx.refUpdater.adjustGridScrollXFromNote(cursor);
        ctx.commitControl();
    };

    const moveFocusNormal = (dir: -1 | 1) => {
        const ctx = createContext();
        const track = ctx.melodySelector.getCurrScoreTrack();
        const next = ctx.melody.focus + dir;

        if (next < 0 || next > track.notes.length - 1) return;

        ctx.melodyUpdater.moveFocus(dir);
        ctx.melodyUpdater.clearFocusLock();

        const note = ctx.melodySelector.getFocusNote();
        if (note == undefined) return;

        ctx.melodyUpdater.setCursorRate(getFocusNoteDisplayRate(ctx, note));
        ctx.outlineUpdater.syncChordSeqFromNote(note);
        ctx.refUpdater.adjustGridScrollXFromNote(note);
        ctx.refUpdater.adjustGridScrollYFromCursor(note);
        ctx.playbackPitch(note.pitch);
        ctx.commitControl();
        ctx.commitData();
    };

    const moveFocusRange = (dir: -1 | 1) => {
        const ctx = createContext();
        const track = ctx.melodySelector.getCurrScoreTrack();
        const next = ctx.melody.focus + dir;

        if (next < 0 || next > track.notes.length - 1) return;

        ctx.melodyUpdater.lockFocusIfNeeded();
        ctx.melodyUpdater.moveFocus(dir);

        const note = ctx.melodySelector.getFocusNote();
        if (note == undefined) return;

        ctx.outlineUpdater.syncChordSeqFromNote(note);
        ctx.refUpdater.adjustGridScrollXFromNote(note);
        ctx.refUpdater.adjustGridScrollYFromCursor(note);
        ctx.commitControl();
        ctx.commitData();
    };

    const movePitchFocusNotes = (dir: -1 | 1) => {
        const ctx = createContext();
        const note = ctx.melodySelector.getFocusNote();

        if (note == undefined) return;

        if (ctx.melody.focusLock === -1) {
            ctx.melodyUpdater.movePitch(note, dir);
            ctx.playbackPitch(note.pitch);
            ctx.refUpdater.adjustGridScrollYFromCursor(note);
        } else {
            const [start, end] = ctx.melodyUpdater.getFocusRange();
            ctx.melodyUpdater.movePitchFocusRange(start, end, dir);
            ctx.refUpdater.adjustGridScrollYFromCursor(note);
        }

        ctx.commitData();
    };

    const moveNotePitch = (dir: number) => {
        const ctx = createContext();
        const note = ctx.melodySelector.getFocusNote();

        if (note == undefined) {
            throw new Error("moveNotePitch requires a focused note.");
        }
        if (ctx.melody.focusLock !== -1) {
            throw new Error("moveNotePitch cannot be used while focus range is active.");
        }

        ctx.melodyUpdater.movePitch(note, dir);
        ctx.playbackPitch(note.pitch);
        ctx.refUpdater.adjustGridScrollYFromCursor(note);
        ctx.commitData();
    };

    const moveRangePitch = (dir: number) => {
        const ctx = createContext();
        const note = ctx.melodySelector.getFocusNote();

        if (note == undefined) {
            throw new Error("moveRangePitch requires a focused note.");
        }

        const moved = ctx.melodyUpdater.moveRangePitch(dir);
        if (!moved) return;

        ctx.refUpdater.adjustGridScrollYFromCursor(note);
        ctx.commitData();
    };

    const moveCursorPitchInScale = (dir: -1 | 1) => {
        const ctx = createContext();
        const cursor = ctx.melody.cursor;
        const tonality = ctx.derivedSelector.getCurBase().scoreBase.tonality;

        ctx.melodyUpdater.movePitchInScale(cursor, tonality, dir);
        ctx.playbackPitch(cursor.pitch);
        ctx.refUpdater.adjustGridScrollYFromCursor(cursor);
        ctx.commitControl();
    };

    const moveNotePitchInScale = (dir: -1 | 1) => {
        const ctx = createContext();
        const note = ctx.melodySelector.getFocusNote();
        const tonality = ctx.derivedSelector.getCurBase().scoreBase.tonality;

        if (note == undefined) return;

        ctx.melodyUpdater.movePitchInScale(note, tonality, dir);
        ctx.playbackPitch(note.pitch);
        ctx.refUpdater.adjustGridScrollYFromCursor(note);
        ctx.commitData();
    };

    const moveRangePitchInScale = (dir: -1 | 1) => {
        const ctx = createContext();
        const note = ctx.melodySelector.getFocusNote();
        const tonality = ctx.derivedSelector.getCurBase().scoreBase.tonality;

        if (note == undefined) return;

        const moved = ctx.melodyUpdater.moveRangePitchInScale(tonality, dir);
        if (!moved) return;

        ctx.refUpdater.adjustGridScrollYFromCursor(note);
        ctx.commitData();
    };

    const addNoteFromFocus = () => {
        const ctx = createContext();
        const note = ctx.melodySelector.getFocusNote();
        const baseTail = ctx.derivedSelector.getBeatNoteTail();

        if (note == undefined) return;

        const added = ctx.melodyUpdater.addNoteFromFocus(note, baseTail);
        if (!added) return;

        const focusedNote = ctx.melodySelector.getFocusNote();
        if (focusedNote == undefined) return;

        ctx.outlineUpdater.syncChordSeqFromNote(focusedNote);
        ctx.refUpdater.adjustGridScrollXFromNote(focusedNote);
        ctx.playbackPitch(focusedNote.pitch);
        ctx.commitControl();
        ctx.commitData();
    };

    const removeFocusNotes = (option?: { focusPrevious?: boolean }) => {
        const ctx = createContext();
        const track = ctx.melodySelector.getCurrScoreTrack();
        const [start, end] = ctx.melodyUpdater.getFocusRange();
        const note = track.notes[start];

        if (note == undefined) return;

        ctx.melodyUpdater.focusOutNoteSide(note, -1);
        ctx.melodyUpdater.removeNotes(start, end);
        ctx.melodyUpdater.setNoOverlap();
        ctx.melodyUpdater.clearFocusLock();

        if (option?.focusPrevious) {
            ctx.melodyUpdater.focusInNearNote(-1);
        }

        const focusNote = ctx.melodySelector.getFocusNote();
        if (focusNote != undefined) {
            ctx.melodyUpdater.setCursorRate(getFocusNoteDisplayRate(ctx, focusNote));
            ctx.outlineUpdater.syncChordSeqFromNote(focusNote);
            ctx.refUpdater.adjustGridScrollXFromNote(focusNote);
            ctx.refUpdater.adjustGridScrollYFromCursor(focusNote);
        } else {
            const cursor = ctx.melody.cursor;
            ctx.outlineUpdater.syncChordSeqFromNote(cursor);
            ctx.refUpdater.adjustGridScrollXFromNote(cursor);
        }
        ctx.commitControl();
        ctx.commitData();
    };

    const changeFocusNoteDiv = (div: number) => {
        const ctx = createContext();
        const note = ctx.melodySelector.getFocusNote();

        if (note == undefined) return;

        ctx.melodyUpdater.changeFocusNoteDiv(note, div);
        ctx.commitData();
    };

    const moveNotePos = (dir: -1 | 1) => {
        const ctx = createContext();
        const note = ctx.melodySelector.getFocusNote();
        const baseTail = ctx.derivedSelector.getBeatNoteTail();

        if (note == undefined) return;

        const moved = ctx.melodyUpdater.moveNotePos(note, dir, baseTail);
        if (!moved) return;

        ctx.outlineUpdater.syncChordSeqFromNote(note);
        ctx.refUpdater.adjustGridScrollXFromNote(note);
        ctx.refUpdater.adjustOutlineScroll();
        ctx.commitControl();
        ctx.commitData();
    };

    const moveNoteLen = (dir: -1 | 1) => {
        const ctx = createContext();
        const note = ctx.melodySelector.getFocusNote();

        if (note == undefined) {
            throw new Error("moveNoteLen requires a focused note.");
        }
        if (ctx.melody.focusLock !== -1) {
            throw new Error("moveNoteLen cannot be used while focus range is active.");
        }

        const moved = ctx.melodyUpdater.moveNoteLen(note, dir);
        if (!moved) return;

        ctx.refUpdater.adjustGridScrollXFromNote(note);
        ctx.commitData();
    };

    const moveRangePos = (dir: -1 | 1) => {
        const ctx = createContext();
        const criteria = ctx.melodySelector.getFocusNote();
        const baseTail = ctx.derivedSelector.getBeatNoteTail();

        if (criteria == undefined) return;

        const moved = ctx.melodyUpdater.moveRangePos(dir, baseTail);
        if (!moved) return;

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
        if (!moved) return;

        ctx.commitData();
    };

    const copyNotes = () => {
        const ctx = createContext();

        ctx.melodyUpdater.copyNotes();
        ctx.melodyUpdater.clearFocusLock();
        ctx.commitControl();
    };

    const pasteClipboardNotes = () => {
        const ctx = createContext();

        // フォーカスしていない時のみ利用可能
        if (ctx.melody.clipboard.notes == null || ctx.melody.focus !== -1) return;

        ctx.melodyUpdater.pasteClipboardNotes();
        ctx.commitData();
        ctx.commitControl();
    };

    const toggleChordNameMode = () => {
        const ctx = createContext();
        const timeline = ctx.settings.view.timeline;
        const chordNameMode = timeline.chordNameMode === "degree" ? "absolute" : "degree";
        settingsStore.set({
            ...ctx.settings,
            view: {
                ...ctx.settings.view,
                timeline: {
                    ...timeline,
                    chordNameMode,
                },
            },
        });
    };

    const undoRedu = (dir: -1 | 1) => {
        (async () => {
            if (dir === -1) await ScoreHistory.undo();
            else if (dir === 1) await ScoreHistory.redo();
            const ctx = createContext();
            let criteria = ctx.melodySelector.getFocusNote();
            if (criteria == undefined) criteria = ctx.melody.cursor;
            ctx.refUpdater.adjustGridScrollYFromCursor(criteria);
            ctx.refUpdater.adjustGridScrollXFromNote(criteria);
        })();
    }

    return {
        addNoteFromCursor,
        addNoteFromFocus,
        changeFocusNoteDiv,
        changeCursorDiv,
        changeCursorRate,
        changeCursorTuplets,
        focusInNearNote,
        focusOutNoteSide,
        moveCursor,
        moveCursorPitchInScale,
        moveNoteLen,
        moveNotePos,
        moveNotePitch,
        moveNotePitchInScale,
        moveFocusNormal,
        moveFocusRange,
        moveRangePos,
        moveRangePitch,
        moveRangePitchInScale,
        movePitchFocusNotes,
        moveCursorPitch,
        moveSpaceFromCursor,
        copyNotes,
        pasteClipboardNotes,
        removeFocusNotes,
        toggleChordNameMode,
        undoRedu
    };
};
export default createMelodyActions;
