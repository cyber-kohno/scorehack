import type { MelodyNote } from "../../domain/melody/melody-types";
import { calcMelodyBeatSide } from "../../domain/melody/melody-types";
import { getMelodyCursorState } from "../../app/melody/melody-cursor-state";
import type { RootStoreToken } from "../root-store";
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

export const isMelodyMode = (rootStoreToken: RootStoreToken) => {
  return getModeState() === "melody";
};

export const getMelodyCursor = (rootStoreToken: RootStoreToken): MelodyNote => {
  return getMelodyCursorState(rootStoreToken);
};

export const isMelodyCursorOverlap = (rootStoreToken: RootStoreToken) => {
  return getMelodyOverlapState();
};

export const getMelodyFocusIndex = (rootStoreToken: RootStoreToken) => {
  return getMelodyFocusState().focus;
};

export const getMelodyFocusLockIndex = (rootStoreToken: RootStoreToken) => {
  return getMelodyFocusState().focusLock;
};

export const getCurrentMelodyTrackIndex = (rootStoreToken: RootStoreToken) => {
  return getMelodyTrackIndex();
};

export const getCurrentMelodyScoreTrack = (rootStoreToken: RootStoreToken) => {
  const trackIndex = getCurrentMelodyTrackIndex(rootStoreToken);
  return getScoreTrack(rootStoreToken, trackIndex);
};

export const getCurrentMelodyNotes = (rootStoreToken: RootStoreToken) => {
  return getCurrentMelodyScoreTrack(rootStoreToken)?.notes ?? [];
};

export const getCurrentMelodyTargetNote = (rootStoreToken: RootStoreToken): MelodyNote => {
  const focus = getMelodyFocusIndex(rootStoreToken);
  if (focus === -1) return getMelodyCursor(rootStoreToken);
  return getCurrentMelodyNotes(rootStoreToken)[focus];
};

export const getCurrentMelodyPitch = (rootStoreToken: RootStoreToken) => {
  return getCurrentMelodyTargetNote(rootStoreToken).pitch;
};

export const getMelodyFocusRange = (rootStoreToken: RootStoreToken) => {
  const focus = getMelodyFocusIndex(rootStoreToken);
  const focusLock = getMelodyFocusLockIndex(rootStoreToken);
  if (focusLock === -1) return [focus, focus] as const;
  return focus < focusLock ? [focus, focusLock] as const : [focusLock, focus] as const;
};

export const isMelodyFocusRangeIndex = (rootStoreToken: RootStoreToken, index: number) => {
  const [start, end] = getMelodyFocusRange(rootStoreToken);
  return isMelodyMode(rootStoreToken) && start <= index && end >= index;
};

export const getMelodyCurrentBeatRect = (rootStoreToken: RootStoreToken) => {
  const note = getCurrentMelodyTargetNote(rootStoreToken);
  const side = calcMelodyBeatSide(note);
  const beatWidth = getEnvBeatWidth();
  const [left, width] = [side.pos, side.len].map((v) => v * beatWidth);
  return { left, width };
};

export const getMelodyScrollLimitProps = (rootStoreToken: RootStoreToken) => {
  return getTimelineGridScrollLimitProps();
};

export const getMelodyCursorMiddle = (rootStoreToken: RootStoreToken) => {
  const { left, width } = getMelodyCurrentBeatRect(rootStoreToken);
  return left + width / 2;
};

export const getMelodyNoteTonality = (rootStoreToken: RootStoreToken, note: MelodyNote) => {
  const beatSide = calcMelodyBeatSide(note);
  return getBaseCacheFromBeat(rootStoreToken, beatSide.pos)?.scoreBase.tonality;
};

export const isMelodyCursorVisible = (rootStoreToken: RootStoreToken, isPreview: boolean) => {
  return isMelodyMode(rootStoreToken) && !isPreview && getMelodyFocusIndex(rootStoreToken) === -1;
};

export const getShadeMelodyTracks = (rootStoreToken: RootStoreToken) => {
  const currentTrackIndex = getCurrentMelodyTrackIndex(rootStoreToken);
  const isHarmonizeMode = getModeState() === "harmonize";

  return getScoreTracks(rootStoreToken)
    .map((track, trackIndex) => ({ track, trackIndex }))
    .filter(({ trackIndex }) => trackIndex !== currentTrackIndex || isHarmonizeMode);
};

export const getShadeMelodyTrack = (rootStoreToken: RootStoreToken, trackIndex: number) => {
  return getScoreTrack(rootStoreToken, trackIndex);
};

export const getShadeMelodyNote = (
  rootStoreToken: RootStoreToken,
  trackIndex: number,
  noteIndex: number,
) => {
  return getShadeMelodyTrack(rootStoreToken, trackIndex)?.notes[noteIndex];
};

