import ChordTheory from "../../domain/theory/chord-theory";
import RhythmTheory from "../../domain/theory/rhythm-theory";
import Toast from "../../service/common/toast-controller";
import DegreeBasis from "../../service/notation/degree-basis";
import ElementState from "../../store/state/data/element-state";
import ToastState from "../../store/state/toast-state";
import type createOutlineBackingActions from "./outline-backing-actions";
import type { OutlineActionContext } from "./outline-actions";

type BackingActions = ReturnType<typeof createOutlineBackingActions>;

const createOutlineChordActions = (
    createContext: () => OutlineActionContext,
    backingActions: BackingActions,
) => {
    const cloneChordData = (chordData: ElementState.DataChord): ElementState.DataChord => {
        return JSON.parse(JSON.stringify(chordData));
    };

    const canChangeScoreTail = (
        ctx: OutlineActionContext,
        deltaBeatNote: number,
    ) => {
        if (deltaBeatNote >= 0) return true;

        const nextTail = ctx.derivedSelector.getBeatNoteTail() + deltaBeatNote;
        const melodyTail = ctx.melodySelector.getAllScoreTracksTailBeatNote();
        if (melodyTail <= nextTail + 1e-9) return true;

        Toast.create({
            ...ToastState.createInitial(),
            x: 12,
            y: 48,
            width: 320,
            text: "Cannot change beat: melody notes exceed the new score length.",
        });
        return false;
    };

    const calcBeatChangeDeltaBeatNote = (
        ctx: OutlineActionContext,
        currentBeat: number,
        nextBeat: number,
    ) => {
        const chordCache = ctx.derivedSelector.getCurChord();
        const baseCache = ctx.derived.baseCaches[chordCache.baseSeq];
        const beatRate = RhythmTheory.getBeatDiv16Count(baseCache.scoreBase.rhythm.ts) / 4;

        return (nextBeat - currentBeat) * beatRate;
    };

    const setDiatonicDegree = (scaleIndex: number, withSeventh: boolean = false) => {
        const ctx = createContext();
        const element = ctx.outlineSelector.getCurrentElement();

        if (element.type !== "chord") return;

        const beforeChordData = cloneChordData(element.data as ElementState.DataChord);
        const afterChordData = cloneChordData(beforeChordData);
        const tonality = ctx.derivedSelector.getCurBase().scoreBase.tonality;
        const displayTonality = DegreeBasis.getDisplayTonality(tonality, ctx.settings.notation.degreeBasis);
        const degree = ChordTheory.getDiatonicDegreeChord(displayTonality.scale, scaleIndex, withSeventh);
        afterChordData.degree = DegreeBasis.toStoredDegree(degree, tonality, ctx.settings.notation.degreeBasis);

        ctx.outlineUpdater.setChordData(afterChordData);
        backingActions.adjustArrangeAfterChordChanged(ctx, beforeChordData, afterChordData);
        ctx.commitDataAndRecalculate();
    };

    const modSymbol = (dir: "prev" | "next" | "lower" | "upper") => {
        const ctx = createContext();
        const element = ctx.outlineSelector.getCurrentElement();

        if (element.type !== "chord") {
            throw new Error("modSymbol requires a chord element.");
        }

        const beforeChordData = cloneChordData(element.data as ElementState.DataChord);
        const changed = ctx.outlineUpdater.modSymbol(dir);

        if (!changed) return;

        const afterChordData = element.data as ElementState.DataChord;
        backingActions.adjustArrangeAfterChordChanged(ctx, beforeChordData, afterChordData);
        ctx.commitDataAndRecalculate();
    };

    const modRoot = (dir: -1 | 1) => {
        const ctx = createContext();
        const element = ctx.outlineSelector.getCurrentElement();

        if (element.type !== "chord") {
            throw new Error("modRoot requires a chord element.");
        }

        const beforeChordData = cloneChordData(element.data as ElementState.DataChord);
        const changed = ctx.outlineUpdater.modRoot(dir);

        if (!changed) return;

        const afterChordData = element.data as ElementState.DataChord;
        backingActions.adjustArrangeAfterChordChanged(ctx, beforeChordData, afterChordData);
        ctx.commitDataAndRecalculate();
    };

    const modBeat = (dir: -1 | 1) => {
        const ctx = createContext();
        const element = ctx.outlineSelector.getCurrentElement();

        if (element.type !== "chord") {
            throw new Error("modBeat requires a chord element.");
        }

        const chordData = element.data as ElementState.DataChord;
        const nextBeat = chordData.beat + dir;
        if (!canChangeScoreTail(
            ctx,
            calcBeatChangeDeltaBeatNote(ctx, chordData.beat, nextBeat),
        )) return;

        const changed = ctx.outlineUpdater.modBeat(dir);

        if (!changed) return;

        ctx.commitDataAndRecalculate();
        ctx.refUpdater.adjustGridScrollXFromOutline();
    };

    const setChordBeat = (beat: number) => {
        const ctx = createContext();
        const element = ctx.outlineSelector.getCurrentElement();

        if (element.type !== "chord") {
            throw new Error("setChordBeat requires a chord element.");
        }

        if (beat < 1 || beat > 4) return;

        const chordData = element.data as ElementState.DataChord;
        if (!canChangeScoreTail(
            ctx,
            calcBeatChangeDeltaBeatNote(ctx, chordData.beat, beat),
        )) return;

        chordData.beat = beat;
        ctx.commitDataAndRecalculate();
        ctx.refUpdater.adjustGridScrollXFromOutline();
    };

    const modOn = (dir: -1 | 1) => {
        const ctx = createContext();
        const element = ctx.outlineSelector.getCurrentElement();

        if (element.type !== "chord") {
            throw new Error("modOn requires a chord element.");
        }

        const beforeChordData = cloneChordData(element.data as ElementState.DataChord);
        const chordData = element.data as ElementState.DataChord;
        const degree = chordData.degree;
        if (degree == undefined) return;

        if (degree.on == undefined) {
            degree.on = ChordTheory.getDegree12Props(dir === 1 ? 0 : 11, dir === -1);
        } else {
            const nextIndex = ChordTheory.getDegree12Index(degree.on) + dir;
            if (nextIndex < 0 || nextIndex > 11) {
                degree.on = undefined;
            } else {
                degree.on = ChordTheory.getDegree12Props(nextIndex, dir === -1);
            }
        }

        const afterChordData = element.data as ElementState.DataChord;
        backingActions.adjustArrangeAfterChordChanged(ctx, beforeChordData, afterChordData);
        ctx.commitDataAndRecalculate();
    };

    const modEat = (dir: -1 | 1) => {
        const ctx = createContext();
        const element = ctx.outlineSelector.getCurrentElement();

        if (element.type !== "chord") {
            throw new Error("modEat requires a chord element.");
        }

        const changed = ctx.outlineUpdater.modEat(dir);

        if (!changed) return;

        ctx.commitDataAndRecalculate();
        ctx.refUpdater.adjustGridScrollXFromOutline();
    };

    const setChordEat = (eat: number) => {
        const ctx = createContext();
        const element = ctx.outlineSelector.getCurrentElement();

        if (element.type !== "chord") {
            throw new Error("setChordEat requires a chord element.");
        }

        if (eat < -2 || eat > 2) return;

        const chordData = element.data as ElementState.DataChord;
        chordData.eat = eat;
        ctx.commitDataAndRecalculate();
        ctx.refUpdater.adjustGridScrollXFromOutline();
    };

    const setChordRoot = (root: ChordTheory.DegreeKey) => {
        const ctx = createContext();
        const element = ctx.outlineSelector.getCurrentElement();

        if (element.type !== "chord") {
            throw new Error("setChordRoot requires a chord element.");
        }

        const beforeChordData = cloneChordData(element.data as ElementState.DataChord);
        const afterChordData = cloneChordData(beforeChordData);
        const symbol = afterChordData.degree?.symbol ?? "";
        afterChordData.degree = {
            symbol,
            ...root,
        };

        ctx.outlineUpdater.setChordData(afterChordData);
        backingActions.adjustArrangeAfterChordChanged(ctx, beforeChordData, afterChordData);
        ctx.commitDataAndRecalculate();
    };

    const setChordOn = (on: ChordTheory.DegreeKey | undefined) => {
        const ctx = createContext();
        const element = ctx.outlineSelector.getCurrentElement();

        if (element.type !== "chord") {
            throw new Error("setChordOn requires a chord element.");
        }

        const beforeChordData = cloneChordData(element.data as ElementState.DataChord);
        const afterChordData = cloneChordData(beforeChordData);
        const degree = afterChordData.degree ?? ChordTheory.getDiatonicDegreeChord("major", 0);
        if (on == undefined) {
            delete degree.on;
        } else {
            degree.on = { ...on };
        }
        afterChordData.degree = degree;

        ctx.outlineUpdater.setChordData(afterChordData);
        backingActions.adjustArrangeAfterChordChanged(ctx, beforeChordData, afterChordData);
        ctx.commitDataAndRecalculate();
    };

    const setChordSymbol = (symbol: ChordTheory.ChordSymol) => {
        const ctx = createContext();
        const element = ctx.outlineSelector.getCurrentElement();

        if (element.type !== "chord") {
            throw new Error("setChordSymbol requires a chord element.");
        }

        const beforeChordData = cloneChordData(element.data as ElementState.DataChord);
        const afterChordData = cloneChordData(beforeChordData);
        const degree = afterChordData.degree ?? ChordTheory.getDiatonicDegreeChord("major", 0);
        degree.symbol = symbol;
        afterChordData.degree = degree;

        ctx.outlineUpdater.setChordData(afterChordData);
        backingActions.adjustArrangeAfterChordChanged(ctx, beforeChordData, afterChordData);
        ctx.commitDataAndRecalculate();
    };

    return {
        setDiatonicDegree,
        modSymbol,
        modRoot,
        modBeat,
        modOn,
        modEat,
        setChordBeat,
        setChordEat,
        setChordRoot,
        setChordOn,
        setChordSymbol,
    };
};

export default createOutlineChordActions;
