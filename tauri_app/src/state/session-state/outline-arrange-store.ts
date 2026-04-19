import { get, writable } from "svelte/store";
import type StoreArrange from "../../domain/arrange/arrange-store";

export const outlineArrangeStore = writable<null | StoreArrange.EditorProps>(null);

export const getOutlineArrangeState = () => get(outlineArrangeStore);

export const setOutlineArrangeState = (
  arrange: null | StoreArrange.EditorProps,
) => {
  outlineArrangeStore.set(arrange);
};

export const clearOutlineArrangeState = () => {
  outlineArrangeStore.set(null);
};

export const touchOutlineArrangeState = () => {
  outlineArrangeStore.set(getOutlineArrangeState());
};
