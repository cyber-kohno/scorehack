import MusicTheory from "../theory/music-theory";
import type StoreArrange from "./arrange-store";
import type StorePianoEditor from "./piano-editor-store";
import type StoreCache from "../../state/cache-state/cache-store";

namespace ArrangeLibrary {
  export interface BackingCategory {
    tsGloup: MusicTheory.TimeSignature[];
    beat: number;
    eatHead?: number;
    eatTail?: number;
  }

  export interface SoundsCategory {
    structCnt: number;
  }

  export interface SearchCategory extends BackingCategory, SoundsCategory {}

  export type SearchRequest = {
    ts: MusicTheory.TimeSignature;
    beat: number;
    eatHead: number;
    eatTail: number;
    structCnt: number;
  };

  export type Maintenance = {};

  export type Cursor = {
    backing: number;
    sounds: number;
  };

  export type PianoArrangeFinder = {
    request: SearchRequest;
    list: StorePianoEditor.Preset[];
    cursor: Cursor;
    apply: Cursor;
  };

  export type Pattern = {
    backingNo: number;
    soundsNos: number[];
  };

  export const getPianoBackingPatternFromNo = (
    no: number,
    lib: StorePianoEditor.Lib,
  ) => {
    const patt = lib.backingPatterns.find((p) => p.no === no);
    if (patt == undefined) throw new Error("Backing pattern was not found.");
    return patt.backing;
  };

  export const getPianoVoicingPatternFromNo = (
    no: number,
    lib: StorePianoEditor.Lib,
  ) => {
    const patt = lib.soundsPatterns.find((p) => p.no === no);
    if (patt == undefined) throw new Error("Voicing pattern was not found.");
    return patt.sounds;
  };

  export const searchPianoPatterns = (args: {
    req: SearchRequest;
    arrTrack: StoreArrange.Track;
    isFilterPatternOnly: boolean;
  }) => {
    const { req, arrTrack: track, isFilterPatternOnly } = args;
    const lib = track.pianoLib as StorePianoEditor.Lib;

    const bkgPatts = lib.backingPatterns.filter((patt) => {
      const cond = patt.category;
      const condEatHead = cond.eatHead ?? 0;
      const condEatTail = cond.eatTail ?? 0;

      return (
        cond.tsGloup
          .map((ts) => MusicTheory.getTSName(ts))
          .includes(MusicTheory.getTSName(req.ts)) &&
        cond.beat === req.beat &&
        condEatHead === req.eatHead &&
        condEatTail === req.eatTail
      );
    });

    const list: StorePianoEditor.Preset[] = bkgPatts.map((bkgPatt) => {
      const voics: number[] = [];

      const presetBkgPatt = lib.presets.find((p) => p.bkgPatt === bkgPatt.no);
      if (presetBkgPatt != undefined) {
        presetBkgPatt.voics.forEach((vNo) => {
          const sndsPatt = lib.soundsPatterns.find((p) => p.no === vNo);
          if (sndsPatt == undefined) {
            throw new Error("Voicing pattern was not found.");
          }
          if (req.structCnt === sndsPatt.category.structCnt) {
            voics.push(vNo);
          }
        });
      }

      track.relations.forEach((r) => {
        const sndsPatt = lib.soundsPatterns.find((p) => p.no === r.sndsPatt);
        if (sndsPatt == undefined) {
          throw new Error("Voicing pattern was not found.");
        }
        if (
          req.structCnt === sndsPatt.category.structCnt &&
          r.bkgPatt === bkgPatt.no &&
          !voics.includes(sndsPatt.no)
        ) {
          voics.push(r.sndsPatt);
        }
      });

      return {
        bkgPatt: bkgPatt.no,
        sortNo: -1,
        voics,
      };
    });

    return list.filter(
      (patt) => !(isFilterPatternOnly && patt.voics.length === 0),
    );
  };
}

export default ArrangeLibrary;
