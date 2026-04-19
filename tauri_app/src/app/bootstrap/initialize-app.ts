import { createCacheActions } from "../cache/cache-actions";
import type { StoreProps, StoreUtil } from "../../system/store/store";
import { applyStaticLayoutVariables } from "./apply-layout-variables";

export const initializeApp = (storeUtil: StoreUtil) => {
  const { lastStore, commit } = storeUtil;
  const { recalculate } = createCacheActions(lastStore);

  applyStaticLayoutVariables();
  recalculate();
  commit();
};

export const initializeAppFromStore = (
  createStoreUtil: (lastStore: StoreProps) => StoreUtil,
  lastStore: StoreProps,
) => {
  initializeApp(createStoreUtil(lastStore));
};

