import TonalityTheory from "../../../domain/theory/tonality-theory";
import type { PlaybackInstrument } from "../../../infra/audio/playback-instrument";
import MelodyState from "../../../store/state/data/melody-state";
import { get } from "svelte/store";
import { playbackStore } from "../../../store/global-store";
import PlaybackState from "../../../store/state/playback-state";

namespace PlaybackCacheState {

  /**
   * ノーツを鳴らす時間情報を管理する
   */
  export type SoundTimePlayer = {
    pitchName: string;
    gain: number;
    startMs: number;
    sustainMs: number;
    target: string;
  };
  /**
   * 1トラック分のノーツ情報をサウンドフォントとペアで管理する
   */
  export type TrackPlayer = {
    sf: PlaybackInstrument;
    notes: SoundTimePlayer[];
  };

  export type LayerTargetMode =
    | "tl-layer-all"
    | "tl-focus-layer"
    | "ol-layer-all"
    | "ol-focus-layer"
    | "all";
  export type Option = {
    target: LayerTargetMode;
  };

  export interface SoundNote extends MelodyState.Note {
    velocity: number;
  }

  export const playbackSF = (track: MelodyState.ScoreTrack, pitchIndex: number) => {
    const preview = get(playbackStore);
    const player = PlaybackState.getInstPlayer(track.instRef, preview);

    if (player == undefined) return;
    const soundName = TonalityTheory.getKey12FullName(pitchIndex);
    player.stop();
    player.play(soundName, 0, { gain: 5, duration: 0.5 });
  }
}
export default PlaybackCacheState;
