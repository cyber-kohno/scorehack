import test from "node:test";
import assert from "node:assert/strict";
import { ScoreQueryService } from "../src/system/service/score-query/score-query-service.ts";
import { MusicTimeline } from "../src/system/service/score-query/music-timeline.ts";
import { SnapshotRepository } from "../src/system/service/score-query/snapshot-repository.ts";
import buildDerived from "../src/system/service/derived/build-derived.ts";
import { catalogSchema, musicalSchema, outlineSchema } from "../src/system/service/mcp/mcp-query-schema.ts";
import { addQ, compareQ, divQ, fromNumber, noteRangeQ, q } from "../src/system/domain/time/rational.ts";
import { describePitchInChord } from "../src/system/domain/theory/pitch-context.ts";

const init = (cnt = 4, unit = 4, scale = "major", key12 = 0) => ({ type: "init", data: {
    rhythm: { ts: { cnt, unit }, feel: { type: "straight" } }, tempo: 100, tonality: { key12, scale },
} });
const chord = (index = 0, beat = 4, eat = 0, symbol = "") => ({ type: "chord", data: { degree: { index, symbol }, beat, eat } });
const note = (pos, len, pitch = 48, div = 1, tuplets) => ({ pos, len, pitch, norm: { div, ...(tuplets ? { tuplets } : {}) } });
const track = (notes = [], name = "track0") => ({ name, notes, isMute: false, volume: 10 });
export const sourceFixture = () => ({
    data: { elements: [init(), { type: "section", data: { name: "verse" } }, chord(), chord(4)],
        scoreTracks: [track()], arrange: { tracks: [] }, audioTracks: [] },
    control: { mode: "melody", melody: { trackIndex: 0, focus: -1, focusLock: -1, cursor: note(0, 1) },
        outline: { trackIndex: 0, focus: 2, focusLock: -1 } },
    scoreName: "fixture", dirty: true,
    settings: { view: { timeline: { beatWidth: 120, chordNameMode: "degree" } },
        notation: { degreeBasis: "tonality" }, playback: { swing: { eighthRatio: 2, sixteenthRatio: 1.6 } } },
});

function setup(source = sourceFixture()) {
    let now = 1000, counter = 0;
    const service = new ScoreQueryService(() => source, () => now, () => `test-id-${++counter}`);
    return { source, service, advance: amount => { now += amount; } };
}
const all = { kind: "all" };
const musical = (service, snapshotId, extra = {}) => service.musical({ snapshotId, trackRefs: ["score:0"], range: all, detail: "harmonic", ...extra });
const collect = (call, request) => {
    const first = call(request), items = [...first.items];
    let response = first;
    while (response.page.nextCursor) {
        response = call({ ...request, snapshotId: first.snapshotId, cursor: response.page.nextCursor });
        items.push(...response.items);
    }
    return { ...first, items };
};

test("exact tuplets and equivalent encodings do not lose a boundary", () => {
    assert.deepEqual(noteRangeQ(note(1, 1, 48, 1, 3)), { startQ: q(1, 3), endQ: q(2, 3) });
    assert.deepEqual(addQ(q(1, 3), q(2, 3)), q(1));
    assert.equal(compareQ(divQ(fromNumber(0.5), q(3)), q(1, 6)), 0);
    assert.deepEqual(noteRangeQ(note(8, 4, 48, 4)), noteRangeQ(note(2, 1)));
});

test("shared derived builder retains UI timing, positions and compiled harmony without mutating input", () => {
    const source = sourceFixture(); source.data.elements[2].data.eat = -1;
    const before = JSON.stringify(source);
    const derived = buildDerived(source.data, source.settings);
    assert.equal(JSON.stringify(source), before);
    assert.equal(derived.chordCaches[0].lengthBeatNote, 3.75);
    assert.equal(derived.chordCaches[1].viewPosLeft, 450);
    assert.equal(derived.chordCaches[1].lengthBeatNote, 4.25);
    assert.equal(derived.chordCaches[1].compiledChord.chord.key12, 7);
    assert.equal(derived.baseCaches[0].startBar, 1);
    assert.equal(derived.baseCaches[0].lengthBeatNote, 8);
});

