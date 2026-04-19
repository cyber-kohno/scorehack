import { get, writable } from "svelte/store";
import type { OutlineElement } from "../../domain/outline/outline-types";
import { createInitialOutlineElements } from "../../domain/outline/create-initial-outline-elements";

export const outlineElementStore = writable<OutlineElement[]>(
  createInitialOutlineElements(),
);

export const getOutlineElementState = () => get(outlineElementStore);

export const setOutlineElementState = (elements: OutlineElement[]) => {
  outlineElementStore.set(elements);
};

export const touchOutlineElementState = () => {
  outlineElementStore.set(getOutlineElementState());
};
