import { get } from "svelte/store";
import { playbackStore } from "../../store/global-store";
import SoundFont, { type InstrumentName } from "soundfont-player";

const loadingPromises = new Map<InstrumentName, Promise<void>>();

const useSoundfontLoader = () => {
    const isLoadSoundFont = (sfName: InstrumentName) => {
        const items = get(playbackStore).sfItems;
        return items.find((c) => c.instrumentName === sfName && c.player != undefined) != undefined;
    };
    const loadSoundFont = async (sfName: InstrumentName) => {
        if (isLoadSoundFont(sfName)) return;

        const loading = loadingPromises.get(sfName);
        if (loading != undefined) return loading;

        const loadingPromise = (async () => {
            const playback = get(playbackStore);
            let item = playback.sfItems.find((sf) => sf.instrumentName === sfName);
            if (item == undefined) {
                item = { instrumentName: sfName };
                playback.sfItems.push(item);
                playbackStore.set({ ...playback, sfItems: [...playback.sfItems] });
            }

            const player = await SoundFont.instrument(new AudioContext(), sfName);
            const latest = get(playbackStore);
            const latestItem = latest.sfItems.find((sf) => sf.instrumentName === sfName);
            if (latestItem == undefined) throw new Error();

            latestItem.player = player;
            playbackStore.set({ ...latest, sfItems: [...latest.sfItems] });
        })();

        loadingPromises.set(sfName, loadingPromise);
        try {
            await loadingPromise;
        } finally {
            loadingPromises.delete(sfName);
        }
    };
    return {
        isLoadSoundFont,
        loadSoundFont,
    };
};
export default useSoundfontLoader;
