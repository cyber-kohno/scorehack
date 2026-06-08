import { get } from "svelte/store";
import { controlStore, dataStore, inputStore, libraryStore } from "../../store/global-store";
import ChordTheory from "../../domain/theory/chord-theory";
import RhythmTheory from "../../domain/theory/rhythm-theory";
import InputState from "../../store/state/input-state";
import LibraryState from "../../store/state/library-state";
import ArrangeLibrary from "../../store/state/data/arrange/arrange-library";

const createContext = () => {
    const data = get(dataStore);
    const control = get(controlStore);
    const library = get(libraryStore);

    return {
        arrange: data.arrange,
        control,
        library,
    };
};

const createLibraryActions = () => {
    const close = () => {
        createContext();
        libraryStore.set(null);
        inputStore.set(InputState.createInitial());
    };

    const moveCondition = (dir: -1 | 1) => {
        const ctx = createContext();
        const library = ctx.library;
        if (library == null || library.focus.finder != null) return;

        const index = LibraryState.Conditions.indexOf(library.focus.condition);
        const next = index + dir;
        if (next < 0 || next > LibraryState.Conditions.length - 1) return;

        library.focus.condition = LibraryState.Conditions[next];
        libraryStore.set({ ...library });
    };

    const moveTimeSignature = (dir: -1 | 1) => {
        const ctx = createContext();
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

    const createSearchRequest = (library: LibraryState.Value): ArrangeLibrary.SearchRequest => ({
        ts: library.condition.ts,
        beat: library.condition.beat,
        eatHead: library.condition.eatHead,
        eatTail: library.condition.eatTail,
        structCnt: createStructCount(library),
    });

    const searchPianoPatterns = (ctx: ReturnType<typeof createContext>, library: LibraryState.Value) => {
        const track = ctx.arrange.tracks[ctx.control.outline.trackIndex];
        if (track == undefined || track.method !== "piano") return [];

        return ArrangeLibrary.searchPianoPatterns({
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
        const next = library.focus.finder.cursor.backing + dir;
        if (next < -1 || next > list.length - 1) return;

        library.focus.finder.cursor.backing = next;
        library.focus.finder.cursor.sounds = -1;
        libraryStore.set({ ...library });
    };

    const moveFinderVoicing = (dir: -1 | 1) => {
        const ctx = createContext();
        const library = ctx.library;
        if (library == null || library.focus.finder == null) return;

        const list = searchPianoPatterns(ctx, library);
        const backing = library.focus.finder.cursor.backing;
        if (backing === -1 || list[backing] == undefined) return;

        const next = library.focus.finder.cursor.sounds + dir;
        if (next < -1 || next > list[backing].voics.length - 1) return;

        library.focus.finder.cursor.sounds = next;
        libraryStore.set({ ...library });
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
        switchToCondition,
        switchToFinder,
    };
};

export default createLibraryActions;
