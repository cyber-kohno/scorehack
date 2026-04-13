import ContextUtil from "../../system/store/contextUtil";
import useReducerCache from "../../system/store/reducer/reducerCache";
import type { StoreProps, StoreUtil } from "../../system/store/store";
import { applyStaticLayoutVariables } from "./apply-layout-variables";

export const initializeApp = (storeUtil: StoreUtil) => {
  const { lastStore, commit } = storeUtil;
  const { calculate } = useReducerCache(lastStore);

  applyStaticLayoutVariables();
  calculate();
  ContextUtil.set("isPreview", () => lastStore.preview.timerKeys != null);
  commit();
};

export const initializeAppFromStore = (
  createStoreUtil: (lastStore: StoreProps) => StoreUtil,
  lastStore: StoreProps,
) => {
  initializeApp(createStoreUtil(lastStore));
};
