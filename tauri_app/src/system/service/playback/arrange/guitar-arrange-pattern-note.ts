import GuitarEditorState from "../../../store/state/data/arrange/guitar/guitar-editor-state";
import type PlaybackCacheState from "../timeline/playback-cache-state";

namespace GuitarArrangePatternNote {
    export const createUnitNotes = (
        unit: GuitarEditorState.Unit,
        option: {
            sustainBeat: number;
            stroke: GuitarEditorState.GuitarStrokeProps;
        },
    ): PlaybackCacheState.SoundNote[] => {
        if (unit.backing == null) return createNotes(unit, option);
        return createBackingNotes(unit, unit.backing, { stroke: option.stroke });
    };

    export const createNotes = (
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

    export const createBackingNotes = (
        unit: GuitarEditorState.Unit,
        backing: GuitarEditorState.BackingEditorProps | GuitarEditorState.BackingData,
        option: {
            stroke: GuitarEditorState.GuitarStrokeProps;
        },
    ): PlaybackCacheState.SoundNote[] => {
        const notes: PlaybackCacheState.SoundNote[] = [];

        if ("items" in backing) {
            backing.items.forEach((item) => {
                const event = GuitarEditorState.convPatternItem(item);
                pushBackingEventNotes(notes, unit, backing.cols, event, option.stroke);
            });
        } else {
            backing.events.forEach((event) => {
                pushBackingEventNotes(notes, unit, backing.cols, event, option.stroke);
            });
        }

        return notes;
    };

    const pushBackingEventNotes = (
        notes: PlaybackCacheState.SoundNote[],
        unit: GuitarEditorState.Unit,
        cols: GuitarEditorState.Col[],
        event: GuitarEditorState.PatternEvent,
        stroke: GuitarEditorState.GuitarStrokeProps,
    ) => {
        const col = cols[event.colIndex];
        if (col == undefined) return;

        const posBeat = getColStartBeat(cols, event.colIndex);
        const lenBeat = getColBeat(col);

        switch (event.technique) {
            case "down":
            case "up":
                pushStrokeNotes(notes, unit, event, posBeat, lenBeat, {
                    ...stroke,
                    strokeDirection: event.technique,
                    velocity: event.velocity,
                });
                return;
            case "pick6":
            case "pick5":
            case "pick4":
            case "pick3":
            case "pick2":
            case "pick1":
                pushPickNote(notes, unit, event, posBeat, lenBeat);
                return;
        }
    };

    const pushStrokeNotes = (
        notes: PlaybackCacheState.SoundNote[],
        unit: GuitarEditorState.Unit,
        event: GuitarEditorState.PatternEvent,
        posBeat: number,
        lenBeat: number,
        stroke: GuitarEditorState.GuitarStrokeProps,
    ) => {
        const orderedStringIndexes = getOrderedStringIndexes(stroke.strokeDirection);

        orderedStringIndexes.forEach((stringIndex, strokeIndex) => {
            const fret = unit.frets[stringIndex];
            if (fret == null) return;

            const tuning = GuitarEditorState.STANDARD_TUNING[stringIndex];
            if (tuning == undefined) return;

            const delayBeat = stroke.strokeDelayBeat * strokeIndex;
            const sustainBeat = Math.max(0, lenBeat - delayBeat);
            if (sustainBeat === 0) return;

            notes.push({
                norm: { div: 1 },
                pos: posBeat + delayBeat,
                len: sustainBeat,
                pitch: tuning.openMidi + fret,
                velocity: stroke.velocity * Math.pow(stroke.decayRate, strokeIndex),
            });
        });
    };

    const pushPickNote = (
        notes: PlaybackCacheState.SoundNote[],
        unit: GuitarEditorState.Unit,
        event: GuitarEditorState.PatternEvent,
        posBeat: number,
        lenBeat: number,
    ) => {
        const stringIndex = getPickStringIndex(event.technique);
        const fret = unit.frets[stringIndex];
        if (fret == null) return;

        const tuning = GuitarEditorState.STANDARD_TUNING[stringIndex];
        if (tuning == undefined) return;

        notes.push({
            norm: { div: 1 },
            pos: posBeat,
            len: lenBeat,
            pitch: tuning.openMidi + fret,
            velocity: event.velocity,
        });
    };

    const getColStartBeat = (cols: GuitarEditorState.Col[], index: number) => {
        return cols.reduce((total, col, colIndex) => {
            if (colIndex >= index) return total;
            return total + getColBeat(col);
        }, 0);
    };

    const getColBeat = (col: GuitarEditorState.Col) => {
        return (1 / col.div / (col.tuplets ?? 1)) * GuitarEditorState.getDotRate(col.dot);
    };

    const getPickStringIndex = (technique: GuitarEditorState.Technique) => {
        switch (technique) {
            case "pick6": return 0;
            case "pick5": return 1;
            case "pick4": return 2;
            case "pick3": return 3;
            case "pick2": return 4;
            case "pick1": return 5;
        }
        throw new Error(`Unsupported guitar pick technique. [${technique}]`);
    };

    const getOrderedStringIndexes = (direction: GuitarEditorState.StrokeDirection) => {
        const indexes = GuitarEditorState.STANDARD_TUNING.map((_, index) => index);
        return direction === "down" ? indexes : indexes.reverse();
    };
}

export default GuitarArrangePatternNote;
