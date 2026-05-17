import type SoundFont from "soundfont-player";
import type { PlaybackInstrument } from "./playback-instrument";

export const createSoundFontPlayerAdapter = (
    player: SoundFont.Player,
): PlaybackInstrument => ({
    play: (note, when, options) => player.play(note as string, when, options),
    stop: () => player.stop(),
});
