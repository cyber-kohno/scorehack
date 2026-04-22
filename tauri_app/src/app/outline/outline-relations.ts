import StorePianoEditor from "../../domain/arrange/piano-editor-store";
import { createProjectDataActions } from "../project-data/project-data-actions";
import { getElementCaches } from "../../state/cache-state/cache-store";
import type { RootStoreToken } from "../../state/root-store";

export const shiftOutlineArrangeRelationsAfterChordInsert = (
  rootStoreToken: RootStoreToken,
  lastChordSeq: number,
) => {
  const { getArrangeTracks } = createProjectDataActions(rootStoreToken);
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
  rootStoreToken: RootStoreToken,
  startIndex: number,
  endIndex: number,
) => {
  if (startIndex === endIndex) return true;
  const elementCaches = getElementCaches(rootStoreToken);
  for (let i = startIndex; i <= endIndex; i++) {
    if (elementCaches[i].type !== "chord") {
      return false;
    }
  }
  return true;
};

export const removeOutlineArrangeRelationsForChord = (
  rootStoreToken: RootStoreToken,
  chordSeq: number,
) => {
  const { getArrangeTracks } = createProjectDataActions(rootStoreToken);
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
  rootStoreToken: RootStoreToken,
  index: number,
) => {
  const elementCaches = getElementCaches(rootStoreToken);
  return elementCaches[index].chordSeq;
};
