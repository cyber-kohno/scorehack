import { get } from "svelte/store";
import ChordTheory from "../../domain/theory/chord-theory";
import ConfirmDialog from "../../service/common/confirm-dialog-controller";
import { controlStore, dataStore, libraryStore } from "../../store/global-store";
import ArrangeState from "../../store/state/data/arrange/arrange-state";
import FinderState from "../../store/state/data/arrange/finder-state";
import GuitarEditorState from "../../store/state/data/arrange/guitar/guitar-editor-state";
import type LibraryState from "../../store/state/library-state";

const createContext = () => {
    const data = get(dataStore);
    const control = get(controlStore);
    const library = get(libraryStore);

    return {
        data,
        arrange: data.arrange,
        control,
        library,
    };
};

const createLibraryGuitarActions = () => {
    const createSearchRequest = (library: LibraryState.Value): FinderState.SearchRequest => ({
        ts: library.condition.ts,
        beat: library.condition.beat,
        eatHead: library.condition.eatHead,
        eatTail: library.condition.eatTail,
        structCnt: 0,
    });

    const createVoicingKey = (library: LibraryState.Value): FinderState.Guitar.VoicingKey => {
        const condition = library.condition;
        return FinderState.Guitar.createVoicingKey({
            key12: condition.root,
            isFlat: false,
            symbol: condition.symbol,
            on: condition.on === -1
                ? undefined
                : {
                    key12: condition.on,
                    isFlat: false,
                },
        });
    };

    const searchVoicings = (
        ctx: ReturnType<typeof createContext>,
        library: LibraryState.Value,
    ) => {
        const track = ctx.arrange.tracks[ctx.control.outline.trackIndex];
        if (track == undefined || track.method !== "guitar") return [];

        return FinderState.Guitar.searchVoicings({
            key: createVoicingKey(library),
            arrTrack: track,
        });
    };

    const searchBackings = (
        ctx: ReturnType<typeof createContext>,
        library: LibraryState.Value,
    ) => {
        const track = ctx.arrange.tracks[ctx.control.outline.trackIndex];
        if (track == undefined || track.method !== "guitar") return [];

        return FinderState.Guitar.searchBackings({
            req: createSearchRequest(library),
            arrTrack: track,
        });
    };

    const getCursor = (library: LibraryState.Value) => {
        const cursor = library.focus.finder?.cursor;
        if (cursor == undefined || !("target" in cursor)) {
            return {
                target: "voicing",
                voicing: 0,
                backing: 0,
                sounds: -1,
            } satisfies LibraryState.FinderCursor;
        }
        return {
            target: cursor.target ?? "voicing",
            voicing: cursor.voicing ?? 0,
            backing: cursor.backing,
            sounds: cursor.sounds,
        } satisfies LibraryState.FinderCursor;
    };

    const switchToFinder = () => {
        const ctx = createContext();
        const library = ctx.library;
        if (library == null || library.focus.finder != null) return;

        library.focus.finder = {
            cursor: {
                target: "voicing",
                voicing: 0,
                backing: 0,
                sounds: -1,
            },
        };
        libraryStore.set({ ...library });
    };

    const moveFinder = (dir: -1 | 1 | -3 | 3) => {
        const ctx = createContext();
        const library = ctx.library;
        if (library == null || library.focus.finder == null) return;

        const cursor = getCursor(library);
        const voicings = searchVoicings(ctx, library);
        const backings = searchBackings(ctx, library);

        if (cursor.target === "voicing") {
            const next = cursor.voicing + dir;
            if (next < 0 || next > voicings.length - 1) return;
            cursor.voicing = next;
        } else {
            const next = cursor.backing + dir;
            if (next < 0 || next > backings.length - 1) return;
            cursor.backing = next;
        }

        library.focus.finder.cursor = cursor;
        libraryStore.set({ ...library });
    };

    const applyFinderSelection = () => {
        const ctx = createContext();
        const library = ctx.library;
        if (library == null || library.focus.finder == null) return;

        const cursor = getCursor(library);
        if (cursor.target !== "voicing") return;

        cursor.target = "backing";
        library.focus.finder.cursor = cursor;
        libraryStore.set({ ...library });
    };

    const backFinderSelection = () => {
        const ctx = createContext();
        const library = ctx.library;
        if (library == null || library.focus.finder == null) return;

        const cursor = getCursor(library);
        if (cursor.target !== "backing") return;

        cursor.target = "voicing";
        library.focus.finder.cursor = cursor;
        libraryStore.set({ ...library });
    };

    const openEditor = () => {
        const ctx = createContext();
        const library = ctx.library;
        if (library == null || library.focus.finder == null) return;

        const track = ctx.arrange.tracks[ctx.control.outline.trackIndex];
        if (track == undefined || track.method !== "guitar") return;

        const cursor = getCursor(library);
        const voicings = searchVoicings(ctx, library);
        const backings = searchBackings(ctx, library);
        const selectedVoicing = voicings[cursor.voicing ?? 0];
        const selectedBacking = backings[cursor.backing];
        const voicingPattern = selectedVoicing == undefined || selectedVoicing.voicingNo === -1
            ? undefined
            : FinderState.Guitar.getVoicingFromNo(selectedVoicing.voicingNo, track.bank);
        const backingPattern = selectedBacking == undefined || selectedBacking.backingNo === -1
            ? undefined
            : FinderState.Guitar.getBackingFromNo(selectedBacking.backingNo, track.bank);
        const mode: ArrangeState.GuitarLibraryEditorMode = (() => {
            if (cursor.target === "voicing") {
                return voicingPattern == undefined ? "add-voicing" : "edit-voicing";
            }
            return backingPattern == undefined ? "add-backing" : "edit-backing";
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
        const editor = GuitarEditorState.createInitialProps();
        if (voicingPattern != undefined) {
            editor.frets = JSON.parse(JSON.stringify(voicingPattern.frets));
        }
        if (mode === "edit-backing" && backingPattern != undefined) {
            editor.backing = GuitarEditorState.createBackingEditorProps(backingPattern.backing);
            editor.control = "col";
        } else if (mode === "add-backing") {
            editor.backing = GuitarEditorState.createInitialBackingProps();
            editor.control = "col";
        } else {
            editor.backing = null;
        }

        ctx.control.outline.arrange = {
            method: "guitar",
            origin: {
                type: "library",
                mode,
                voicingNo: voicingPattern?.no ?? -1,
                backingNo: backingPattern?.no ?? -1,
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

    const toggleRegular = () => {
        const ctx = createContext();
        const library = ctx.library;
        if (library == null || library.focus.finder == null) return;

        const track = ctx.arrange.tracks[ctx.control.outline.trackIndex];
        if (track == undefined || track.method !== "guitar") return;

        const cursor = getCursor(library);
        const commit = () => {
            dataStore.set({ ...ctx.data });
            libraryStore.set({ ...library });
        };
        const removeVoicingRegular = (voicingNo: number) => {
            track.bank.voicingRegulars = track.bank.voicingRegulars.filter(regular => {
                return regular.voicingNo !== voicingNo;
            });
        };
        const removeBackingRegular = (backingNo: number) => {
            track.bank.backingRegulars = track.bank.backingRegulars.filter(regular => {
                return regular.backingNo !== backingNo;
            });
        };

        if (cursor.target === "voicing") {
            const selected = searchVoicings(ctx, library)[cursor.voicing ?? 0];
            if (selected == undefined || selected.voicingNo === -1) return;

            const voicingNo = selected.voicingNo;
            const isRegular = track.bank.voicingRegulars.some(regular => {
                return regular.voicingNo === voicingNo;
            });
            if (!isRegular) {
                track.bank.voicingRegulars.push({ voicingNo, sortNo: -1 });
                commit();
                return;
            }

            if (ArrangeState.isPatternReferenced("sndsPatt", voicingNo, track)) {
                removeVoicingRegular(voicingNo);
                commit();
                return;
            }

            const removeVoicingRegularAndDeletePattern = () => {
                removeVoicingRegular(voicingNo);
                track.bank.voicingPatterns = track.bank.voicingPatterns.filter(pattern => {
                    return pattern.no !== voicingNo;
                });
                const nextList = searchVoicings(ctx, library);
                cursor.voicing = nextList.length === 0
                    ? 0
                    : Math.min(cursor.voicing ?? 0, nextList.length - 1);
                library.focus.finder!.cursor = cursor;
                commit();
            };

            ConfirmDialog.open({
                tone: "danger",
                title: "Delete Regular",
                messageLines: [
                    "This guitar voicing is not used by any chord block.",
                    "Remove it from the library?",
                ],
                choices: [
                    {
                        label: "Delete",
                        role: "proceed",
                        callback: removeVoicingRegularAndDeletePattern,
                    },
                ],
            });
            return;
        }

        const selected = searchBackings(ctx, library)[cursor.backing];
        if (selected == undefined || selected.backingNo === -1) return;

        const backingNo = selected.backingNo;
        const isRegular = track.bank.backingRegulars.some(regular => {
            return regular.backingNo === backingNo;
        });
        if (!isRegular) {
            track.bank.backingRegulars.push({ backingNo, sortNo: -1 });
            commit();
            return;
        }

        if (ArrangeState.isPatternReferenced("bkgPatt", backingNo, track)) {
            removeBackingRegular(backingNo);
            commit();
            return;
        }

        const removeBackingRegularAndDeletePattern = () => {
            removeBackingRegular(backingNo);
            track.bank.backingPatterns = track.bank.backingPatterns.filter(pattern => {
                return pattern.no !== backingNo;
            });
            const nextList = searchBackings(ctx, library);
            cursor.backing = nextList.length === 0
                ? 0
                : Math.min(cursor.backing, nextList.length - 1);
            library.focus.finder!.cursor = cursor;
            commit();
        };

        ConfirmDialog.open({
            tone: "danger",
            title: "Delete Regular",
            messageLines: [
                "This guitar backing is not used by any chord block.",
                "Remove it from the library?",
            ],
            choices: [
                {
                    label: "Delete",
                    role: "proceed",
                    callback: removeBackingRegularAndDeletePattern,
                },
            ],
        });
    };

    return {
        applyFinderSelection,
        backFinderSelection,
        moveFinder,
        openEditor,
        switchToFinder,
        toggleRegular,
    };
};

export default createLibraryGuitarActions;
