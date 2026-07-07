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
  $: getPickStringIndex = (event: GuitarEditorState.PatternEvent | undefined) => {
    if (event?.kind !== "pick") return undefined;
    const stringIndex = GuitarEditorState.STANDARD_TUNING.findIndex((string) => {
      return string.number === event.stringNumber;
    });
    return stringIndex === -1 ? undefined : stringIndex;
  };
</script>

<div class="wrap">
  <div class="content" style:width={`${contentWidth}px`}>
    {#each GuitarEditorState.STANDARD_TUNING as _string, stringIndex}
      <div class="record">
        {#each colRanges as range}
          {@const event = getEvent(range.index)}
          {@const pickStringIndex = getPickStringIndex(event)}
          <div class="cell-frame" style:width={`${range.width}px`}>
            <div class="cell">
              {#if pickStringIndex === stringIndex}
                <div class="pick-mark"></div>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {/each}
    {#each colRanges as range}
      {@const event = getEvent(range.index)}
      {#if event?.kind === "stroke"}
        <div
          class="stroke-mark"
          style:left={`${range.left}px`}
          style:width={`${range.width}px`}
        >
          {@html event.direction === "down" ? "&darr;" : "&uarr;"}
        </div>
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
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background-color: rgba(92, 255, 101, 0.92);
    box-shadow: 0 0 3px rgba(105, 255, 118, 0.82);
    transform: translate(-50%, -50%);
  }

  .stroke-mark {
    display: inline-flex;
    position: absolute;
    top: 1px;
    height: 35px;
    align-items: center;
    justify-content: center;
    color: rgba(92, 255, 101, 0.96);
    font-size: 24px;
    font-weight: 900;
    line-height: 1;
    pointer-events: none;
    text-shadow: 0 0 3px rgba(0, 0, 0, 0.78);
  }
</style>
