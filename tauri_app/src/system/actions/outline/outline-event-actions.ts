import RhythmTheory from "../../domain/theory/rhythm-theory";
import ElementState from "../../store/state/data/element-state";
import type { OutlineActionContext } from "./outline-actions";

const createOutlineEventActions = (
    createContext: () => OutlineActionContext,
) => {
    const insertEventMod = () => {
        const ctx = createContext();
        const element = ctx.outlineSelector.getCurrentElement();

        if (element.type === "init") return;

        const data: ElementState.DataModulate = {
            method: "domm",
            val: 0,
        };
        ctx.outlineUpdater.insertElement({
            type: "modulate",
            data,
        });
        ctx.commitDataAndRecalculate();
    };

    const initialTempo = (dir: -1 | 1) => {
        const ctx = createContext();
        const initData = ctx.outlineSelector.getCurrentInitData();
        const nextTempo = initData.tempo + dir;

        if (nextTempo < 1) return;

        initData.tempo = nextTempo;
        ctx.commitDataAndRecalculate();
    };

    const initialScale = () => {
        const ctx = createContext();
        const tonality = ctx.outlineSelector.getCurrentInitData().tonality;
        tonality.scale = tonality.scale === 'major' ? 'minor' : 'major';
        ctx.commitDataAndRecalculate();
    };

    const initialScaleKey = (dir: -1 | 1) => {
        const ctx = createContext();
        const tonality = ctx.outlineSelector.getCurrentInitData().tonality;
        tonality.key12 = (12 + tonality.key12 + dir) % 12;
        ctx.commitDataAndRecalculate();
    };

    const initialTS = (dir: -1 | 1) => {
        const ctx = createContext();
        const initData = ctx.outlineSelector.getCurrentInitData();
        const currentName = RhythmTheory.formatTS(initData.ts);
        const currentIndex = RhythmTheory.TS_DEFS.findIndex(
            ts => RhythmTheory.formatTS(ts) === currentName,
        );

        if (currentIndex === -1) return;

        const nextIndex = (RhythmTheory.TS_DEFS.length + currentIndex + dir) % RhythmTheory.TS_DEFS.length;
        initData.ts = { ...RhythmTheory.TS_DEFS[nextIndex] };
        ctx.commitDataAndRecalculate();
    };

    const insertEventTempo = () => {
        const ctx = createContext();
        const element = ctx.outlineSelector.getCurrentElement();

        if (element.type === "init") return;

        const data: ElementState.DataTempo = {
            method: "addition",
            val: 0,
        };
        ctx.outlineUpdater.insertElement({
            type: "tempo",
            data,
        });
        ctx.commitDataAndRecalculate();
    };

    const insertEventTS = () => {
        const ctx = createContext();
        const element = ctx.outlineSelector.getCurrentElement();

        if (element.type === "init") return;

        const scoreBase = ctx.derivedSelector.getCurBase().scoreBase;
        const data: ElementState.DataTS = {
            newTS: { ...scoreBase.ts },
        };
        ctx.outlineUpdater.insertElement({
            type: "ts",
            data,
        });
        ctx.commitDataAndRecalculate();
    };

    const eventModKind = (dir: -1 | 1) => {
        const ctx = createContext();
        const element = ctx.outlineSelector.getCurrentElement();

        if (element.type !== "modulate") {
            throw new Error("eventModKind requires a modulate element.");
        }

        const data = element.data as ElementState.DataModulate;
        const methods = ElementState.ModulateMedhods;
        const currentIndex = methods.findIndex(method => method === data.method);

        if (currentIndex === -1) return;

        const nextIndex = (methods.length + currentIndex + dir) % methods.length;
        data.method = methods[nextIndex];
        if (data.method === "domm" || data.method === "key") {
            data.val = Math.max(-3, Math.min(3, data.val ?? 0));
        } else {
            data.val = undefined;
        }

        ctx.commitDataAndRecalculate();
    };

    const eventModVal = (dir: -1 | 1) => {
        const ctx = createContext();
        const element = ctx.outlineSelector.getCurrentElement();

        if (element.type !== "modulate") {
            throw new Error("eventModVal requires a modulate element.");
        }

        const data = element.data as ElementState.DataModulate;
        if (data.method !== "domm" && data.method !== "key") return;

        const nextVal = (data.val ?? 0) + dir;
        if (nextVal < -3 || nextVal > 3) return;

        data.val = nextVal;
        ctx.commitDataAndRecalculate();
    };

    const getCurrentTempoEventPrev = (ctx: OutlineActionContext) => {
        const tempo = ctx.derived.elementCaches[ctx.outline.focus].tempo;
        if (tempo == undefined) throw new Error("tempo cache must exist.");
        return tempo.prev;
    };

    const getTempoEventNext = (
        prev: number,
        method: ElementState.TempoMedhod,
        val: number,
    ) => {
        switch (method) {
            case "addition": return prev + val;
            case "rate": return Math.floor(prev * (val / 100));
        }
    };

    const eventTempoKind = (dir: -1 | 1) => {
        const ctx = createContext();
        const element = ctx.outlineSelector.getCurrentElement();

        if (element.type !== "tempo") {
            throw new Error("eventTempoKind requires a tempo element.");
        }

        const data = element.data as ElementState.DataTempo;
        const methods = ElementState.TempoMedhods;
        const currentIndex = methods.findIndex(method => method === data.method);

        if (currentIndex === -1) return;

        const nextIndex = (methods.length + currentIndex + dir) % methods.length;
        const nextMethod = methods[nextIndex];
        const nextVal = nextMethod === "rate" ? 100 : 0;

        const prev = getCurrentTempoEventPrev(ctx);
        const nextTempo = getTempoEventNext(prev, nextMethod, nextVal);
        if (nextTempo < 10 || nextTempo > 250) return;

        data.method = nextMethod;
        data.val = nextVal;
        ctx.commitDataAndRecalculate();
    };

    const eventTempoVal = (dir: -1 | 1) => {
        const ctx = createContext();
        const element = ctx.outlineSelector.getCurrentElement();

        if (element.type !== "tempo") {
            throw new Error("eventTempoVal requires a tempo element.");
        }

        const data = element.data as ElementState.DataTempo;
        const prev = getCurrentTempoEventPrev(ctx);
        const nextVal = data.val + dir;
        const nextTempo = getTempoEventNext(prev, data.method, nextVal);

        if (nextTempo < 10 || nextTempo > 250) return;

        data.val = nextVal;
        ctx.commitDataAndRecalculate();
    };

    const eventTS = (dir: -1 | 1) => {
        const ctx = createContext();
        const element = ctx.outlineSelector.getCurrentElement();

        if (element.type !== "ts") {
            throw new Error("eventTS requires a ts element.");
        }

        const data = element.data as ElementState.DataTS;
        const currentName = RhythmTheory.formatTS(data.newTS);
        const currentIndex = RhythmTheory.TS_DEFS.findIndex(
            ts => RhythmTheory.formatTS(ts) === currentName,
        );

        if (currentIndex === -1) return;

        const nextIndex = (RhythmTheory.TS_DEFS.length + currentIndex + dir) % RhythmTheory.TS_DEFS.length;
        data.newTS = { ...RhythmTheory.TS_DEFS[nextIndex] };
        ctx.commitDataAndRecalculate();
    };

    return {
        eventModKind,
        eventModVal,
        eventTempoKind,
        eventTempoVal,
        eventTS,
        initialScale,
        initialScaleKey,
        initialTempo,
        initialTS,
        insertEventMod,
        insertEventTempo,
        insertEventTS,
    };
};

export default createOutlineEventActions;
