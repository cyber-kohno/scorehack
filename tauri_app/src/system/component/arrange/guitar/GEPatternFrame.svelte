<script lang="ts">
  import RhythmTheory from "../../../domain/theory/rhythm-theory";
  import Layout from "../../../layout/layout-constant";
  import createArrangeSelector from "../../../service/arrange/arrange-selector";
  import { controlStore, dataStore, refStore } from "../../../store/global-store";
  import GuitarEditorState from "../../../store/state/data/arrange/guitar/guitar-editor-state";

  $: selector = createArrangeSelector({ control: $controlStore, data: $dataStore });
  $: arrange = selector.getArrange();
  $: editor = selector.getGuitarEditor();
  $: backing = (() => {
    const backing = editor.backing;
    if (backing == null) throw new Error();
    return backing;
  })();
  $: beatWidth =
    Layout.arrange.piano.DIV1_WIDTH /
    (RhythmTheory.getBeatDiv16Count(arrange.target.scoreBase.rhythm.ts) / 4);
  $: getColWidth = (col: GuitarEditorState.Col) => {
    return GuitarEditorState.getColWidthCriteriaBeatWidth(col, beatWidth);
  };
  $: contentWidth = backing.cols.reduce((total, col, index) => {
    total += getColWidth(col) + 1;
    if (index === backing.cols.length - 1) total += 1;
    return total;
  }, 0);
  $: getEvent = (colIndex: number) => {
    return backing.events.find((event) => event.colIndex === colIndex);
  };
  $: displayStrings = GuitarEditorState.STANDARD_TUNING
    .map((string, stringIndex) => ({ string, stringIndex }))
    .reverse();
  $: getDisplayRowIndex = (stringNumber: number) => {
    return displayStrings.findIndex(({ string }) => string.number === stringNumber);
  };
  $: isStringInEvent = (
    event: GuitarEditorState.PatternEvent | undefined,
    stringNumber: number,
  ) => {
    if (event == undefined) return false;
    const min = Math.min(event.fromString, event.toString);
    const max = Math.max(event.fromString, event.toString);
    return stringNumber >= min && stringNumber <= max;
  };
  $: focusRect = (() => {
    if (editor.control !== "pattern") return null;
    const col = backing.cols[backing.cursorX];
    if (col == undefined) return null;

    const left = backing.cols
      .slice(0, backing.cursorX)
      .reduce((total, col) => total + getColWidth(col) + 1, 1);
    const rowIndex = getDisplayRowIndex(GuitarEditorState.STANDARD_TUNING[backing.cursorY].number);
    return {
      left,
      width: getColWidth(col),
      top: 1 + rowIndex * (Layout.arrange.piano.BACKING_RECORD_HEIGHT + 1),
      height: Layout.arrange.piano.BACKING_RECORD_HEIGHT,
    };
  })();
  $: getStrokeRect = (event: GuitarEditorState.PatternEvent) => {
    const fromRow = getDisplayRowIndex(event.fromString);
    const toRow = getDisplayRowIndex(event.toString);
    const topRow = Math.min(fromRow, toRow);
    const bottomRow = Math.max(fromRow, toRow);
    const recordHeight = Layout.arrange.piano.BACKING_RECORD_HEIGHT;
    const markSize = 10;
    return {
      top: 1 + topRow * (recordHeight + 1) + recordHeight / 2 - markSize / 2,
      height: (bottomRow - topRow) * (recordHeight + 1) + markSize,
      width: markSize,
    };
  };
</script>

<div class="frame" bind:this={$refStore.arrange.guitar.pattern}>
  <div class="content" style:width={`${contentWidth}px`}>
    {#each displayStrings as { stringIndex }}
      <div class="record">
        {#each backing.cols as col, colIndex}
          {@const event = getEvent(colIndex)}
          <div class="cell" style:width={`${getColWidth(col)}px`}>
            <div class="inner"></div>
            {#if event != undefined && event.fromString === GuitarEditorState.STANDARD_TUNING[stringIndex].number}
              <div class="pick-mark"></div>
            {/if}
            {#if event != undefined && event.fromString !== event.toString && event.toString === GuitarEditorState.STANDARD_TUNING[stringIndex].number}
              <div class="to-mark"></div>
            {/if}
          </div>
        {/each}
      </div>
    {/each}
    {#each backing.cols as col, colIndex}
      {@const event = getEvent(colIndex)}
      {#if event != undefined && event.fromString !== event.toString}
        {@const strokeRect = getStrokeRect(event)}
        <div
          class="stroke-range"
          style:left={`${backing.cols.slice(0, colIndex).reduce((total, col) => total + getColWidth(col) + 1, 1) + getColWidth(col) / 2 - strokeRect.width / 2}px`}
          style:width={`${strokeRect.width}px`}
          style:top={`${strokeRect.top}px`}
          style:height={`${strokeRect.height}px`}
        ></div>
      {/if}
    {/each}
    {#if focusRect != null}
      <div
        class="column-focus"
        style:left={`${focusRect.left}px`}
        style:width={`${focusRect.width}px`}
        style:top={`${focusRect.top}px`}
        style:height={`${focusRect.height}px`}
      ></div>
    {/if}
  </div>
</div>

<style>
  .frame {
    display: inline-block;
    position: relative;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    background-color: rgba(0, 0, 0, 0.32);
    overflow: hidden;
    white-space: nowrap;
    * {
      vertical-align: top;
    }
  }

  .content {
    display: inline-block;
    position: relative;
    height: 100%;
  }

  .record {
    display: block;
    position: relative;
    height: var(--ap-backing-record-height);
    margin: 1px 0 0 0;
    padding: 0;
  }

  .cell {
    display: inline-block;
    position: relative;
    height: 100%;
    margin: 0 0 0 1px;
    padding: 0;
    border-radius: 2px;
    background-color: rgba(60, 53, 128, 0.685);
  }

  .inner {
    display: inline-block;
    position: relative;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
  }

  .pick-mark {
    display: inline-block;
    position: absolute;
    left: 50%;
    top: 50%;
    z-index: 3;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: rgba(89, 255, 89, 0.92);
    border: 1px solid rgba(9, 60, 16, 0.68);
    transform: translate(-50%, -50%);
  }

  .to-mark {
    display: inline-block;
    position: absolute;
    left: 50%;
    top: 50%;
    z-index: 4;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: rgba(255, 69, 69, 0.96);
    border: 1px solid rgba(91, 0, 0, 0.72);
    transform: translate(-50%, -50%);
  }

  .stroke-range {
    display: inline-block;
    position: absolute;
    z-index: 2;
    border-radius: 5px;
    background-color: rgba(126, 255, 117, 0.42);
    pointer-events: none;
  }

  .column-focus {
    display: inline-block;
    position: absolute;
    left: 0;
    z-index: 3;
    background-color: rgba(255, 237, 134, 0.473);
    pointer-events: none;
  }
</style>
