import RhythmTheory from "../../../domain/theory/rhythm-theory";
import DrumEditorState from "../../../store/state/data/arrange/drum/drum-editor-state";
import type DerivedState from "../../../store/state/derived-state";
import type PlaybackCacheState from "../timeline/playback-cache-state";

namespace DrumArrangePatternNote {
    export const createNotes = (
        unit: DrumEditorState.Unit,
        option: {
            beat: DerivedState.BeatCache;
            ts: RhythmTheory.TimeSignature;
        },
    ): PlaybackCacheState.SoundNote[] => {
        const criteriaDiv = DrumEditorState.getEffectiveCriteriaDiv(
            unit.pattern.criteriaDiv,
            option.beat,
            option.ts,
        );
        const colCount = DrumEditorState.getColumnCount(
            criteriaDiv,
            option.beat,
            option.ts,
        );
        const cells = createCells(unit.pattern.colDivs, colCount, criteriaDiv, option.ts);
        const mappings = new Map(unit.mappings.map((mapping) => [mapping.key, mapping]));

        return unit.pattern.hits
            .map(DrumEditorState.convHitInfo)
            .map((hit): PlaybackCacheState.SoundNote | undefined => {
                const cell = cells[hit.colIndex];
                const record = unit.pattern.records[hit.recordIndex];
                if (cell == undefined || record == undefined) return undefined;

                const mapping = mappings.get(record.key);
                if (mapping == undefined || mapping.pitch === -1) return undefined;

                return {
                    norm: { div: 1 },
                    pos: cell.start,
                    len: cell.len,
                    pitch: mapping.pitch,
                    velocity: hit.velocity,
                };
            })
            .filter((note): note is PlaybackCacheState.SoundNote => note != undefined);
    };

    const createCells = (
        colDivs: DrumEditorState.ColDiv[],
        colCount: number,
        criteriaDiv: DrumEditorState.CriteriaDiv,
        ts: RhythmTheory.TimeSignature,
    ) => {
        const beatRate = RhythmTheory.getBeatDiv16Count(ts) / 4;
        const criteriaLen = beatRate / criteriaDiv;
        let start = 0;

        return Array.from({ length: colCount }, (_, index) => {
            const div = colDivs.find(item => item.index === index)?.div ?? 1;
            const splitLen = criteriaLen / div;

            const cells = Array.from({ length: div }, () => {
                const cell = { start, len: splitLen };
                start += splitLen;
                return cell;
            });
            return cells;
        }).flat();
    };
}

export default DrumArrangePatternNote;
