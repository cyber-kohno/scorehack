import type { RootStoreToken } from "../../state/root-store";
import {
  getViewportTimerKeys,
  type ViewportTimerKey,
} from "../../state/session-state/viewport-timer-store";

const clearRelatedTimers = (
  timerKeys: ViewportTimerKey[],
  refs: HTMLElement[],
  target: "scrollLeft" | "scrollTop",
) => {
  const getTargetKey = (ref: HTMLElement) => ref.className + target;
  const include = (key: ViewportTimerKey) =>
    refs.map((ref) => getTargetKey(ref)).includes(key.target);

  timerKeys.forEach((key) => {
    if (include(key)) clearTimeout(key.id);
  });
  const next = timerKeys.filter((key) => !include(key));
  timerKeys.length = 0;
  timerKeys.push(...next);

  return getTargetKey;
};

const smoothScroll = (
  rootStoreToken: RootStoreToken,
  refs: HTMLElement[],
  target: "scrollLeft" | "scrollTop",
  nextValue: number,
) => {
  void rootStoreToken;
  const timerKeys = getViewportTimerKeys();
  const getTargetKey = clearRelatedTimers(timerKeys, refs, target);

  refs.forEach((ref, i) => {
    const isCriteria = i === 0;
    const divVal = (nextValue - ref[target]) / 15;
    for (let j = 0; j < 15; j++) {
      const isTail = j === 14;
      const id = setTimeout(() => {
        if (!isCriteria && isTail) ref[target] = refs[0][target];
        else ref[target] += divVal;
      }, 10 * j);
      timerKeys.push({ target: getTargetKey(ref), id });
    }
  });
};

export const smoothScrollLeft = (
  rootStoreToken: RootStoreToken,
  refs: HTMLElement[],
  nextValue: number,
) => {
  smoothScroll(rootStoreToken, refs, "scrollLeft", nextValue);
};

export const smoothScrollTop = (
  rootStoreToken: RootStoreToken,
  refs: HTMLElement[],
  nextValue: number,
) => {
  smoothScroll(rootStoreToken, refs, "scrollTop", nextValue);
};
