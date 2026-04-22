import Layout from "../../styles/tokens/layout-tokens";
import type { MelodyNote } from "../../domain/melody/melody-types";
import { calcMelodyBeat } from "../../domain/melody/melody-types";
import type { RootStoreToken } from "../../state/root-store";
import { getEnvBeatWidth } from "../../state/session-state/env-store";
import { smoothScrollLeft, smoothScrollTop } from "../viewport/scroll-actions";
import {
  getTimelineGridRef,
  getTimelineHeaderRef,
  getTimelinePitchRef,
} from "../../state/session-state/timeline-viewport-store";

export const adjustTimelineScrollXFromMelodyNote = (
  rootStoreToken: RootStoreToken,
  note: MelodyNote,
) => {
  const gridRef = getTimelineGridRef();
  const headerRef = getTimelineHeaderRef();
  if (gridRef == undefined || headerRef == undefined) return;
  const width = gridRef.getBoundingClientRect().width;
  const beatWidth = getEnvBeatWidth();
  const [pos, len] = [note.pos, note.len].map(
    (size) => calcMelodyBeat(note.norm, size) * beatWidth,
  );

  smoothScrollLeft(rootStoreToken, [gridRef, headerRef], pos + len / 2 - width / 2);
};

export const adjustTimelineScrollYFromMelodyNote = (
  rootStoreToken: RootStoreToken,
  note: MelodyNote,
) => {
  const gridRef = getTimelineGridRef();
  const pitchRef = getTimelinePitchRef();
  if (gridRef == undefined || pitchRef == undefined) return;
  const height = gridRef.getBoundingClientRect().height;
  const pos = (Layout.pitch.NUM - note.pitch) * Layout.pitch.ITEM_HEIGHT;

  smoothScrollTop(rootStoreToken, [gridRef, pitchRef], pos - height / 2);
};
