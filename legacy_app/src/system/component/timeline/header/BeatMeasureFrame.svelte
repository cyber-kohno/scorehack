<script lang="ts">
  import type StoreRef from "../../../store/props/storeRef";
  import store from "../../../store/store";
  import MeasureBlock from "./MeasureBlock.svelte";
  import MeasureFocus from "./MeasureFocus.svelte";

  export let scrollLimitProps: StoreRef.ScrollLimitProps;

  $: baseCaches = $store.cache.baseCaches;

</script>

<div class="wrap">
  {#each baseCaches as baseCache}
    <MeasureBlock {baseCache} {scrollLimitProps} />
  {/each}
  <MeasureFocus />
</div>

<style>
  .wrap {
    display: inline-block;
    position: relative;
    background-color: #b6ebe4;
    min-width: 100%;
    width: var(--beat-sum);
    height: var(--memori-height);
  }
</style>
