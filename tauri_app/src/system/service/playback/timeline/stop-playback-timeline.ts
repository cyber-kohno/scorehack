import { get } from "svelte/store";
import { controlStore, dataStore, derivedStore, playbackStore } from "../../../store/global-store";
import createMelodyUpdater from "../../melody/melody-updater";

const stopPlaybackTimeline = () => {
    const playback = get(playbackStore);
    const control = get(controlStore);
    const data = get(dataStore);
    const derived = get(derivedStore);
    const melodyUpdater = createMelodyUpdater({ control, data });

    if (playback.timerKeys == null)
        throw new Error("cache.timerKeysがnullであってはならない。");
    playback.timerKeys.forEach((key) => {
        // console.log(`clear timerKeys: [${key}]`);
        clearTimeout(key);
    });
    playback.timerKeys = null;
    if (playback.intervalKeys != null) {
        playback.intervalKeys.forEach((key) => {
            // console.log(`clear intervalKeys: [${key}]`);
            clearInterval(key);
        });
        playback.intervalKeys = null;
    }
    playback.linePos = -1;
    playback.sfItems.forEach((sf) => {
        if (sf.player) sf.player.stop();
    });

    playback.audios.forEach((audio) => audio.element.pause());
    playback.audios.length = 0;

    // メロディモード時はカーソルを同期
    if (control.mode === "melody") {
        melodyUpdater.syncCursorFromElementSeq(derived);
        controlStore.set({ ...control });
    }
    playbackStore.set({ ...playback });
};
export default stopPlaybackTimeline;