test("6/8 uses dotted-quarter beats while retaining quarter-note coordinates", () => {
    const { source, service } = setup();
    source.data.elements = [init(6, 8), chord(0, 2), chord(4, 2)];
    source.data.scoreTracks[0].notes = [note(4, 0.5)];
    const result = musical(service, service.overview().snapshotId);
    const n = result.items.find(item => item.kind === "note");
    assert.equal(n.start.bar, 2); assert.equal(n.start.beat, 1);
    assert.deepEqual(n.start.offsetInBeatQ, q(1)); assert.deepEqual(n.start.beatUnitQ, q(3, 2));
    const bars = service.outline({ snapshotId: result.snapshotId, range: { kind: "bars", fromBar: 2, throughBar: 2 } });
    assert.deepEqual(bars.targetRange, { startQ: q(3), endQ: q(6) });
});

test("meter changes preserve exact global Q and the UI's bar numbering", () => {
    const { source, service } = setup();
    source.data.elements = [init(), chord(), { type: "rhythm", data: { newRhythm: { ts: { cnt: 6, unit: 8 }, feel: { type: "straight" } } } }, chord(0, 2)];
    const id = service.overview().snapshotId;
    const result = service.outline({ snapshotId: id, range: { kind: "bars", fromBar: 2, throughBar: 2 } });
    assert.deepEqual(result.targetRange, { startQ: q(4), endQ: q(7) });
    assert.deepEqual(result.contextAtStart.rhythm.ts, { cnt: 6, unit: 8 });
});

test("held notes are returned with original span, clipped overlap and chord-specific relations", () => {
    const { source, service } = setup(); source.data.scoreTracks[0].notes = [note(3, 2, 52)];
    const id = service.overview().snapshotId;
    const result = musical(service, id, { range: { kind: "bars", fromBar: 2, throughBar: 2 } });
    const n = result.items.find(item => item.kind === "note");
    assert.deepEqual(n.range, { startQ: q(3), endQ: q(5) });
    assert.deepEqual(n.overlap, { startQ: q(4), endQ: q(5) });
    assert.equal(n.contexts[0].chords[0].absoluteChord, "G");
    const onset = musical(service, id, { range: { kind: "bars", fromBar: 2, throughBar: 2 }, noteFilter: "onset" });
    assert.equal(onset.items.filter(item => item.kind === "note").length, 0);
    assert.deepEqual(onset.items.find(item => item.kind === "gap").range, { startQ: q(5), endQ: q(8) });
});

test("negative eat moves the actual chord boundary, not just its duration", () => {
    const { source, service } = setup(); source.data.elements[2].data.eat = -1;
    source.data.scoreTracks[0].notes = [note(7, 1, 52, 2)];
    const result = musical(service, service.overview().snapshotId);
    const n = result.items.find(item => item.kind === "note");
    assert.equal(n.contexts.length, 2);
    assert.deepEqual(n.contexts[0].range.endQ, q(15, 4));
    assert.equal(n.contexts[0].chords[0].absoluteChord, "C");
    assert.equal(n.contexts[1].chords[0].absoluteChord, "G");
    const g = result.items.find(item => item.kind === "chord" && item.absoluteChord === "G");
    assert.deepEqual(g.nominalRange.startQ, q(4)); assert.deepEqual(g.range.startQ, q(15, 4));
});

test("final syncopation separates sounding outline from nominal score extent", () => {
    for (const eat of [-1, 1]) {
        const { source, service } = setup();
        source.data.elements = [init(), chord(0, 4, eat)];
        source.data.scoreTracks[0].notes = [note(15, 2, 48, 4)];
        const overview = service.overview();
        assert.deepEqual(overview.outlineRange.endQ, q(16 + eat, 4));
        assert.deepEqual(overview.scoreRange.endQ, q(17, 4));
        const contexts = musical(service, overview.snapshotId).items.find(item => item.kind === "note").contexts;
        assert.deepEqual(contexts.map(context => context.harmonyStatus), eat < 0 ? ["outside-outline"] : ["assigned"]);
    }
});

