import { writable } from "svelte/store";
import { touchTerminalState } from "../../state/session-state/terminal-store";
import { touchPreviewState } from "../../state/session-state/preview-store";
import { touchTrackRefGroups } from "../../state/session-state/track-ref-store";
import { touchViewportTimerKeys } from "../../state/session-state/viewport-timer-store";
import { touchTimelineViewportRefs } from "../../state/session-state/timeline-viewport-store";
import { touchTerminalRefs } from "../../state/session-state/terminal-ref-store";
import { touchOutlineRefs } from "../../state/session-state/outline-ref-store";
import { touchArrangeRefs } from "../../state/session-state/arrange-ref-store";
import { touchInputState } from "../../state/session-state/input-store";
import { touchModeState } from "../../state/session-state/mode-store";
import { touchOutlineFocusState } from "../../state/session-state/outline-focus-store";
import { touchOutlineTrackIndex } from "../../state/session-state/outline-track-store";
import { touchOutlineArrangeState } from "../../state/session-state/outline-arrange-store";
import { touchMelodyTrackIndex } from "../../state/session-state/melody-track-store";
import { touchMelodyFocusState } from "../../state/session-state/melody-focus-store";
import { touchMelodyClipboardState } from "../../state/session-state/melody-clipboard-store";
import { touchMelodyOverlapState } from "../../state/session-state/melody-overlap-store";
import { touchMelodyCursorState } from "../../state/session-state/melody-cursor-store";
import { touchAudioTrackState } from "../../state/session-state/audio-track-store";
import { touchArrangeDataState } from "../../state/session-state/arrange-data-store";
import { touchScoreTrackState } from "../../state/session-state/score-track-store";
import { touchOutlineElementState } from "../../state/session-state/outline-element-store";
import { touchCacheState } from "../../state/cache-state/cache-store";

export type StoreProps = Record<string, never>;

const store = writable<StoreProps>({});

export type StoreUtil = {
  lastStore: StoreProps;
  commit: () => void;
};

export const createStoreUtil = (lastStore: StoreProps): StoreUtil => {
  return {
    lastStore,
    commit: () => {
      store.set(lastStore);
      touchTerminalState();
      touchPreviewState();
      touchTrackRefGroups();
      touchViewportTimerKeys();
      touchTimelineViewportRefs();
      touchTerminalRefs();
      touchOutlineRefs();
      touchArrangeRefs();
      touchInputState();
      touchModeState();
      touchOutlineFocusState();
      touchOutlineTrackIndex();
      touchOutlineArrangeState();
      touchMelodyTrackIndex();
      touchMelodyFocusState();
      touchMelodyClipboardState();
      touchMelodyOverlapState();
      touchMelodyCursorState();
      touchAudioTrackState();
      touchArrangeDataState();
      touchScoreTrackState();
      touchOutlineElementState();
      touchCacheState();
    },
  };
};

export default store;
