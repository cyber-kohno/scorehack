import type { MelodyNote } from "../../domain/melody/melody-types";
import { calcMelodyBeatSide } from "../../domain/melody/melody-types";
import { getMelodyCursorState } from "../../app/melody/melody-cursor-state";
import type { StoreProps } from "../../system/store/store";
import { getEnvBeatWidth } from "../session-state/env-store";
import { getModeState } from "../session-state/mode-store";
import { getBaseCacheFromBeat } from "../cache-state/cache-store";
import {
  getScoreTrack,
  getScoreTracks,
} from "../project-data/melody-project-data";
import { getTimelineGridScrollLimitProps } from "../session-state/timeline-viewport-store";
import { getMelodyTrackIndex } from "../session-state/melody-track-store";
import { getMelodyFocusState } from "../session-state/melody-focus-store";
import { getMelodyOverlapState } from "../session-state/melody-overlap-store";

export const isMelodyMode = (lastStore: StoreProps) => {
  return getModeState() === "melody";
};

export const getMelodyCursor = (lastStore: StoreProps): MelodyNote => {
  return getMelodyCursorState(lastStore);
};

export const isMelodyCursorOverlap = (lastStore: StoreProps) => {
  return getMelodyOverlapState();
};

export const getMelodyFocusIndex = (lastStore: StoreProps) => {
  return getMelodyFocusState().focus;
};

export const getMelodyFocusLockIndex = (lastStore: StoreProps) => {
  return getMelodyFocusState().focusLock;
};

export const getCurrentMelodyTrackIndex = (lastStore: StoreProps) => {
  return getMelodyTrackIndex();
};

export const getCurrentMelodyScoreTrack = (lastStore: StoreProps) => {
  const trackIndex = getCurrentMelodyTrackIndex(lastStore);
  return getScoreTrack(lastStore, trackIndex);
};

export const getCurrentMelodyNotes = (lastStore: StoreProps) => {
  return getCurrentMelodyScoreTrack(lastStore)?.notes ?? [];
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
  const beatWidth = getEnvBeatWidth();
  const [left, width] = [side.pos, side.len].map((v) => v * beatWidth);
  return { left, width };
};

export const getMelodyScrollLimitProps = (lastStore: StoreProps) => {
  return getTimelineGridScrollLimitProps();
};

export const getMelodyCursorMiddle = (lastStore: StoreProps) => {
  const { left, width } = getMelodyCurrentBeatRect(lastStore);
  return left + width / 2;
};

export const getMelodyNoteTonality = (lastStore: StoreProps, note: MelodyNote) => {
  const beatSide = calcMelodyBeatSide(note);
  return getBaseCacheFromBeat(lastStore, beatSide.pos)?.scoreBase.tonality;
};

export const isMelodyCursorVisible = (lastStore: StoreProps, isPreview: boolean) => {
  return isMelodyMode(lastStore) && !isPreview && getMelodyFocusIndex(lastStore) === -1;
};

export const getShadeMelodyTracks = (lastStore: StoreProps) => {
  const currentTrackIndex = getCurrentMelodyTrackIndex(lastStore);
  const isHarmonizeMode = getModeState() === "harmonize";

  return getScoreTracks(lastStore)
    .map((track, trackIndex) => ({ track, trackIndex }))
    .filter(({ trackIndex }) => trackIndex !== currentTrackIndex || isHarmonizeMode);
};

export const getShadeMelodyTrack = (lastStore: StoreProps, trackIndex: number) => {
  return getScoreTrack(lastStore, trackIndex);
};

export const getShadeMelodyNote = (
  lastStore: StoreProps,
  trackIndex: number,
  noteIndex: number,
) => {
  return getShadeMelodyTrack(lastStore, trackIndex)?.notes[noteIndex];
};
