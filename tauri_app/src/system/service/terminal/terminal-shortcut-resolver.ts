import type SettingsState from "../../store/state/settings-state";

namespace TerminalShortcutResolver {
    export const resolve = (
        command: string,
        shortcuts: SettingsState.TerminalShortcut[],
    ) => {
        const items = command.split(" ");
        const shortcutKey = items[0];
        const shortcut = shortcuts.find((item) => item.key === shortcutKey);
        if (shortcut == undefined) return command;

        return [shortcut.command, ...items.slice(1)].join(" ");
    };
}

export default TerminalShortcutResolver;
