import { get } from "svelte/store";
import TonalityTheory from "../../../domain/theory/tonality-theory";
import RhythmTheory from "../../../domain/theory/rhythm-theory";
import { controlStore, dataStore, playbackStore } from "../../../store/global-store";
import MelodyState from "../../../store/state/data/melody-state";
import GuitarEditorState from "../../../store/state/data/arrange/guitar/guitar-editor-state";
import PlaybackState from "../../../store/state/playback-state";
import EditorPlaybackResult from "./editor-playback-result";
import GuitarArrangePatternNote from "./guitar-arrange-pattern-note";

const playbackGuitarEditor = () => {
    const control = get(controlStore);
    const data = get(dataStore);
    const playback = get(playbackStore);

    const arrange = control.outline.arrange;
    if (arrange == null || arrange.method !== "guitar" || arrange.editor == undefined) {
        throw new Error("Guitar editor playback requires active guitar editor.");
    }

    const editor = arrange.editor as GuitarEditorState.Value;
    const track = data.arrange.tracks[control.outline.trackIndex];
    if (track == undefined || track.method !== "guitar") {
        throw new Error("Guitar editor playback requires active guitar track.");
    }
    if (track.instRef == undefined) return EditorPlaybackResult.instNotSet();

    const player = PlaybackState.getInstPlayer(track.instRef, playback);
    if (player == undefined) return EditorPlaybackResult.playerNotReady();

    const beatDiv16Cnt = RhythmTheory.getBeatDiv16Count(arrange.target.scoreBase.rhythm.ts);
    const beatRate = beatDiv16Cnt / 4;
    const beatSize =
        arrange.target.beat.num +
        (-arrange.target.beat.eatHead + arrange.target.beat.eatTail) / beatDiv16Cnt;
    const sustainBeat = beatSize * beatRate;
    const unit = { frets: editor.frets };
    const notes = editor.backing == null
        ? GuitarArrangePatternNote.createNotes(
            unit,
            {
                sustainBeat,
            },
        )
        : GuitarArrangePatternNote.createBackingNotes(
            unit,
            editor.backing,
        );

    playback.timerKeys = [];
    playback.intervalKeys = [];

    const tempo = arrange.target.scoreBase.tempo * beatRate;
    const msPerQuarter = 60000 / tempo;

    const patternDurationMs = editor.backing == null
        ? sustainBeat * msPerQuarter
        : GuitarEditorState.getBackingBeatLength(editor.backing.cols) * msPerQuarter;
    if (notes.length === 0 && patternDurationMs === 0) return EditorPlaybackResult.ignored();

    let endMs = patternDurationMs;
    notes.forEach((note) => {
        const side = MelodyState.calcBeatSide(note);
        const startMs = side.pos * msPerQuarter;
        const sustainMs = side.len * msPerQuarter;
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

export default playbackGuitarEditor;
