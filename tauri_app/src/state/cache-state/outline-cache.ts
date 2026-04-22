import type { StoreProps } from "../root-store";
import {
  getOutlineFrameRef,
  getOutlineScrollLimitProps,
} from "../session-state/outline-ref-store";
import { getOutlineFocusState } from "../session-state/outline-focus-store";
import {
  getBaseCaches,
  getElementCaches,
  getOutlineTailPosition,
} from "./cache-store";

export const getCurrentOutlineElementCache = (lastStore: StoreProps) => {
  const focus = getOutlineFocusState().focus;
  return getElementCaches(lastStore)[focus];
};

export const getCurrentOutlineBaseCache = (lastStore: StoreProps) => {
  const element = getCurrentOutlineElementCache(lastStore);
  if (element == undefined) return undefined;
  return getBaseCaches(lastStore)[element.baseSeq];
};

export const getVisibleOutlineElementCaches = (lastStore: StoreProps) => {
  const elementSeq = getOutlineFocusState().focus;
  const elementCaches = getElementCaches(lastStore);
  const limitProps = getOutlineScrollLimitProps();
  if (limitProps == null) return [];

  return elementCaches.filter(
    (element, index) =>
      Math.abs(elementSeq - index) < 12 ||
      Math.abs(limitProps.scrollMiddleY - (element.outlineTop + element.viewHeight / 2)) <=
        limitProps.rectHeight,
  );
};

export const getOutlineTailPos = (lastStore: StoreProps) => {
  return getOutlineTailPosition(lastStore);
};

export const getCurrentOutlineTop = (lastStore: StoreProps) => {
  const element = getCurrentOutlineElementCache(lastStore);
  const outlineRef = getOutlineFrameRef();
  if (element == undefined || outlineRef == undefined) return null;
  return element.outlineTop - outlineRef.scrollTop;
};
