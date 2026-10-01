import RhythmTheory from "../../../domain/theory/rhythm-theory";
import TonalityTheory from "../../../domain/theory/tonality-theory";
import MelodyState from "../../../store/state/data/melody-state";
import type DerivedState from "../../../store/state/derived-state";
import type PlaybackCacheState from "./playback-cache-state";

const convertNoteToPlayer = (
    baseCaches: DerivedState.BaseCache[],
    currentLeft: number,
    note: MelodyState.Note,
    velocity: number,
    swing: RhythmTheory.SwingRatios,
): PlaybackCacheState.SoundTimePlayer | null => {
    const side = MelodyState.calcBeatSide(note);
    const [left, right] = [side.pos, side.pos + side.len];
    if (left < currentLeft) return null;

    const ignoresSwing = note.norm.tuplets != undefined;
    const getTime = (
        base: DerivedState.BaseCache,
        start: number,
        len: number,
    ) => {
        const beatDiv16Cnt = RhythmTheory.getBeatDiv16Count(base.scoreBase.rhythm.ts);
        const beatRate = beatDiv16Cnt / 4;
        const msPerBeatNote = 60000 / (base.scoreBase.tempo * beatRate);
        const beatNoteLen = ignoresSwing
            ? len
            : RhythmTheory.getSwungBeatNoteDuration(
                base.scoreBase.rhythm,
                swing,
                start,
                len,
            );
        return msPerBeatNote * beatNoteLen;
    };

    let startMs = 0;
    let sustainMs = 0;

    baseCaches.some((base) => {
        const start = base.startBeatNote;
        const end = start + base.lengthBeatNote;

        if (left < end) {
            sustainMs = getTime(base, left, right - left);
            startMs += getTime(base, start, left - start);
            return 1;
        }

        startMs += getTime(base, start, base.lengthBeatNote);
    });

    baseCaches.some((base) => {
        const start = base.startBeatNote;
        const end = start + base.lengthBeatNote;

        if (currentLeft < end) {
            startMs -= getTime(base, start, currentLeft - start);
            return 1;
        }

        startMs -= getTime(base, start, base.lengthBeatNote);
    });

    const pitchName = TonalityTheory.getKey12FullName(note.pitch);
    const gain = 5 * (velocity / 10);
    return {
        startMs,
        gain,
        sustainMs,
        pitchName,
        target: "",
    };
};
export default convertNoteToPlayer;
