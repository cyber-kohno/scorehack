import type StoreMelody from "../melody/melody-store";
import StoreArrange from "./arrange-store";
import type ArrangeLibrary from "./arrange-library";
import StorePianoBacking from "./piano-backing-store";

namespace StorePianoEditor {
  export type Phase = "preset" | "edit" | "preview";
  export type Control = "voicing" | "col" | "record" | "notes";

  export interface Props {
    phase: Phase;
    control: Control;
    preset: PresetBak;
    voicing: Voicing;
    backing: null | StorePianoBacking.EditorProps;
    lastSource: string;
  }

  export const createInitialProps = (): Props => {
    return {
      backing: null,
      phase: "edit",
      control: "voicing",
      lastSource: "",
      voicing: {
        cursorX: 0,
        cursorY: 0,
        items: [],
      },
      preset: { index: -1, list: [] },
    };
  };

  export const getEditorProps = (
    chordSeq: number,
    track: StoreArrange.Track,
  ): Props => {
    const props = createInitialProps();
    const relation = track.relations.find((r) => r.chordSeq === chordSeq);
    if (relation != undefined) {
      const lib = track.pianoLib;
      if (lib == undefined) throw new Error();
      if (relation.bkgPatt !== -1) {
        const bkgPatt = lib.backingPatterns.find((p) => p.no === relation.bkgPatt);
        if (bkgPatt == undefined) throw new Error();
        const bkg = bkgPatt.backing;
        props.backing = StorePianoBacking.createInitialBackingProps();
        props.backing.recordNum = JSON.parse(JSON.stringify(bkg.recordNum));
        props.backing.layers = JSON.parse(JSON.stringify(bkg.layers));
      }

      const sndsPatt = lib.soundsPatterns.find((p) => p.no === relation.sndsPatt);
      if (sndsPatt == undefined) throw new Error();
      props.voicing.items = sndsPatt.sounds.slice();
    }
    return props;
  };

  type PresetBak = {
    list: Unit[];
    index: number;
  };

  type Voicing = {
    items: string[];
    cursorX: number;
    cursorY: number;
  };

  export interface Unit {
    voicingSounds: string[];
    layers: StorePianoBacking.Layer[];
  }

  export interface BackingPattern extends StoreArrange.Pattern {
    backing: StorePianoBacking.DataProps;
    category: ArrangeLibrary.BackingCategory;
  }

  export interface SoundsPattern extends StoreArrange.Pattern {
    sounds: string[];
    category: ArrangeLibrary.SoundsCategory;
  }

  export type Preset = {
    bkgPatt: number;
    sortNo: number;
    voics: number[];
  };

  export type Lib = {
    backingPatterns: BackingPattern[];
    soundsPatterns: SoundsPattern[];
    presets: Preset[];
  };

  export const createInitialLib = (): Lib => ({
    backingPatterns: [],
    soundsPatterns: [],
    presets: [],
  });

  export const registPattern = (
    category: ArrangeLibrary.SearchCategory,
    backing: StorePianoBacking.DataProps | null,
    sounds: string[],
    lib: Lib,
  ) => {
    let backingPatt: BackingPattern | undefined = undefined;
    if (backing != null) {
      const backingSrc = JSON.stringify(backing);
      backingPatt = lib.backingPatterns.find((pat) => {
        const pattSrc = JSON.stringify(pat.backing);
        return backingSrc === pattSrc;
      });
      if (backingPatt == undefined) {
        const maxNo = lib.backingPatterns.reduce(
          (p, n) => (n.no > p ? n.no : p),
          -1,
        );
        backingPatt = {
          no: maxNo + 1,
          backing: JSON.parse(backingSrc),
          category: { ...category },
        };
        lib.backingPatterns.push(backingPatt);
      }
    }

    const soundsSrc = JSON.stringify(sounds);
    let soundsPatt = lib.soundsPatterns.find((pat) => {
      const pattSrc = JSON.stringify(pat.sounds);
      return soundsSrc === pattSrc;
    });
    if (soundsPatt == undefined) {
      const maxNo = lib.soundsPatterns.reduce(
        (p, n) => (n.no > p ? n.no : p),
        -1,
      );
      soundsPatt = {
        no: maxNo + 1,
        sounds: JSON.parse(soundsSrc),
        category: { ...category },
      };
      lib.soundsPatterns.push(soundsPatt);
    }
    return [backingPatt == null ? -1 : backingPatt.no, soundsPatt.no];
  };

  export const getArrangePatternFromRelation = (
    chordSeq: number,
    track: StoreArrange.Track,
  ): Unit | undefined => {
    const relation = track.relations.find((r) => r.chordSeq === chordSeq);

    if (relation != undefined) {
      const pianoLib = track.pianoLib as StorePianoEditor.Lib;
      const backingPatt = pianoLib.backingPatterns.find(
        (patt) => patt.no === relation.bkgPatt,
      );
      if (backingPatt == null) {
        throw new Error("backingPatt must not be undefined.");
      }
      const soundsPatt = pianoLib.soundsPatterns.find(
        (patt) => patt.no === relation.sndsPatt,
      );
      if (soundsPatt == null) {
        throw new Error("soundsPatt must not be undefined.");
      }

      return {
        voicingSounds: soundsPatt.sounds,
        layers: backingPatt.backing.layers,
      };
    }
    return undefined;
  };

  export const deleteUnreferUnit = (track: StoreArrange.Track) => {
    const pianoLib = track.pianoLib as StorePianoEditor.Lib;
    StoreArrange.deleteUnreferPattern(
      "bkgPatt",
      pianoLib.backingPatterns,
      (patt: StoreArrange.Pattern) => {
        return pianoLib.presets.find((p) => p.bkgPatt === patt.no) != undefined;
      },
      track,
    );
    StoreArrange.deleteUnreferPattern(
      "sndsPatt",
      pianoLib.soundsPatterns,
      (patt: StoreArrange.Pattern) => {
        return (
          pianoLib.presets.find((p) => {
            return p.voics.includes(patt.no);
          }) != undefined
        );
      },
      track,
    );
  };
}

export default StorePianoEditor;
