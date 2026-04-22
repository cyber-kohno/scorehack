import type { RootStoreToken } from "../root-store";
import { getOutlineFocusState } from "../session-state/outline-focus-store";
import {
  getBaseCaches,
  getChordCaches,
  getElementCaches,
} from "./cache-store";

export const getTimelineFocusElementCache = (rootStoreToken: RootStoreToken) => {
  const focus = getOutlineFocusState().focus;
  return getElementCaches(rootStoreToken)[focus];
};

export const getTimelineFocusChordCache = (rootStoreToken: RootStoreToken) => {
  const element = getTimelineFocusElementCache(rootStoreToken);
  if (element == undefined || element.lastChordSeq === -1) return undefined;
  return getChordCaches(rootStoreToken)[element.lastChordSeq];
};

export const getTimelineCurrentChordCache = (rootStoreToken: RootStoreToken) => {
  const element = getTimelineFocusElementCache(rootStoreToken);
  if (element == undefined || element.chordSeq === -1) return undefined;
  return getChordCaches(rootStoreToken)[element.chordSeq];
};

export const getTimelineCurrentBaseCache = (rootStoreToken: RootStoreToken) => {
  const element = getTimelineFocusElementCache(rootStoreToken);
  if (element == undefined) return undefined;
  return getBaseCaches(rootStoreToken)[element.baseSeq];
};

export const getTimelineBaseCaches = (rootStoreToken: RootStoreToken) => {
  return getBaseCaches(rootStoreToken);
};

export const getTimelineChordCaches = (rootStoreToken: RootStoreToken) => {
  return getChordCaches(rootStoreToken);
};

