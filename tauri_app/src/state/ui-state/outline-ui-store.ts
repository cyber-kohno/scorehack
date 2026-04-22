import type StoreCache from "../../state/cache-state/cache-store";
import type { OutlineDataChord } from "../../domain/outline/outline-types";
import type { RootStoreToken } from "../root-store";
import MusicTheory from "../../domain/theory/music-theory";
import { getInputHoldValue } from "../session-state/input-store";
import { getModeState } from "../session-state/mode-store";
import { getOutlineArrangeState } from "../session-state/outline-arrange-store";
import { getOutlineFocusState } from "../session-state/outline-focus-store";
import { getOutlineElement } from "../project-data/outline-project-data";
import {
  getCurrentOutlineBaseCache,
  getCurrentOutlineElementCache as getCurrentOutlineElementCacheFromCache,
  getOutlineTailPos as getOutlineTailPosFromCache,
  getVisibleOutlineElementCaches,
} from "../cache-state/outline-cache";

export const getOutlineFocus = (rootStoreToken: RootStoreToken) => {
  void rootStoreToken;
  return getOutlineFocusState().focus;
};

export const getCurrentOutlineElementCache = (
  rootStoreToken: RootStoreToken,
): StoreCache.ElementCache | undefined => {
  return getCurrentOutlineElementCacheFromCache(rootStoreToken);
};

export const getCurrentOutlineScoreBase = (rootStoreToken: RootStoreToken) => {
  return getCurrentOutlineBaseCache(rootStoreToken)?.scoreBase ?? null;
};

export const getOutlineHeaderInfo = (rootStoreToken: RootStoreToken) => {
  const scoreBase = getCurrentOutlineScoreBase(rootStoreToken);
  const elementCache = getCurrentOutlineElementCache(rootStoreToken);
  if (scoreBase == null || elementCache == undefined) return null;

  return {
    scaleName: MusicTheory.getScaleName(scoreBase.tonality),
    tsName: MusicTheory.getTSName(scoreBase.ts),
    tempo: scoreBase.tempo,
    sectionName: elementCache.curSection,
  };
};

export const getVisibleOutlineElements = (rootStoreToken: RootStoreToken) => {
  return getVisibleOutlineElementCaches(rootStoreToken);
};

export const isOutlineChordSelectorVisible = (rootStoreToken: RootStoreToken) => {
  const element = getCurrentOutlineElementCache(rootStoreToken);
  if (element == undefined) return false;
  const projectElement = getOutlineElement(rootStoreToken, getOutlineFocus(rootStoreToken));
  if (projectElement == undefined) return false;

  return (
    getModeState() === "harmonize" &&
    getOutlineArrangeState() == null &&
    getInputHoldValue("holdC") &&
    element.type === "chord" &&
    (projectElement.data as OutlineDataChord).degree != undefined
  );
};

export const getOutlineTailPos = (rootStoreToken: RootStoreToken) => {
  return getOutlineTailPosFromCache(rootStoreToken);
};

