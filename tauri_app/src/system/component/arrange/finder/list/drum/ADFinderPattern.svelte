<script lang="ts">
  import RhythmTheory from "../../../../../domain/theory/rhythm-theory";
  import DrumHitIcon from "../../../../common/DrumHitIcon.svelte";
  import DrumEditorState from "../../../../../store/state/data/arrange/drum/drum-editor-state";

  export let pattern: DrumEditorState.Pattern;
  export let mappings: DrumEditorState.Mapping[];

  const BASE_THUMBNAIL_BEAT_WIDTH = 36;
  const RECORD_HEIGHT = 10;
  const MIN_CELL_WIDTH = 5;

  $: beatWidth = BASE_THUMBNAIL_BEAT_WIDTH / (RhythmTheory.getBeatDiv16Count(pattern.category.tsGroup[0]) / 4);
  $: criteriaDiv = pattern.pattern.criteriaDiv;
  $: baseColWidth = Math.max(MIN_CELL_WIDTH, beatWidth / criteriaDiv);
  $: baseColCount = DrumEditorState.getColumnCount(
    criteriaDiv,
    {
      num: pattern.category.beat,
      eatHead: pattern.category.eatHead ?? 0,
      eatTail: pattern.category.eatTail ?? 0,
    },
    pattern.category.tsGroup[0],
  );
  $: baseCols = Array.from({ length: baseColCount }, (_, index) => {
    const colDiv = pattern.pattern.colDivs.find(item => item.index === index);
    const div = colDiv?.div ?? 1;
    return { index, div, width: baseColWidth / div };
  });
  $: cells = baseCols.flatMap((col) => {
    return Array.from({ length: col.div }, (_, splitIndex) => ({
      key: `${col.index}.${splitIndex}`,
      width: col.width,
    }));
  });
  $: hits = pattern.pattern.hits.map(DrumEditorState.convHitInfo);
  $: hitMap = new Map(hits.map((hit) => [`${hit.colIndex}.${hit.recordIndex}`, hit]));
  $: markKinds = new Map(
    pattern.pattern.records.map((record, recordIndex) => {
      const mapping = mappings.find(item => item.key === record.key);
      return [recordIndex, mapping?.markKind ?? DrumEditorState.DefaultMarkKind];
    }),
  );
  $: contentWidth = cells.reduce((sum, cell) => sum + cell.width + 1, 1);
</script>

<div class="pattern" style:width={`${contentWidth}px`}>
  {#each Array.from({ length: pattern.pattern.records.length }, (_, i) => pattern.pattern.records.length - 1 - i) as recordIndex}
    <div class="record">
      {#each cells as cell, cellIndex (cell.key)}
        <div class="cell" style:width={`${cell.width}px`}>
          {#if hitMap.has(`${cellIndex}.${recordIndex}`)}
            <div class="hit" style:opacity={`${0.35 + (hitMap.get(`${cellIndex}.${recordIndex}`)?.velocity ?? 10) / 20 * 0.65}`}>
              <DrumHitIcon kind={markKinds.get(recordIndex) ?? DrumEditorState.DefaultMarkKind} size={10} />
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/each}
</div>

<style>
  .pattern {
    display: inline-block;
    position: relative;
    height: 100%;
    overflow: hidden;
  }

  .record {
    display: block;
    position: relative;
    height: 10px;
    margin: 1px 0 0 0;
    white-space: nowrap;
  }

  .cell {
    display: inline-block;
    position: relative;
    height: 100%;
    margin: 0 0 0 1px;
    background-color: rgba(240, 248, 255, 0.16);
    vertical-align: top;
  }

  .hit {
    display: inline-block;
    position: absolute;
    left: 50%;
    top: 50%;
    width: 10px;
    height: 10px;
    transform: translate(-50%, -50%);
  }
</style>
