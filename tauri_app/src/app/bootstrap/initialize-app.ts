import { createCacheActions } from "../cache/cache-actions";
import { createStoreUtil, type StoreProps, type StoreUtil } from "../../state/root-store";
import { applyStaticLayoutVariables } from "./apply-layout-variables";

export const initializeApp = (storeUtil: StoreUtil) => {
  const { lastStore, commit } = storeUtil;
  const { recalculate } = createCacheActions(lastStore);

  applyStaticLayoutVariables();
  recalculate();
  commit();
};

export const initializeAppFromStore = (lastStore: StoreProps) => {
  initializeApp(createStoreUtil(lastStore));
};

