import TonalityTheory from "../../domain/theory/tonality-theory";
import { describeKey, pitchClass } from "../../domain/theory/pitch-context";
import { compareQ, intersectQ, maxQ, noteRangeQ, type QRange } from "../../domain/time/rational";
import { MusicTimeline, trackRef } from "./music-timeline";
import { ScoreQueryError, type CatalogRequest, type MusicalRequest, type OutlineRequest, type ReadSource, type Snapshot } from "./query-types";
import { SnapshotRepository } from "./snapshot-repository";

type Candidate = { range: QRange; make: () => unknown };
type Cursor = { snapshotId: string; query: string; offset: number; expiresAt: number };
const MAX_BYTES = 180 * 1024;

/** Read-only application service. The MCP adapter only validates and dispatches. */
export class ScoreQueryService {
    private readonly snapshots: SnapshotRepository;
    private timelines = new WeakMap<Snapshot, MusicTimeline>();
    private readonly cursors = new Map<string, Cursor>();
    constructor(read: () => ReadSource, private readonly now: () => number = Date.now,
        private readonly newId: () => string = () => crypto.randomUUID()) {
        this.snapshots = new SnapshotRepository(read, now, newId);
    }

    clear(): void {
        this.snapshots.clear(); this.cursors.clear(); this.timelines = new WeakMap();
    }

    private read(snapshotId?: string) {
        const snapshot = snapshotId ? this.snapshots.get(snapshotId) : this.snapshots.capture();
        let timeline = this.timelines.get(snapshot);
        if (!timeline) {
            timeline = new MusicTimeline(snapshot);
            this.timelines.set(snapshot, timeline);
        }
        return { snapshot, timeline };
    }

    private meta(snapshot: Snapshot) {
        return {
            schemaVersion: 1, snapshotId: snapshot.snapshotId, refScope: "snapshot",
            capturedAtEpochMs: snapshot.capturedAtEpochMs, expiresAtEpochMs: snapshot.expiresAtEpochMs,
            scoreName: snapshot.scoreName, dirty: snapshot.dirty,
            time: { unit: "quarter-note", encoding: "rational", interval: "start-inclusive-end-exclusive", timing: "notated-unswung", barNumbering: "scorehack-ui" },
            notation: { degreeBasis: snapshot.settings.notation.degreeBasis, canonicalDegreeConvention: "local-tonic-major-scale", pitchNaming: "scorehack-C0-is-index-0", enharmonicSpelling: "not-preserved" },
        };
    }

    private selection<T>(read: () => T | null) {
        try {
            const selection = read();
            return { selection, selectionStatus: selection === null ? "none" : "selected", selectionError: null };
        } catch (error) {
            if (!(error instanceof ScoreQueryError)) throw error;
            return { selection: null, selectionStatus: "invalid", selectionError: { code: error.code, message: error.message } };
        }
    }

    private page(snapshot: Snapshot, query: string, candidates: Candidate[], options: { cursor?: string; limit?: number }, metadata: object) {
        for (const [id, cursor] of this.cursors) if (cursor.expiresAt <= this.now()) this.cursors.delete(id);
        let offset = 0;
        if (options.cursor) {
            const cursor = this.cursors.get(options.cursor);
            if (!cursor || cursor.snapshotId !== snapshot.snapshotId || cursor.query !== query) {
                throw new ScoreQueryError("INVALID_CURSOR", "Cursor belongs to a different snapshot or query. Keep the same range, targets and detail.");
            }
            offset = cursor.offset;
        }
        const limit = options.limit ?? 64;
        const items: unknown[] = [];
        const envelope = { ...this.meta(snapshot), ...metadata };
        const encoder = new TextEncoder();
        const size = (records: unknown[]) => encoder.encode(JSON.stringify({ ...envelope, items: records })).length;
        if (size([]) > MAX_BYTES - 1024) throw new ScoreQueryError("RESULT_METADATA_TOO_LARGE", "Score metadata exceeds the response budget.");
        let next = offset;
        while (next < candidates.length && items.length < limit) {
            const item = candidates[next].make();
            if (size([...items, item]) > MAX_BYTES - 1024) {
                if (items.length === 0) throw new ScoreQueryError("RESULT_ITEM_TOO_LARGE", "One item exceeds the response budget. Request a shorter range or standard detail.");
                break;
            }
            items.push(item); next++;
        }
        let nextCursor: string | null = null;
        if (next < candidates.length) {
            while (this.cursors.size >= 512) this.cursors.delete(this.cursors.keys().next().value!);
            nextCursor = this.newId();
            this.cursors.set(nextCursor, { snapshotId: snapshot.snapshotId, query, offset: next, expiresAt: snapshot.expiresAtEpochMs });
        }
        return structuredClone({ ...envelope, items, page: { offset, returnedCount: items.length, totalCount: candidates.length, complete: nextCursor === null, nextCursor, maxResponseBytes: MAX_BYTES } });
    }

