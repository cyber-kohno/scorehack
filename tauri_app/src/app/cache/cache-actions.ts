import type { StoreProps } from "../../state/root-store";
import { recalculateCache } from "../../state/cache-state/recalculate-cache";

export const createCacheActions = (lastStore: StoreProps) => {
  return {
    recalculate: () => recalculateCache(lastStore),
  };
};
