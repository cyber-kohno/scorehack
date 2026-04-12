import type StorePianoEditor from "../../../store/props/arrange/piano/storePianoEditor";
import type StoreCache from "../../../store/props/storeCache";
import StoreMelody from "../../../store/props/storeMelody";
import MusicTheory from "../../../../domain/theory/music-theory";
import type PreviewUtil from "../previewUtil";

namespace PianoArrangePreviewUtil {
  /**
   * 繧｢繝ｬ繝ｳ繧ｸ縺ｮ繝代ち繝ｼ繝ｳ繝ｦ繝九ャ繝医ｒ繝弱・繝・ュ蝣ｱ縺ｫ螟画鋤縺励※霑斐☆縲・
   * @param unit
   * @param chord
   * @returns
   */
  export const convertPatternToNotes = (
    unit: StorePianoEditor.Unit,
    chord: MusicTheory.KeyChordProps,
  ): PreviewUtil.SoundNote[] => {
    const notes: PreviewUtil.SoundNote[] = [];

    const relationStructs = calcRelationStructs(chord);

    const pitchIndexes = unit.voicingSounds.map((v) => {
      const [octaveIndex, structIndex] = v.split(".").map((v) => Number(v));
      const struct = relationStructs[structIndex];
      return (octaveIndex + struct.carryForwardOctave) * 12 + struct.key12;
    });

    /** 繝壹ム繝ｫ隕∫ｴ縺ｯ0繝ｬ繧､繝､繝ｼ縺ｧ縺ｮ縺ｿ邂｡逅・☆繧九◆繧√・繝ｼ繧ｹ縺ｨ縺励※菫晄戟縺吶ｋ */
    const baseCols = unit.layers[0].cols;

    unit.layers.forEach((l) => {
      // console.log(l);
      l.items.forEach((src) => {
        const note = convSrcToNote(src);
        const col = l.cols[note.colIndex];
        const norm: StoreMelody.Norm = col;
        const criteriaRate = 1 / norm.div / (norm.tuplets ?? 1);
        // 繧ｫ繝ｩ繝・磯浹萓｡・峨ｈ繧贋ｽ咲ｽｮ繧貞叙蠕・
        const pos = l.cols.reduce((prev, cur, i) => {
          let ret = prev;
          const curRate = 1 / cur.div / (cur.tuplets ?? 1);
          const len = getDotRate(cur.dot);
          if (note.colIndex > i) {
            ret += len * (curRate / criteriaRate);
          }
          return ret;
        }, 0);
        let len = getDotRate(col.dot);

        /**
         * 蝓ｺ貅悶↓縺ｪ繧九・繝繝ｫ縺ｮ菴咲ｽｮ諠・ｱ繧定ｿ斐☆
         * @returns 繧ｫ繝ｩ繝[繧､繝ｳ繝・ャ繧ｯ繧ｹ縲∽ｽ咲ｽｮ・磯聞縺包ｼ云
         */
        const getPedalCriteria = () => {
          let curPos = 0;
          for (let i = 0; i < baseCols.length; i++) {
            const curCol = baseCols[i];
            const curRate = 1 / curCol.div / (curCol.tuplets ?? 1);
            const len = getDotRate(curCol.dot);
            const colLen = len * (curRate / criteriaRate);
            if (pos >= curPos && pos < curPos + colLen) {
              return [i, curPos];
            }
            curPos += colLen;
          }
          return [-1, 0];
        };
        const [baseColIndex, baseColPos] = getPedalCriteria();
        // console.log(`layer:${layerIndex}, ${note.colIndex}-${note.recordIndex} pedalIndex:[${baseColIndex}]`);

        // 繝壹ム繝ｫ縺瑚ｸ上∪繧後※縺・ｋ蝣ｴ蜷医√・繝繝ｫ繧定・・縺励◆髻ｳ萓｡縺ｫ荳頑嶌縺阪☆繧・
        if (baseColIndex !== -1 && baseCols[baseColIndex].pedal !== 0) {
          let pedalLen = 0;
          for (let i = baseColIndex; i < baseCols.length; i++) {
            const curCol = baseCols[i];
            const curRate = 1 / curCol.div / (curCol.tuplets ?? 1);
            const len = getDotRate(curCol.dot);
            const colLen = len * (curRate / criteriaRate);
            // 繝壹ム繝ｫ髢句ｧ玖ｦ∫ｴ縺ｮ縺ｿPOS縺ｮ蟾ｮ蛻・ｒ閠・・縺吶ｋ
            if (i === baseColIndex) {
              const adjust = pos - baseColPos;
              // console.log(`layer:${layerIndex}, ${note.colIndex}-${note.recordIndex} baseColPos:[${baseColPos}], pos:[${pos}]`);
              pedalLen += colLen - adjust;
            } else {
              // 雕上∩縺｣縺ｱ縺ｪ縺嶺ｻ･螟悶・蛻・ｋ
              if (curCol.pedal !== 1) break;
              pedalLen += colLen;
            }
          }
          // 繝壹ム繝ｫ縺ｮ譁ｹ縺碁聞縺代ｌ縺ｰ荳頑嶌縺阪☆繧・
          if (len < pedalLen) len = pedalLen;
        }
        const pitch = pitchIndexes[note.recordIndex];
        const velocity = note.velocity;
        notes.push({ pos, len, pitch, norm, velocity });
      });
    });
    return notes;
  };

