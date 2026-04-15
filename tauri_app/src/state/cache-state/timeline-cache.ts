import type { StoreProps } from "../../system/store/store";
import {
  getBaseCaches,
  getChordCaches,
  getElementCaches,
} from "./cache-store";

export const getTimelineFocusElementCache = (lastStore: StoreProps) => {
  const focus = lastStore.control.outline.focus;
  return getElementCaches(lastStore)[focus];
};

export const getTimelineFocusChordCache = (lastStore: StoreProps) => {
  const element = getTimelineFocusElementCache(lastStore);
  if (element == undefined || element.lastChordSeq === -1) return undefined;
  return getChordCaches(lastStore)[element.lastChordSeq];
};

export const getTimelineCurrentChordCache = (lastStore: StoreProps) => {
  const element = getTimelineFocusElementCache(lastStore);
  if (element == undefined || element.chordSeq === -1) return undefined;
  return getChordCaches(lastStore)[element.chordSeq];
};

export const getTimelineCurrentBaseCache = (lastStore: StoreProps) => {
  const element = getTimelineFocusElementCache(lastStore);
  if (element == undefined) return undefined;
  return getBaseCaches(lastStore)[element.baseSeq];
};

export const getTimelineBaseCaches = (lastStore: StoreProps) => {
  return getBaseCaches(lastStore);
};

export const getTimelineChordCaches = (lastStore: StoreProps) => {
  return getChordCaches(lastStore);
};
