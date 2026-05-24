import TonalityTheory from "../../../domain/theory/tonality-theory";
import type { PlaybackInstrument } from "../../../infra/audio/playback-instrument";
import MelodyState from "../../../store/state/data/melody-state";
import { get } from "svelte/store";
import { playbackStore } from "../../../store/global-store";

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
    const ref = track.instRef;
    const player = (() => {
      if (ref?.source === "soundfont") {
        return preview.userSfItems.find((item) => {
          return item.definitionName === ref.definitionName
            && item.bank === ref.bank
            && item.program === ref.program;
        })?.player;
      }

      const sfName = ref?.source === "builtin" ? ref.name : "";
      if (sfName === "") return undefined;
      return preview.sfItems.find(item => item.instrumentName === sfName)?.player;
    })();

    if (player == undefined) return;
    const soundName = TonalityTheory.getKey12FullName(pitchIndex);
    player.stop();
    player.play(soundName, 0, { gain: 5, duration: 0.5 });
  }
}
export default PlaybackCacheState;
