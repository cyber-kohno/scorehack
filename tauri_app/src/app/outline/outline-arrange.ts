import { createPianoArrangeFinder } from "../arrange/arrange-state";
import { createProjectDataActions } from "../project-data/project-data-actions";
import { getBaseCaches, getChordCaches, getElementCaches } from "../../state/cache-state/cache-store";
import { getOutlineFocusState } from "../../state/session-state/outline-focus-store";
import { getOutlineTrackIndex } from "../../state/session-state/outline-track-store";
import { setOutlineArrangeState } from "../../state/session-state/outline-arrange-store";
import StorePianoEditor from "../../domain/arrange/piano-editor-store";
import type StoreArrange from "../../domain/arrange/arrange-store";
import type StoreCache from "../../state/cache-state/cache-store";
import type { RootStoreToken } from "../../state/root-store";

type BuildArrangeProps = {
  arrange: StoreArrange.EditorProps;
  arrTrack: StoreArrange.Track;
  chordCache: StoreCache.ChordCache;
};

export const getCurrentOutlineArrangeTrack = (rootStoreToken: RootStoreToken) => {
  const { getArrangeTrack } = createProjectDataActions(rootStoreToken);
  return getArrangeTrack(getOutlineTrackIndex());
};

export const buildOutlineArrange = (
  rootStoreToken: RootStoreToken,
  buildDetail: (props: BuildArrangeProps) => void,
) => {
  const track = getCurrentOutlineArrangeTrack(rootStoreToken);

  if (track == undefined) return;

  const { focus } = getOutlineFocusState();
  const baseCaches = getBaseCaches(rootStoreToken);
  const elementCaches = getElementCaches(rootStoreToken);
  const chordCaches = getChordCaches(rootStoreToken);
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

export const openOutlineArrangeEditor = (rootStoreToken: RootStoreToken) => {
  buildOutlineArrange(rootStoreToken, ({ arrange, arrTrack, chordCache }) => {
    switch (arrTrack.method) {
      case "piano":
        arrange.editor = StorePianoEditor.getEditorProps(chordCache.chordSeq, arrTrack);
        break;
    }
  });
};

export const openOutlineArrangeFinder = (rootStoreToken: RootStoreToken) => {
  buildOutlineArrange(rootStoreToken, ({ arrange, arrTrack, chordCache }) => {
    const ts = getBaseCaches(rootStoreToken)[chordCache.baseSeq].scoreBase.ts;
    if (arrTrack.method !== "piano") throw new Error();
    arrange.finder = createPianoArrangeFinder({ arrTrack, ts, chordCache });
  });
};

