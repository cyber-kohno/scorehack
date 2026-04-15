import type { StoreProps } from "../../system/store/store";
import { getTimelineFocusChordCache } from "../../state/cache-state/timeline-cache";

export const getTimelineFocusPos = (lastStore: StoreProps) => {
  let pos = 0;
  const chordCache = getTimelineFocusChordCache(lastStore);
  if (chordCache != undefined) {
    pos = chordCache.viewPosLeft + chordCache.viewPosWidth / 2;
  }
  return pos;
};
