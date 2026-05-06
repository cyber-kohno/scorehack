import { getContext, setContext } from "svelte";
import { writable, type Writable } from "svelte/store";
import type PianoBackingState from "../../../store/state/data/arrange/piano/piano-backing-state";
import type PianoEditorState from "../../../store/state/data/arrange/piano/piano-editor-state";
import type ArrangeState from "../../../store/state/data/arrange/arrange-state";

type BackingProps = {
    backing: PianoBackingState.EditorProps;
    getCurLayer: () => PianoBackingState.Layer;
    getBackLayer: () => PianoBackingState.Layer;
    getColWidth: (col: PianoBackingState.Col) => number;
    getColFrameWidth: () => number;
};

const ARRANGE_KEY = Symbol("piano-arrange");

type Context = {
    arrange: Writable<ArrangeState.EditorProps>;
    editor: Writable<PianoEditorState.Props>;
    backingProps: Writable<BackingProps>;
};

export const createPianoEditorContext = () => {
    const ctx: Context = {
        arrange: writable(null as unknown as ArrangeState.EditorProps),
        editor: writable(null as unknown as PianoEditorState.Props),
        backingProps: writable(null as unknown as BackingProps),
    };
    setContext(ARRANGE_KEY, ctx);
    return ctx;
};

export const getPianoEditorContext = () => {
    const ctx = getContext<Context>(ARRANGE_KEY);
    if (ctx == undefined) throw new Error("Piano editor context is not available.");
    return ctx;
};

export const getPianoArrange = () => {
    return getPianoEditorContext().arrange;
};

export const getPianoEditor = () => {
    return getPianoEditorContext().editor;
};

export const getPianoBacking = () => {
    return getPianoEditorContext().backingProps;
};
