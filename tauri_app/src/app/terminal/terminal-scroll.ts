import type { StoreProps } from "../../state/root-store";
import { getTerminalStateStore } from "../../state/session-state/terminal-store";
import {
  getTerminalFrameRef,
  getTerminalHelperRef,
} from "../../state/session-state/terminal-ref-store";
import { smoothScrollTop } from "../viewport/scroll-actions";

export const adjustTerminalScroll = (lastStore: StoreProps) => {
  const ref = getTerminalFrameRef();
  if (ref == undefined) return;
  smoothScrollTop(lastStore, [ref], ref.scrollHeight);
};

export const adjustHelperScroll = (lastStore: StoreProps) => {
  const ref = getTerminalHelperRef();
  const helper = getTerminalStateStore()?.helper;
  if (ref == undefined || helper == null) return;
  const { height: frameHeight } = ref.getBoundingClientRect();
  const itemTop = helper.focus * 26;
  const top = itemTop - frameHeight / 2;
  smoothScrollTop(lastStore, [ref], top);
};
