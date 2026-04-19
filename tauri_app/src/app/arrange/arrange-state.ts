import ArrangeLibrary from "../../domain/arrange/arrange-library";
import StorePianoEditor from "../../domain/arrange/piano-editor-store";
import type StoreArrange from "../../domain/arrange/arrange-store";
import type StoreCache from "../../state/cache-state/cache-store";
import type { StoreProps } from "../../system/store/store";
import type MusicTheory from "../../domain/theory/music-theory";
import { getOutlineTrackIndex } from "../../state/session-state/outline-track-store";
import { getOutlineArrangeState } from "../../state/session-state/outline-arrange-store";
import { getArrangeTrack } from "../../state/project-data/arrange-project-data";

export type ArrangeFinderProps = {
  ts: MusicTheory.TimeSignature;
  chordCache: StoreCache.ChordCache;
  arrTrack: StoreArrange.Track;
};

export const getActiveArrange = (lastStore: StoreProps) => {
  const arrange = getOutlineArrangeState();
  if (arrange == null) throw new Error();
  return arrange;
};

export const getCurrentArrangeTrack = (lastStore: StoreProps) => {
  const track = getArrangeTrack(lastStore, getOutlineTrackIndex());
  if (track == undefined) throw new Error();
  return track;
};

export const getPianoArrangeEditor = (lastStore: StoreProps) => {
  const arrange = getActiveArrange(lastStore);
  if (arrange.method !== "piano" || arrange.editor == undefined) throw new Error();
  return arrange.editor as StorePianoEditor.Props;
};

export const getPianoArrangeFinder = (lastStore: StoreProps) => {
  const arrange = getActiveArrange(lastStore);
  if (arrange.method !== "piano" || arrange.finder == undefined) throw new Error();
  return arrange.finder as ArrangeLibrary.PianoArrangeFinder;
};

export const getCurrentPianoLibrary = (lastStore: StoreProps) => {
  const track = getCurrentArrangeTrack(lastStore);
  if (track.method === "piano" && track.pianoLib != undefined) {
    return track.pianoLib as StorePianoEditor.Lib;
  }
  throw new Error();
};

export const createPianoArrangeFinder = (props: ArrangeFinderProps) => {
  const { ts, chordCache: chord, arrTrack } = props;
  const compiledChord = chord.compiledChord;
  if (compiledChord == undefined) throw new Error();

  const req: ArrangeLibrary.SearchRequest = {
    beat: chord.beat.num,
    eatHead: chord.beat.eatHead,
    eatTail: chord.beat.eatTail,
    structCnt: compiledChord.structs.length,
    ts,
  };

  const finder: ArrangeLibrary.PianoArrangeFinder = {
    cursor: { backing: -1, sounds: -1 },
    apply: { backing: -1, sounds: -1 },
    request: req,
    list: ArrangeLibrary.searchPianoPatterns({
      req,
      arrTrack,
      isFilterPatternOnly: false,
    }),
  };

  if (finder.list.length > 0) {
    const relations = arrTrack.relations;
    const relation = relations.find((r) => r.chordSeq === chord.chordSeq);
    if (relation != undefined) {
      const bkgPatt = finder.list.findIndex((f) => f.bkgPatt === relation.bkgPatt);
      const sndPatt = finder.list[bkgPatt].voics.findIndex(
        (v) => v === relation.sndsPatt,
      );

      if (bkgPatt === -1 || sndPatt === -1) throw new Error();
      finder.cursor.backing = finder.apply.backing = bkgPatt;
      finder.cursor.sounds = finder.apply.sounds = sndPatt;
    }
  }

  return finder;
};

