import test, { beforeEach } from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { SpessaSynthLogging } from "spessasynth_core";
import loadAudio from "audio-loader";
import noteParser from "note-parser";

SpessaSynthLogging(false, false, false);

// Exercise the production WAV pipeline and MIDI encoder. Replace only native
// WebAudio/SoundFont/file boundaries; no user's sound banks or files are touched.
const mocks = {
    "soundfont-player": `export default { async instrument(context, name, options) {
        const harness = globalThis.__wavHarness;
        // MIDI.js samples use flat keys. Use the real loader's exact-key filter,
        // then the same MIDI normalization as sample-player, without decoding audio.
        const loaded = await harness.loadAudio({}, harness.samples, { only: options.notes });
        const pitches = new Set(Object.keys(loaded).map(harness.toMidi));
        harness.builtinRequests.push({ name, notes: options.notes, loaded: Object.keys(loaded) });
        return { play(pitch, startSec) {
            if (!pitches.has(harness.toMidi(pitch))) { harness.missing.push(pitch); return; }
            context.schedule(startSec, "builtin");
        } };
    } };`,
    "spessasynth_lib": `export class WorkletSynthesizer {
        constructor(context) { this.context = context; }
        connect() {}
        async startOfflineRender(options) {
            globalThis.__wavHarness.requests.push(options);
            const midi = options.midiSequence;
            const skip = options.sequencerOptions.skipToFirstNoteOn ?? true;
            const offset = skip ? midi.midiTicksToSeconds(midi.firstNoteOn) : 0;
            for (const track of midi.tracks) for (const event of track.events) {
                if ((event.statusByte & 0xf0) === 0x90 && event.data[1] > 0)
                    this.context.schedule(midi.midiTicksToSeconds(event.ticks) - offset, "soundfont");
            }
        }
        destroy() { globalThis.__wavHarness.destroyed++; }
    }`,
    "spessasynth_lib/dist/spessasynth_processor.min.js?url": `export default "mock-worklet";`,
    "@tauri-apps/plugin-fs": `export async function readFile() { return new Uint8Array([0]); }
        export async function readTextFile() { throw new Error("unexpected read"); }
        export async function writeFile() { throw new Error("unexpected write"); }
        export async function writeTextFile() { throw new Error("unexpected write"); }`,
};
registerHooks({
    resolve(specifier, context, nextResolve) {
        if (specifier in mocks) return { shortCircuit: true,
            url: `data:text/javascript,${encodeURIComponent(mocks[specifier])}` };
        return nextResolve(specifier, context);
    },
});

class OfflineAudioContextMock {
    constructor({ numberOfChannels, length, sampleRate }) {
        this.sampleRate = sampleRate;
        this.channels = Array.from({ length: numberOfChannels }, () => new Float32Array(length));
        this.destination = {};
        this.audioWorklet = { addModule: async () => {} };
        this.events = [];
        globalThis.__wavHarness.contexts.push(this);
    }
    schedule(startSec, source) {
        this.events.push({ startSec, source });
        const index = Math.round(startSec * this.sampleRate);
        for (const channel of this.channels) channel[index] += 0.25;
    }
    async startRendering() {
        return { numberOfChannels: this.channels.length, sampleRate: this.sampleRate,
            length: this.channels[0].length, getChannelData: index => this.channels[index] };
    }
}
globalThis.OfflineAudioContext = OfflineAudioContextMock;
const { default: createScoreWav } = await import("../src/system/service/export/audio/create-score-wav.ts");
const { default: buildDerived } = await import("../src/system/service/derived/build-derived.ts");
const { default: NoteName } = await import("../src/system/infra/audio/note-name.ts");

beforeEach(() => {
    const names = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
    const samples = Object.fromEntries(Array.from({ length: 88 }, (_, i) => {
        const midi = i + 21; // Actual builtin sample range: A0 through C8.
        return [`${names[midi % 12]}${Math.floor(midi / 12) - 1}`, "sample"];
    }));
    globalThis.__wavHarness = { contexts: [], requests: [], destroyed: 0,
        builtinRequests: [], missing: [], samples, loadAudio, toMidi: noteParser.midi };
});
const inst = source => source === "builtin" ? { source, name: "violin" }
    : { source, definitionName: "piano", bank: 0, program: 0 };
function fixture(melodySource = "builtin", arrangeSource = "soundfont", intro = 16, melodyStart = intro + 0.5) {
    const data = {
        elements: [
            { type: "init", data: { rhythm: { ts: { cnt: 4, unit: 4 }, feel: { type: "straight" } },
                tempo: 80, tonality: { key12: 0, scale: "major" } } },
            ...(intro ? [{ type: "chord", data: { beat: intro, eat: 0 } }] : []),
            { type: "chord", data: { beat: 4, eat: 0, degree: { index: 0, symbol: "" } } },
        ],
        scoreTracks: [{ name: "melody", instRef: inst(melodySource), volume: 10, isMute: false,
            notes: [{ norm: { div: 1 }, pos: melodyStart, len: 1, pitch: 48 }] }],
        arrange: { tracks: [{ name: "piano", method: "piano", instRef: inst(arrangeSource), volume: 10, isMute: false,
            relations: [{ chordSeq: intro ? 1 : 0, sndsPatt: 0, bkgPatt: -1 }],
            bank: { soundsPatterns: [{ no: 0, sounds: ["3.0"] }], backingPatterns: [], regulars: [] } }] },
        audioTracks: [],
    };
    const settings = {
        view: { timeline: { beatWidth: 120, chordNameMode: "degree" } },
        playback: { swing: { eighthRatio: 2, sixteenthRatio: 1.6 } },
        userSoundFonts: [{ name: "piano", filePath: "mock.sf2" }], envs: { HOME_DIR: "" },
    };
    return { data, settings, derived: buildDerived(data, settings), sampleRate: 100 };
}
const firstPcmFrame = bytes => {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    assert.equal(view.getUint32(24, true), 100);
    for (let offset = 44; offset < bytes.length; offset += 4)
        if (view.getInt16(offset, true) !== 0 || view.getInt16(offset + 2, true) !== 0) return (offset - 44) / 4;
    return null;
};

