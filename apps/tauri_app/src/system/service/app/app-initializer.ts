import { get } from "svelte/store";
import UserSoundFontCache from "../../infra/audio/user-soundfont-cache";
import UserSoundFontPath from "../../infra/audio/user-soundfont-path";
import SettingsFile from "../../infra/settings/settings-file";
import ScoreHistory from "../../infra/tauri/history/score-history";
import createTerminalActions from "../../actions/terminal/terminal-actions";
import LayoutInitializer from "../../layout/layout-initializer";
import { settingsStore, terminalStore } from "../../store/global-store";
import recalculate from "../derived/recalculate-derived";
import useTerminalLogger from "../terminal/terminal-logger";

const waitForInitialPaint = async () => {
    await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
    });
};

const getActiveTerminal = () => {
    const terminal = get(terminalStore);
    if (terminal == null) throw new Error("terminal is not active.");
    return terminal;
};

const commitTerminal = (terminal = getActiveTerminal()) => {
    terminalStore.set({ ...terminal });
};

const initializeApp = async () => {
    LayoutInitializer.initConstProps();
    recalculate();
    ScoreHistory.reset();

    const terminalActions = createTerminalActions();
    terminalActions.open();
    const terminal = getActiveTerminal();
    terminal.wait = true;
    const logger = useTerminalLogger(terminal);

    logger.outputInfo("Starting application initialization.");
    commitTerminal(terminal);
    await waitForInitialPaint();

    try {
        logger.outputInfo("Loading settings.");
        commitTerminal(terminal);

        const settings = await SettingsFile.loadSettings();
        if (settings == null) {
            logger.outputInfo("Settings file was not found. Initial settings will be used.");
        } else {
            settingsStore.set(settings);
            recalculate();
            logger.outputInfo("Settings loaded successfully.");
        }
        commitTerminal(terminal);

        const currentSettings = get(settingsStore);
        if (currentSettings.userSoundFonts.length === 0) {
            logger.outputInfo("No user SoundFont definitions found.");
        } else {
            logger.outputInfo("Loading user SoundFont preset caches.");
            commitTerminal(terminal);

            for (const soundFont of currentSettings.userSoundFonts) {
                try {
                    logger.outputInfo(`Loading user SoundFont presets. [${soundFont.name}]`);
                    commitTerminal(terminal);
                    await UserSoundFontCache.buildPresetCache(UserSoundFontPath.resolvePath(soundFont, currentSettings));
                    logger.outputInfo(`User SoundFont presets loaded successfully. [${soundFont.name}]`);
                } catch (error) {
                    console.error("Failed to load user SoundFont presets:", error);
                    logger.outputError(`Failed to load user SoundFont presets. [${soundFont.name}]`);
                }
                commitTerminal(terminal);
            }
        }
    } catch (error) {
        console.error("Failed to initialize application:", error);
        logger.outputError("Application initialization failed.");
    } finally {
        terminal.wait = false;
        logger.outputInfo("Application initialization finished.");
        commitTerminal(terminal);
    }
};

export default initializeApp;