test("9/8 and 12/8 bars retain dotted-quarter beat positions", () => {
    for (const cnt of [9, 12]) {
        const { source, service } = setup();
        source.data.elements = [init(cnt, 8), chord(0, cnt / 3), chord(4, cnt / 3)];
        source.data.scoreTracks[0].notes = [note(cnt / 2, 0.5)];
        const overview = service.overview();
        const result = musical(service, overview.snapshotId, { range: { kind: "bars", fromBar: 2, throughBar: 2 } });
        assert.deepEqual(result.targetRange, { startQ: q(cnt, 2), endQ: q(cnt) });
        const n = result.items.find(item => item.kind === "note");
        assert.equal(n.start.bar, 2); assert.equal(n.start.beat, 1);
        assert.deepEqual(n.start.beatUnitQ, q(3, 2));
    }
});

test("slash bass is distinguished from chord membership", () => {
    const cOverD = { key12: 0, symbol: "", on: { key12: 2 } };
    assert.equal(describePitchInChord(48, cOverD).isChordTone, true);
    assert.equal(describePitchInChord(48, cOverD).isBassPitchClass, false);
    assert.equal(describePitchInChord(50, cOverD).isChordTone, false);
    assert.equal(describePitchInChord(50, cOverD).isBassPitchClass, true);
});

test("a note is not split, but its degree changes across an explicit modulation", () => {
    const { source, service } = setup();
    source.data.elements = [init(), chord(), { type: "modulate", data: { method: "key", val: 2 } }, chord()];
    source.data.scoreTracks[0].notes = [note(7, 2, 52, 2)];
    const result = musical(service, service.overview().snapshotId);
    const notes = result.items.filter(item => item.kind === "note");
    assert.equal(notes.length, 1);
    assert.deepEqual(notes[0].contexts.map(context => context.degree), ["3", "2"]);
    assert.deepEqual(notes[0].contexts.map(context => context.chords[0].relation.isChordTone), [true, false]);
});

test("anticipated new-key harmony keeps chord's key distinct from the note's current key", () => {
    const { source, service } = setup();
    source.data.elements = [init(), chord(0, 4, -1), { type: "modulate", data: { method: "key", val: 2 } }, chord()];
    source.data.scoreTracks[0].notes = [note(15, 1, 54, 4)];
    const result = musical(service, service.overview().snapshotId);
    const context = result.items.find(item => item.kind === "note").contexts[0];
    assert.equal(context.key.name, "Cmajor"); assert.equal(context.chords[0].key.name, "Dmajor");
    assert.equal(context.chords[0].absoluteChord, "D");
});

test("minor local degrees and relative-major display degrees are distinguished", () => {
    const { source, service } = setup();
    source.data.elements = [init(4, 4, "minor", 9), chord(0, 4, 0, "m")];
    source.settings.notation.degreeBasis = "relative-major";
    source.data.scoreTracks[0].notes = [note(0, 1, 57), note(1, 1, 60)];
    const result = musical(service, service.overview().snapshotId);
    const c = result.items.find(item => item.kind === "note").contexts[0];
    assert.equal(c.degree, "1"); assert.equal(c.displayDegree, "6");
    const harmony = result.items.find(item => item.kind === "chord");
    assert.equal(harmony.degree, "Im"); assert.equal(harmony.displayDegree, "VIm");
    const third = result.items.filter(item => item.kind === "note")[1].contexts[0];
    assert.equal(third.degree, "b3"); assert.equal(third.diatonicScaleStep, 3); assert.equal(third.displayDegree, "1");
});

test("duplicate names across track families do not change the explicit target", () => {
    const { source, service } = setup();
    source.data.scoreTracks = [track([note(0, 1, 48)]), track([note(0, 1, 52)])];
    source.data.audioTracks = [{ name: "track0", pathRef: { path: "private.wav" }, isMute: false, volume: 10 }];
    source.control.melody.trackIndex = 1;
    const editor = service.editor();
    assert.equal(editor.melody.track.ref, "score:1"); assert.equal(editor.melody.selection, null);
    assert.equal(editor.melody.cursorIsSelection, false);
    const result = musical(service, editor.snapshotId, { trackRefs: ["score:1"] });
    assert.equal(result.items.find(item => item.kind === "note").pitch.index, 52);
    assert.throws(() => musical(service, editor.snapshotId, { trackRefs: ["audio:0"] }), { code: "UNSUPPORTED_TRACK" });
    assert.ok(!JSON.stringify(service.overview({ snapshotId: editor.snapshotId })).includes("private.wav"));
});

