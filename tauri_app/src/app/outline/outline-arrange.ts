import { createPianoArrangeFinder } from "../arrange/arrange-state";
import { createProjectDataActions } from "../project-data/project-data-actions";
import { getBaseCaches, getChordCaches, getElementCaches } from "../../state/cache-state/cache-store";
import { getOutlineFocusState } from "../../state/session-state/outline-focus-store";
import { getOutlineTrackIndex } from "../../state/session-state/outline-track-store";
import { setOutlineArrangeState } from "../../state/session-state/outline-arrange-store";
import StorePianoEditor from "../../domain/arrange/piano-editor-store";
import type StoreArrange from "../../domain/arrange/arrange-store";
import type StoreCache from "../../state/cache-state/cache-store";
import type { StoreProps } from "../../state/root-store";

type BuildArrangeProps = {
  arrange: StoreArrange.EditorProps;
  arrTrack: StoreArrange.Track;
  chordCache: StoreCache.ChordCache;
};

export const getCurrentOutlineArrangeTrack = (lastStore: StoreProps) => {
  const { getArrangeTrack } = createProjectDataActions(lastStore);
  return getArrangeTrack(getOutlineTrackIndex());
};

export const buildOutlineArrange = (
  lastStore: StoreProps,
  buildDetail: (props: BuildArrangeProps) => void,
) => {
  const track = getCurrentOutlineArrangeTrack(lastStore);

  if (track == undefined) return;

  const { focus } = getOutlineFocusState();
  const baseCaches = getBaseCaches(lastStore);
  const elementCaches = getElementCaches(lastStore);
  const chordCaches = getChordCaches(lastStore);
  const { chordSeq, baseSeq } = elementCaches[focus];
  if (chordSeq === -1) return;
  const chordCache = chordCaches[chordSeq];
  const scoreBase = baseCaches[baseSeq].scoreBase;

  if (chordCache.compiledChord == undefined) return;

  const target: StoreArrange.Target = {
    scoreBase,
    beat: chordCache.beat,
    compiledChord: chordCache.compiledChord,
    chordSeq: chordCache.chordSeq,
  };

  const arrange: StoreArrange.EditorProps = {
    method: track.method,
    target,
  };
  buildDetail({ arrange, arrTrack: track, chordCache });

  setOutlineArrangeState(arrange);
};

export const openOutlineArrangeEditor = (lastStore: StoreProps) => {
  buildOutlineArrange(lastStore, ({ arrange, arrTrack, chordCache }) => {
    switch (arrTrack.method) {
      case "piano":
        arrange.editor = StorePianoEditor.getEditorProps(chordCache.chordSeq, arrTrack);
        break;
    }
  });
};

export const openOutlineArrangeFinder = (lastStore: StoreProps) => {
  buildOutlineArrange(lastStore, ({ arrange, arrTrack, chordCache }) => {
    const ts = getBaseCaches(lastStore)[chordCache.baseSeq].scoreBase.ts;
    if (arrTrack.method !== "piano") throw new Error();
    arrange.finder = createPianoArrangeFinder({ arrTrack, ts, chordCache });
  });
};