    overview(request: CatalogRequest = {}) {
        if (request.cursor && !request.snapshotId) throw new ScoreQueryError("INVALID_PARAMS", "Paging requires the snapshotId from the first response.");
        const { snapshot, timeline } = this.read(request.snapshotId);
        const scoreTracks = snapshot.data.scoreTracks.map((track, index) => ({ index, ref: trackRef("score", index), name: track.name, noteCount: track.notes.length, isMute: track.isMute }));
        const tracks = [
            ...scoreTracks.map(track => ({ kind: "track", trackKind: "score", ...track })),
            ...snapshot.data.arrange.tracks.map((track, index) => ({ kind: "track", trackKind: "arrange", index, ref: trackRef("arrange", index), name: track.name, method: track.method, isMute: track.isMute })),
            ...snapshot.data.audioTracks.map((track, index) => ({ kind: "track", trackKind: "audio", index, ref: trackRef("audio", index), name: track.name, isMute: track.isMute })),
        ];
        const records = [...tracks, ...timeline.sections.map(section => ({ kind: "section", ...section })), ...timeline.changes];
        const zeroSpan = { startQ: timeline.extent.startQ, endQ: timeline.extent.startQ };
        return this.page(snapshot, "overview", records.map(record => ({ range: zeroSpan, make: () => record })), request, {
            scoreTrackCount: scoreTracks.length, audioTrackCount: snapshot.data.audioTracks.length,
            arrangeTrackCount: snapshot.data.arrange.tracks.length, totalNoteCount: scoreTracks.reduce((sum, track) => sum + track.noteCount, 0),
            scoreTracks: scoreTracks.slice(0, 128), scoreTracksComplete: scoreTracks.length <= 128,
            scoreRange: timeline.extent, outlineRange: timeline.outlineRange,
            initialKey: describeKey(snapshot.derived.baseCaches[0].scoreBase.tonality),
            initialRhythm: snapshot.derived.baseCaches[0].scoreBase.rhythm,
            initialTempo: snapshot.derived.baseCaches[0].scoreBase.tempo,
            sectionCount: timeline.sections.length, chordCount: timeline.chords.length,
        });
    }

    editor(request: { snapshotId?: string } = {}) {
        const { snapshot, timeline } = this.read(request.snapshotId);
        const control = snapshot.control;
        const score = snapshot.data.scoreTracks[control.melody.trackIndex];
        const arrange = snapshot.data.arrange.tracks[control.outline.trackIndex];
        const result = {
            ...this.meta(snapshot), mode: control.mode,
            activeEditor: control.mode === "melody" ? "melody" : "outline",
            melody: { track: score ? { ref: trackRef("score", control.melody.trackIndex), name: score.name } : null,
                ...this.selection(() => timeline.melodySelection()), cursor: { range: noteRangeQ(control.melody.cursor), pitchIndex: control.melody.cursor.pitch },
                cursorIsSelection: false },
            outline: { arrangeTrack: arrange ? { ref: trackRef("arrange", control.outline.trackIndex), name: arrange.name } : null,
                ...this.selection(() => timeline.outlineSelection()) },
        };
        if (new TextEncoder().encode(JSON.stringify(result)).length > MAX_BYTES) throw new ScoreQueryError("RESULT_METADATA_TOO_LARGE", "Editor metadata exceeds the response budget.");
        return structuredClone(result);
    }

    private queryContext(request: OutlineRequest) {
        const { snapshot, timeline } = this.read(request.snapshotId);
        const targetRange = timeline.resolveRange(request.range);
        const resolvedRange = timeline.expandRange(targetRange, request.context);
        return { snapshot, timeline, targetRange, resolvedRange, harmonic: request.detail === "harmonic" };
    }

    outline(request: OutlineRequest) {
        const { snapshot, timeline, targetRange, resolvedRange, harmonic } = this.queryContext(request);
        const records = timeline.outlineItems(resolvedRange, harmonic);
        records.sort((a, b) => compareQ(a.range.startQ, b.range.startQ) || a.kind.localeCompare(b.kind));
        const query = JSON.stringify({ method: "outline", range: request.range, context: request.context, detail: request.detail ?? "standard" });
        return this.page(snapshot, query, records.map(record => ({ range: record.range, make: () => ({ ...record, overlap: intersectQ(record.range, resolvedRange) }) })), request, {
            requestedRange: request.range, targetRange, resolvedRange,
            resolvedSelection: request.range.kind === "selection" ? (request.range.source === "melody" ? timeline.melodySelection() : timeline.outlineSelection()) : null,
            contextAtStart: this.contextAt(timeline, resolvedRange), detail: request.detail ?? "standard",
        });
    }

