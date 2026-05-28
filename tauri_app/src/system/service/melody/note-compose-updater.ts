import type ControlState from "../../store/state/control-state";
import MelodyState from "../../store/state/data/melody-state";

type Context = {
    melody: ControlState.MelodyValue;
    track: MelodyState.ScoreTrack;
};

const createNoteComposeUpdater = (ctx: Context) => {
    const { melody, track } = ctx;

    const isNearInteger = (value: number) => {
        return Math.abs(value - Math.round(value)) < 0.000001;
    };

    const getFocusNote = () => {
        return track.notes[melody.focus];
    };

    const getFocusRange = () => {
        if (melody.focusLock === -1) return [melody.focus, melody.focus];
        return melody.focus < melody.focusLock
            ? [melody.focus, melody.focusLock]
            : [melody.focusLock, melody.focus];
    };

    const findRepresentableSide = (
        baseNorm: MelodyState.Norm,
        posBeat: number,
        lenBeat: number,
        extraNorms: MelodyState.Norm[],
    ) => {
        const candidates: MelodyState.Norm[] = [];
        const seen = new Set<string>();

        const addCandidate = (norm: MelodyState.Norm) => {
            const tuplets = norm.tuplets === 1 ? undefined : norm.tuplets;
            const key = `${norm.div}:${tuplets ?? ""}`;
            if (seen.has(key)) return;

            candidates.push(tuplets == undefined ? { div: norm.div } : { div: norm.div, tuplets });
            seen.add(key);
        };

        const addCandidateSeq = (norm: MelodyState.Norm) => {
            for (let i = 0; i < 12; i++) {
                addCandidate({ ...norm, div: norm.div * (2 ** i) });
            }
        };

        addCandidateSeq(baseNorm);
        extraNorms.forEach(addCandidateSeq);
        [undefined, 3].forEach(tuplets => {
            for (let div = 1; div <= 2048; div *= 2) {
                addCandidate(tuplets == undefined ? { div } : { div, tuplets });
            }
        });

        for (const norm of candidates) {
            const unitBeat = MelodyState.calcBeat(norm, 1);
            const rawPos = posBeat / unitBeat;
            const rawLen = lenBeat / unitBeat;
            if (!isNearInteger(rawPos) || !isNearInteger(rawLen)) continue;

            return {
                norm,
                pos: Math.round(rawPos),
                len: Math.round(rawLen),
            };
        }

        return undefined;
    };

    const splitFocusNote = () => {
        const source = getFocusNote() as MelodyState.VocalNote | undefined;
        if (source == undefined) return false;

        const noteBeat = MelodyState.calcBeatSide(source);
        const cursorUnitBeat = MelodyState.calcBeat(melody.cursor.norm, melody.cursor.len);
        if (cursorUnitBeat >= noteBeat.len - 1e-9) return false;

        const count = noteBeat.len / cursorUnitBeat;
        const roundedCount = Math.round(count);
        if (Math.abs(count - roundedCount) > 1e-9) {
            throw new Error("Focused note length must be divisible by cursor unit.");
        }

        const unitBeat = MelodyState.calcBeat(melody.cursor.norm, 1);
        const rawStart = noteBeat.pos / unitBeat;
        const rawLen = cursorUnitBeat / unitBeat;
        const start = Math.round(rawStart);
        const len = Math.round(rawLen);
        if (Math.abs(rawStart - start) > 1e-9 || Math.abs(rawLen - len) > 1e-9) {
            throw new Error("Focused note cannot be represented by cursor unit.");
        }

        const notes = [...Array(roundedCount).keys()].map((index): MelodyState.VocalNote => {
            const note: MelodyState.VocalNote = {
                norm: { ...melody.cursor.norm },
                pos: start + index * len,
                len,
                pitch: source.pitch,
            };
            if (index === 0 && source.pron != undefined) note.pron = source.pron;
            return note;
        });

        const focusIndex = melody.focus;
        track.notes.splice(focusIndex, 1, ...notes);
        melody.focus = focusIndex;
        melody.focusLock = focusIndex + notes.length - 1;
        if (melody.focusLock === melody.focus) melody.focusLock = -1;

        return true;
    };

    const mergeFocusNotes = () => {
        const [start, end] = getFocusRange();
        if (start === end) return false;

        const targets = track.notes.slice(start, end + 1) as MelodyState.VocalNote[];
        const pitch = targets[0].pitch;
        const firstSide = MelodyState.calcBeatSide(targets[0]);
        let tail = firstSide.pos + firstSide.len;

        for (let i = 1; i < targets.length; i++) {
            const note = targets[i];
            if (note.pitch !== pitch) return false;

            const side = MelodyState.calcBeatSide(note);
            if (Math.abs(side.pos - tail) > 1e-9) return false;
            tail = side.pos + side.len;
        }

        const mergedSide = findRepresentableSide(
            targets[0].norm,
            firstSide.pos,
            tail - firstSide.pos,
            targets.slice(1).map(note => note.norm),
        );
        if (mergedSide == undefined) return false;

        const merged: MelodyState.VocalNote = {
            norm: { ...mergedSide.norm },
            pos: mergedSide.pos,
            len: mergedSide.len,
            pitch,
        };
        if (targets[0].pron != undefined) merged.pron = targets[0].pron;
        MelodyState.normalize(merged);

        track.notes.splice(start, targets.length, merged);
        melody.focus = start;
        melody.focusLock = -1;

        return true;
    };

    return {
        splitFocusNote,
        mergeFocusNotes,
    };
};

export default createNoteComposeUpdater;
