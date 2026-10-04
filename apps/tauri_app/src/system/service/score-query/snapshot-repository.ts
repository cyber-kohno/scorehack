import buildDerived from "../derived/build-derived";
import { ScoreQueryError, type ReadSource, type Snapshot } from "./query-types";

/** Frozen read state. Depends on an injected source, never a global store. */
export class SnapshotRepository {
    private readonly snapshots = new Map<string, Snapshot>();
    constructor(
        private readonly read: () => ReadSource,
        private readonly now: () => number = Date.now,
        private readonly newId: () => string = () => crypto.randomUUID(),
        private readonly ttlMs = 120_000,
        private readonly capacity = 4,
    ) {}

    clear(): void { this.snapshots.clear(); }

    get(snapshotId: string): Snapshot {
        const snapshot = this.snapshots.get(snapshotId);
        if (snapshot === undefined || snapshot.expiresAtEpochMs <= this.now()) {
            this.snapshots.delete(snapshotId);
            throw new ScoreQueryError("SNAPSHOT_NOT_AVAILABLE", "Snapshot expired or was evicted. Fetch a new overview or editor context and use its refs.");
        }
        return snapshot;
    }

    capture(): Snapshot {
        const source = structuredClone(this.read());
        const capturedAtEpochMs = this.now();
        for (const [id, snapshot] of this.snapshots) {
            if (snapshot.expiresAtEpochMs <= capturedAtEpochMs) this.snapshots.delete(id);
        }
        while (this.snapshots.size >= this.capacity) this.snapshots.delete(this.snapshots.keys().next().value!);
        const snapshot: Snapshot = {
            ...source,
            snapshotId: this.newId(),
            capturedAtEpochMs,
            expiresAtEpochMs: capturedAtEpochMs + this.ttlMs,
            derived: buildDerived(source.data, source.settings),
        };
        this.snapshots.set(snapshot.snapshotId, snapshot);
        return snapshot;
    }
}
