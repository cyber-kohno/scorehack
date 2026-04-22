import { get, type Writable } from "svelte/store";
import { createStoreUtil, type StoreProps } from "../../state/root-store";
import { createKeyboardRouter } from "../shell/keyboard-router";

export const bindGlobalKeyboard = (store: Writable<StoreProps>) => {
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
