import type StoreCache from "../../system/store/props/storeCache";
import type { OutlineDataChord } from "../../domain/outline/outline-types";
import type { StoreProps } from "../../system/store/store";
import MusicTheory from "../../domain/theory/music-theory";
import { getOutlineElement } from "../project-data/outline-project-data";
import {
  getCurrentOutlineBaseCache,
  getCurrentOutlineElementCache as getCurrentOutlineElementCacheFromCache,
  getOutlineTailPos as getOutlineTailPosFromCache,
  getVisibleOutlineElementCaches,
} from "../cache-state/outline-cache";

export const getOutlineFocus = (lastStore: StoreProps) => {
  return lastStore.control.outline.focus;
};

export const getCurrentOutlineElementCache = (
  lastStore: StoreProps,
): StoreCache.ElementCache | undefined => {
  return getCurrentOutlineElementCacheFromCache(lastStore);
};

export const getCurrentOutlineScoreBase = (lastStore: StoreProps) => {
  return getCurrentOutlineBaseCache(lastStore)?.scoreBase ?? null;
};

export const getOutlineHeaderInfo = (lastStore: StoreProps) => {
  const scoreBase = getCurrentOutlineScoreBase(lastStore);
  const elementCache = getCurrentOutlineElementCache(lastStore);
  if (scoreBase == null || elementCache == undefined) return null;

  return {
    scaleName: MusicTheory.getScaleName(scoreBase.tonality),
    tsName: MusicTheory.getTSName(scoreBase.ts),
    tempo: scoreBase.tempo,
    sectionName: elementCache.curSection,
  };
};

export const getVisibleOutlineElements = (lastStore: StoreProps) => {
  return getVisibleOutlineElementCaches(lastStore);
};

export const isOutlineChordSelectorVisible = (lastStore: StoreProps) => {
  const element = getCurrentOutlineElementCache(lastStore);
  if (element == undefined) return false;
  const projectElement = getOutlineElement(lastStore, getOutlineFocus(lastStore));
  if (projectElement == undefined) return false;

  return (
    lastStore.control.mode === "harmonize" &&
    lastStore.control.outline.arrange == null &&
    lastStore.input.holdC &&
    element.type === "chord" &&
    (projectElement.data as OutlineDataChord).degree != undefined
  );
};

export const getOutlineTailPos = (lastStore: StoreProps) => {
  return getOutlineTailPosFromCache(lastStore);
};
