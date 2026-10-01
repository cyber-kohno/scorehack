<script lang="ts">
  import RhythmTheory from "../../../../../domain/theory/rhythm-theory";
  import GuitarEditorState from "../../../../../store/state/data/arrange/guitar/guitar-editor-state";

  export let backing: GuitarEditorState.BackingData;
  export let ts: RhythmTheory.TimeSignature;

  const BASE_THUMBNAIL_BEAT_WIDTH = 36;
  const RECORD_HEIGHT = 5;
  const RECORD_GAP = 1;
  const RECORD_COUNT = 6;
  const CONTENT_HEIGHT = RECORD_HEIGHT * RECORD_COUNT + RECORD_GAP * (RECORD_COUNT - 1);

  $: events = backing.items.map(GuitarEditorState.convPatternItem);
  $: beatWidth =
    BASE_THUMBNAIL_BEAT_WIDTH /
    (RhythmTheory.getBeatDiv16Count(ts) / 4);
  $: getColWidth = (col: GuitarEditorState.Col) => {
    return GuitarEditorState.getColWidthCriteriaBeatWidth(col, beatWidth);
  };
  $: colRanges = (() => {
    let left = 0;
    return backing.cols.map((col, index) => {
      const width = getColWidth(col);
      const range = { index, left, width };
      left += width + 1;
      return range;
    });
  })();
  $: contentWidth = colRanges.reduce((width, range) => {
    return Math.max(width, range.left + range.width);
  }, 0);
  $: getEvent = (colIndex: number) => {
    return events.find((event) => event.colIndex === colIndex);
  };
  $: displayStrings = GuitarEditorState.STANDARD_TUNING
    .map((string, stringIndex) => ({ string, stringIndex }))
    .reverse();
  $: getDisplayRowIndex = (stringNumber: number) => {
    return displayStrings.findIndex(({ string }) => string.number === stringNumber);
  };
  $: getStringCenterTop = (stringNumber: number) => {
    const rowIndex = getDisplayRowIndex(stringNumber);
    return `${rowIndex * (RECORD_HEIGHT + RECORD_GAP) + RECORD_HEIGHT / 2}px`;
  };
  $: getStrokeRect = (event: GuitarEditorState.PatternEvent) => {
    const fromRow = getDisplayRowIndex(event.fromString);
    const toRow = getDisplayRowIndex(event.toString);
    const topRow = Math.min(fromRow, toRow);
    const diff = Math.abs(fromRow - toRow);
    const markSize = 5;
    return {
      top: `${topRow * (RECORD_HEIGHT + RECORD_GAP) + RECORD_HEIGHT / 2}px`,
      height: `${diff * (RECORD_HEIGHT + RECORD_GAP)}px`,
      width: markSize,
    };
  };
</script>

<div class="wrap">
  <div
    class="content"
    style:width={`${contentWidth}px`}
    style:height={`${CONTENT_HEIGHT}px`}
  >
    <div class="grid-bg">
      {#each displayStrings as _string}
        <div class="record" style:width={`${contentWidth}px`}>
          {#each colRanges as range}
            <div class="cell" style:width={`${range.width}px`}></div>
          {/each}
        </div>
      {/each}
    </div>
    <div class="overlay">
      {#each colRanges as range}
        {@const event = getEvent(range.index)}
        {#if event != undefined}
          {@const centerLeft = range.left + range.width / 2}
          {#if event.fromString !== event.toString}
            {@const strokeRect = getStrokeRect(event)}
            <div
              class="stroke-range"
              style:left={`${centerLeft - strokeRect.width / 2}px`}
              style:width={`${strokeRect.width}px`}
              style:top={strokeRect.top}
              style:height={strokeRect.height}
            ></div>
            <div
              class="to-mark"
              style:left={`${centerLeft}px`}
              style:top={getStringCenterTop(event.toString)}
            ></div>
          {/if}
          <div
            class="pick-mark"
            style:left={`${centerLeft}px`}
            style:top={getStringCenterTop(event.fromString)}
          ></div>
        {/if}
      {/each}
    </div>
  </div>
</div>

<style>
  .wrap {
    display: block;
    position: relative;
    width: 100%;
    height: 100%;
    line-height: 0;
    overflow: hidden;
  }

  .content {
    display: block;
    position: relative;
  }

  .grid-bg {
    display: grid;
    grid-template-rows: repeat(6, 5px);
    position: relative;
    z-index: 0;
    width: 100%;
    gap: 1px;
    box-sizing: border-box;
  }

  .record {
    display: flex;
    min-height: 0;
    gap: 1px;
  }

  .cell {
    display: block;
    position: relative;
    min-width: 0;
    height: 100%;
    border-radius: 1px;
    box-sizing: border-box;
    background-color: rgba(225, 241, 243, 0.2);
  }

  .overlay {
    display: block;
    position: absolute;
    inset: 0;
    z-index: 1;
    pointer-events: none;
  }

  .pick-mark {
    display: inline-block;
    position: absolute;
    z-index: 2;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background-color: rgba(92, 255, 101, 0.92);
    box-shadow: 0 0 3px rgba(105, 255, 118, 0.82);
    transform: translate(-50%, -50%);
  }

  .to-mark {
    display: inline-block;
    position: absolute;
    z-index: 3;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background-color: rgba(255, 69, 69, 0.96);
    box-shadow: 0 0 3px rgba(255, 88, 88, 0.78);
    transform: translate(-50%, -50%);
  }

  .stroke-range {
    display: inline-block;
    position: absolute;
    z-index: 1;
    border-radius: 3px;
    background-color: rgba(255, 82, 82, 0.38);
    pointer-events: none;
  }
</style>
