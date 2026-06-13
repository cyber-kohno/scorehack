import type FilePathRef from "../../infra/file/file-path-ref";
import type ArrangeState from "./data/arrange/arrange-state";

namespace SettingsState {

    export type Value = {
        view: View;
        notation: Notation;
        playback: Playback;
        userSoundFonts: UserSoundFontDefinition[];
        terminalShortcuts: TerminalShortcut[];
        library: Library;
        envs: Envs;
    }

    export type TimelineChordNameMode = "absolute" | "degree";
    export type DegreeBasis = "tonality" | "relative-major";
    export type SoundFontFileFormat = "sf2" | "sf3";
    export type EnvKey = "HOME_DIR" | "SF_FILE_DIR" | "SCH_FILE_DIR";

    export const EnvKeys: EnvKey[] = ["HOME_DIR", "SF_FILE_DIR", "SCH_FILE_DIR"];

    export type Envs = Record<EnvKey, string>;

    export type UserSoundFontDefinition = {
        name: string;
        filePath?: string;
        pathRef?: FilePathRef.Value;
        format: SoundFontFileFormat;
    };

    export type TerminalShortcut = {
        key: string;
        command: string;
    };

    export type TimelineView = {
        beatWidth: number;
        chordNameMode: TimelineChordNameMode;
    }

    export type View = {
        timeline: TimelineView;
    }

    export type Playback = {
        swing: {
            eighthRatio: number;
            sixteenthRatio: number;
        };
    };

    export type Notation = {
        degreeBasis: DegreeBasis;
    };

    export type PianoPreset = ArrangeState.PianoTrackBank & {
        name: string;
    };

    export type GuitarPreset = ArrangeState.GuitarTrackBank & {
        name: string;
    };

    export type Preset = PianoPreset | GuitarPreset;

    export type Library = {
        presets: Preset[];
    };

    export const createInitial = (): Value => ({
        view: {
            timeline: {
                beatWidth: 120,
                chordNameMode: "degree"
            }
        },
        notation: {
            degreeBasis: "tonality",
        },
        playback: {
            swing: {
                eighthRatio: 2.0,
                sixteenthRatio: 1.6,
            },
        },
        userSoundFonts: [],
        terminalShortcuts: [],
        library: {
            presets: [],
        },
        envs: {
            HOME_DIR: "",
            SF_FILE_DIR: "",
            SCH_FILE_DIR: ""
        }
    });
}

export default SettingsState;
