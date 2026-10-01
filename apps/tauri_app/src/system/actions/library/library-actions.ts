import { get } from "svelte/store";
import { controlStore, dataStore, inputStore, libraryStore } from "../../store/global-store";
import ChordTheory from "../../domain/theory/chord-theory";
import RhythmTheory from "../../domain/theory/rhythm-theory";
import InputState from "../../store/state/input-state";
import LibraryState from "../../store/state/library-state";

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

    const switchToFinder = () => {
        const ctx = createContext();
        const library = ctx.library;
        if (library == null || library.focus.finder != null) return;

        library.focus.finder = {
            cursor: {
                backing: -1,
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

    return {
        close,
        moveBeat,
        moveCondition,
        moveEat,
        movePitch,
        moveSymbol,
        moveSymbolTones,
        moveTimeSignature,
        switchToCondition,
        switchToFinder,
    };
};

export default createLibraryActions;
