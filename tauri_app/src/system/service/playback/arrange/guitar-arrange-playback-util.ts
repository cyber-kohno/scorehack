import GuitarEditorState from "../../../store/state/data/arrange/guitar/guitar-editor-state";
import type PlaybackCacheState from "../timeline/playback-cache-state";

namespace GuitarArrangePlaybackUtil {
    export const convertPatternToNotes = (
        unit: GuitarEditorState.Unit,
        option: {
            sustainBeat: number;
            stroke: GuitarEditorState.GuitarStrokeProps;
        },
    ): PlaybackCacheState.SoundNote[] => {
        const notes: PlaybackCacheState.SoundNote[] = [];
        const orderedStringIndexes = getOrderedStringIndexes(option.stroke.strokeDirection);

        orderedStringIndexes.forEach((stringIndex, strokeIndex) => {
            const fret = unit.frets[stringIndex];
            if (fret == null) return;

            const tuning = GuitarEditorState.STANDARD_TUNING[stringIndex];
            if (tuning == undefined) return;

            const delayBeat = option.stroke.strokeDelayBeat * strokeIndex;
            const sustainBeat = Math.max(0, option.sustainBeat - delayBeat);
            if (sustainBeat === 0) return;

            notes.push({
                norm: { div: 1 },
                pos: delayBeat,
                len: sustainBeat,
                pitch: tuning.openMidi + fret,
                velocity: option.stroke.velocity * Math.pow(option.stroke.decayRate, strokeIndex),
            });
        });

        return notes;
    };

    const getOrderedStringIndexes = (direction: GuitarEditorState.StrokeDirection) => {
        const indexes = GuitarEditorState.STANDARD_TUNING.map((_, index) => index);
        return direction === "down" ? indexes : indexes.reverse();
    };
}

export default GuitarArrangePlaybackUtil;
