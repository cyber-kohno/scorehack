import Layout from "../../styles/tokens/layout-tokens";
import {
  OUTLINE_MARGIN_HEAD,
  type OutlineDataChord,
  type OutlineDataInit,
  type OutlineDataModulate,
  type OutlineDataSection,
  type OutlineDataTempo,
} from "../../domain/outline/outline-types";
import MusicTheory from "../../domain/theory/music-theory";
import { getEnvBeatWidth } from "../session-state/env-store";
import { getArrangeTracks } from "../project-data/arrange-project-data";
import { getOutlineElements } from "../project-data/outline-project-data";
import { setCache } from "./cache-store";
import type StoreCache from "../../state/cache-state/cache-store";
import type { StoreProps } from "../root-store";

export const recalculateCache = (lastStore: StoreProps) => {
  const elements = getOutlineElements(lastStore);
  const beatWidth = getEnvBeatWidth();

  const baseCaches: StoreCache.BaseCache[] = [];
  const elementCaches: StoreCache.ElementCache[] = [];
  const chordCaches: StoreCache.ChordCache[] = [];

  const initialScoreBase: OutlineDataInit = elements[0].data;

  let baseCache: StoreCache.BaseCache = {
    startTime: 0,
    sustainTime: 0,
    startBeat: 0,
    startBeatNote: 0,
    lengthBeat: 0,
    lengthBeatNote: 0,
    viewPosLeft: 0,
    viewPosWidth: 0,
    scoreBase: JSON.parse(JSON.stringify(initialScoreBase)),
    startBar: 1,
    baseSeq: 0,
  };

  let startBeat = 0;
  let startBeatNote = 0;
  let elapsedTime = 0;
  let prevEat = 0;
  let lastChordSeq = -1;
  let viewPos = 0;
  let outlineTailPos = OUTLINE_MARGIN_HEAD;
  let sectionStart: string | undefined = undefined;
  let lastModulate: StoreCache.ModulateCahce | undefined = undefined;
  let lastTempo: StoreCache.TempoCahce | undefined = undefined;
  let curSection = "";

  elements.forEach((el, i) => {
    const elementCache: StoreCache.ElementCache = {
      ...JSON.parse(JSON.stringify(el)),
      baseSeq: baseCaches.length,
      elementSeq: i,
      chordSeq: -1,
      lastChordSeq,
      viewHeight: 0,
      outlineTop: outlineTailPos,
      curSection,
    };

    switch (el.type) {
      case "section": {
        const data = el.data as OutlineDataSection;
        curSection = sectionStart = data.name;
        elementCache.curSection = curSection;
        break;
      }
      case "chord": {
        lastChordSeq++;
        elementCache.lastChordSeq = lastChordSeq;

        const data = el.data as OutlineDataChord;
        let compiledChord: StoreCache.CompiledChord | undefined = undefined;
        if (data.degree != undefined) {
          const tonality = baseCache.scoreBase.tonality;
          const chord = MusicTheory.getKeyChordFromDegree(tonality, data.degree);
          const symbol = MusicTheory.getSymbolProps(chord.symbol);
          const structs: MusicTheory.ChordStruct[] = symbol.structs.map((s) => {
            const interval = MusicTheory.getIntervalFromRelation(s);
            return {
              key12: (chord.key12 + interval) % 12,
              relation: s,
            };
          });

          const on = chord.on;
          if (on != undefined) {
            const same = structs.find((s) => on.key12 === s.key12);
            if (same == undefined) {
              structs.push({ key12: on.key12, relation: "on" });
            } else {
              same.relation = "on";
            }
          }

          compiledChord = { chord, structs };
        }

        const beatDiv16Cnt = MusicTheory.getBeatDiv16Count(baseCache.scoreBase.ts);
        const beatRate = beatDiv16Cnt / 4;
        const beatSize = data.beat + (prevEat * -1 + data.eat) / beatDiv16Cnt;
        const beatSizeNote = beatSize * beatRate;

        const viewPosLeft = viewPos;
        const viewPosWidth = beatSize * beatWidth;
        viewPos += viewPosWidth;

        const sustainTime =
          (60000 / baseCache.scoreBase.tempo) * (data.beat + (-prevEat + data.eat) / 4);

        const beat: StoreCache.BeatCache = {
          num: data.beat,
          eatHead: prevEat,
          eatTail: data.eat,
        };

        const arrs: string[] = [];
        getArrangeTracks(lastStore).forEach((track) => {
          const relation = track.relations.find((r) => r.chordSeq === lastChordSeq);
          if (relation != undefined) arrs.push(track.name);
        });

        const chordCache: StoreCache.ChordCache = {
          chordSeq: lastChordSeq,
          elementSeq: i,
          baseSeq: baseCaches.length,
          beat,
          compiledChord,
          startBeat,
          lengthBeat: beatSize,
          startBeatNote,
          lengthBeatNote: beatSizeNote,
          viewPosLeft,
          viewPosWidth,
          sustainTime,
          startTime: elapsedTime,
          sectionStart,
          modulate: lastModulate,
          tempo: lastTempo,
          arrs,
        };

        startBeat += beatSize;
        startBeatNote += beatSizeNote;
        sectionStart = undefined;
        lastModulate = undefined;
        lastTempo = undefined;

        chordCaches.push(chordCache);
        elementCache.chordSeq = lastChordSeq;

        elapsedTime += sustainTime;
        prevEat = data.eat;
        baseCache.sustainTime += sustainTime;
        baseCache.lengthBeat += data.beat;
        baseCache.lengthBeatNote += data.beat * beatRate;
        break;
      }
      case "modulate":
      case "tempo": {
        baseCache.viewPosWidth = viewPos - baseCache.viewPosLeft;
        baseCaches.push(baseCache);

        elementCache.baseSeq++;
        baseCache = JSON.parse(JSON.stringify(baseCache));
        baseCache.baseSeq++;
        baseCache.viewPosLeft = viewPos;
        baseCache.startTime = elapsedTime;
        baseCache.sustainTime = 0;

        const divCnt = MusicTheory.getBarDivBeatCount(baseCache.scoreBase.ts);
        baseCache.startBar += Math.ceil(baseCache.lengthBeat / divCnt);
        baseCache.startBeat = baseCache.startBeat + baseCache.lengthBeat;
        baseCache.startBeatNote += baseCache.lengthBeatNote;
        baseCache.lengthBeat = 0;
        baseCache.lengthBeatNote = 0;

        switch (el.type) {
          case "modulate": {
            const data = el.data as OutlineDataModulate;
            const tonality = baseCache.scoreBase.tonality;
            const prevTonality: MusicTheory.Tonality = JSON.parse(JSON.stringify(tonality));

            const updateKey12 = (val: number) => {
              let nextKey12 = tonality.key12 + val;
              while (nextKey12 < 0) nextKey12 += 12;
              tonality.key12 = nextKey12 % 12;
            };
            const invertScale = () => {
              tonality.scale = tonality.scale === "major" ? "minor" : "major";
            };

            switch (data.method) {
              case "domm":
                updateKey12(data.val * MusicTheory.DOMMINANT_KEY_COEFFICENT);
                break;
              case "key":
                updateKey12(data.val);
                break;
              case "parallel":
                invertScale();
                break;
              case "relative": {
                let val = MusicTheory.DOMMINANT_KEY_COEFFICENT * 3;
                if (tonality.scale === "minor") val *= -1;
                updateKey12(val);
                invertScale();
                break;
              }
            }

            lastModulate = { prev: prevTonality, next: tonality };
            elementCache.modulate = lastModulate;
            break;
          }
          case "tempo": {
            const data = el.data as OutlineDataTempo;
            let tempo = baseCache.scoreBase.tempo;
            const prev = tempo;

            switch (data.method) {
              case "rate":
                tempo = Math.floor(tempo * (data.val / 100));
                break;
              case "addition":
                tempo += data.val;
                break;
            }

            lastTempo = { prev, next: tempo };
            elementCache.tempo = lastTempo;
            baseCache.scoreBase.tempo = tempo;
            break;
          }
        }
        break;
      }
    }

    const getElementViewHeight = () => {
      const EL = Layout.element;
      switch (elementCache.type) {
        case "init":
          return (EL.INIT_RECORD_HEIGHT + EL.INIT_RECORD_MARGIN) * 3 + EL.INIT_RECORD_MARGIN;
        case "section":
          return (
            EL.SECTION_LABEL_HEIGHT +
            EL.SECTION_BORDER_HEIGHT +
            EL.SECTION_TOP_MARGIN +
            EL.SECTION_BOTTOM_MARGIN
          );
        case "chord": {
          const data = elementCache.data as OutlineDataChord;
          let ret = EL.CHORD_SEQ_HEIGHT + EL.CHORD_TIP_HEIGHT + EL.CHORD_DEGREE_HEIGHT;
          if (data.degree != undefined) ret += EL.CHORD_NAME_HEIGHT;
          if (chordCaches[lastChordSeq].arrs.length > 0) ret += EL.CHORD_ARR_HEIGHT;
          return ret;
        }
        case "modulate":
          return EL.MODULATE_RECRORD_HEIGHT * 3;
      }
      return 0;
    };

    elementCache.viewHeight = getElementViewHeight();
    outlineTailPos += elementCache.viewHeight;
    outlineTailPos += 2;
    outlineTailPos += OUTLINE_MARGIN_HEAD;

    elementCaches.push(elementCache);
  });

  baseCache.viewPosWidth = viewPos - baseCache.viewPosLeft;
  baseCaches.push(baseCache);

  setCache({
    baseCaches,
    chordCaches,
    elementCaches,
    outlineTailPos,
  });
};

