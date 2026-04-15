<script lang="ts">
  import store from "../../store/store";
  import { getTimelineTailMarginLeft } from "../../../state/ui-state/timeline-ui-store";

  $: [left, width] = (() => {
    let width = 0;
    const ref = $store.ref.grid;
    if (ref) {
      width = ref.getBoundingClientRect().width;
    }
    // console.log(width);

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
    /* background-color: aliceblue; */
  }
</style>
