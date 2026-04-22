<script>
  import PEBTableBackLayer from "./PEBTableBackLayer.svelte";
  import PEBTableMainLayer from "./PEBTableMainLayer.svelte";
  import { setArrangePianoTableRef } from "../../../../../state/session-state/arrange-ref-store";

  let tableRef;
  $: setArrangePianoTableRef(tableRef);
</script>

<div class="wrap" bind:this={tableRef}>
  <PEBTableMainLayer />
  <PEBTableBackLayer />
</div>

<style>
  .wrap {
    display: inline-block;
    position: relative;
    width: 100%;
    height: var(--ap-backing-table-height);
    overflow-x: hidden;
  }
</style>
