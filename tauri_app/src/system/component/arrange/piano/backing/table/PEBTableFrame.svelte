<script>
  import PEBTableBackLayer from "./PEBTableBackLayer.svelte";
  import { refStore } from "../../../../../store/global-store";
  import PEBTableMainLayer from "./PEBTableMainLayer.svelte.svelte";
  $: pianoRef = $refStore.arrange.piano;
</script>

import {refStore} from "../../../../../store/global-store";

<div class="wrap" bind:this={pianoRef.table}>
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
