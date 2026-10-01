import { get } from "svelte/store";
import TonalityTheory from "../../../domain/theory/tonality-theory";
import RhythmTheory from "../../../domain/theory/rhythm-theory";
import { controlStore, dataStore, playbackStore, settingsStore } from "../../../store/global-store";
import DrumEditorState from "../../../store/state/data/arrange/drum/drum-editor-state";
import MelodyState from "../../../store/state/data/melody-state";
import PlaybackState from "../../../store/state/playback-state";
import DrumArrangePatternNote from "./drum-arrange-pattern-note";
import EditorPlaybackResult from "./editor-playback-result";

const playbackDrumEditor = () => {
    const control = get(controlStore);
    const data = get(dataStore);
    const playback = get(playbackStore);
    const settings = get(settingsStore);

    const arrange = control.outline.arrange;
    if (arrange == null || arrange.method !== "drum" || arrange.editor == undefined) {
        throw new Error("Drum editor playback requires active drum editor.");
    }

    const editor = arrange.editor as DrumEditorState.Value;
    const track = data.arrange.tracks[control.outline.trackIndex];
    if (track == undefined || track.method !== "drum") {
        throw new Error("Drum editor playback requires active drum track.");
    }
    if (track.instRef == undefined) return EditorPlaybackResult.instNotSet();

    const player = PlaybackState.getInstPlayer(track.instRef, playback);
    if (player == undefined) return EditorPlaybackResult.playerNotReady();

    const pattern = DrumEditorState.createPatternData(editor);
    const notes = DrumArrangePatternNote.createNotes(
        {
            mappings: track.bank.mappings,
            pattern,
        },
        {
            beat: arrange.target.beat,
            ts: arrange.target.scoreBase.rhythm.ts,
        },
    );

    playback.timerKeys = [];
    playback.intervalKeys = [];

    const beatRate = RhythmTheory.getBeatDiv16Count(arrange.target.scoreBase.rhythm.ts) / 4;
    const msPerBeatNote = 60000 / (arrange.target.scoreBase.tempo * beatRate);
    const patternDurationMs = DrumEditorState.getPatternBeatLength(
        pattern.criteriaDiv,
        arrange.target.beat,
        arrange.target.scoreBase.rhythm.ts,
    ) * msPerBeatNote;
    if (notes.length === 0 && patternDurationMs === 0) return EditorPlaybackResult.ignored();

    let endMs = patternDurationMs;
    notes.forEach((note) => {
        const side = MelodyState.calcBeatSide(note);
        const startBeatNote = side.pos;
        const startMs = msPerBeatNote * RhythmTheory.getSwungBeatNoteDuration(
            arrange.target.scoreBase.rhythm,
            settings.playback.swing,
            0,
            startBeatNote,
        );
        const pitchName = TonalityTheory.getKey12FullName(note.pitch);
        const gain = 5 * (track.volume / 10) * (note.velocity / 10);
        const durationSec = Math.max(0.2, side.len * msPerBeatNote / 1000);

        const key = setTimeout(() => {
            player.play(pitchName, 0, {
                gain,
                duration: durationSec,
            });
        }, startMs);
        playback.timerKeys?.push(key);

        const tailMs = startMs + durationSec * 1000;
        if (endMs < tailMs) endMs = tailMs;
    });

    const endKey = setTimeout(() => {
        const current = get(playbackStore);
        if (current.timerKeys == null) return;

        current.timerKeys.forEach(key => clearTimeout(key));
        current.timerKeys = null;
        current.intervalKeys = null;
        current.linePos = -1;
        current.sfItems.forEach(sf => sf.player?.stop());
        current.userSfItems.forEach(sf => sf.player?.stop());
        playbackStore.set({ ...current });
    }, endMs);
    playback.timerKeys.push(endKey);

    playbackStore.set({ ...playback });
    return EditorPlaybackResult.ok(endMs);
};

export default playbackDrumEditor;
