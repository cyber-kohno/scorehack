import type { RootStoreToken } from "../root-store";
import {
  getBaseCaches,
  getChordCaches,
  getElementCaches,
} from "./cache-store";

export const getPlaybackBaseCaches = (rootStoreToken: RootStoreToken) => {
  return getBaseCaches(rootStoreToken);
};

export const getPlaybackChordCaches = (rootStoreToken: RootStoreToken) => {
  return getChordCaches(rootStoreToken);
};

export const getPlaybackElementCaches = (rootStoreToken: RootStoreToken) => {
  return getElementCaches(rootStoreToken);
};

export const getPlaybackTailChordCache = (rootStoreToken: RootStoreToken) => {
  const chordCaches = getPlaybackChordCaches(rootStoreToken);
  return chordCaches[chordCaches.length - 1];
};

