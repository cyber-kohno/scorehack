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
  $: getPickStringIndex = (event: GuitarEditorState.PatternEvent | undefined) => {
    if (event?.kind !== "pick") return undefined;

    const stringNumber = event.stringNumber;
    const stringIndex = GuitarEditorState.STANDARD_TUNING.findIndex((string) => {
      return string.number === stringNumber;
    });
    return stringIndex === -1 ? undefined : stringIndex;
  };
  $: displayStrings = GuitarEditorState.STANDARD_TUNING
    .map((string, stringIndex) => ({ string, stringIndex }))
    .reverse();
  $: focusRect = (() => {
    if (editor.control !== "pattern") return null;
    const col = backing.cols[backing.cursorX];
    if (col == undefined) return null;

    const left = backing.cols
      .slice(0, backing.cursorX)
      .reduce((total, col) => total + getColWidth(col) + 1, 1);
    return {
      left,
      width: getColWidth(col),
    };
  })();
</script>

<div class="frame" bind:this={$refStore.arrange.guitar.pattern}>
  <div class="content" style:width={`${contentWidth}px`}>
    {#each displayStrings as { stringIndex }}
      <div class="record">
        {#each backing.cols as col, colIndex}
          {@const event = getEvent(colIndex)}
          {@const pickStringIndex = getPickStringIndex(event)}
          <div class="cell" style:width={`${getColWidth(col)}px`}>
            <div class="inner"></div>
            {#if pickStringIndex === stringIndex}
              <div class="pick-mark"></div>
            {/if}
          </div>
        {/each}
      </div>
    {/each}
    {#each backing.cols as col, colIndex}
      {@const event = getEvent(colIndex)}
      {#if event?.kind === "stroke"}
        <div
          class="stroke-mark"
          style:left={`${backing.cols.slice(0, colIndex).reduce((total, col) => total + getColWidth(col) + 1, 1)}px`}
          style:width={`${getColWidth(col)}px`}
        >
          {@html event.direction === "down" ? "&uarr;" : "&darr;"}
        </div>
      {/if}
    {/each}
    {#if focusRect != null}
      <div
        class="column-focus"
        style:left={`${focusRect.left}px`}
        style:width={`${focusRect.width}px`}
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
    z-index: 1;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: rgba(89, 255, 89, 0.92);
    border: 1px solid rgba(9, 60, 16, 0.68);
    transform: translate(-50%, -50%);
  }

  .stroke-mark {
    display: inline-flex;
    position: absolute;
    top: 1px;
    z-index: 1;
    height: calc((var(--ap-backing-record-height) + 1px) * 6);
    align-items: center;
    justify-content: center;
    color: rgba(92, 255, 96, 0.95);
    font-size: 30px;
    font-weight: 800;
    line-height: 1;
    pointer-events: none;
    text-shadow: 0 0 2px rgba(0, 0, 0, 0.65);
  }

  .column-focus {
    display: inline-block;
    position: absolute;
    left: 0;
    top: 1px;
    z-index: 2;
    height: calc((var(--ap-backing-record-height) + 1px) * 6);
    background-color: rgba(255, 237, 134, 0.473);
    pointer-events: none;
  }
</style>
