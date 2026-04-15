import type { MelodyNote } from "../../domain/melody/melody-types";
import { calcMelodyBeatSide } from "../../domain/melody/melody-types";
import StoreRef from "../../system/store/props/storeRef";
import type { StoreProps } from "../../system/store/store";

export const isMelodyMode = (lastStore: StoreProps) => {
  return lastStore.control.mode === "melody";
};

export const getMelodyCursor = (lastStore: StoreProps): MelodyNote => {
  return lastStore.control.melody.cursor;
};

export const isMelodyCursorOverlap = (lastStore: StoreProps) => {
  return lastStore.control.melody.isOverlap;
};

export const getMelodyFocusIndex = (lastStore: StoreProps) => {
  return lastStore.control.melody.focus;
};

export const getMelodyFocusLockIndex = (lastStore: StoreProps) => {
  return lastStore.control.melody.focusLock;
};

export const getCurrentMelodyTrackIndex = (lastStore: StoreProps) => {
  return lastStore.control.melody.trackIndex;
};

export const getCurrentMelodyScoreTrack = (lastStore: StoreProps) => {
  const trackIndex = getCurrentMelodyTrackIndex(lastStore);
  return lastStore.data.scoreTracks[trackIndex];
};

export const getCurrentMelodyNotes = (lastStore: StoreProps) => {
  return getCurrentMelodyScoreTrack(lastStore).notes;
};

export const getCurrentMelodyTargetNote = (lastStore: StoreProps): MelodyNote => {
  const focus = getMelodyFocusIndex(lastStore);
  if (focus === -1) return getMelodyCursor(lastStore);
  return getCurrentMelodyNotes(lastStore)[focus];
};

export const getCurrentMelodyPitch = (lastStore: StoreProps) => {
  return getCurrentMelodyTargetNote(lastStore).pitch;
};

export const getMelodyFocusRange = (lastStore: StoreProps) => {
  const focus = getMelodyFocusIndex(lastStore);
  const focusLock = getMelodyFocusLockIndex(lastStore);
  if (focusLock === -1) return [focus, focus] as const;
  return focus < focusLock ? [focus, focusLock] as const : [focusLock, focus] as const;
};

export const isMelodyFocusRangeIndex = (lastStore: StoreProps, index: number) => {
  const [start, end] = getMelodyFocusRange(lastStore);
  return isMelodyMode(lastStore) && start <= index && end >= index;
};

export const getMelodyCurrentBeatRect = (lastStore: StoreProps) => {
  const note = getCurrentMelodyTargetNote(lastStore);
  const side = calcMelodyBeatSide(note);
  const [left, width] = [side.pos, side.len].map((v) => v * lastStore.env.beatWidth);
  return { left, width };
};

export const getMelodyScrollLimitProps = (lastStore: StoreProps) => {
  return StoreRef.getScrollLimitProps(lastStore.ref.grid);
};

export const getMelodyCursorMiddle = (lastStore: StoreProps) => {
  const { left, width } = getMelodyCurrentBeatRect(lastStore);
  return left + width / 2;
};

export const isMelodyCursorVisible = (lastStore: StoreProps, isPreview: boolean) => {
  return isMelodyMode(lastStore) && !isPreview && getMelodyFocusIndex(lastStore) === -1;
};

export const getShadeMelodyTracks = (lastStore: StoreProps) => {
  const currentTrackIndex = getCurrentMelodyTrackIndex(lastStore);
  const isHarmonizeMode = lastStore.control.mode === "harmonize";

  return lastStore.data.scoreTracks
    .map((track, trackIndex) => ({ track, trackIndex }))
    .filter(({ trackIndex }) => trackIndex !== currentTrackIndex || isHarmonizeMode);
};
