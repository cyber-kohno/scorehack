import { get } from "svelte/store";
import TonalityTheory from "../../../domain/theory/tonality-theory";
import RhythmTheory from "../../../domain/theory/rhythm-theory";
import { controlStore, dataStore, playbackStore, settingsStore } from "../../../store/global-store";
import MelodyState from "../../../store/state/data/melody-state";
import type PianoEditorState from "../../../store/state/data/arrange/piano/piano-editor-state";
import PlaybackState from "../../../store/state/playback-state";
import EditorPlaybackResult from "./editor-playback-result";
import PianoArrangePatternNote from "./piano-arrange-pattern-note";

const playbackPianoEditor = () => {
    const control = get(controlStore);
    const data = get(dataStore);
    const playback = get(playbackStore);
    const settings = get(settingsStore);

    const arrange = control.outline.arrange;
    if (arrange == null || arrange.method !== "piano" || arrange.editor == undefined) {
        throw new Error("Piano editor playback requires active piano editor.");
    }

    const editor = arrange.editor as PianoEditorState.Value;
    const track = data.arrange.tracks[control.outline.trackIndex];
    if (track == undefined || track.method !== "piano") {
        throw new Error("Piano editor playback requires active piano track.");
    }
    if (track.instRef == undefined) return EditorPlaybackResult.instNotSet();

    const player = PlaybackState.getInstPlayer(track.instRef, playback);
    if (player == undefined) return EditorPlaybackResult.playerNotReady();

    const chord = arrange.target.compiledChord.chord;
    const unit: PianoEditorState.Unit = {
        voicingSounds: editor.voicing.items,
        layers: editor.backing?.layers ?? null,
    };
    const beatDiv16Cnt = RhythmTheory.getBeatDiv16Count(arrange.target.scoreBase.rhythm.ts);
    const beatRate = beatDiv16Cnt / 4;
    const beatSize =
        arrange.target.beat.num +
        (-arrange.target.beat.eatHead + arrange.target.beat.eatTail) / beatDiv16Cnt;
    const sustainBeat = beatSize * beatRate;
    const notes = PianoArrangePatternNote.createNotes(unit, chord, { sustainBeat });
    if (notes.length === 0) return EditorPlaybackResult.ignored();

    playback.timerKeys = [];
    playback.intervalKeys = [];

    const msPerBeatNote = 60000 / (arrange.target.scoreBase.tempo * beatRate);

    let endMs = 0;
    notes.forEach((note) => {
        const side = MelodyState.calcBeatSide(note);
        const startBeatNote = side.pos;
        const sustainBeatNote = note.norm.tuplets != undefined
            ? side.len
            : RhythmTheory.getSwungBeatNoteDuration(
                arrange.target.scoreBase.rhythm,
                settings.playback.swing,
                startBeatNote,
                side.len,
            );
        const startMs = msPerBeatNote * (
            note.norm.tuplets != undefined
                ? startBeatNote
                : RhythmTheory.getSwungBeatNoteDuration(
                    arrange.target.scoreBase.rhythm,
                    settings.playback.swing,
                    0,
                    startBeatNote,
                )
        );
        const sustainMs = sustainBeatNote * msPerBeatNote;
        const pitchName = TonalityTheory.getKey12FullName(note.pitch);
        const gain = 5 * (track.volume / 10) * (note.velocity / 10);

        const key = setTimeout(() => {
            player.play(pitchName, 0, {
                gain,
                duration: sustainMs / 1000,
            });
        }, startMs);
        playback.timerKeys?.push(key);

        const tailMs = startMs + sustainMs;
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

export default playbackPianoEditor;
