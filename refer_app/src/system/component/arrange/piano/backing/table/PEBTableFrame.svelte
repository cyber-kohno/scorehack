<script>
  import store from "../../../../../store/store";
  import PEBTableBackLayer from "./PEBTableBackLayer.svelte";
  import PEBTableMainLayer from "./PEBTableMainLayer.svelte.svelte";
  $: pianoRef = $store.ref.arrange.piano;
</script>

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