test("export WAV preserves a four-bar silent intro with builtin melody and SoundFont accompaniment", async () => {
    const props = fixture();
    const before = JSON.stringify(props);
    const bytes = await createScoreWav(props);
    const context = globalThis.__wavHarness.contexts.at(-1);
    assert.deepEqual(context.events, [
        { source: "soundfont", startSec: 12 }, { source: "builtin", startSec: 12.375 },
    ]);
    assert.equal(firstPcmFrame(bytes), 1200);
    assert.equal(globalThis.__wavHarness.requests[0].sequencerOptions.skipToFirstNoteOn, false);
    assert.equal(globalThis.__wavHarness.destroyed, 1);
    assert.equal(JSON.stringify(props), before);
});

test("SoundFont melody also retains its own later entry against builtin accompaniment", async () => {
    const bytes = await createScoreWav(fixture("soundfont", "builtin", 16, 18));
    assert.deepEqual(globalThis.__wavHarness.contexts.at(-1).events, [
        { source: "soundfont", startSec: 13.5 }, { source: "builtin", startSec: 12 },
    ]);
    assert.equal(firstPcmFrame(bytes), 1200);
});

test("independent SoundFont tracks are not aligned to their individual first notes", async () => {
    await createScoreWav(fixture("soundfont", "soundfont", 16, 18));
    assert.deepEqual(globalThis.__wavHarness.contexts.at(-1).events, [
        { source: "soundfont", startSec: 13.5 }, { source: "soundfont", startSec: 12 },
    ]);
    assert.equal(globalThis.__wavHarness.destroyed, 2);
});

test("a score without a silent intro still starts at zero", async () => {
    const bytes = await createScoreWav(fixture("builtin", "soundfont", 0, 0));
    assert.ok(globalThis.__wavHarness.contexts.at(-1).events.every(event => event.startSec === 0));
    assert.equal(firstPcmFrame(bytes), 0);
});

test("builtin melody exports every chromatic pitch with both short and long notes", async () => {
    const props = fixture("builtin", "builtin", 0, 0);
    props.data.arrange.tracks = [];
    props.data.scoreTracks[0].notes = Array.from({ length: 24 }, (_, i) => ({
        norm: { div: 1 }, pos: i * 2, len: i < 12 ? 0.25 : 1.5, pitch: 48 + i % 12,
    }));
    props.data.elements[1].data.beat = 48;
    props.derived = buildDerived(props.data, props.settings);
    const before = JSON.stringify(props.data);
    const bytes = await createScoreWav(props);
    const harness = globalThis.__wavHarness;
    assert.deepEqual(harness.missing, []);
    assert.deepEqual(harness.builtinRequests[0].notes,
        ["C4", "Db4", "D4", "Eb4", "E4", "F4", "Gb4", "G4", "Ab4", "A4", "Bb4", "B4"]);
    assert.deepEqual(harness.builtinRequests[0].loaded, harness.builtinRequests[0].notes);
    assert.equal(harness.contexts.at(-1).events.length, 24);
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    for (let i = 0; i < 24; i++) {
        const frame = Math.round(i * 2 * 0.75 * props.sampleRate);
        assert.notEqual(view.getInt16(44 + frame * 4, true), 0, `missing pitch ${48 + i % 12} at note ${i}`);
    }
    assert.equal(JSON.stringify(props.data), before);
});

test("builtin accompaniment also loads accidental pitches without dropping notes", async () => {
    const props = fixture("builtin", "builtin", 0, 0);
    props.data.scoreTracks[0].isMute = true;
    props.data.elements[0].data.tonality.key12 = 6; // F# major: F#, A#, C#.
    props.data.arrange.tracks[0].bank.soundsPatterns[0].sounds = ["3.0", "3.1", "3.2"];
    props.derived = buildDerived(props.data, props.settings);
    await createScoreWav(props);
    const harness = globalThis.__wavHarness;
    assert.deepEqual(harness.missing, []);
    const request = harness.builtinRequests[0];
    assert.deepEqual(request.notes, ["Gb3", "Bb3", "Db4"]);
    assert.deepEqual([...request.loaded].sort(), [...request.notes].sort());
    assert.equal(harness.contexts.at(-1).events.length, request.notes.length);
});

test("MIDI.js sample keys preserve pitch and octave for sharp, flat, and natural names", () => {
    const sharps = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const flats = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
    for (const octave of [-1, 0, 3, 4, 7, 8]) {
        for (let pitch = 0; pitch < 12; pitch++) {
            const expected = `${flats[pitch]}${octave}`;
            for (const input of [`${sharps[pitch]}${octave}`, expected]) {
                const key = NoteName.toMidiJsSoundFontKey(input);
                assert.equal(key, expected);
                assert.equal(NoteName.toMidiNumber(key), NoteName.toMidiNumber(input));
            }
        }
    }
});
