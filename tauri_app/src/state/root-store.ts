import { writable } from "svelte/store";
import { touchTerminalState } from "./session-state/terminal-store";
import { touchPreviewState } from "./session-state/preview-store";
import { touchTrackRefGroups } from "./session-state/track-ref-store";
import { touchViewportTimerKeys } from "./session-state/viewport-timer-store";
import { touchTimelineViewportRefs } from "./session-state/timeline-viewport-store";
import { touchTerminalRefs } from "./session-state/terminal-ref-store";
import { touchOutlineRefs } from "./session-state/outline-ref-store";
import { touchArrangeRefs } from "./session-state/arrange-ref-store";
import { touchInputState } from "./session-state/input-store";
import { touchModeState } from "./session-state/mode-store";
import { touchOutlineFocusState } from "./session-state/outline-focus-store";
import { touchOutlineTrackIndex } from "./session-state/outline-track-store";
import { touchOutlineArrangeState } from "./session-state/outline-arrange-store";
import { touchMelodyTrackIndex } from "./session-state/melody-track-store";
import { touchMelodyFocusState } from "./session-state/melody-focus-store";
import { touchMelodyClipboardState } from "./session-state/melody-clipboard-store";
import { touchMelodyOverlapState } from "./session-state/melody-overlap-store";
import { touchMelodyCursorState } from "./session-state/melody-cursor-store";
import { touchAudioTrackState } from "./session-state/audio-track-store";
import { touchArrangeDataState } from "./session-state/arrange-data-store";
import { touchScoreTrackState } from "./session-state/score-track-store";
import { touchOutlineElementState } from "./session-state/outline-element-store";
import { touchCacheState } from "./cache-state/cache-store";

export type RootStoreToken = Record<string, never>;

const store = writable<RootStoreToken>({});

export type CommitContext = {
  lastStore: RootStoreToken;
  commit: () => void;
};

export const createCommitContext = (lastStore: RootStoreToken): CommitContext => {
  return {
    lastStore,
    commit: () => {
      // 現段階の commit は selective update ではなく、
      // 分割済み state を旧来の「1回の確定点」でそろえるための互換同期バリア。
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
