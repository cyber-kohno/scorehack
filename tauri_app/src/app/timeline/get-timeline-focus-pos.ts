import type { RootStoreToken } from "../../state/root-store";
import { getTimelineFocusChordCache } from "../../state/cache-state/timeline-cache";

export const getTimelineFocusPos = (rootStoreToken: RootStoreToken) => {
  let pos = 0;
  const chordCache = getTimelineFocusChordCache(rootStoreToken);
  if (chordCache != undefined) {
    pos = chordCache.viewPosLeft + chordCache.viewPosWidth / 2;
  }
  return pos;
};
