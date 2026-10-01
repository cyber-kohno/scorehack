import { get } from "svelte/store";
import TonalityTheory from "../../../domain/theory/tonality-theory";
import { playbackStore } from "../../../store/global-store";
import type ArrangeState from "../../../store/state/data/arrange/arrange-state";
import PlaybackState from "../../../store/state/playback-state";

const previewArrangeNote = (track: ArrangeState.Track, pitch: number) => {
    const playback = get(playbackStore);
    const player = PlaybackState.getInstPlayer(track.instRef, playback);
    if (player == undefined) return;

    const pitchName = TonalityTheory.getKey12FullName(pitch);
    player.stop();
    player.play(pitchName, 0, {
        gain: 5 * (track.volume / 10),
        duration: 0.5,
    });
};

export default previewArrangeNote;
