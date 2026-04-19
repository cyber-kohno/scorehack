<script lang="ts">
  import type { ScrollLimitProps } from "../../../../state/session-state/scroll-limit-props";
  import store from "../../../store/store";
  import { getTimelineBaseCaches } from "../../../../state/cache-state/timeline-cache";
  import MeasureBlock from "./MeasureBlock.svelte";
  import MeasureFocus from "./MeasureFocus.svelte";

  export let scrollLimitProps: ScrollLimitProps;

  $: baseCaches = getTimelineBaseCaches($store);

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


