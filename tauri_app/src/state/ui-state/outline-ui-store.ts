import type StoreCache from "../../system/store/props/storeCache";
import StoreRef from "../../system/store/props/storeRef";
import type { OutlineDataChord } from "../../domain/outline/outline-types";
import type { StoreProps } from "../../system/store/store";
import MusicTheory from "../../domain/theory/music-theory";

export const getOutlineFocus = (lastStore: StoreProps) => {
  return lastStore.control.outline.focus;
};

export const getCurrentOutlineElementCache = (
  lastStore: StoreProps,
): StoreCache.ElementCache | undefined => {
  return lastStore.cache.elementCaches[getOutlineFocus(lastStore)];
};

export const getCurrentOutlineScoreBase = (lastStore: StoreProps) => {
  const baseSeq = getCurrentOutlineElementCache(lastStore)?.baseSeq;
  if (baseSeq == undefined) return null;
  return lastStore.cache.baseCaches[baseSeq]?.scoreBase ?? null;
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
  const elementSeq = getOutlineFocus(lastStore);
  const elementCaches = lastStore.cache.elementCaches;
  const limitProps = StoreRef.getScrollLimitProps(lastStore.ref.outline);
  if (limitProps == null) return [];

  return elementCaches.filter(
    (el, i) =>
      Math.abs(elementSeq - i) < 12 ||
      Math.abs(limitProps.scrollMiddleY - (el.outlineTop + el.viewHeight / 2)) <=
        limitProps.rectHeight,
  );
};

export const isOutlineChordSelectorVisible = (lastStore: StoreProps) => {
  const element = getCurrentOutlineElementCache(lastStore);
  if (element == undefined) return false;

  return (
    lastStore.control.mode === "harmonize" &&
    lastStore.control.outline.arrange == null &&
    lastStore.input.holdC &&
    element.type === "chord" &&
    (element.data as OutlineDataChord).degree != undefined
  );
};

export const getOutlineTailPos = (lastStore: StoreProps) => {
  return lastStore.cache.outlineTailPos;
};
