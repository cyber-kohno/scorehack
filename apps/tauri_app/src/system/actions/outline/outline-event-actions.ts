import { get } from "svelte/store";
import RhythmTheory from "../../domain/theory/rhythm-theory";
import FloatingTextInput from "../../service/common/floating-text-input-controller";
import ElementState from "../../store/state/data/element-state";
import { refStore } from "../../store/global-store";
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
        const currentName = RhythmTheory.formatTS(initData.rhythm.ts);
        const currentIndex = RhythmTheory.TS_DEFS.findIndex(
            ts => RhythmTheory.formatTS(ts) === currentName,
        );

        if (currentIndex === -1) return;

        const nextIndex = (RhythmTheory.TS_DEFS.length + currentIndex + dir) % RhythmTheory.TS_DEFS.length;
        initData.rhythm.ts = { ...RhythmTheory.TS_DEFS[nextIndex] };
        initData.rhythm.feel = { type: 'straight' };
        ctx.commitDataAndRecalculate();
    };

    const initialFeel = (dir: -1 | 1) => {
        const ctx = createContext();
        const initData = ctx.outlineSelector.getCurrentInitData();
        const feels = RhythmTheory.getAvailableFeels(initData.rhythm.ts);
        const currentIndex = feels.findIndex(feel => RhythmTheory.isSameFeel(feel, initData.rhythm.feel));
        const nextIndex = currentIndex === -1
            ? 0
            : (feels.length + currentIndex + dir) % feels.length;

        initData.rhythm.feel = { ...feels[nextIndex] };
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

    const insertEventRhythm = () => {
        const ctx = createContext();
        const element = ctx.outlineSelector.getCurrentElement();

        if (element.type === "init") return;

        const scoreBase = ctx.derivedSelector.getCurBase().scoreBase;
        const data: ElementState.DataRhythm = {
            newRhythm: JSON.parse(JSON.stringify(scoreBase.rhythm)),
        };
        ctx.outlineUpdater.insertElement({
            type: "rhythm",
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

    const setEventModMethod = (method: Exclude<ElementState.ModulateMedhod, "domm" | "key">) => {
        const ctx = createContext();
        const element = ctx.outlineSelector.getCurrentElement();

        if (element.type !== "modulate") {
            throw new Error("setEventModMethod requires a modulate element.");
        }

        const data = element.data as ElementState.DataModulate;
        data.method = method;
        data.val = undefined;
        ctx.commitDataAndRecalculate();
    };

    const setEventModMethodValue = (
        method: Extract<ElementState.ModulateMedhod, "domm" | "key">,
        val: number,
    ) => {
        const ctx = createContext();
        const element = ctx.outlineSelector.getCurrentElement();

        if (element.type !== "modulate") {
            throw new Error("setEventModMethodValue requires a modulate element.");
        }

        if (val < -3 || val > 3) return;

        const data = element.data as ElementState.DataModulate;
        data.method = method;
        data.val = val;
        ctx.commitDataAndRecalculate();
    };

    const setTempoEventMethodForInput = (
        data: ElementState.DataTempo,
        method: ElementState.TempoMedhod,
    ) => {
        if (data.method === method) return false;

        data.method = method;
        data.val = method === "rate" ? 100 : 0;
        return true;
    };

    const setEventTempoValue = (value: string) => {
        const ctx = createContext();
        const element = ctx.outlineSelector.getCurrentElement();

        if (element.type !== "tempo") return;

        const data = element.data as ElementState.DataTempo;
        const prev = getCurrentTempoEventPrev(ctx);
        const nextVal = Number(value.trim());
        if (!Number.isFinite(nextVal)) return;

        const nextTempo = getTempoEventNext(prev, data.method, nextVal);
        if (nextTempo < 10 || nextTempo > 250) return;

        data.val = nextVal;
        ctx.commitDataAndRecalculate();
    };

    const openEventTempoInput = (method: ElementState.TempoMedhod) => {
        const ctx = createContext();
        const element = ctx.outlineSelector.getCurrentElement();

        if (element.type !== "tempo") {
            throw new Error("openEventTempoInput requires a tempo element.");
        }

        const data = element.data as ElementState.DataTempo;
        const changed = setTempoEventMethodForInput(data, method);
        if (changed) ctx.commitDataAndRecalculate();

        const prev = getCurrentTempoEventPrev(ctx);
        const value = `${data.val}`;
        const elementRef = get(refStore).elementRefs.find((item) => item.seq === ctx.outline.focus)?.ref;
        if (elementRef == undefined) return;

        const rect = elementRef.getBoundingClientRect();
        FloatingTextInput.open({
            value,
            cursor: value.length,
            left: rect.left,
            top: rect.bottom + 10,
            width: Math.max(120, rect.width),
            permit: (value) => {
                const nextVal = Number(value.trim());
                if (!Number.isFinite(nextVal)) return false;

                const nextTempo = getTempoEventNext(prev, method, nextVal);
                return nextTempo >= 10 && nextTempo <= 250;
            },
            apply: setEventTempoValue,
        });
    };

    const eventTS = (dir: -1 | 1) => {
        const ctx = createContext();
        const element = ctx.outlineSelector.getCurrentElement();

        if (element.type !== "rhythm") {
            throw new Error("eventTS requires a rhythm element.");
        }

        const data = element.data as ElementState.DataRhythm;
        const currentName = RhythmTheory.formatTS(data.newRhythm.ts);
        const currentIndex = RhythmTheory.TS_DEFS.findIndex(
            ts => RhythmTheory.formatTS(ts) === currentName,
        );

        if (currentIndex === -1) return;

        const nextIndex = (RhythmTheory.TS_DEFS.length + currentIndex + dir) % RhythmTheory.TS_DEFS.length;
        data.newRhythm.ts = { ...RhythmTheory.TS_DEFS[nextIndex] };
        data.newRhythm.feel = { type: 'straight' };
        ctx.commitDataAndRecalculate();
    };

    const setEventTS = (tsName: string) => {
        const ctx = createContext();
        const element = ctx.outlineSelector.getCurrentElement();

        if (element.type !== "rhythm") {
            throw new Error("setEventTS requires a rhythm element.");
        }

        const ts = RhythmTheory.parseTS(tsName);
        if (ts == undefined) return;

        const data = element.data as ElementState.DataRhythm;
        data.newRhythm.ts = ts;
        data.newRhythm.feel = { type: "straight" };
        ctx.commitDataAndRecalculate();
    };

    const eventFeel = (dir: -1 | 1) => {
        const ctx = createContext();
        const element = ctx.outlineSelector.getCurrentElement();

        if (element.type !== "rhythm") {
            throw new Error("eventFeel requires a rhythm element.");
        }

        const data = element.data as ElementState.DataRhythm;
        const feels = RhythmTheory.getAvailableFeels(data.newRhythm.ts);
        const currentIndex = feels.findIndex(feel => RhythmTheory.isSameFeel(feel, data.newRhythm.feel));
        const nextIndex = currentIndex === -1
            ? 0
            : (feels.length + currentIndex + dir) % feels.length;

        data.newRhythm.feel = { ...feels[nextIndex] };
        ctx.commitDataAndRecalculate();
    };

    const setEventFeel = (feel: RhythmTheory.RhythmFeel) => {
        const ctx = createContext();
        const element = ctx.outlineSelector.getCurrentElement();

        if (element.type !== "rhythm") {
            throw new Error("setEventFeel requires a rhythm element.");
        }

        const data = element.data as ElementState.DataRhythm;
        const feels = RhythmTheory.getAvailableFeels(data.newRhythm.ts);
        const isAvailable = feels.some(item => RhythmTheory.isSameFeel(item, feel));
        if (!isAvailable) return;

        data.newRhythm.feel = { ...feel };
        ctx.commitDataAndRecalculate();
    };

    return {
        eventFeel,
        eventModKind,
        eventModVal,
        eventTempoKind,
        eventTempoVal,
        eventTS,
        initialFeel,
        initialScale,
        initialScaleKey,
        initialTempo,
        initialTS,
        insertEventMod,
        insertEventRhythm,
        insertEventTempo,
        openEventTempoInput,
        setEventModMethod,
        setEventModMethodValue,
        setEventFeel,
        setEventTS,
    };
};

export default createOutlineEventActions;
