<script lang="ts">
  import ContextUtil from "../../../../../store/contextUtil";

  import PBNotesCell from "./PEBTableCell.svelte";
  $: bp = ContextUtil.get("backingProps");
  $: backing = $bp.backing;
  $: layer = backing.layers[backing.layerIndex];
</script>

<div class="wrap" style:width="{$bp.getColFrameWidth()}px">
  {#each Array.from({ length: backing.recordNum }, (_, i) => backing.recordNum - 1 - i) as recordIndex}
    <div class="record">
      {#each layer.cols as col, colIndex}
        <PBNotesCell {colIndex} {recordIndex} col={col} />
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
    /* width: 100%; */
    height: 100%;
    z-index: 2;
  }
  .record {
    display: block;
    position: relative;
    margin: 1px 0 0 0;
    /* width: 100%; */
    height: var(--ap-backing-record-height);
    padding: 0;
  }
</style>
