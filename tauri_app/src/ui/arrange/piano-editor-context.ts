import { getContext, setContext } from "svelte";
import { derived, type Readable } from "svelte/store";
import store from "../../system/store/store";
import type StorePianoBacking from "../../domain/arrange/piano-backing-store";
import type StorePianoEditor from "../../domain/arrange/piano-editor-store";
import type StoreArrange from "../../domain/arrange/arrange-store";

const ARRANGE_EDITOR_CONTEXT = {
  arrange: Symbol("arrange-editor-arrange"),
  pianoEditor: Symbol("arrange-editor-piano-editor"),
  backingProps: Symbol("arrange-editor-backing-props"),
};

export type PianoEditorBackingContext = {
  backing: StorePianoBacking.EditorProps;
  getCurLayer: () => StorePianoBacking.Layer;
  getBackLayer: () => StorePianoBacking.Layer;
  getColWidth: (col: StorePianoBacking.Col) => number;
  getColFrameWidth: () => number;
};

const asReadable = <T>(value: T): Readable<T> => derived(store, () => value);

export const setArrangeEditorArrangeContext = (
  arrange: StoreArrange.EditorProps,
) => {
  setContext(ARRANGE_EDITOR_CONTEXT.arrange, asReadable(arrange));
};

export const getArrangeEditorArrangeContext = () => {
  return getContext<Readable<StoreArrange.EditorProps>>(
    ARRANGE_EDITOR_CONTEXT.arrange,
  );
};

export const setArrangeEditorPianoEditorContext = (
  editor: StorePianoEditor.Props,
) => {
  setContext(ARRANGE_EDITOR_CONTEXT.pianoEditor, asReadable(editor));
};

export const getArrangeEditorPianoEditorContext = () => {
  return getContext<Readable<StorePianoEditor.Props>>(
    ARRANGE_EDITOR_CONTEXT.pianoEditor,
  );
};

export const setArrangeEditorBackingContext = (
  backingProps: PianoEditorBackingContext,
) => {
  setContext(ARRANGE_EDITOR_CONTEXT.backingProps, asReadable(backingProps));
};

export const getArrangeEditorBackingContext = () => {
  return getContext<Readable<PianoEditorBackingContext>>(
    ARRANGE_EDITOR_CONTEXT.backingProps,
  );
};
