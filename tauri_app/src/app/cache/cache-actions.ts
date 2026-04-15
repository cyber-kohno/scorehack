import type { StoreProps } from "../../system/store/store";
import useReducerCache from "../../system/store/reducer/reducerCache";

export const createCacheActions = (lastStore: StoreProps) => {
  const { calculate } = useReducerCache(lastStore);

  return {
    recalculate: calculate,
  };
};
