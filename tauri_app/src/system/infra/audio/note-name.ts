namespace NoteName {
    const NOTE_INDEXES: Record<string, number> = {
        C: 0,
        "C#": 1,
        DB: 1,
        D: 2,
        "D#": 3,
        EB: 3,
        E: 4,
        F: 5,
        "F#": 6,
        GB: 6,
        G: 7,
        "G#": 8,
        AB: 8,
        A: 9,
        "A#": 10,
        BB: 10,
        B: 11,
    };

    export const toMidiNumber = (note: string | number) => {
        if (typeof note === "number") return note;

        const match = /^([A-Ga-g])([#bB]?)(-?\d+)$/.exec(note);
        if (match == null) throw new Error(`Invalid note name. [${note}]`);

        const pitchName = `${match[1].toUpperCase()}${match[2].toUpperCase()}`;
        const pitchIndex = NOTE_INDEXES[pitchName];
        if (pitchIndex == undefined) throw new Error(`Invalid note name. [${note}]`);

        const octave = Number(match[3]);
        return (octave + 1) * 12 + pitchIndex;
    };
}

export default NoteName;
