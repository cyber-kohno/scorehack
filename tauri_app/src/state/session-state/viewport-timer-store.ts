import { get, writable } from "svelte/store";

export type ViewportTimerKey = {
  id: number;
  target: string;
};

export const viewportTimerStore = writable<ViewportTimerKey[]>([]);

export const getViewportTimerKeys = () => get(viewportTimerStore);

export const setViewportTimerKeys = (timerKeys: ViewportTimerKey[]) => {
  viewportTimerStore.set(timerKeys);
};

export const touchViewportTimerKeys = () => {
  viewportTimerStore.set(getViewportTimerKeys());
};

export const pushViewportTimerKey = (timerKey: ViewportTimerKey) => {
  getViewportTimerKeys().push(timerKey);
};

export const clearViewportTimerKeys = () => {
  getViewportTimerKeys().length = 0;
};
