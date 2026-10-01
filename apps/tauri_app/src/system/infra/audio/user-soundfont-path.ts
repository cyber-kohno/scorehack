import FilePathRef from "../file/file-path-ref";
import type SettingsState from "../../store/state/settings-state";

namespace UserSoundFontPath {
    export const createPathRef = FilePathRef.createPathRef;

    export const resolvePath = (
        soundFont: SettingsState.UserSoundFontDefinition,
        settings: SettingsState.Value,
    ) => {
        const pathRef = soundFont.pathRef;
        if (pathRef == undefined) return soundFont.filePath ?? "";
        return FilePathRef.resolvePath(pathRef, settings.envs.HOME_DIR);
    };

    export const formatPathRef = (
        soundFont: SettingsState.UserSoundFontDefinition,
    ) => {
        const pathRef = soundFont.pathRef;
        if (pathRef == undefined) return soundFont.filePath ?? "";
        return FilePathRef.formatPathRef(pathRef);
    };
}

export default UserSoundFontPath;