    private contextAt(timeline: MusicTimeline, range: QRange) {
        const base = timeline.baseAt(range.startQ).cache;
        return { position: timeline.position(range.startQ), key: describeKey(base.scoreBase.tonality), rhythm: base.scoreBase.rhythm, tempo: base.scoreBase.tempo };
    }

    musical(request: MusicalRequest) {
        const { snapshot, timeline, targetRange, resolvedRange, harmonic } = this.queryContext(request);
        const candidates: Candidate[] = timeline.outlineItems(resolvedRange, harmonic).map(record => ({ range: record.range, make: () => ({ ...record, overlap: intersectQ(record.range, resolvedRange) }) }));
        const selectionState = this.selection(() => timeline.melodySelection());
        const selection = selectionState.selection;
        const resolvedTracks = request.trackRefs.map(ref => {
            const match = /^score:(0|[1-9]\d*)$/.exec(ref);
            if (!match) throw new ScoreQueryError("UNSUPPORTED_TRACK", "Musical note queries currently support explicit score track refs only; arrange/audio are catalogued but not expanded.");
            const index = Number(match[1]);
            const track = snapshot.data.scoreTracks[index];
            if (!track) throw new ScoreQueryError("INVALID_REFERENCE", "Track does not exist in this snapshot.");
            const spans = timeline.noteRanges[index];
            track.notes.forEach((note, noteIndex) => {
                const range = spans[noteIndex];
                const overlap = intersectQ(range, resolvedRange);
                if (!overlap || (request.noteFilter === "onset" && compareQ(range.startQ, resolvedRange.startQ) < 0)) return;
                candidates.push({ range: overlap, make: () => ({
                    kind: "note", ref: `note:${index}:${noteIndex}`, trackRef: ref, range, overlap,
                    isSelected: selectionState.selectionStatus === "invalid" ? null : selection !== null && selection.trackRef === ref && selection.indexRange.from <= noteIndex && noteIndex <= selection.indexRange.through,
                    start: timeline.position(range.startQ), end: timeline.position(range.endQ),
                    pitch: { index: note.pitch, pitchClass: pitchClass(note.pitch), name: TonalityTheory.getKey12FullName(note.pitch) },
                    pronunciation: note.pron ?? null,
                    contexts: harmonic ? timeline.noteContexts(note.pitch, overlap) : null,
                    contextStatus: harmonic ? "included-for-overlap" : "not-requested",
                }) });
            });
            // Silence is calculated from ALL notes, including notes omitted by onset filtering/paging.
            const covered = spans.map(range => intersectQ(range, resolvedRange)).filter((range): range is QRange => range !== null).sort((a, b) => compareQ(a.startQ, b.startQ));
            let gapStart = resolvedRange.startQ;
            const pushGap = (range: QRange) => candidates.push({ range, make: () => ({ kind: "gap", trackRef: ref, range, meaning: "no-score-notes-sounding" }) });
            for (const span of covered) {
                if (compareQ(gapStart, span.startQ) < 0) pushGap({ startQ: gapStart, endQ: span.startQ });
                gapStart = maxQ(gapStart, span.endQ);
            }
            if (compareQ(gapStart, resolvedRange.endQ) < 0) pushGap({ startQ: gapStart, endQ: resolvedRange.endQ });
            return { ref, name: track.name, isMute: track.isMute, trackKind: "score" };
        });
        candidates.sort((a, b) => compareQ(a.range.startQ, b.range.startQ));
        const query = JSON.stringify({ method: "musical", range: request.range, context: request.context, detail: request.detail ?? "standard", trackRefs: request.trackRefs, noteFilter: request.noteFilter ?? "overlap" });
        return this.page(snapshot, query, candidates, request, { requestedRange: request.range, targetRange, resolvedRange, resolvedTracks,
            resolvedSelection: request.range.kind === "selection" ? (request.range.source === "melody" ? selection : timeline.outlineSelection()) : null,
            capturedMelodySelectionStatus: selectionState.selectionStatus, selectionError: selectionState.selectionError,
            contextAtStart: this.contextAt(timeline, resolvedRange), detail: request.detail ?? "standard", noteFilter: request.noteFilter ?? "overlap" });
    }
}
