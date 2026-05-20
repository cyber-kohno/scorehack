namespace SettingsState {

    export type TimelineChordNameMode = "absolute" | "degree";
    export type SoundFontFileFormat = "sf2" | "sf3";
    export type EnvKey = "HOME_DIR" | "SF_FILE_DIR" | "SCH_FILE_DIR";

    export const EnvKeys: EnvKey[] = ["HOME_DIR", "SF_FILE_DIR", "SCH_FILE_DIR"];

    export type Envs = Record<EnvKey, string>;

    export type SoundFontPathRef =
        | {
            kind: "home";
            relativePath: string;
        }
        | {
            kind: "external";
            path: string;
        };

    export type UserSoundFontDefinition = {
        name: string;
        filePath?: string;
        pathRef?: SoundFontPathRef;
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

    export type Value = {
        view: View;
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
