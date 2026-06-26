import { get } from "svelte/store";
import { controlStore, dataStore, inputStore, libraryStore, refStore } from "../../store/global-store";
import ChordTheory from "../../domain/theory/chord-theory";
import RhythmTheory from "../../domain/theory/rhythm-theory";
import InputState from "../../store/state/input-state";
import LibraryState from "../../store/state/library-state";
import FinderState from "../../store/state/data/arrange/finder-state";
import ArrangeState from "../../store/state/data/arrange/arrange-state";
import PianoBackingState from "../../store/state/data/arrange/piano/piano-backing-state";
import PianoEditorState from "../../store/state/data/arrange/piano/piano-editor-state";
import ActionMenu from "../../service/common/action-menu-controller";
import ActionMenuState from "../../store/state/action-menu-state";
import Toast from "../../service/common/toast-controller";
import ToastState from "../../store/state/toast-state";
import ConfirmDialog from "../../service/common/confirm-dialog-controller";

const FINDER_BACKING_RECORD_HEIGHT = 71;
const FINDER_VOICING_CELL_WIDTH = 109;

const getFinderVoicingScrollLeft = (frame: HTMLElement, soundsIndex: number) => {
    const rect = frame.getBoundingClientRect();
    const targetCenter = soundsIndex * FINDER_VOICING_CELL_WIDTH + FINDER_VOICING_CELL_WIDTH / 2;
    return Math.max(0, targetCenter - rect.width / 2);
};

const createContext = () => {
    const data = get(dataStore);
    const control = get(controlStore);
    const library = get(libraryStore);
    const ref = get(refStore);

    return {
        data,
        arrange: data.arrange,
        control,
        library,
        ref,
    };
};

