import type ControlState from "../../store/state/control-state";
import type DataState from "../../store/state/data/data-state";
import type DerivedState from "../../store/state/derived-state";
import type SettingsState from "../../store/state/settings-state";
import type { Q, QRange } from "../../domain/time/rational";

export class ScoreQueryError extends Error {
    constructor(public readonly code: string, message: string) { super(message); }
}

export type ReadSource = {
    data: DataState.Value;
    control: ControlState.Value;
    scoreName: string;
    dirty: boolean;
    settings: Pick<SettingsState.Value, "view" | "notation" | "playback">;
};

export type Snapshot = ReadSource & {
    snapshotId: string;
    capturedAtEpochMs: number;
    expiresAtEpochMs: number;
    derived: DerivedState.Value;
};

export type QueryRange =
    | { kind: "all" }
    | { kind: "bars"; fromBar: number; throughBar: number }
    | ({ kind: "q" } & QRange)
    | { kind: "section"; sectionRef: string }
    | { kind: "chord"; chordRef: string }
    | { kind: "selection"; source: "melody" | "outline" };

export type CatalogRequest = { snapshotId?: string; cursor?: string; limit?: number };
export type OutlineRequest = {
    snapshotId: string;
    range: QueryRange;
    context?: { beforeBars: number; afterBars: number };
    detail?: "standard" | "harmonic";
    cursor?: string;
    limit?: number;
};
export type MusicalRequest = OutlineRequest & {
    trackRefs: string[];
    noteFilter?: "overlap" | "onset";
};

export type TimedItem = { kind: string; range: QRange; [key: string]: unknown };
export type MusicalPosition = {
    q: Q;
    bar: number | null;
    beat: number | null;
    offsetInBeatQ: Q | null;
    beatUnitQ: Q | null;
};
