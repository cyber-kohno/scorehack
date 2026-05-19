import { get } from "svelte/store";
import TonalityTheory from "../../../domain/theory/tonality-theory";
import { playbackStore } from "../../../store/global-store";
import type ArrangeState from "../../../store/state/data/arrange/arrange-state";

const previewArrangeNote = (track: ArrangeState.Track, pitch: number) => {
    if (track.isMute) return;

    const playback = get(playbackStore);
    const player = (() => {
        const ref = track.soundFontRef;
        if (ref?.source === "user") {
            return playback.userSfItems.find((item) => {
                return item.definitionName === ref.definitionName
                    && item.bank === ref.bank
                    && item.program === ref.program;
            })?.player;
        }

        const instrumentName = ref?.source === "builtin" ? ref.name : track.soundFont;
        if (instrumentName === "") return undefined;
        return playback.sfItems.find(item => item.instrumentName === instrumentName)?.player;
    })();
    if (player == undefined) return;

    const pitchName = TonalityTheory.getKey12FullName(pitch);
    player.stop();
    player.play(pitchName, 0, {
        gain: 5 * (track.volume / 10),
        duration: 0.5,
    });
};

export default previewArrangeNote;
