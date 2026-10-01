<script lang="ts">
  import { getPianoBacking, getPianoEditor } from "../../piano-editor-context";
  import { inputStore } from "../../../../../store/global-store";
  import PianoBackingState from "../../../../../store/state/data/arrange/piano/piano-backing-state";
  import PEBNotesDetailFrame from "./PEBNotesDetailFrame.svelte";

  const editor = getPianoEditor();
  const bp = getPianoBacking();

  $: backing = $bp.backing;
  $: layer = backing.layers[backing.layerIndex];
  $: isOptionActive =
    $editor.phase === "edit" && $editor.control === "notes" && $inputStore.holdC;

  $: isDispOption = (colIndex: number, recordIndex: number) => {
    if (!isOptionActive) return false;
    if (backing.cursorX !== colIndex || backing.cursorY !== recordIndex) {
      return false;
    }
    const currentKey = `${colIndex}.${recordIndex}`;
    return PianoBackingState.convRemoveOptionNotes(layer.items).includes(
      currentKey
    );
  };
</script>

<div class="wrap" style:width="{$bp.getColFrameWidth()}px">
  {#each Array.from({ length: backing.recordNum }, (_, i) => backing.recordNum - 1 - i) as recordIndex}
    <div class="record">
      {#each layer.cols as col, colIndex}
        <div class="cell" style:width={`${$bp.getColWidth(col)}px`}>
          {#if isDispOption(colIndex, recordIndex)}
            <PEBNotesDetailFrame {colIndex} {recordIndex} />
          {/if}
        </div>
      {/each}
    </div>
  {/each}
</div>

<style>
  .wrap {
    display: inline-block;
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    z-index: 3;
    pointer-events: none;
  }
  .record {
    display: block;
    position: relative;
    margin: 1px 0 0 0;
    height: var(--ap-backing-record-height);
    padding: 0;
    white-space: nowrap;
  }
  .cell {
    display: inline-block;
    position: relative;
    margin: 0 0 0 1px;
    height: 100%;
    padding: 0;
  }
</style>
