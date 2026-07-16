<script lang="ts">
  import RhythmTheory from "../../../../../domain/theory/rhythm-theory";
  import GuitarEditorState from "../../../../../store/state/data/arrange/guitar/guitar-editor-state";

  export let backing: GuitarEditorState.BackingData;
  export let ts: RhythmTheory.TimeSignature;

  const BASE_THUMBNAIL_BEAT_WIDTH = 36;

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
  $: getStrokeRect = (event: GuitarEditorState.PatternEvent) => {
    const fromRow = getDisplayRowIndex(event.fromString);
    const toRow = getDisplayRowIndex(event.toString);
    const topRow = Math.min(fromRow, toRow);
    const bottomRow = Math.max(fromRow, toRow);
    const markSize = 5;
    return {
      top: 1 + topRow * 6,
      height: (bottomRow - topRow) * 6 + markSize,
      width: markSize,
    };
  };
</script>

<div class="wrap">
  <div class="content" style:width={`${contentWidth}px`}>
    {#each displayStrings as { string }}
      <div class="record">
        {#each colRanges as range}
          {@const event = getEvent(range.index)}
          <div class="cell-frame" style:width={`${range.width}px`}>
            <div class="cell">
              {#if event != undefined && event.fromString === string.number}
                <div class="pick-mark"></div>
              {/if}
              {#if event != undefined && event.fromString !== event.toString && event.toString === string.number}
                <div class="to-mark"></div>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {/each}
    {#each colRanges as range}
      {@const event = getEvent(range.index)}
      {#if event != undefined && event.fromString !== event.toString}
        {@const strokeRect = getStrokeRect(event)}
        <div
          class="stroke-range"
          style:left={`${range.left + range.width / 2 - strokeRect.width / 2}px`}
          style:width={`${strokeRect.width}px`}
          style:top={`${strokeRect.top}px`}
          style:height={`${strokeRect.height}px`}
        ></div>
      {/if}
    {/each}
  </div>
</div>

<style>
  .wrap {
    display: inline-block;
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .content {
    display: inline-block;
    position: relative;
    height: 100%;
  }

  .record {
    display: block;
    position: relative;
    height: 5px;
    margin: 1px 0 0 0;
    white-space: nowrap;
  }

  .cell-frame {
    display: inline-block;
    position: relative;
    height: 100%;
    padding: 0 0 0 1px;
    box-sizing: border-box;
    vertical-align: top;
  }

  .cell {
    display: inline-block;
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 1px;
    background-color: rgba(225, 241, 243, 0.18);
  }

  .pick-mark {
    display: inline-block;
    position: absolute;
    left: 50%;
    top: 50%;
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
    left: 50%;
    top: 50%;
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
    background-color: rgba(126, 255, 117, 0.42);
    pointer-events: none;
  }
</style>
