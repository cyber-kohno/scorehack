<script lang="ts">
  import { derivedStore } from "../../../store/global-store";
  import type RefState from "../../../store/state/ref-state";  import MeasureBlock from "./MeasureBlock.svelte";
  import MeasureFocus from "./MeasureFocus.svelte";

  export let scrollLimitProps: RefState.ScrollLimitProps;

  $: baseCaches = $derivedStore.baseCaches;

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
