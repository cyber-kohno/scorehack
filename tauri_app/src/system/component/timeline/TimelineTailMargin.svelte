<script lang="ts">
  import useDerivedSelector from "../../service/derived/derived-selector";
  import { controlStore, derivedStore, refStore } from "../../store/global-store";
  $: [left, width] = (() => {
    const { getChordBlockRight } = useDerivedSelector($derivedStore, $controlStore);
    let width = 0;
    const ref = $refStore.grid;
    if (ref) {
      width = ref.getBoundingClientRect().width;
    }
    // console.log(width);

    const left = getChordBlockRight();
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
