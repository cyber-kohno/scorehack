import type DerivedState from "../../store/state/derived-state";
import MelodyState from "../../store/state/data/melody-state";
import type TonalityTheory from "../../domain/theory/tonality-theory";
import RhythmTheory from "../../domain/theory/rhythm-theory";
import RomajiPronunciation from "../../domain/lyric/romaji-pronunciation";

namespace MusicXmlExporter {
    const DIVISIONS = 480;

    type MeasureInfo = {
        start: number;
        end: number;
        number: number;
        base: DerivedState.BaseCache;
        isBaseStart: boolean;
    };

    type NoteSegment = {
        note?: MelodyState.VocalNote;
        start: number;
        end: number;
        tieStart: boolean;
        tieStop: boolean;
    };

    export type LyricError = {
        measure: number;
        pron: string;
    };

    export type Result =
        | { ok: true; xml: string }
        | { ok: false; errors: LyricError[] };

    const escapeXml = (value: string) => {
        return value
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&apos;");
    };

    const formatDuration = (beatNoteLength: number) => {
        return Math.max(1, Math.round(beatNoteLength * DIVISIONS));
    };

    const getMeasureLengthBeatNote = (base: DerivedState.BaseCache) => {
        const ts = base.scoreBase.rhythm.ts;
        return (ts.cnt * 4) / ts.unit;
    };

    const roundUpToMeasureEnd = (
        baseStart: number,
        tail: number,
        measureLength: number,
    ) => {
        const length = Math.max(0, tail - baseStart);
        const measureCount = Math.ceil((length - 1e-9) / measureLength);
        return baseStart + Math.max(1, measureCount) * measureLength;
    };

    const buildMeasures = (derived: DerivedState.Value, track: MelodyState.ScoreTrack): MeasureInfo[] => {
        const noteTail = track.notes.reduce((tail, note) => {
            const side = MelodyState.calcBeatSide(note);
            return Math.max(tail, side.pos + side.len);
        }, 0);
        const scoreTail = derived.baseCaches.reduce((tail, base) => {
            return Math.max(tail, base.startBeatNote + base.lengthBeatNote);
        }, 0);
        const tail = Math.max(noteTail, scoreTail);
        const measures: MeasureInfo[] = [];
        let number = 1;

        derived.baseCaches.forEach((base, index) => {
            const measureLength = getMeasureLengthBeatNote(base);
            const nextBase = derived.baseCaches[index + 1];
            const exactBaseTail = nextBase?.startBeatNote ?? Math.max(base.startBeatNote + base.lengthBeatNote, tail);
            const baseTail = nextBase == undefined
                ? roundUpToMeasureEnd(base.startBeatNote, exactBaseTail, measureLength)
                : exactBaseTail;
            let start = base.startBeatNote;
            let isBaseStart = true;

            while (start < baseTail - 1e-9) {
                const end = Math.min(start + measureLength, baseTail);
                measures.push({ start, end, number, base, isBaseStart });
                number++;
                start = end;
                isBaseStart = false;
            }
        });

        if (measures.length === 0 && derived.baseCaches[0] != undefined) {
            const base = derived.baseCaches[0];
            measures.push({
                start: 0,
                end: getMeasureLengthBeatNote(base),
                number,
                base,
                isBaseStart: true,
            });
        }

        return measures;
    };

    const getFifths = (tonality: TonalityTheory.Tonality) => {
        const targetKey12 = tonality.scale === "minor"
            ? (tonality.key12 + 3) % 12
            : tonality.key12;
        let best: number | null = null;
        for (let fifths = -7; fifths <= 7; fifths++) {
            const key12 = ((fifths * 7) % 12 + 12) % 12;
            if (key12 === targetKey12 && (best == null || Math.abs(fifths) < Math.abs(best))) {
                best = fifths;
            }
        }
        return best ?? 0;
    };

    const isSameTonality = (
        left: TonalityTheory.Tonality,
        right: TonalityTheory.Tonality,
    ) => {
        return left.key12 === right.key12
            && left.scale === right.scale;
    };

    const isSameTimeSignature = (
        left: RhythmTheory.TimeSignature,
        right: RhythmTheory.TimeSignature,
    ) => {
        return left.cnt === right.cnt
            && left.unit === right.unit;
    };

