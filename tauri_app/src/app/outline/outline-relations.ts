import StorePianoEditor from "../../domain/arrange/piano-editor-store";
import { createProjectDataActions } from "../project-data/project-data-actions";
import { getElementCaches } from "../../state/cache-state/cache-store";
import type { StoreProps } from "../../system/store/store";

export const shiftOutlineArrangeRelationsAfterChordInsert = (
  lastStore: StoreProps,
  lastChordSeq: number,
) => {
  const { getArrangeTracks } = createProjectDataActions(lastStore);
  const tracks = getArrangeTracks();
  tracks.forEach((track) => {
    track.relations.forEach((relation) => {
      if (relation.chordSeq > lastChordSeq) {
        relation.chordSeq++;
      }
    });
  });
};

export const canRemoveOutlineRange = (
  lastStore: StoreProps,
  startIndex: number,
  endIndex: number,
) => {
  if (startIndex === endIndex) return true;
  const elementCaches = getElementCaches(lastStore);
  for (let i = startIndex; i <= endIndex; i++) {
    if (elementCaches[i].type !== "chord") {
      return false;
    }
  }
  return true;
};

export const removeOutlineArrangeRelationsForChord = (
  lastStore: StoreProps,
  chordSeq: number,
) => {
  const { getArrangeTracks } = createProjectDataActions(lastStore);
  const tracks = getArrangeTracks();
  tracks.forEach((track) => {
    const deleteIndex = track.relations.findIndex(
      (relation) => relation.chordSeq === chordSeq,
    );
    if (deleteIndex !== -1) {
      track.relations.splice(deleteIndex, 1);
      StorePianoEditor.deleteUnreferUnit(track);
    }
    track.relations.forEach((relation) => {
      if (relation.chordSeq > chordSeq) {
        relation.chordSeq--;
      }
    });
  });
};

export const getOutlineChordSeqAtElementIndex = (
  lastStore: StoreProps,
  index: number,
) => {
  const elementCaches = getElementCaches(lastStore);
  return elementCaches[index].chordSeq;
};