const createLibraryActions = () => {
    const getActiveTrack = (ctx: ReturnType<typeof createContext>) => {
        return ctx.arrange.tracks[ctx.control.outline.trackIndex];
    };

    const getConditions = (ctx: ReturnType<typeof createContext>) => {
        return getActiveTrack(ctx)?.method === "drum"
            ? LibraryState.DrumConditions
            : LibraryState.Conditions;
    };

    const ensureConditionVisible = (ctx: ReturnType<typeof createContext>) => {
        const library = ctx.library;
        if (library == null || library.focus.finder != null) return;

        const conditions = getConditions(ctx);
        if (conditions.includes(library.focus.condition)) return;

        library.focus.condition = conditions[0];
        libraryStore.set({ ...library });
    };

    const adjustFinderBackingScroll = (ctx: ReturnType<typeof createContext>) => {
        const library = ctx.library;
        if (library == null || library.focus.finder == null) return;

        const frame = ctx.ref.library.finder.frame;
        if (frame == undefined) return;

        const rect = frame.getClientRects()[0];
        if (rect == undefined) return;

        const top = -rect.width / 2 + library.focus.finder.cursor.backing * FINDER_BACKING_RECORD_HEIGHT;
        frame.scrollTo({ top, behavior: "smooth" });
    };

    const adjustFinderVoicingScroll = (ctx: ReturnType<typeof createContext>) => {
        const library = ctx.library;
        if (library == null || library.focus.finder == null) return;

        const cursor = library.focus.finder.cursor;
        const recordRef = ctx.ref.library.finder.records.find(record => {
            return record.seq === cursor.backing;
        })?.ref;
        if (recordRef == undefined) return;

        const targetRef = cursor.sounds === -1
            ? recordRef.querySelector<HTMLElement>("[data-finder-sounds-index]")
            : recordRef.querySelector<HTMLElement>(`[data-finder-sounds-index="${cursor.sounds}"]`);
        const frame = targetRef?.parentElement;
        if (frame == undefined) return;

        const left = getFinderVoicingScrollLeft(frame, cursor.sounds);
        frame.scrollTo({ left, behavior: "smooth" });
    };

    const resetFinderVoicingScroll = (ctx: ReturnType<typeof createContext>, backingIndex: number) => {
        if (backingIndex < 0) return;

        const recordRef = ctx.ref.library.finder.records.find(record => {
            return record.seq === backingIndex;
        })?.ref;
        const targetRef = recordRef?.querySelector<HTMLElement>("[data-finder-sounds-index]");
        targetRef?.parentElement?.scrollTo({ left: 0, behavior: "smooth" });
    };

    const close = () => {
        createContext();
        libraryStore.set(null);
        inputStore.set(InputState.createInitial());
    };

    const moveCondition = (dir: -1 | 1) => {
        const ctx = createContext();
        const library = ctx.library;
        if (library == null || library.focus.finder != null) return;

        const conditions = getConditions(ctx);
        const index = conditions.indexOf(library.focus.condition);
        const next = index + dir;
        if (next < 0 || next > conditions.length - 1) return;

        library.focus.condition = conditions[next];
        libraryStore.set({ ...library });
    };

    const moveTimeSignature = (dir: -1 | 1) => {
        const ctx = createContext();
        ensureConditionVisible(ctx);
        const library = ctx.library;
        if (library == null || library.focus.finder != null || library.focus.condition !== "ts") return;

        const names = RhythmTheory.getTSNames();
        const currentName = RhythmTheory.formatTS(library.condition.ts);
        const index = names.indexOf(currentName);
        const next = index + dir;
        if (next < 0 || next > names.length - 1) return;

        const ts = RhythmTheory.parseTS(names[next]);
        if (ts == undefined) throw new Error(`Unsupported time signature. [${names[next]}]`);

        library.condition.ts = ts;
        libraryStore.set({ ...library });
    };

    const moveBeat = (dir: -1 | 1) => {
        const ctx = createContext();
        const library = ctx.library;
        if (library == null || library.focus.finder != null || library.focus.condition !== "beat") return;

        const next = library.condition.beat + dir;
        if (next < 1 || next > 4) return;

        library.condition.beat = next;
        libraryStore.set({ ...library });
    };

    const moveEat = (dir: -1 | 1) => {
        const ctx = createContext();
        const library = ctx.library;
        if (library == null || library.focus.finder != null) return;

        const values = [-2, -1, 0, 1, 2];
        const getNext = (current: number) => {
            const index = values.indexOf(current);
            const next = index + dir;
            if (next < 0 || next > values.length - 1) return current;
            return values[next];
        };

        switch (library.focus.condition) {
            case "eat-head":
                library.condition.eatHead = getNext(library.condition.eatHead);
                libraryStore.set({ ...library });
                break;
            case "eat-tail":
                library.condition.eatTail = getNext(library.condition.eatTail);
                libraryStore.set({ ...library });
                break;
        }
    };

    const movePitch = (dir: -1 | 1) => {
        const ctx = createContext();
        const library = ctx.library;
        if (library == null || library.focus.finder != null) return;

        const getNext = (current: number) => {
            const next = current + dir;
            if (next < 0 || next > 11) return current;
            return next;
        };
        const getNextOn = (current: number) => {
            const next = current + dir;
            if (next < -1 || next > 11) return current;
            return next;
        };

        switch (library.focus.condition) {
            case "root":
                library.condition.root = getNext(library.condition.root);
                libraryStore.set({ ...library });
                break;
            case "on":
                library.condition.on = getNextOn(library.condition.on);
                libraryStore.set({ ...library });
                break;
        }
    };

    const moveSymbolTones = (dir: -1 | 1) => {
        const ctx = createContext();
        const library = ctx.library;
        if (library == null || library.focus.finder != null || library.focus.condition !== "symbol-tones") return;

        const currentTones = ChordTheory.getSymbolProps(library.condition.symbol).structs.length;
        const currentIndex = currentTones - 3;
        const nextIndex = currentIndex + dir;
        if (nextIndex < 0 || nextIndex > ChordTheory.SymbolTable.length - 1) return;

        const nextSymbol = ChordTheory.SymbolTable[nextIndex][0];
        if (nextSymbol == undefined) throw new Error(`Symbol candidates are empty. [${nextIndex}]`);

        library.condition.symbolTones = nextIndex + 3;
        library.condition.symbol = nextSymbol;
        libraryStore.set({ ...library });
    };

    const moveSymbol = (dir: -1 | 1) => {
        const ctx = createContext();
        const library = ctx.library;
        if (library == null || library.focus.finder != null || library.focus.condition !== "symbol") return;

        const currentTones = ChordTheory.getSymbolProps(library.condition.symbol).structs.length;
        const symbols = ChordTheory.SymbolTable[currentTones - 3];
        const index = symbols.indexOf(library.condition.symbol);
        const next = index + dir;
        if (next < 0 || next > symbols.length - 1) return;

        library.condition.symbol = symbols[next];
        library.condition.symbolTones = currentTones;
        libraryStore.set({ ...library });
    };

    const createStructCount = (library: LibraryState.Value) => {
        const condition = library.condition;
        const chord = {
            key12: condition.root,
            isFlat: false,
            symbol: condition.symbol,
            on: condition.on === -1
                ? undefined
                : {
                    key12: condition.on,
                    isFlat: false,
                },
        };

        return ChordTheory.getStructsFromKeyChord(chord).length;
    };

    const createSearchRequest = (library: LibraryState.Value): FinderState.SearchRequest => ({
        ts: library.condition.ts,
        beat: library.condition.beat,
        eatHead: library.condition.eatHead,
        eatTail: library.condition.eatTail,
        structCnt: createStructCount(library),
    });

    const searchPianoPatterns = (ctx: ReturnType<typeof createContext>, library: LibraryState.Value) => {
        const track = ctx.arrange.tracks[ctx.control.outline.trackIndex];
        if (track == undefined || track.method !== "piano") return [];

        return FinderState.searchPianoPatterns({
            req: createSearchRequest(library),
            arrTrack: track,
            isFilterPatternOnly: false,
        });
    };

    const switchToFinder = () => {
        const ctx = createContext();
        const library = ctx.library;
        if (library == null || library.focus.finder != null) return;

        const list = searchPianoPatterns(ctx, library);
        library.focus.finder = {
            cursor: {
                backing: list.length === 0 ? -1 : 0,
                sounds: -1,
            },
        };
        libraryStore.set({ ...library });
    };

    const switchToCondition = () => {
        const ctx = createContext();
        const library = ctx.library;
        if (library == null || library.focus.finder == null) return;

        library.focus.finder = null;
        libraryStore.set({ ...library });
    };

    const moveFinderBacking = (dir: -1 | 1) => {
        const ctx = createContext();
        const library = ctx.library;
        if (library == null || library.focus.finder == null) return;

        const list = searchPianoPatterns(ctx, library);
        if (list.length === 0) return;

        const next = library.focus.finder.cursor.backing + dir;
        if (next < 0 || next > list.length - 1) return;

        const previousBackingIndex = library.focus.finder.cursor.backing;
        library.focus.finder.cursor.backing = next;
        library.focus.finder.cursor.sounds = -1;
        libraryStore.set({ ...library });
        resetFinderVoicingScroll(ctx, previousBackingIndex);
        adjustFinderBackingScroll(ctx);
        adjustFinderVoicingScroll(ctx);
    };

    const moveFinderVoicing = (dir: -1 | 1) => {
        const ctx = createContext();
        const library = ctx.library;
        if (library == null || library.focus.finder == null) return;

        const list = searchPianoPatterns(ctx, library);
        const backing = library.focus.finder.cursor.backing;
        if (backing === -1 || list[backing] == undefined) return;

        const next = library.focus.finder.cursor.sounds + dir;
        if (next < -1 || next > list[backing].soundsNos.length - 1) return;

        library.focus.finder.cursor.sounds = next;
        libraryStore.set({ ...library });
        adjustFinderVoicingScroll(ctx);
    };

    const openPianoEditor = (modeOption?: ArrangeState.LibraryEditorMode) => {
        const ctx = createContext();
        const library = ctx.library;
        if (library == null || library.focus.finder == null) return;

        const track = ctx.arrange.tracks[ctx.control.outline.trackIndex];
        if (track == undefined || track.method !== "piano") return;
        const pianoLib = track.bank;

        const list = searchPianoPatterns(ctx, library);
        const cursor = library.focus.finder.cursor;
        const selected = list[cursor.backing];

        const backingPattern = selected == undefined
            ? undefined
            : pianoLib.backingPatterns.find(pattern => {
                return pattern.no === selected.backingNo;
            });
        if (selected != undefined && selected.backingNo !== -1 && backingPattern == undefined) return;

        const soundsPattern = selected == undefined || cursor.sounds === -1
            ? undefined
            : pianoLib.soundsPatterns.find(pattern => {
                return pattern.no === selected.soundsNos[cursor.sounds];
            });
        const mode: ArrangeState.LibraryEditorMode = (() => {
            if (modeOption != undefined) return modeOption;
            if (cursor.sounds !== -1) return "edit-sounds";
            return "add-sounds";
        })();

        const condition = library.condition;
        const chord = {
            key12: condition.root,
            isFlat: false,
            symbol: condition.symbol,
            on: condition.on === -1
                ? undefined
                : {
                    key12: condition.on,
                    isFlat: false,
                },
        };
        const editor = PianoEditorState.createInitialProps();
        if (backingPattern != undefined) {
            const backing = PianoBackingState.createInitialBackingProps();
            backing.recordNum = backingPattern.backing.recordNum;
            backing.layers = JSON.parse(JSON.stringify(backingPattern.backing.layers));
            editor.backing = backing;
        } else {
            editor.backing = null;
        }
        editor.voicing.items = soundsPattern == undefined
            ? []
            : JSON.parse(JSON.stringify(soundsPattern.sounds));
        editor.lastSource = PianoEditorState.createSnapshot(editor);

        ctx.control.outline.arrange = {
            method: "piano",
            origin: {
                type: "library",
                mode,
                backingNo: selected == undefined ? -1 : selected.backingNo,
                soundsNo: selected == undefined || cursor.sounds === -1
                    ? -1
                    : selected.soundsNos[cursor.sounds],
            },
            target: {
                scoreBase: {
                    rhythm: {
                        ts: condition.ts,
                        feel: { type: "straight" },
                    },
                    tempo: 100,
                    tonality: {
                        key12: 0,
                        scale: "major",
                    },
                },
                beat: {
                    num: condition.beat,
                    eatHead: condition.eatHead,
                    eatTail: condition.eatTail,
                },
                compiledChord: {
                    chord,
                    structs: ChordTheory.getStructsFromKeyChord(chord),
                },
                chordSeq: -1,
            },
            editor,
        };
        controlStore.set({ ...ctx.control });
    };

    const togglePreset = () => {
        const ctx = createContext();
        const library = ctx.library;
        if (library == null || library.focus.finder == null) return;

        const track = ctx.arrange.tracks[ctx.control.outline.trackIndex];
        if (track == undefined || track.method !== "piano") return;
        const pianoLib = track.bank;

        const list = searchPianoPatterns(ctx, library);
        const cursor = library.focus.finder.cursor;
        const selected = list[cursor.backing];
        if (selected == undefined) return;

        let regular = pianoLib.regulars.find(regular => {
            return regular.backingNo === selected.backingNo;
        });
        const commit = () => {
            dataStore.set({ ...ctx.data });
            libraryStore.set({ ...library });
        };
        const isBackingUnreferencedWithoutPreset = (backingNo: number) => {
            if (backingNo === -1) return false;
            return !ArrangeState.isPatternReferenced("bkgPatt", backingNo, track);
        };
        const isSoundsUnreferencedWithoutPreset = (soundsNo: number) => {
            return (
                !ArrangeState.isPatternReferenced("sndsPatt", soundsNo, track) &&
                !pianoLib.regulars.some(item => item !== regular && item.soundsNos.includes(soundsNo))
            );
        };
        const removeBackingPreset = () => {
            if (regular == undefined) return;
            pianoLib.regulars = pianoLib.regulars.filter(item => item !== regular);
            if (isBackingUnreferencedWithoutPreset(selected.backingNo)) {
                PianoEditorState.deleteBackingPattern(pianoLib, selected.backingNo);
            }
            commit();
        };
        const removeSoundsPreset = (soundsNo: number) => {
            if (regular == undefined) return;
            regular.soundsNos = regular.soundsNos.filter(no => no !== soundsNo);
            if (isSoundsUnreferencedWithoutPreset(soundsNo)) {
                PianoEditorState.deleteSoundsPattern(pianoLib, soundsNo);
            }
            commit();
        };

        if (cursor.sounds === -1) {
            if (regular == undefined) {
                pianoLib.regulars.push({
                    backingNo: selected.backingNo,
                    sortNo: -1,
                    soundsNos: [],
                });
            } else if (regular.soundsNos.length === 0) {
                if (isBackingUnreferencedWithoutPreset(selected.backingNo)) {
                    ConfirmDialog.open({
                        tone: "danger",
                        title: "Delete Preset",
                        messageLines: [
                            "This backing pattern is not used by any chord block.",
                            "Remove it from the library?",
                        ],
                        choices: [
                            {
                                label: "Delete",
                                role: "proceed",
                                callback: removeBackingPreset,
                            },
                        ],
                    });
                    return;
                }
                removeBackingPreset();
                return;
            } else {
                Toast.create({
                    ...ToastState.createInitial(),
                    x: 24,
                    y: 84,
                    width: 340,
                    text: "Cannot remove backing preset while voicings are linked.",
                });
                return;
            }

            commit();
            return;
        }

        const soundsNo = selected.soundsNos[cursor.sounds];
        if (soundsNo == undefined) return;

        if (regular == undefined) {
            regular = {
                backingNo: selected.backingNo,
                sortNo: -1,
                soundsNos: [soundsNo],
            };
            pianoLib.regulars.push(regular);
        } else if (regular.soundsNos.includes(soundsNo)) {
            if (isSoundsUnreferencedWithoutPreset(soundsNo)) {
                ConfirmDialog.open({
                    tone: "danger",
                    title: "Delete Preset",
                    messageLines: [
                        "This voicing pattern is not used by any chord block.",
                        "Remove it from the library?",
                    ],
                    choices: [
                        {
                            label: "Delete",
                            role: "proceed",
                            callback: () => removeSoundsPreset(soundsNo),
                        },
                    ],
                });
                return;
            }
            removeSoundsPreset(soundsNo);
            return;
        } else {
            regular.soundsNos.push(soundsNo);
        }

        commit();
    };

    const openMenu = () => {
        const ctx = createContext();
        const library = ctx.library;
        if (library == null || library.focus.finder == null) return;

        const cursor = library.focus.finder.cursor;
        if (cursor.backing < 0) return;

        const recordRef = ctx.ref.library.finder.records.find(record => {
            return record.seq === cursor.backing;
        })?.ref;
        if (recordRef == undefined) return;

        const anchorRef = cursor.sounds === -1
            ? recordRef
            : recordRef.querySelector<HTMLElement>(`[data-finder-sounds-index="${cursor.sounds}"]`) ?? recordRef;
        const rect = anchorRef.getBoundingClientRect();
        const { action } = ActionMenuState.createFactory();
        const list = searchPianoPatterns(ctx, library);
        const selected = list[cursor.backing];
        const actions = (() => {
            if (cursor.sounds !== -1) {
                return [
                    action("Edit", () => openPianoEditor("edit-sounds")),
                    action("Copy", () => openPianoEditor("add-sounds")),
                ];
            }
            if (selected?.backingNo === -1) {
                return [
                    action("Add Backing", () => openPianoEditor("add-backing")),
                    action("Add Voicing", () => openPianoEditor("add-sounds")),
                ];
            }
            return [
                action("Edit", () => openPianoEditor("edit-backing")),
                action("Copy Backing", () => openPianoEditor("add-backing")),
                action("Add Voicing", () => openPianoEditor("add-sounds")),
            ];
        })();
        ActionMenu.openAt(
            actions,
            rect.left + 8,
            rect.bottom + 8,
        );
    };

    return {
        close,
        moveBeat,
        moveCondition,
        moveEat,
        movePitch,
        moveSymbol,
        moveSymbolTones,
        moveTimeSignature,
        moveFinderBacking,
        moveFinderVoicing,
        togglePreset,
        openMenu,
        openPianoEditor,
        switchToCondition,
        switchToFinder,
    };
};

export default createLibraryActions;