    const pitchToXml = (pitch: number) => {
        const pitchClass = ((pitch % 12) + 12) % 12;
        const octave = Math.floor(pitch / 12);
        const steps = [
            { step: "C", alter: 0 },
            { step: "C", alter: 1 },
            { step: "D", alter: 0 },
            { step: "D", alter: 1 },
            { step: "E", alter: 0 },
            { step: "F", alter: 0 },
            { step: "F", alter: 1 },
            { step: "G", alter: 0 },
            { step: "G", alter: 1 },
            { step: "A", alter: 0 },
            { step: "A", alter: 1 },
            { step: "B", alter: 0 },
        ];
        return { ...steps[pitchClass], octave };
    };

    const getType = (beatNoteLength: number) => {
        const defs = [
            { len: 4, type: "whole", dots: 0 },
            { len: 3, type: "half", dots: 1 },
            { len: 2, type: "half", dots: 0 },
            { len: 1.5, type: "quarter", dots: 1 },
            { len: 1, type: "quarter", dots: 0 },
            { len: 0.75, type: "eighth", dots: 1 },
            { len: 0.5, type: "eighth", dots: 0 },
            { len: 0.375, type: "16th", dots: 1 },
            { len: 0.25, type: "16th", dots: 0 },
            { len: 0.125, type: "32nd", dots: 0 },
        ];
        return defs.find((def) => Math.abs(def.len - beatNoteLength) < 1e-9);
    };

    const renderNote = (segment: NoteSegment, indent: string) => {
        const duration = formatDuration(segment.end - segment.start);
        const type = getType(segment.end - segment.start);
        const lines = [`${indent}<note>`];

        if (segment.note == undefined) {
            lines.push(`${indent}  <rest/>`);
        } else {
            const pitch = pitchToXml(segment.note.pitch);
            lines.push(`${indent}  <pitch>`);
            lines.push(`${indent}    <step>${pitch.step}</step>`);
            if (pitch.alter !== 0) lines.push(`${indent}    <alter>${pitch.alter}</alter>`);
            lines.push(`${indent}    <octave>${pitch.octave}</octave>`);
            lines.push(`${indent}  </pitch>`);
        }

        lines.push(`${indent}  <duration>${duration}</duration>`);
        if (segment.tieStart) lines.push(`${indent}  <tie type="start"/>`);
        if (segment.tieStop) lines.push(`${indent}  <tie type="stop"/>`);
        if (type != undefined) {
            lines.push(`${indent}  <type>${type.type}</type>`);
            for (let i = 0; i < type.dots; i++) lines.push(`${indent}  <dot/>`);
        }
        if (segment.note != undefined && (segment.tieStart || segment.tieStop)) {
            lines.push(`${indent}  <notations>`);
            if (segment.tieStop) lines.push(`${indent}    <tied type="stop"/>`);
            if (segment.tieStart) lines.push(`${indent}    <tied type="start"/>`);
            lines.push(`${indent}  </notations>`);
        }
        if (segment.note?.pron != undefined) {
            const lyric = RomajiPronunciation.toHiragana(segment.note.pron);
            if (lyric == null) throw new Error(`Invalid pronunciation. [${segment.note.pron}]`);
            lines.push(`${indent}  <lyric>`);
            lines.push(`${indent}    <syllabic>single</syllabic>`);
            lines.push(`${indent}    <text>${escapeXml(lyric)}</text>`);
            lines.push(`${indent}  </lyric>`);
        }
        lines.push(`${indent}</note>`);
        return lines;
    };

    const collectMeasureSegments = (
        track: MelodyState.ScoreTrack,
        measure: MeasureInfo,
    ): NoteSegment[] => {
        const segments: NoteSegment[] = [];
        const notes = track.notes
            .map((note) => ({ note, side: MelodyState.calcBeatSide(note) }))
            .filter(({ side }) => side.pos < measure.end - 1e-9 && side.pos + side.len > measure.start + 1e-9)
            .sort((a, b) => a.side.pos - b.side.pos);
        let cursor = measure.start;

        notes.forEach(({ note, side }) => {
            const noteStart = Math.max(side.pos, measure.start);
            const noteEnd = Math.min(side.pos + side.len, measure.end);

            if (noteStart > cursor + 1e-9) {
                segments.push({
                    start: cursor,
                    end: noteStart,
                    tieStart: false,
                    tieStop: false,
                });
            }

            segments.push({
                note,
                start: noteStart,
                end: noteEnd,
                tieStart: noteEnd < side.pos + side.len - 1e-9,
                tieStop: noteStart > side.pos + 1e-9,
            });
            cursor = Math.max(cursor, noteEnd);
        });

        if (cursor < measure.end - 1e-9) {
            segments.push({
                start: cursor,
                end: measure.end,
                tieStart: false,
                tieStop: false,
            });
        }

        return segments;
    };

