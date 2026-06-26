import { readBinaryFile } from "../tauri/fs";
import SoundFontFile from "./soundfont-file";

namespace UserSoundFontCache {
    export type PresetCache = {
        filePath: string;
        presets: SoundFontFile.Preset[];
        cachedAt: number;
    };

    const presetCacheByFilePath = new Map<string, PresetCache>();

    export const buildPresetCache = async (filePath: string) => {
        const bytes = await readBinaryFile(filePath);
        const presets = SoundFontFile.readPresets(bytes);

        presetCacheByFilePath.set(filePath, {
            filePath,
            presets,
            cachedAt: Date.now(),
        });

        return presets;
    };

    export const getPresets = (filePath: string) => {
        return presetCacheByFilePath.get(filePath)?.presets ?? [];
    };

    export const getPresetBanks = (filePath: string) => {
        return Array.from(new Set(
            getPresets(filePath).map((preset) => preset.bank),
        )).map((bank) => bank.toString());
    };

    export const getPresetPrograms = (filePath: string, bank: number) => {
        return getPresets(filePath)
            .filter((preset) => preset.bank === bank)
            .map((preset) => preset.program.toString());
    };

    export const findPreset = (
        presets: SoundFontFile.Preset[],
        bank: number,
        program: number,
    ) => {
        return presets.find((preset) => {
            return preset.bank === bank && preset.program === program;
        });
    };

    export const hasPresetCache = (filePath: string) => {
        return presetCacheByFilePath.has(filePath);
    };
}

export default UserSoundFontCache;
