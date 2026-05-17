import { BaseDirectory, exists, mkdir, readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import UserSoundFontPath from "../audio/user-soundfont-path";
import SettingsState from "../../store/state/settings-state";

namespace SettingsFile {
    const SETTINGS_DIR = "settings";
    const SETTINGS_FILE = `${SETTINGS_DIR}/settings.json`;
    const GEN = 1;

    type PersistedSettings = {
        gen: typeof GEN;
        settings: SettingsState.Value;
    };

    const normalizeUserSoundFonts = (settings: SettingsState.Value): SettingsState.Value => {
        return {
            ...settings,
            userSoundFonts: settings.userSoundFonts.map((soundFont) => {
                if (soundFont.pathRef?.kind === "home") return soundFont;

                const path = soundFont.pathRef?.kind === "external"
                    ? soundFont.pathRef.path
                    : soundFont.filePath;
                if (path == undefined || path === "") return soundFont;

                return {
                    ...soundFont,
                    pathRef: UserSoundFontPath.createPathRef(path, settings.envs.HOME_DIR),
                };
            }),
        };
    };

    const mergeSettings = (settings: Partial<SettingsState.Value>): SettingsState.Value => {
        const merged = {
            ...SettingsState.INITIAL,
            ...settings,
            view: {
                ...SettingsState.INITIAL.view,
                ...settings.view,
                timeline: {
                    ...SettingsState.INITIAL.view.timeline,
                    ...settings.view?.timeline,
                },
            },
            playback: {
                ...SettingsState.INITIAL.playback,
                ...settings.playback,
                swing: {
                    ...SettingsState.INITIAL.playback.swing,
                    ...settings.playback?.swing,
                },
            },
            userSoundFonts: settings.userSoundFonts ?? SettingsState.INITIAL.userSoundFonts,
            envs: {
                ...SettingsState.INITIAL.envs,
                ...settings.envs,
            },
        };
        return normalizeUserSoundFonts(merged);
    };

    export const saveSettings = async (settings: SettingsState.Value) => {
        const payload: PersistedSettings = {
            gen: GEN,
            settings,
        };

        await mkdir(SETTINGS_DIR, {
            baseDir: BaseDirectory.AppConfig,
            recursive: true,
        });
        await writeTextFile(SETTINGS_FILE, JSON.stringify(payload, null, 2), {
            baseDir: BaseDirectory.AppConfig,
        });
    };

    export const loadSettings = async (): Promise<SettingsState.Value | null> => {
        const fileExists = await exists(SETTINGS_FILE, {
            baseDir: BaseDirectory.AppConfig,
        });
        if (!fileExists) return null;

        const text = await readTextFile(SETTINGS_FILE, {
            baseDir: BaseDirectory.AppConfig,
        });
        const payload = JSON.parse(text) as Partial<PersistedSettings>;
        if (payload.gen !== GEN || payload.settings == undefined) return null;

        return mergeSettings(payload.settings);
    };
}

export default SettingsFile;
