import useReducerOutline from "./outline-reducer";
import type { RootStoreToken } from "../../state/root-store";

export type OutlineActions = ReturnType<typeof useReducerOutline>;

export const createOutlineActions = (
  rootStoreToken: RootStoreToken,
): OutlineActions => {
  return useReducerOutline(rootStoreToken);
};
