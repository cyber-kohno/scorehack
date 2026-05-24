import type FilePathRef from "../../infra/file/file-path-ref";

namespace SettingsState {

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

    export type Value = {
        view: View;
        notation: Notation;
        playback: Playback;
        userSoundFonts: UserSoundFontDefinition[];
        envs: Envs;
    }

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
        envs: {
            HOME_DIR: "",
            SF_FILE_DIR: "",
            SCH_FILE_DIR: ""
        }
    });
}

export default SettingsState;
