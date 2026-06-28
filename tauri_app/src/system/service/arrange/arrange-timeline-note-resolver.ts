import RhythmTheory from "../../domain/theory/rhythm-theory";
import ArrangeState from "../../store/state/data/arrange/arrange-state";
import GuitarEditorState from "../../store/state/data/arrange/guitar/guitar-editor-state";
import PianoEditorState from "../../store/state/data/arrange/piano/piano-editor-state";
import MelodyState from "../../store/state/data/melody-state";
import type DerivedState from "../../store/state/derived-state";
import GuitarArrangePatternNote from "../playback/arrange/guitar-arrange-pattern-note";
import PianoArrangePatternNote from "../playback/arrange/piano-arrange-pattern-note";

namespace ArrangeTimelineNoteResolver {
    export type TimelineNote = {
        trackIndex: number;
        noteIndex: number;
        method: ArrangeState.ArrangeMedhod;
        isMute: boolean;
        note: MelodyState.Note;
    };

    export const resolveChordTrackNotes = (
        track: ArrangeState.Track,
        trackIndex: number,
        chordCache: DerivedState.ChordCache,
        baseCaches: DerivedState.BaseCache[],
        startNoteIndex = 0,
    ): TimelineNote[] => {
        const notes: TimelineNote[] = [];
        const baseCache = baseCaches[chordCache.baseSeq];
        if (baseCache == undefined) return notes;
        if (chordCache.error.arrange.overLengthTrackIndexes.includes(trackIndex)) return notes;

        const beatDiv16Cnt = RhythmTheory.getBeatDiv16Count(baseCache.scoreBase.rhythm.ts);
        const beatRate = beatDiv16Cnt / 4;
        const startBeat =
            chordCache.startBeat * beatRate +
            (chordCache.beat.eatHead / beatDiv16Cnt) * beatRate;
        let noteIndex = startNoteIndex;

        switch (track.method) {
            case "piano": {
                const arrPattern = PianoEditorState.getArrangePatternFromRelation(
                    chordCache.chordSeq,
                    track,
                );
                const compiledChord = chordCache.compiledChord;
                if (arrPattern == undefined || compiledChord == undefined) return notes;

                PianoArrangePatternNote.createNotes(
                    arrPattern,
                    compiledChord.chord,
                    { sustainBeat: chordCache.lengthBeatNote },
                ).forEach((note) => {
                    notes.push({
                        trackIndex,
                        noteIndex,
                        method: track.method,
                        isMute: track.isMute,
                        note: MelodyState.calcAddBeat(note, startBeat),
                    });
                    noteIndex++;
                });
            } break;
            case "guitar": {
                const arrPattern = GuitarEditorState.getArrangePatternFromRelation(
                    chordCache.chordSeq,
                    track,
                );
                if (arrPattern == undefined) return notes;

                GuitarArrangePatternNote.createNotes(
                    arrPattern,
                    {
                        sustainBeat: chordCache.lengthBeatNote,
                        stroke: GuitarEditorState.createDefaultStrokeProps(),
                    },
                ).forEach((note) => {
                    notes.push({
                        trackIndex,
                        noteIndex,
                        method: track.method,
                        isMute: track.isMute,
                        note: MelodyState.calcAddBeat(note, startBeat),
                    });
                    noteIndex++;
                });
            } break;
        }

        return notes;
    };

    export const resolve = (
        tracks: ArrangeState.Track[],
        derived: DerivedState.Value,
    ): TimelineNote[] => {
        const notes: TimelineNote[] = [];

        tracks.forEach((track, trackIndex) => {
            let noteIndex = 0;

            derived.chordCaches.forEach((chordCache) => {
                const chordNotes = resolveChordTrackNotes(
                    track,
                    trackIndex,
                    chordCache,
                    derived.baseCaches,
                    noteIndex,
                );
                notes.push(...chordNotes);
                noteIndex += chordNotes.length;
            });
        });

        return notes;
    };
}

export default ArrangeTimelineNoteResolver;
