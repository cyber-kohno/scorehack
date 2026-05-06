import { get } from "svelte/store";
import { playbackStore } from "../../store/global-store";
import SoundFont, { type InstrumentName } from "soundfont-player";

const useSoundfontLoader = () => {
    const preview = get(playbackStore);
    const isLoadSoundFont = (sfName: InstrumentName) => {
        const items = preview.sfItems;
        return items.find((c) => c.instrumentName === sfName) != undefined;
    };
    const loadSoundFont = async (sfName: InstrumentName) => {
        const items = preview.sfItems;
        items.push({ instrumentName: sfName });
        const player = await SoundFont.instrument(new AudioContext(), sfName);
        const item = items.find((sf) => sf.instrumentName === sfName);
        if (item == undefined) throw new Error();
        item.player = player;
    };
    return {
        isLoadSoundFont,
        loadSoundFont,
    };
};
export default useSoundfontLoader;