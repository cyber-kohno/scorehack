import SoundFontFile from "../../infra/audio/soundfont-file";
import UserSoundFontCache from "../../infra/audio/user-soundfont-cache";
import UserSoundFontPath from "../../infra/audio/user-soundfont-path";
import { settingsStore } from "../../store/global-store";
import type { TrackInstRef } from "../../store/state/data/track-inst-ref";
import { get } from "svelte/store";
import useUserSoundfontLoader from "./user-soundfont-loader";

export type UserTrackInstRef = Extract<TrackInstRef, { source: "soundfont" }>;

export type PrepareUserSoundFontResult = {
    preset: SoundFontFile.Preset;
};

export type UserSoundFontPrepareErrorCode =
    | "definition-not-found"
    | "file-unavailable"
    | "preset-not-found";

export class UserSoundFontPrepareError extends Error {
    constructor(
        public readonly code: UserSoundFontPrepareErrorCode,
        message: string,
    ) {
        super(message);
    }
}

export const formatUserSoundFontRef = (ref: UserTrackInstRef) => {
    return `${ref.definitionName} ${SoundFontFile.formatPresetKey(ref)}`;
};

export const prepareUserSoundFont = async (
    ref: UserTrackInstRef,
): Promise<PrepareUserSoundFontResult> => {
    const settings = get(settingsStore);
    const definition = settings.userSoundFonts.find((soundFont) => {
        return soundFont.name === ref.definitionName;
    });
    if (definition == undefined) {
        throw new UserSoundFontPrepareError(
            "definition-not-found",
            `User SoundFont definition not found. [${ref.definitionName}]`,
        );
    }

    let presets: SoundFontFile.Preset[];
    const filePath = UserSoundFontPath.resolvePath(definition, settings);
    try {
        presets = await UserSoundFontCache.buildPresetCache(filePath);
    } catch {
        throw new UserSoundFontPrepareError(
            "file-unavailable",
            `User SoundFont file not found or cannot be read. [${ref.definitionName} ${UserSoundFontPath.formatPathRef(definition)}]`,
        );
    }

    const preset = UserSoundFontCache.findPreset(
        presets,
        ref.bank,
        ref.program,
    );
    if (preset == undefined) {
        throw new UserSoundFontPrepareError(
            "preset-not-found",
            `User SoundFont preset not found. [${formatUserSoundFontRef(ref)}]`,
        );
    }

    const { loadUserSoundFont } = useUserSoundfontLoader();
    await loadUserSoundFont(ref);

    return { preset };
};
