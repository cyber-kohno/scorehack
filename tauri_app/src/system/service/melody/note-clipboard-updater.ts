import type ControlState from "../../store/state/control-state";
import MelodyState from "../../store/state/data/melody-state";

type Context = {
    melody: ControlState.MelodyValue;
    track: MelodyState.ScoreTrack;
    moveNoteByUnit: (note: MelodyState.Note, unit: MelodyState.Note) => void;
};

const createNoteClipboardUpdater = (ctx: Context) => {
    const { melody, track, moveNoteByUnit } = ctx;

    const getFocusRange = () => {
        if (melody.focusLock === -1) return [melody.focus, melody.focus];
        return melody.focus < melody.focusLock
            ? [melody.focus, melody.focusLock]
            : [melody.focusLock, melody.focus];
    };

    const sortTrackNotes = (track: MelodyState.ScoreTrack) => {
        track.notes.sort((a, b) => {
            const [aX, bX] = [a, b].map(n => MelodyState.calcBeatSide(n).pos);
            return aX - bX;
        });
    };

    const copyNotes = () => {
        const [start, end] = getFocusRange();
        const notes = track.notes.filter((_, i) => {
            return i >= start && i <= end;
        });
        melody.clipboard.notes = JSON.parse(JSON.stringify(notes));
    };

    const pasteClipboardNotes = () => {
        const clipNotes = melody.clipboard.notes;
        if (clipNotes == null || clipNotes.length === 0) return;

        const criteria: MelodyState.Note = JSON.parse(JSON.stringify(clipNotes[0]));
        const cursor = melody.cursor;
        criteria.pos *= -1;
        clipNotes.forEach(note => {
            moveNoteByUnit(note, criteria);
            moveNoteByUnit(note, cursor);
            track.notes.push(note);
        });
        sortTrackNotes(track);

        const focusIndex = track.notes.findIndex(note => note == clipNotes[0]);
        melody.focus = focusIndex;
        melody.focusLock = focusIndex + clipNotes.length - 1;
        melody.clipboard.notes = null;
    };

    return {
        copyNotes,
        pasteClipboardNotes,
    };
};

export default createNoteClipboardUpdater;
