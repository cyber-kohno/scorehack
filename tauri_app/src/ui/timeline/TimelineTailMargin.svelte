<script lang="ts">
import store from "../../state/root-store";
  import { getTimelineTailMarginLeft } from "../../state/ui-state/timeline-ui-store";
  import { getTimelineGridRef } from "../../state/session-state/timeline-viewport-store";

  $: [left, width] = (() => {
    let width = 0;
    const ref = getTimelineGridRef();
    if (ref) {
      width = ref.getBoundingClientRect().width;
    }

    const left = getTimelineTailMarginLeft($store);
    return [left, width];
  })();
</script>

<div class="wrap" style:left="{left}px" style:width="{width}px"></div>

<style>
  .wrap {
    display: inline-block;
    position: absolute;
    z-index: 1;
    top: 0;
    height: 100%;
  }
</style>
