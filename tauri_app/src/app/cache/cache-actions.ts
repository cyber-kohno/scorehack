import type { RootStoreToken } from "../../state/root-store";
import { recalculateCache } from "../../state/cache-state/recalculate-cache";

export const createCacheActions = (rootStoreToken: RootStoreToken) => {
  return {
    recalculate: () => recalculateCache(rootStoreToken),
  };
};
