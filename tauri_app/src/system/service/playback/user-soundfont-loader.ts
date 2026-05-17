import { get } from "svelte/store";
import { createSpessaSynthInstrument } from "../../infra/audio/spessasynth-instrument";
import UserSoundFontPath from "../../infra/audio/user-soundfont-path";
import { playbackStore, settingsStore } from "../../store/global-store";
import type { TrackSoundFontRef } from "../../store/state/data/track-soundfont-ref";

type UserTrackSoundFontRef = Extract<TrackSoundFontRef, { source: "user" }>;

const createKey = (ref: UserTrackSoundFontRef) => {
    return `${ref.definitionName}:${ref.bank}:${ref.program}`;
};

const loadingPromises = new Map<string, Promise<void>>();

const useUserSoundfontLoader = () => {
    const findDefinition = (definitionName: string) => {
        return get(settingsStore).userSoundFonts.find((soundFont) => {
            return soundFont.name === definitionName;
        });
    };

    const isLoadUserSoundFont = (
        ref: UserTrackSoundFontRef,
    ) => {
        const playback = get(playbackStore);
        return playback.userSfItems.some((item) => {
            return item.definitionName === ref.definitionName
                && item.bank === ref.bank
                && item.program === ref.program
                && item.player != undefined;
        });
    };

    const loadUserSoundFont = async (
        ref: UserTrackSoundFontRef,
    ) => {
        if (isLoadUserSoundFont(ref)) return;

        const key = createKey(ref);
        const loading = loadingPromises.get(key);
        if (loading != undefined) return loading;

        const loadingPromise = (async () => {
            const settings = get(settingsStore);
            const definition = findDefinition(ref.definitionName);
            if (definition == undefined) throw new Error(`User SoundFont definition not found. [${ref.definitionName}]`);

            const playback = get(playbackStore);
            let item = playback.userSfItems.find((candidate) => {
                return candidate.definitionName === ref.definitionName
                    && candidate.bank === ref.bank
                    && candidate.program === ref.program;
            });
            if (item == undefined) {
                item = {
                    definitionName: ref.definitionName,
                    bank: ref.bank,
                    program: ref.program,
                };
                playback.userSfItems.push(item);
                playbackStore.set({ ...playback, userSfItems: [...playback.userSfItems] });
            }

            const player = await createSpessaSynthInstrument({
                filePath: UserSoundFontPath.resolvePath(definition, settings),
                bank: ref.bank,
                program: ref.program,
            });

            const latest = get(playbackStore);
            const latestItem = latest.userSfItems.find((candidate) => {
                return candidate.definitionName === ref.definitionName
                    && candidate.bank === ref.bank
                    && candidate.program === ref.program;
            });
            if (latestItem == undefined) throw new Error();

            latestItem.player = player;
            playbackStore.set({ ...latest, userSfItems: [...latest.userSfItems] });
        })();

        loadingPromises.set(key, loadingPromise);
        try {
            await loadingPromise;
        } finally {
            loadingPromises.delete(key);
        }
    };

    return {
        isLoadUserSoundFont,
        loadUserSoundFont,
    };
};

export default useUserSoundfontLoader;
