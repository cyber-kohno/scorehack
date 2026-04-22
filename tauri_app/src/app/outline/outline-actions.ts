import useReducerOutline from "./outline-reducer";
import type { StoreProps } from "../../state/root-store";

export type OutlineActions = ReturnType<typeof useReducerOutline>;

export const createOutlineActions = (lastStore: StoreProps): OutlineActions => {
  return useReducerOutline(lastStore);
};
