import type MelodyState from "../../melody-state";
import ArrangeState from "../arrange-state";
import type ArrangeLibrary from "../arrange-library";
import PianoBackingState from "./piano-backing-state";

namespace PianoEditorState {
  export type Phase = "preset" | "edit" | "preview";
  export type Control = "voicing" | "col" | "record" | "notes";

  export interface Props {
    phase: Phase;
    control: Control;

    preset: PresetBak;
    voicing: Voicing;
    backing: null | PianoBackingState.EditorProps;

    /** 繧ｨ繝・ぅ繧ｿ襍ｷ蜍墓凾縺ｮ繧ｽ繝ｼ繧ｹ繧剃ｿ晄戟 */
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
    track: ArrangeState.Track,
  ): Props => {
    const props = createInitialProps();
    const relation = track.relations.find((r) => r.chordSeq === chordSeq);
    if (relation != undefined) {
      const lib = track.pianoLib;
      if (lib == undefined) throw new Error();
      // console.log(relation);
      if (relation.bkgPatt !== -1) {
        const bkgPatt = lib.backingPatterns.find(
          (p) => p.no === relation.bkgPatt,
        );
        if (bkgPatt == undefined) throw new Error();
        const bkg = bkgPatt.backing;
        props.backing = PianoBackingState.createInitialBackingProps();
        props.backing.recordNum = JSON.parse(JSON.stringify(bkg.recordNum));
        props.backing.layers = JSON.parse(JSON.stringify(bkg.layers));
      }

      const sndsPatt = lib.soundsPatterns.find(
        (p) => p.no === relation.sndsPatt,
      );
      if (sndsPatt == undefined) throw new Error();
      const sounds = sndsPatt.sounds;
      props.voicing.items = sounds.slice();
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
    // extends ArrangeEditor.Unit {
    voicingSounds: string[];
    layers: PianoBackingState.Layer[];
  }

  export interface BackingPattern extends ArrangeState.Pattern {
    backing: PianoBackingState.DataProps;

    category: ArrangeLibrary.BackingCategory;
  }
  export interface SoundsPattern extends ArrangeState.Pattern {
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

  // export const getUnitFromEditor = (editor: Props): Unit => {
  //     return {
  //         layers: editor.backing.layers,
  //         voicingSounds: editor.voicing.sounds
  //     }
  // }

  /**
   * 繧｢繝ｬ繝ｳ繧ｸ・医ヰ繝・く繝ｳ繧ｰ繝ｻ繝懊う繧ｷ繝ｳ繧ｰ・峨ヱ繧ｿ繝ｼ繝ｳ繧呈､懃ｴ｢・医↑縺代ｌ縺ｰ逋ｻ骭ｲ・峨＠縲∬ｭ伜挨騾｣逡ｪ繧定ｿ斐☆
   * @param category 讀懃ｴ｢逕ｨ縺ｮ繧ｫ繝・ざ繝ｪ
   * @param backing 繝舌ャ繧ｭ繝ｳ繧ｰ
   * @param sounds 繝懊う繧ｷ繝ｳ繧ｰ
   * @param lib 繝ｩ繧､繝悶Λ繝ｪ
   * @returns 繧｢繝ｬ繝ｳ繧ｸ・医ヰ繝・く繝ｳ繧ｰ繝ｻ繝懊う繧ｷ繝ｳ繧ｰ・峨・隴伜挨騾｣逡ｪ縺ｮ驟榊・・亥・蜑ｲ莉｣蜈･縺ｧ菴ｿ縺・Φ螳夲ｼ・
   */
  export const registPattern = (
    category: ArrangeLibrary.SearchCategory,
    backing: PianoBackingState.DataProps | null,
    sounds: string[],
    lib: Lib,
  ) => {
    let backingPatt: BackingPattern | undefined = undefined;
    if (backing != null) {
      const backingSrc = JSON.stringify(backing);
      // 譌｢蟄倥・繝舌ャ繧ｭ繝ｳ繧ｰ繝代ち繝ｼ繝ｳ繧呈､懃ｴ｢
      backingPatt = lib.backingPatterns.find((pat) => {
        const pattSrc = JSON.stringify(pat.backing);
        return backingSrc === pattSrc;
      });
      // 譌｢蟄倥・繝代ち繝ｼ繝ｳ縺瑚ｦ九▽縺九ｉ縺ｪ縺九▲縺溷ｴ蜷医∵眠隕剰ｿｽ蜉
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
    // 譌｢蟄倥・讒区・髻ｳ繝代ち繝ｼ繝ｳ繧呈､懃ｴ｢
    let soundsPatt = lib.soundsPatterns.find((pat) => {
      const pattSrc = JSON.stringify(pat.sounds);
      return soundsSrc === pattSrc;
    });
    // 譌｢蟄倥・繝代ち繝ｼ繝ｳ縺瑚ｦ九▽縺九ｉ縺ｪ縺九▲縺溷ｴ蜷医∵眠隕剰ｿｽ蜉
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

  /**
   * 繧ｳ繝ｼ繝峨↓蜑ｲ繧雁ｽ薙※繧峨ｌ縺ｦ縺・ｋ繧｢繝ｬ繝ｳ繧ｸ繝代ち繝ｼ繝ｳ繧呈､懃ｴ｢縺励※霑斐☆縲・
   * 蜑ｲ繧雁ｽ薙※繧峨ｌ縺ｦ縺・↑縺・ｴ蜷・ndefined繧定ｿ斐☆縲・
   * @param chordSeq
   * @param track
   * @returns
   */
  export const getArrangePatternFromRelation = (
    chordSeq: number,
    track: ArrangeState.Track,
  ): Unit | undefined => {
    const relations = track.relations;
    const relation = relations.find((r) => r.chordSeq === chordSeq);

    if (relation != undefined) {
      const pianoLib = track.pianoLib as PianoEditorState.Lib;
      const backingPatt = pianoLib.backingPatterns.find(
        (patt) => patt.no === relation.bkgPatt,
      );
      if (backingPatt == null)
        throw new Error("backingPatt must not be undefined.");
      const soundsPatt = pianoLib.soundsPatterns.find(
        (patt) => patt.no === relation.sndsPatt,
      );
      if (soundsPatt == null)
        throw new Error("soundsPatt must not be undefined.");

      return {
        voicingSounds: soundsPatt.sounds,
        layers: backingPatt.backing.layers,
      };
    }
    return undefined;
  };

  export const deleteUnreferUnit = (track: ArrangeState.Track) => {
    const pianoLib = track.pianoLib as PianoEditorState.Lib;
    ArrangeState.deleteUnreferPattern(
      "bkgPatt",
      pianoLib.backingPatterns,
      (patt: ArrangeState.Pattern) => {
        return pianoLib.presets.find((p) => p.bkgPatt === patt.no) != undefined;
      },
      track,
    );
    ArrangeState.deleteUnreferPattern(
      "sndsPatt",
      pianoLib.soundsPatterns,
      (patt: ArrangeState.Pattern) => {
        const result =
          pianoLib.presets.find((p) => {
            // console.log(`p.voics:${p.voics}, patt.no:${patt.no}`);
            return p.voics.includes(patt.no);
          }) != undefined;
        // console.log(`result: ${result}`);
        return result;
      },
      track,
    );
  };
}

export default PianoEditorState;
