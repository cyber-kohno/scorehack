import { get, writable } from "svelte/store";
import { getScrollLimitProps } from "./scroll-limit-props";

export type OutlineElementRefItem = {
  seq: number;
  ref: HTMLElement;
};

export type OutlineRefState = {
  outline?: HTMLElement;
  elementRefs: OutlineElementRefItem[];
};

const createInitialOutlineRefState = (): OutlineRefState => ({
  elementRefs: [],
});

export const outlineRefStore = writable<OutlineRefState>(
  createInitialOutlineRefState(),
);

export const getOutlineRefState = () => get(outlineRefStore);

export const getOutlineFrameRef = () => getOutlineRefState().outline;

export const getOutlineElementRefs = () => getOutlineRefState().elementRefs;

export const setOutlineFrameRef = (ref?: HTMLElement) => {
  const state = getOutlineRefState();
  if (state.outline === ref) return;
  state.outline = ref;
  outlineRefStore.set(state);
};

export const getOutlineScrollLimitProps = () => {
  return getScrollLimitProps(getOutlineFrameRef());
};

export const upsertOutlineElementRef = (seq: number, ref: HTMLElement) => {
  const refs = getOutlineElementRefs();
  const instance = refs.find((item) => item.seq === seq);
  if (instance == undefined) refs.push({ seq, ref });
  else instance.ref = ref;
};

export const findOutlineElementRef = (seq: number) => {
  return getOutlineElementRefs().find((item) => item.seq === seq);
};

export const touchOutlineRefs = () => {
  outlineRefStore.set(getOutlineRefState());
};