  const getDotRate = (dot: number | undefined) => {
    switch (dot) {
      case undefined:
        return 1;
      case 1:
        return 1.5;
      case 2:
        return 1.75;
    }
    throw new Error(`dot縺梧Φ螳壹＠縺ｦ縺・↑縺・ヱ繧ｿ繝ｼ繝ｳ縺ｮ蛟､縲・${dot}]`);
  };

  /**
   * 繝弱・繝・・繧ｽ繝ｼ繧ｹ諠・ｱ・域枚蟄怜・・峨ｒ繧ｪ繝悶ず繧ｧ繧ｯ繝医↓螟画鋤縺励※霑斐☆
   * @param src
   * @returns
   */
  const convSrcToNote = (src: string) => {
    const items = src.split(".").map((v) => Number(v));
    const [colIndex, recordIndex] = items;
    let velocity = 10;
    let delay = 0;
    if (items.length !== 2) {
      velocity = items[2];
      delay = items[3];
    }
    return { colIndex, recordIndex, velocity, delay };
  };

  const calcRelationStructs = (chord: MusicTheory.KeyChordProps) => {
    const symbolProps = MusicTheory.getSymbolProps(chord.symbol);
    const relationStructs: {
      /** 繧ｪ繧ｯ繧ｿ繝ｼ繝也ｹｰ繧贋ｸ翫￡ */
      carryForwardOctave: number;
      key12: number;
    }[] = symbolProps.structs.map((s) => {
      const tempPitchIndex =
        chord.key12 + MusicTheory.getIntervalFromRelation(s);
      return {
        carryForwardOctave: Math.floor(tempPitchIndex / 12),
        key12: tempPitchIndex % 12,
      };
    });
    // console.log(chord);
    // 繧ｪ繝ｳ繧ｳ繝ｼ繝峨ｒ讒区・髻ｳ縺ｫ雜ｳ縺・
    if (chord.on != undefined) {
      const on = chord.on;
      if (!relationStructs.map((r) => r.key12).includes(on.key12)) {
        relationStructs.push({
          key12: on.key12,
          carryForwardOctave: 0,
        });
        // console.log(relationStructs);
        relationStructs.sort((a, b) => a.key12 - b.key12);
        // console.log(relationStructs);
      }
    }
    return relationStructs;
  };
}
export default PianoArrangePreviewUtil;

