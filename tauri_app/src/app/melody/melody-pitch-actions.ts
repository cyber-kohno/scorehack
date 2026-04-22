import StoreMelody from "../../domain/melody/melody-store";
import MusicTheory from "../../domain/theory/music-theory";

type MoveMelodyPitchRangeParams = {
  targets: StoreMelody.Note[];
  dir: number;
  onPitchMoved: () => void;
};

export const moveMelodyPitchRange = ({
  targets,
  dir,
  onPitchMoved,
}: MoveMelodyPitchRangeParams) => {
  if (targets.find((note) => !StoreMelody.validatePitch(note.pitch)) != undefined) {
    return false;
  }

  targets.forEach((note) => {
    note.pitch += dir;
  });
  onPitchMoved();
  return true;
};

export const getNextScalePitch = (
  pitchIndex: number,
  dir: -1 | 1,
  tonality: number[],
) => {
  while (true) {
    pitchIndex += dir;
    const isScale = MusicTheory.isScale(pitchIndex, tonality);
    if (isScale) break;
  }

  return pitchIndex;
};

type MoveScaleLockedMelodyPitchParams = {
  note: StoreMelody.Note;
  dir: -1 | 1;
  tonality: number[];
  maxPitch: number;
  onPitchMoved: (note: StoreMelody.Note) => void;
  onPreviewPitch: (pitchIndex: number) => void;
};

export const moveScaleLockedMelodyPitch = ({
  note,
  dir,
  tonality,
  maxPitch,
  onPitchMoved,
  onPreviewPitch,
}: MoveScaleLockedMelodyPitchParams) => {
  let nextPitch = getNextScalePitch(note.pitch, dir, tonality);
  if (nextPitch < 0) nextPitch = 0;
  if (nextPitch > maxPitch) nextPitch = maxPitch;

  note.pitch = nextPitch;
  onPreviewPitch(note.pitch);
  onPitchMoved(note);
};

type MoveScaleLockedMelodyPitchRangeParams = {
  targets: StoreMelody.Note[];
  dir: -1 | 1;
  tonality: number[];
  onPitchMoved: () => void;
};

export const moveScaleLockedMelodyPitchRange = ({
  targets,
  dir,
  tonality,
  onPitchMoved,
}: MoveScaleLockedMelodyPitchRangeParams) => {
  if (
    targets.find(
      (note) => !StoreMelody.validatePitch(getNextScalePitch(note.pitch, dir, tonality)),
    ) != undefined
  ) {
    return false;
  }

  targets.forEach((note) => {
    note.pitch = getNextScalePitch(note.pitch, dir, tonality);
  });
  onPitchMoved();
  return true;
};
