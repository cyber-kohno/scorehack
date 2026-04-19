import type { StoreProps } from "../../system/store/store";
import { recalculateCache } from "../../state/cache-state/recalculate-cache";

export const createCacheActions = (lastStore: StoreProps) => {
  return {
    recalculate: () => recalculateCache(lastStore),
  };
};
