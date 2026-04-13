import { get, type Writable } from "svelte/store";
import type { StoreProps, StoreUtil } from "../../system/store/store";
import { createKeyboardRouter } from "../shell/keyboard-router";

export const bindGlobalKeyboard = (
  store: Writable<StoreProps>,
  createStoreUtil: (lastStore: StoreProps) => StoreUtil,
) => {
  const onKeyDown = (event: KeyboardEvent) => {
    const { onKeyDown } = createKeyboardRouter(createStoreUtil(get(store)));
    onKeyDown(event);
  };

  const onKeyUp = (event: KeyboardEvent) => {
    const { onKeyUp } = createKeyboardRouter(createStoreUtil(get(store)));
    onKeyUp(event);
  };

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);

  return () => {
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyUp);
  };
};