test("captured selection resolves exact chosen notes independently of the cursor and later UI changes", () => {
    const { source, service } = setup(); source.data.scoreTracks[0].notes = [note(2, 1), note(5, 1), note(0, 1)];
    source.data.scoreTracks[0].notes.push(note(3, 1));
    source.control.melody.focus = 0; source.control.melody.focusLock = 1;
    const editor = service.editor();
    assert.deepEqual(editor.melody.selection.noteRefs, ["note:0:0", "note:0:1"]);
    assert.deepEqual(editor.melody.selection.range, { startQ: q(2), endQ: q(6) });
    source.control.melody.focus = 2; source.control.melody.focusLock = -1;
    const result = musical(service, editor.snapshotId, { range: { kind: "selection", source: "melody" } });
    assert.deepEqual(result.targetRange, { startQ: q(2), endQ: q(6) });
    assert.equal(result.resolvedSelection.count, 2);
    assert.equal(result.items.find(item => item.ref === "note:0:3").isSelected, false);
    assert.equal(result.items.find(item => item.ref === "note:0:0").isSelected, true);
});

test("no selection and point-only outline selections do not silently become cursor ranges", () => {
    const { source, service } = setup();
    const editor = service.editor();
    assert.throws(() => musical(service, editor.snapshotId, { range: { kind: "selection", source: "melody" } }), { code: "NO_SELECTION_RANGE" });
    source.control.outline.focus = 0;
    const point = service.editor();
    assert.equal(point.outline.selection.range, null);
    assert.throws(() => service.outline({ snapshotId: point.snapshotId, range: { kind: "selection", source: "outline" } }), { code: "NO_SELECTION_RANGE" });
});

test("snapshot freezes edits, track switching, score replacement, settings and returned DTOs", () => {
    const { source, service } = setup(); source.data.scoreTracks[0].notes = [note(0, 1)];
    const overview = service.overview();
    source.data.scoreTracks[0].notes[0].pitch = 55; source.scoreName = "another score";
    source.settings.notation.degreeBasis = "relative-major";
    const old = musical(service, overview.snapshotId);
    assert.equal(old.scoreName, "fixture"); assert.equal(old.items.find(item => item.kind === "note").pitch.index, 48);
    old.items.find(item => item.kind === "chord").range.startQ.numerator = 999;
    assert.deepEqual(musical(service, overview.snapshotId).items.find(item => item.kind === "chord").range.startQ, q(0));
    const fresh = service.overview(); assert.equal(fresh.scoreName, "another score");
});

test("snapshots expire, are evicted and are cleared at session boundaries", () => {
    const { service, advance } = setup(); const old = service.overview().snapshotId;
    advance(120000); assert.throws(() => service.editor({ snapshotId: old }), { code: "SNAPSHOT_NOT_AVAILABLE" });
    const first = service.overview().snapshotId;
    for (let i = 0; i < 4; i++) service.overview();
    assert.throws(() => service.editor({ snapshotId: first }), { code: "SNAPSHOT_NOT_AVAILABLE" });
    const last = service.overview().snapshotId; service.clear();
    assert.throws(() => service.editor({ snapshotId: last }), { code: "SNAPSHOT_NOT_AVAILABLE" });
});

test("paging keeps all records without implying missing pages are rests", () => {
    const { source, service } = setup(); source.data.scoreTracks[0].notes = Array.from({ length: 16 }, (_, i) => note(i / 2, 0.5));
    const id = service.overview().snapshotId;
    const request = { snapshotId: id, trackRefs: ["score:0"], range: all, detail: "harmonic", limit: 2 };
    const first = service.musical(request); assert.equal(first.page.complete, false);
    const full = collect(args => service.musical(args), request);
    assert.equal(full.items.filter(item => item.kind === "note").length, 16);
    assert.equal(full.items.filter(item => item.kind === "gap").length, 0);
    assert.throws(() => service.musical({ ...request, detail: "standard", cursor: first.page.nextCursor }), { code: "INVALID_CURSOR" });
});

