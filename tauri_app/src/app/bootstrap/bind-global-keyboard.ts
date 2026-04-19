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

  window.addEventListener("keydown", onKeyDown, { capture: true });
  window.addEventListener("keyup", onKeyUp, { capture: true });

  return () => {
    window.removeEventListener("keydown", onKeyDown, { capture: true });
    window.removeEventListener("keyup", onKeyUp, { capture: true });
  };
};
