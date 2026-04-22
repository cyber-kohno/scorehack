import type { RootStoreToken } from "../root-store";
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

export const getCurrentOutlineElementCache = (rootStoreToken: RootStoreToken) => {
  const focus = getOutlineFocusState().focus;
  return getElementCaches(rootStoreToken)[focus];
};

export const getCurrentOutlineBaseCache = (rootStoreToken: RootStoreToken) => {
  const element = getCurrentOutlineElementCache(rootStoreToken);
  if (element == undefined) return undefined;
  return getBaseCaches(rootStoreToken)[element.baseSeq];
};

export const getVisibleOutlineElementCaches = (rootStoreToken: RootStoreToken) => {
  const elementSeq = getOutlineFocusState().focus;
  const elementCaches = getElementCaches(rootStoreToken);
  const limitProps = getOutlineScrollLimitProps();
  if (limitProps == null) return [];

  return elementCaches.filter(
    (element, index) =>
      Math.abs(elementSeq - index) < 12 ||
      Math.abs(limitProps.scrollMiddleY - (element.outlineTop + element.viewHeight / 2)) <=
        limitProps.rectHeight,
  );
};

export const getOutlineTailPos = (rootStoreToken: RootStoreToken) => {
  return getOutlineTailPosition(rootStoreToken);
};

export const getCurrentOutlineTop = (rootStoreToken: RootStoreToken) => {
  const element = getCurrentOutlineElementCache(rootStoreToken);
  const outlineRef = getOutlineFrameRef();
  if (element == undefined || outlineRef == undefined) return null;
  return element.outlineTop - outlineRef.scrollTop;
};