    const validateLyrics = (
        track: MelodyState.ScoreTrack,
        measures: MeasureInfo[],
    ): LyricError[] => {
        return track.notes.flatMap((note) => {
            if (note.pron == undefined) return [];

            const lyric = RomajiPronunciation.toHiragana(note.pron);
            if (lyric != null) return [];

            const side = MelodyState.calcBeatSide(note);
            const measure = measures.find((item) => {
                return side.pos >= item.start - 1e-9 && side.pos < item.end - 1e-9;
            });
            return [{
                measure: measure?.number ?? 0,
                pron: note.pron,
            }];
        });
    };

    const renderAttributes = (
        measure: MeasureInfo,
        prevBase: DerivedState.BaseCache | undefined,
    ) => {
        const scoreBase = measure.base.scoreBase;
        const ts = scoreBase.rhythm.ts;
        const isFirst = prevBase == undefined;
        const shouldRenderKey = isFirst
            || !isSameTonality(prevBase.scoreBase.tonality, scoreBase.tonality);
        const shouldRenderTime = isFirst
            || !isSameTimeSignature(prevBase.scoreBase.rhythm.ts, ts);

        if (!isFirst && !shouldRenderKey && !shouldRenderTime) return [];

        const lines = [
            "      <attributes>",
        ];
        if (isFirst) lines.push(`        <divisions>${DIVISIONS}</divisions>`);
        if (shouldRenderKey) {
            lines.push("        <key>");
            lines.push(`          <fifths>${getFifths(scoreBase.tonality)}</fifths>`);
            lines.push(`          <mode>${scoreBase.tonality.scale}</mode>`);
            lines.push("        </key>");
        }
        if (shouldRenderTime) {
            lines.push("        <time>");
            lines.push(`          <beats>${ts.cnt}</beats>`);
            lines.push(`          <beat-type>${ts.unit}</beat-type>`);
            lines.push("        </time>");
        }
        if (isFirst) {
            lines.push("        <clef>");
            lines.push("          <sign>G</sign>");
            lines.push("          <line>2</line>");
            lines.push("        </clef>");
        }
        lines.push("      </attributes>");
        return lines;
    };

    const renderTempoDirection = (
        measure: MeasureInfo,
        prevBase: DerivedState.BaseCache | undefined,
    ) => {
        const tempo = measure.base.scoreBase.tempo;
        if (prevBase != undefined && prevBase.scoreBase.tempo === tempo) return [];

        const beatRate = RhythmTheory.getBeatDiv16Count(measure.base.scoreBase.rhythm.ts) / 4;
        const soundTempo = tempo * beatRate;
        const beatUnitDot = beatRate === 1.5 ? "<beat-unit-dot/>" : "";

        return [
            `      <direction placement="above">`,
            `        <direction-type><metronome><beat-unit>quarter</beat-unit>${beatUnitDot}<per-minute>${tempo}</per-minute></metronome></direction-type>`,
            `        <sound tempo="${soundTempo}"/>`,
            `      </direction>`,
        ];
    };

    export const create = (props: {
        title: string;
        track: MelodyState.ScoreTrack;
        derived: DerivedState.Value;
    }): Result => {
        const title = escapeXml(props.title);
        const measures = buildMeasures(props.derived, props.track);
        const lyricErrors = validateLyrics(props.track, measures);
        if (lyricErrors.length > 0) {
            return {
                ok: false,
                errors: lyricErrors,
            };
        }

        const lines = [
            `<?xml version="1.0" encoding="UTF-8" standalone="no"?>`,
            `<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 4.0 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">`,
            `<score-partwise version="4.0">`,
            `  <work>`,
            `    <work-title>${title}</work-title>`,
            `  </work>`,
            `  <part-list>`,
            `    <score-part id="P1">`,
            `      <part-name>${escapeXml(props.track.name)}</part-name>`,
            `    </score-part>`,
            `  </part-list>`,
            `  <part id="P1">`,
        ];

        let prevBase: DerivedState.BaseCache | undefined = undefined;
        measures.forEach((measure) => {
            lines.push(`    <measure number="${measure.number}">`);
            if (measure.isBaseStart) {
                lines.push(...renderAttributes(measure, prevBase));
                lines.push(...renderTempoDirection(measure, prevBase));
                prevBase = measure.base;
            }
            collectMeasureSegments(props.track, measure).forEach((segment) => {
                lines.push(...renderNote(segment, "      "));
            });
            lines.push(`    </measure>`);
        });

        lines.push(`  </part>`);
        lines.push(`</score-partwise>`);
        return {
            ok: true,
            xml: lines.join("\n"),
        };
    };
}

export default MusicXmlExporter;
