namespace SettingsState {

    export type TimelineChordNameMode = "absolute" | "degree";

    export type TimelineView = {
        beatWidth: number;
        chordNameMode: TimelineChordNameMode;
    }

    export type View = {
        timeline: TimelineView;
    }

    export type Value = {
        view: View;
    }

    export const INITIAL: Value = {
        view: {
            timeline: {
                beatWidth: 120,
                chordNameMode: "degree"
            }
        }
    };
}

export default SettingsState;
