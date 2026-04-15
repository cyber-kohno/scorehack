import type SoundFont from "soundfont-player";
import type { MelodyNote } from "../melody/melody-types";

export type PlaybackTrackTargetMode =
  | "tl-layer-all"
  | "tl-focus-layer"
  | "ol-layer-all"
  | "ol-focus-layer"
  | "all";

export type PlaybackOption = {
  target: PlaybackTrackTargetMode;
};

export type PlaybackSoundTimePlayer = {
  pitchName: string;
  gain: number;
  startMs: number;
  sustainMs: number;
  target: string;
};

export type PlaybackTrackPlayer = {
  sf: SoundFont.Player;
  notes: PlaybackSoundTimePlayer[];
};

export interface PlaybackSoundNote extends MelodyNote {
  velocity: number;
}
