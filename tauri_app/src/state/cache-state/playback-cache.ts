import type { StoreProps } from "../root-store";
import {
  getBaseCaches,
  getChordCaches,
  getElementCaches,
} from "./cache-store";

export const getPlaybackBaseCaches = (lastStore: StoreProps) => {
  return getBaseCaches(lastStore);
};

export const getPlaybackChordCaches = (lastStore: StoreProps) => {
  return getChordCaches(lastStore);
};

export const getPlaybackElementCaches = (lastStore: StoreProps) => {
  return getElementCaches(lastStore);
};

export const getPlaybackTailChordCache = (lastStore: StoreProps) => {
  const chordCaches = getPlaybackChordCaches(lastStore);
  return chordCaches[chordCaches.length - 1];
};
