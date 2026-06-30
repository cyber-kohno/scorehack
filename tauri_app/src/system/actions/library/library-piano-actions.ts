import { get } from "svelte/store";
import { controlStore, dataStore, libraryStore, refStore } from "../../store/global-store";
import ChordTheory from "../../domain/theory/chord-theory";
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

const createLibraryPianoActions = () => {
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

    const searchPatterns = (ctx: ReturnType<typeof createContext>, library: LibraryState.Value) => {
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

        const list = searchPatterns(ctx, library);
        library.focus.finder = {
            cursor: {
                backing: list.length === 0 ? -1 : 0,
                sounds: -1,
            },
        };
        libraryStore.set({ ...library });
    };

    const moveFinderBacking = (dir: -1 | 1) => {
        const ctx = createContext();
        const library = ctx.library;
        if (library == null || library.focus.finder == null) return;

        const list = searchPatterns(ctx, library);
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

        const list = searchPatterns(ctx, library);
        const backing = library.focus.finder.cursor.backing;
        if (backing === -1 || list[backing] == undefined) return;

        const next = library.focus.finder.cursor.sounds + dir;
        if (next < -1 || next > list[backing].soundsNos.length - 1) return;

        library.focus.finder.cursor.sounds = next;
        libraryStore.set({ ...library });
        adjustFinderVoicingScroll(ctx);
    };

    const openEditor = (modeOption?: ArrangeState.PianoLibraryEditorMode) => {
        const ctx = createContext();
        const library = ctx.library;
        if (library == null || library.focus.finder == null) return;

        const track = ctx.arrange.tracks[ctx.control.outline.trackIndex];
        if (track == undefined || track.method !== "piano") return;
        const pianoLib = track.bank;

        const list = searchPatterns(ctx, library);
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

        const list = searchPatterns(ctx, library);
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
        const list = searchPatterns(ctx, library);
        const selected = list[cursor.backing];
        const actions = (() => {
            if (cursor.sounds !== -1) {
                return [
                    action("Edit", () => openEditor("edit-sounds")),
                    action("Copy", () => openEditor("add-sounds")),
                ];
            }
            if (selected?.backingNo === -1) {
                return [
                    action("Add Backing", () => openEditor("add-backing")),
                    action("Add Voicing", () => openEditor("add-sounds")),
                ];
            }
            return [
                action("Edit", () => openEditor("edit-backing")),
                action("Copy Backing", () => openEditor("add-backing")),
                action("Add Voicing", () => openEditor("add-sounds")),
            ];
        })();
        ActionMenu.openAt(
            actions,
            rect.left + 8,
            rect.bottom + 8,
        );
    };

    return {
        moveFinderBacking,
        moveFinderVoicing,
        openEditor,
        openMenu,
        switchToFinder,
        togglePreset,
    };
};

export default createLibraryPianoActions;
