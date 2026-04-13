import useReducerOutline from "../../system/store/reducer/reducerOutline";
import type { StoreProps } from "../../system/store/store";

export type OutlineActions = ReturnType<typeof useReducerOutline>;

export const createOutlineActions = (lastStore: StoreProps): OutlineActions => {
  return useReducerOutline(lastStore);
};
