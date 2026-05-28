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
import FloatingTextInput from "../../service/common/floating-text-input-controller";
import createMelodyNoteComposeActions from "./melody-note-compose-actions";
import createMelodyNotePositionActions from "./melody-note-position-actions";

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
        derived,
        ref,
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

export type MelodyActionContext = ReturnType<typeof createContext>;

const createMelodyActions = () => {
    const noteComposeActions = createMelodyNoteComposeActions(createContext);
    const notePositionActions = createMelodyNotePositionActions(createContext);

    const isNear = (left: number, right: number) => {
        return Math.abs(left - right) < 0.000001;
    };

    const getChordHeadBeatNote = (
        chordCache: ReturnType<typeof createContext>["derived"]["chordCaches"][number],
        baseCache: ReturnType<typeof createContext>["derived"]["baseCaches"][number],
    ) => {
        const beatDiv16Cnt = RhythmTheory.getBeatDiv16Count(baseCache.scoreBase.rhythm.ts);
        const beatRate = beatDiv16Cnt / 4;

        return chordCache.startBeatNote + (chordCache.beat.eatHead / beatDiv16Cnt) * beatRate;
    };

    const getFocusNoteDisplayRate = (
        ctx: ReturnType<typeof createContext>,
        note: MelodyState.Note,
    ) => {
        const pos = MelodyState.calcBeat(note.norm, note.pos);
        const base = ctx.derivedSelector.getBaseFromBeat(pos);
        return getNoteDisplayRate(note, base.scoreBase.rhythm.ts);
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

    const moveCursorOrFocusNote = (dir: -1 | 1) => {
        const ctx = createContext();
        const cursor = ctx.melody.cursor;
        const targetPos = cursor.pos - (dir === -1 ? cursor.len : 0);
        const [targetBeatPos, targetBeatLen] = [targetPos, cursor.len].map(size =>
            MelodyState.calcBeat(cursor.norm, size)
        );
        const nextPos = cursor.pos + dir * cursor.len;
        const nextBeatPos = MelodyState.calcBeat(cursor.norm, nextPos);
        const tailBeatNote = ctx.derivedSelector.getBeatNoteTail();

        if (targetBeatPos < 0 || targetBeatPos + targetBeatLen > tailBeatNote) return;

        const targetCursor = { ...cursor, pos: targetPos };
        const track = ctx.melodySelector.getCurrScoreTrack();
        const noteIndex = track.notes.findIndex(note =>
            MelodyState.judgeOverlapNotes(targetCursor, note)
        );

        if (noteIndex === -1) {
            if (nextBeatPos < 0 || nextBeatPos + targetBeatLen > tailBeatNote) return;

            ctx.melodyUpdater.moveCursor(dir);
            ctx.refUpdater.adjustGridScrollXFromNote(cursor);
            ctx.outlineUpdater.syncChordSeqFromNote(cursor);
            ctx.refUpdater.adjustOutlineScroll();
            ctx.melodyUpdater.judgeOverlap();
            ctx.commitControl();
            return;
        }

        ctx.melody.focus = noteIndex;
        ctx.melodyUpdater.clearFocusLock();

        const note = track.notes[noteIndex];
        ctx.melodyUpdater.setCursorRate(getFocusNoteDisplayRate(ctx, note));
        ctx.outlineUpdater.syncChordSeqFromNote(note);
        ctx.refUpdater.adjustOutlineScroll();
        ctx.refUpdater.adjustGridScrollXFromNote(note);
        ctx.refUpdater.adjustGridScrollYFromCursor(note);
        ctx.playbackPitch(note.pitch);
        ctx.commitControl();
    };

    const moveCursorToChordBlock = (dir: -1 | 1) => {
        const ctx = createContext();
        const target = ctx.melodySelector.getFocusNote() ?? ctx.melody.cursor;
        const currentPos = MelodyState.calcBeat(target.norm, target.pos);
        const chordEntries = ctx.derived.chordCaches.map((chordCache, index) => {
            const baseCache = ctx.derived.baseCaches[chordCache.baseSeq];
            const head = getChordHeadBeatNote(chordCache, baseCache);

            return {
                chordCache,
                baseCache,
                head,
                tail: head + chordCache.lengthBeatNote,
                index,
            };
        });
        const currentIndex = chordEntries.findIndex(({ head, tail }) =>
            head <= currentPos + 0.000001 && currentPos < tail - 0.000001,
        );
        const previousIndex = () => {
            for (let i = chordEntries.length - 1; i >= 0; i--) {
                if (chordEntries[i].head < currentPos - 0.000001) return i;
            }
            return -1;
        };
        const nextIndex = () => chordEntries.findIndex(({ head }) => head > currentPos + 0.000001);
        const targetIndex = dir === -1
            ? currentIndex === -1 || isNear(currentPos, chordEntries[currentIndex].head)
                ? previousIndex()
                : currentIndex
            : nextIndex();

        const entry = chordEntries[targetIndex];
        if (entry == undefined) return;

        ctx.melodyUpdater.setCursorFromBeatNote(entry.head, entry.baseCache.scoreBase.rhythm.ts);
        ctx.melody.focus = -1;
        ctx.melody.focusLock = -1;
        ctx.control.outline.focus = entry.chordCache.elementSeq;
        ctx.melodyUpdater.judgeOverlap();
        ctx.refUpdater.adjustOutlineScroll();
        ctx.refUpdater.adjustGridScrollXFromNote(ctx.melody.cursor);
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
        const rate = RhythmTheory.getMelodyInputRates(base.scoreBase.rhythm.ts)[index];

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
        ctx.refUpdater.adjustOutlineScroll();
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

        const cursor = ctx.melody.cursor;
        const cursorLenBeat = MelodyState.calcBeat(cursor.norm, cursor.len);
        const sideBeat = MelodyState.calcBeat(note.norm, note.pos + (dir === 1 ? note.len : 0));
        const tailBeatNote = ctx.derivedSelector.getBeatNoteTail();
        if (sideBeat < -1e-9 || sideBeat + cursorLenBeat > tailBeatNote + 1e-9) return;

        ctx.melodyUpdater.focusOutNoteSide(note, dir);
        ctx.melodyUpdater.clearFocusLock();
        ctx.melodyUpdater.judgeOverlap();

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
        ctx.refUpdater.adjustOutlineScroll();
        ctx.refUpdater.adjustGridScrollXFromNote(note);
        ctx.refUpdater.adjustGridScrollYFromCursor(note);
        ctx.playbackPitch(note.pitch);
        ctx.commitControl();
    };

    const focusSelectedEdge = (dir: -1 | 1) => {
        const ctx = createContext();
        const { focus, focusLock } = ctx.melody;
        if (focusLock === -1) return;

        const [start, end] = focus < focusLock
            ? [focus, focusLock]
            : [focusLock, focus];
        ctx.melody.focus = dir === -1 ? start : end;
        ctx.melody.focusLock = -1;

        const note = ctx.melodySelector.getFocusNote();
        if (note == undefined) return;

        ctx.melodyUpdater.setCursorRate(getFocusNoteDisplayRate(ctx, note));
        ctx.outlineUpdater.syncChordSeqFromNote(note);
        ctx.refUpdater.adjustOutlineScroll();
        ctx.refUpdater.adjustGridScrollXFromNote(note);
        ctx.refUpdater.adjustGridScrollYFromCursor(note);
        ctx.playbackPitch(note.pitch);
        ctx.commitControl();
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
        ctx.refUpdater.adjustOutlineScroll();
        ctx.refUpdater.adjustGridScrollXFromNote(note);
        ctx.refUpdater.adjustGridScrollYFromCursor(note);
        ctx.commitControl();
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
            ctx.refUpdater.adjustOutlineScroll();
            ctx.refUpdater.adjustGridScrollXFromNote(focusNote);
            ctx.refUpdater.adjustGridScrollYFromCursor(focusNote);
        } else {
            const cursor = ctx.melody.cursor;
            ctx.outlineUpdater.syncChordSeqFromNote(cursor);
            ctx.refUpdater.adjustOutlineScroll();
            ctx.refUpdater.adjustGridScrollXFromNote(cursor);
        }
        ctx.commitControl();
        ctx.commitData();
    };

    const copyNotes = () => {
        const ctx = createContext();

        ctx.melodyUpdater.copyNotes();
        ctx.commitControl();
    };

    const pasteClipboardNotes = () => {
        const ctx = createContext();

        // フォーカスしてぁE��ぁE��のみ利用可能
        if (ctx.melody.clipboard.notes == null || ctx.melody.focus !== -1) return;

        ctx.melodyUpdater.pasteClipboardNotes();
        ctx.commitData();
        ctx.commitControl();
    };

    const openPronInput = () => {
        const ctx = createContext();
        if (ctx.melody.focusLock !== -1) return;

        const note = ctx.melodySelector.getFocusNote() as MelodyState.VocalNote | undefined;
        const noteIndex = ctx.melody.focus;

        if (note == undefined || noteIndex === -1) return;

        const noteRef = ctx.ref.noteRefs[ctx.melody.trackIndex]?.find((item) => item.seq === noteIndex)?.ref;
        if (noteRef == undefined) return;

        const rect = noteRef.getBoundingClientRect();
        const value = note.pron ?? "";

        FloatingTextInput.open({
            value,
            cursor: value.length,
            left: rect.left,
            top: rect.bottom + 10,
            width: Math.max(120, rect.width),
            apply: (value) => setNotePron(ctx.melody.trackIndex, noteIndex, value),
        });
    };

    const setNotePron = (trackIndex: number, noteIndex: number, value: string) => {
        const ctx = createContext();
        const track = ctx.data.scoreTracks[trackIndex];
        const note = track?.notes[noteIndex];
        if (note == undefined) return;

        ctx.melodyUpdater.setNotePron(note, value);
        ctx.commitData();
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
        ...noteComposeActions,
        ...notePositionActions,
        changeCursorDiv,
        changeCursorRate,
        changeCursorTuplets,
        focusSelectedEdge,
        focusInNearNote,
        focusOutNoteSide,
        moveCursor,
        moveCursorToChordBlock,
        moveCursorOrFocusNote,
        moveCursorPitchInScale,
        moveNotePitch,
        moveNotePitchInScale,
        moveFocusNormal,
        moveFocusRange,
        moveRangePitch,
        moveRangePitchInScale,
        movePitchFocusNotes,
        moveCursorPitch,
        copyNotes,
        pasteClipboardNotes,
        openPronInput,
        removeFocusNotes,
        toggleChordNameMode,
        undoRedu
    };
};
export default createMelodyActions;
