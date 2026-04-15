import type StoreData from "../../system/store/props/storeData";
import type { StoreProps } from "../../system/store/store";

export const getProjectData = (lastStore: StoreProps): StoreData.Props => {
  return lastStore.data;
};

export const setProjectData = (
  lastStore: StoreProps,
  nextData: StoreData.Props,
): void => {
  lastStore.data = nextData;
};
