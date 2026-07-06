import GuitarEditorState from "../../../store/state/data/arrange/guitar/guitar-editor-state";
import type PlaybackCacheState from "../timeline/playback-cache-state";

namespace GuitarArrangePatternNote {
    const STROKE_INTERVAL_FACTOR = 0.015;
    const DEFAULT_STROKE_SPEED = 1;
    const DEFAULT_STROKE_DECAY_RATE = 0.82;
    const DEFAULT_SUSTAIN_STROKE_VELOCITY = 10;

    type ResolvedStrokeProps = {
        direction: GuitarEditorState.StrokeDirection;
        velocity: number;
        decayRate: number;
        speed: number;
    };
    type GuitarSoundNote = PlaybackCacheState.SoundNote & {
        stringIndex: number;
    };

    export const createUnitNotes = (
        unit: GuitarEditorState.Unit,
        option: {
            sustainBeat: number;
        },
    ): PlaybackCacheState.SoundNote[] => {
        if (unit.backing == null) return createNotes(unit, option);
        return createBackingNotes(unit, unit.backing);
    };

    export const createNotes = (
        unit: GuitarEditorState.Unit,
        option: {
            sustainBeat: number;
        },
    ): PlaybackCacheState.SoundNote[] => {
        const notes: GuitarSoundNote[] = [];
        pushStrokeNotes(notes, unit, 0, option.sustainBeat, {
            direction: "down",
            velocity: DEFAULT_SUSTAIN_STROKE_VELOCITY,
            decayRate: DEFAULT_STROKE_DECAY_RATE,
            speed: DEFAULT_STROKE_SPEED,
        });

        return finalizeSustainNotes(notes, option.sustainBeat);
    };

    export const createBackingNotes = (
        unit: GuitarEditorState.Unit,
        backing: GuitarEditorState.BackingEditorProps | GuitarEditorState.BackingData,
    ): PlaybackCacheState.SoundNote[] => {
        const notes: GuitarSoundNote[] = [];

        if ("items" in backing) {
            backing.items.forEach((item) => {
                const event = GuitarEditorState.convPatternItem(item);
                pushBackingEventNotes(notes, unit, backing.cols, event);
            });
        } else {
            backing.events.forEach((event) => {
                pushBackingEventNotes(notes, unit, backing.cols, event);
            });
        }

        return finalizeSustainNotes(notes, getColsBeat(backing.cols));
    };

    const pushBackingEventNotes = (
        notes: GuitarSoundNote[],
        unit: GuitarEditorState.Unit,
        cols: GuitarEditorState.Col[],
        event: GuitarEditorState.PatternEvent,
    ) => {
        const col = cols[event.colIndex];
        if (col == undefined) return;

        const posBeat = getColStartBeat(cols, event.colIndex);
        const lenBeat = getColBeat(col);

        switch (event.kind) {
            case "stroke":
                pushStrokeNotes(notes, unit, posBeat, lenBeat, {
                    direction: event.direction,
                    velocity: event.velocity,
                    decayRate: DEFAULT_STROKE_DECAY_RATE,
                    speed: event.speed,
                });
                return;
            case "pick":
                pushPickNote(notes, unit, event.stringNumber, event.velocity, posBeat, lenBeat);
                return;
        }
    };

    const pushStrokeNotes = (
        notes: GuitarSoundNote[],
        unit: GuitarEditorState.Unit,
        posBeat: number,
        lenBeat: number,
        stroke: ResolvedStrokeProps,
    ) => {
        const soundingStrings = getOrderedStringIndexes(stroke.direction)
            .map((stringIndex) => {
                const fret = unit.frets[stringIndex];
                const tuning = GuitarEditorState.STANDARD_TUNING[stringIndex];
                if (fret == null || tuning == undefined) return undefined;

                return { fret, stringIndex, tuning };
            })
            .filter((item) => item != undefined);
        const intervalBeat = STROKE_INTERVAL_FACTOR / stroke.speed;

        soundingStrings.forEach(({ fret, stringIndex, tuning }, strokeIndex) => {
            const delayBeat = intervalBeat * strokeIndex;
            const sustainBeat = Math.max(0, lenBeat - delayBeat);
            if (sustainBeat === 0) return;

            notes.push({
                stringIndex,
                norm: { div: 1 },
                pos: posBeat + delayBeat,
                len: sustainBeat,
                pitch: tuning.openPitchIndex + fret,
                velocity: stroke.velocity * Math.pow(stroke.decayRate, strokeIndex),
            });
        });
    };

    const pushPickNote = (
        notes: GuitarSoundNote[],
        unit: GuitarEditorState.Unit,
        stringNumber: GuitarEditorState.PickStringNumber,
        velocity: number,
        posBeat: number,
        lenBeat: number,
    ) => {
        const stringIndex = getPickStringIndex(stringNumber);
        const fret = unit.frets[stringIndex];
        if (fret == null) return;

        const tuning = GuitarEditorState.STANDARD_TUNING[stringIndex];
        if (tuning == undefined) return;

        notes.push({
            stringIndex,
            norm: { div: 1 },
            pos: posBeat,
            len: lenBeat,
            pitch: tuning.openPitchIndex + fret,
            velocity,
        });
    };

    const getColStartBeat = (cols: GuitarEditorState.Col[], index: number) => {
        return cols.reduce((total, col, colIndex) => {
            if (colIndex >= index) return total;
            return total + getColBeat(col);
        }, 0);
    };

    const getColsBeat = (cols: GuitarEditorState.Col[]) => {
        return cols.reduce((total, col) => total + getColBeat(col), 0);
    };

    const getColBeat = (col: GuitarEditorState.Col) => {
        return (1 / col.div / (col.tuplets ?? 1)) * GuitarEditorState.getDotRate(col.dot);
    };

    const getPickStringIndex = (stringNumber: GuitarEditorState.PickStringNumber) => {
        const index = GuitarEditorState.STANDARD_TUNING.findIndex((string) => {
            return string.number === stringNumber;
        });
        if (index === -1) throw new Error(`Unsupported guitar string number. [${stringNumber}]`);
        return index;
    };

    const getOrderedStringIndexes = (direction: GuitarEditorState.StrokeDirection) => {
        const indexes = GuitarEditorState.STANDARD_TUNING.map((_, index) => index);
        return direction === "down" ? indexes : indexes.reverse();
    };

    const finalizeSustainNotes = (
        notes: GuitarSoundNote[],
        endBeat: number,
    ): PlaybackCacheState.SoundNote[] => {
        const sorted = [...notes].sort((a, b) => {
            if (a.stringIndex !== b.stringIndex) return a.stringIndex - b.stringIndex;
            return a.pos - b.pos;
        });

        sorted.forEach((note, index) => {
            const next = sorted
                .slice(index + 1)
                .find((item) => item.stringIndex === note.stringIndex);
            note.len = Math.max(0, (next?.pos ?? endBeat) - note.pos);
        });

        return notes
            .filter((note) => note.len > 0)
            .map(({ stringIndex: _stringIndex, ...note }) => note);
    };
}

export default GuitarArrangePatternNote;
