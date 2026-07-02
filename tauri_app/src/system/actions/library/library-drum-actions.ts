import { get } from "svelte/store";
import { controlStore, dataStore, libraryStore, refStore } from "../../store/global-store";
import ActionMenu from "../../service/common/action-menu-controller";
import ActionMenuState from "../../store/state/action-menu-state";
import ConfirmDialog from "../../service/common/confirm-dialog-controller";
import ArrangeState from "../../store/state/data/arrange/arrange-state";
import DrumEditorState from "../../store/state/data/arrange/drum/drum-editor-state";
import FinderState from "../../store/state/data/arrange/finder-state";
import type LibraryState from "../../store/state/library-state";

const PATTERN_ROW_HEIGHT = 71;
const COLUMN_COUNT = FinderState.Drum.ColumnCount;

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

const createLibraryDrumActions = () => {
    const createSearchRequest = (library: LibraryState.Value): FinderState.SearchRequest => ({
        ts: library.condition.ts,
        beat: library.condition.beat,
        eatHead: library.condition.eatHead,
        eatTail: library.condition.eatTail,
        structCnt: 0,
    });

    const searchPatterns = (ctx: ReturnType<typeof createContext>, library: LibraryState.Value) => {
        const track = ctx.arrange.tracks[ctx.control.outline.trackIndex];
        if (track == undefined || track.method !== "drum") return [];

        return FinderState.Drum.searchPatterns({
            req: createSearchRequest(library),
            arrTrack: track,
        });
    };

    const adjustFinderPatternScroll = (ctx: ReturnType<typeof createContext>) => {
        const library = ctx.library;
        if (library == null || library.focus.finder == null) return;

        const frame = ctx.ref.library.finder.frame;
        if (frame == undefined) return;

        const rect = frame.getClientRects()[0];
        if (rect == undefined) return;

        const rowIndex = Math.floor(library.focus.finder.cursor.backing / COLUMN_COUNT);
        const top = -rect.height / 2 + rowIndex * PATTERN_ROW_HEIGHT;
        frame.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
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

    const moveFinderPattern = (dir: -1 | 1 | -3 | 3) => {
        const ctx = createContext();
        const library = ctx.library;
        if (library == null || library.focus.finder == null) return;

        const list = searchPatterns(ctx, library);
        if (list.length === 0) return;

        const current = library.focus.finder.cursor.backing;
        if (current === -1) return;

        const next = current + dir;
        if (next < 0 || next > list.length - 1) return;

        library.focus.finder.cursor.backing = next;
        library.focus.finder.cursor.sounds = -1;
        libraryStore.set({ ...library });
        adjustFinderPatternScroll(ctx);
    };

    const createEditorFromPattern = (pattern: DrumEditorState.Pattern | undefined) => {
        const editor = DrumEditorState.createInitialProps();
        if (pattern != undefined) {
            Object.assign(editor, DrumEditorState.createPatternDataEditorProps(pattern.pattern));
            editor.cursorY = editor.records.length > 0 ? 0 : -1;
        }
        editor.lastSource = DrumEditorState.createSnapshot(editor);
        return editor;
    };

    const openEditor = (
        modeOption?: ArrangeState.DrumLibraryEditorMode,
        option: { copySource?: boolean } = {},
    ) => {
        const ctx = createContext();
        const library = ctx.library;
        if (library == null || library.focus.finder == null) return;

        const track = ctx.arrange.tracks[ctx.control.outline.trackIndex];
        if (track == undefined || track.method !== "drum") return;

        const list = searchPatterns(ctx, library);
        const selected = list[library.focus.finder.cursor.backing];
        const mode: ArrangeState.DrumLibraryEditorMode = modeOption
            ?? (selected == undefined ? "add-pattern" : "edit-pattern");
        if (selected == undefined && mode === "edit-pattern") return;

        const pattern = selected == undefined
            ? undefined
            : track.bank.patterns.find(pattern => pattern.no === selected.patternNo);
        if (selected != undefined && pattern == undefined) throw new Error("Drum pattern must exist.");

        const condition = library.condition;
        ctx.control.outline.arrange = {
            method: "drum",
            origin: {
                type: "library",
                mode,
                patternNo: selected?.patternNo ?? -1,
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
                chordSeq: -1,
            },
            editor: createEditorFromPattern(mode === "add-pattern" && option.copySource !== true
                ? undefined
                : pattern),
        };
        controlStore.set({ ...ctx.control });
    };

    const openMenu = () => {
        const ctx = createContext();
        const library = ctx.library;
        if (library == null || library.focus.finder == null) return;

        const cursor = library.focus.finder.cursor.backing;
        const { action } = ActionMenuState.createFactory();
        if (cursor < 0) {
            const frame = ctx.ref.library.finder.frame;
            const rect = frame?.getBoundingClientRect();
            ActionMenu.openAt(
                [
                    action("Add", () => openEditor("add-pattern")),
                ],
                rect == undefined ? 24 : rect.left + 8,
                rect == undefined ? 84 : rect.top + 36,
            );
            return;
        }

        const recordRef = ctx.ref.library.finder.records.find(record => {
            return record.seq === cursor;
        })?.ref;
        if (recordRef == undefined) return;

        const rect = recordRef.getBoundingClientRect();
        ActionMenu.openAt(
            [
                action("Edit", () => openEditor("edit-pattern")),
                action("Copy", () => openEditor("add-pattern", { copySource: true })),
                action("Add", () => openEditor("add-pattern")),
            ],
            rect.left + 8,
            rect.bottom + 8,
        );
    };

    const toggleRegular = () => {
        const ctx = createContext();
        const library = ctx.library;
        if (library == null || library.focus.finder == null) return;
        const finder = library.focus.finder;

        const track = ctx.arrange.tracks[ctx.control.outline.trackIndex];
        if (track == undefined || track.method !== "drum") return;

        const list = searchPatterns(ctx, library);
        const selected = list[finder.cursor.backing];
        if (selected == undefined) return;

        const patternNo = selected.patternNo;
        const commit = () => {
            dataStore.set({ ...ctx.data });
            libraryStore.set({ ...library });
        };
        const adjustCursorAfterDelete = () => {
            const nextList = searchPatterns(ctx, library);
            finder.cursor.backing = nextList.length === 0
                ? -1
                : Math.min(finder.cursor.backing, nextList.length - 1);
            finder.cursor.sounds = -1;
        };
        const removeRegular = () => {
            track.bank.regulars = track.bank.regulars.filter(regular => {
                return regular.patternNo !== patternNo;
            });
        };
        const removeRegularAndDeletePattern = () => {
            removeRegular();
            track.bank.patterns = track.bank.patterns.filter(pattern => {
                return pattern.no !== patternNo;
            });
            adjustCursorAfterDelete();
            commit();
        };

        const isRegular = track.bank.regulars.some(regular => {
            return regular.patternNo === patternNo;
        });
        if (!isRegular) {
            track.bank.regulars.push({
                patternNo,
                sortNo: -1,
            });
            commit();
            return;
        }

        if (!ArrangeState.isPatternReferenced("sndsPatt", patternNo, track)) {
            ConfirmDialog.open({
                tone: "danger",
                title: "Delete Regular",
                messageLines: [
                    "This drum pattern is not used by any chord block.",
                    "Remove it from the library?",
                ],
                choices: [
                    {
                        label: "Delete",
                        role: "proceed",
                        callback: removeRegularAndDeletePattern,
                    },
                ],
            });
            return;
        }

        removeRegular();
        commit();
    };

    return {
        moveFinderPattern,
        openEditor,
        openMenu,
        switchToFinder,
        toggleRegular,
    };
};

export default createLibraryDrumActions;