test("overlapping polyphonic notes produce silence from their union", () => {
    const { source, service } = setup(); source.data.scoreTracks[0].notes = [note(0, 3), note(1, 4), note(6, 1)];
    const result = musical(service, service.overview().snapshotId);
    assert.deepEqual(result.items.filter(item => item.kind === "gap").map(item => item.range), [
        { startQ: q(5), endQ: q(6) }, { startQ: q(7), endQ: q(8) },
    ]);
});

test("unassigned harmony, outside-outline and unrequested detail remain distinct", () => {
    const { source, service } = setup(); delete source.data.elements[3].data.degree;
    source.data.scoreTracks[0].notes = [note(7, 2)];
    const id = service.overview().snapshotId;
    const n = musical(service, id).items.find(item => item.kind === "note");
    assert.deepEqual(n.contexts.map(context => context.harmonyStatus), ["unassigned", "outside-outline"]);
    const standard = musical(service, id, { detail: "standard" }).items.find(item => item.kind === "note");
    assert.equal(standard.contexts, null); assert.equal(standard.contextStatus, "not-requested");
});

test("section and chord refs, duplicate section names and surrounding bars resolve explicitly", () => {
    const { source, service } = setup();
    source.data.elements.push({ type: "section", data: { name: "verse" } }, chord());
    const id = service.overview().snapshotId;
    const section = service.outline({ snapshotId: id, range: { kind: "section", sectionRef: "section:4" } });
    assert.deepEqual(section.targetRange, { startQ: q(8), endQ: q(12) });
    const padded = service.outline({ snapshotId: id, range: { kind: "chord", chordRef: "chord:1" }, context: { beforeBars: 1, afterBars: 1 } });
    assert.deepEqual(padded.resolvedRange, { startQ: q(0), endQ: q(12) });
    assert.throws(() => service.outline({ snapshotId: id, range: { kind: "section", sectionRef: "verse" } }), { code: "INVALID_REFERENCE" });
});

test("bounded catalog can be continued, and huge single items fail explicitly", () => {
    const { source, service } = setup(); source.data.scoreTracks = Array.from({ length: 140 }, () => track());
    const overview = collect(args => service.overview(args), { limit: 8 });
    assert.equal(overview.items.filter(item => item.kind === "track").length, 140);
    assert.equal(overview.scoreTracksComplete, false);
    source.data.scoreTracks = [track([{ ...note(0, 1), pron: "x".repeat(200000) }])];
    const id = service.overview().snapshotId;
    assert.throws(() => collect(args => musical(service, id, args), {}), { code: "RESULT_ITEM_TOO_LARGE" });
});

test("wire validation rejects bad fractions, reversed bars, duplicate targets and unknown fields", () => {
    assert.equal(outlineSchema.safeParse({ snapshotId: "s", range: { kind: "q", startQ: { numerator: 0, denominator: 0 }, endQ: q(1) } }).success, false);
    assert.equal(outlineSchema.safeParse({ snapshotId: "s", range: { kind: "bars", fromBar: 3, throughBar: 2 } }).success, false);
    assert.equal(musicalSchema.safeParse({ snapshotId: "s", range: all, trackRefs: ["score:0", "score:0"] }).success, false);
    assert.equal(catalogSchema.safeParse({ sql: "anything" }).success, false);
});

test("queries leave the live score and control untouched", () => {
    const { source, service } = setup(); source.data.scoreTracks[0].notes = [note(0, 1)];
    const before = JSON.stringify(source); const editor = service.editor();
    service.overview({ snapshotId: editor.snapshotId });
    service.outline({ snapshotId: editor.snapshotId, range: all }); musical(service, editor.snapshotId);
    assert.equal(JSON.stringify(source), before);
});

test("stale inactive selections are reported without blocking explicit-track queries", () => {
    const { source, service } = setup(); source.control.melody.trackIndex = 99; source.control.melody.focus = 2;
    source.control.mode = "harmonize";
    const editor = service.editor();
    assert.equal(editor.melody.track, null); assert.equal(editor.melody.selectionStatus, "invalid");
    const result = musical(service, editor.snapshotId);
    assert.equal(result.capturedMelodySelectionStatus, "invalid");
    assert.throws(() => musical(service, editor.snapshotId, { range: { kind: "selection", source: "melody" } }), { code: "INVALID_SELECTION" });
});
