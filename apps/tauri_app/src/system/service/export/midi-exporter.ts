import MidiWriter from "midi-writer-js";
import type DerivedState from "../../store/state/derived-state";
import MelodyState from "../../store/state/data/melody-state";

namespace MidiExporter {
    const TICKS_PER_BEAT_NOTE = 480;
    const DEFAULT_TEMPO = 120;
    const DEFAULT_TIME_SIGNATURE = {
        cnt: 4,
        unit: 4,
    };

    export type Result =
        | { ok: true; bytes: Uint8Array }
        | { ok: false; reason: "empty" };

    const clamp = (value: number, min: number, max: number) => {
        return Math.min(max, Math.max(min, value));
    };

    const toTick = (beatNote: number) => {
        return Math.max(0, Math.round(beatNote * TICKS_PER_BEAT_NOTE));
    };

    const findBase = (derived: DerivedState.Value, beatNote: number) => {
        return derived.baseCaches.find((base) => {
            const start = base.startBeatNote;
            const end = base.startBeatNote + base.lengthBeatNote;
            return beatNote >= start - 1e-9 && beatNote < end - 1e-9;
        }) ?? derived.baseCaches[0];
    };

    export const create = (props: {
        title: string;
        notes: MelodyState.VocalNote[];
        volume: number;
        derived: DerivedState.Value;
    }): Result => {
        if (props.notes.length === 0) {
            return { ok: false, reason: "empty" };
        }

        const notes = props.notes
            .map((note) => ({ note, side: MelodyState.calcBeatSide(note) }))
            .sort((a, b) => a.side.pos - b.side.pos);
        const firstBeatNote = notes[0].side.pos;
        const base = findBase(props.derived, firstBeatNote);
        const rhythm = base?.scoreBase.rhythm.ts ?? DEFAULT_TIME_SIGNATURE;
        const tempo = base?.scoreBase.tempo ?? DEFAULT_TEMPO;
        const velocity = clamp(Math.round(props.volume * 10), 1, 100);
        const track = new MidiWriter.Track();

        track.addTrackName(props.title);
        track.setTempo(tempo);
        track.setTimeSignature(rhythm.cnt, rhythm.unit, 24, 8);

        notes.forEach(({ note, side }) => {
            track.addEvent(new MidiWriter.NoteEvent({
                pitch: [note.pitch],
                duration: `T${Math.max(1, toTick(side.len))}`,
                startTick: toTick(side.pos - firstBeatNote),
                velocity,
            }));
        });

        const writer = new MidiWriter.Writer(track, {
            ticksPerBeat: TICKS_PER_BEAT_NOTE,
        });
        return {
            ok: true,
            bytes: writer.buildFile(),
        };
    };
}

export default MidiExporter;
