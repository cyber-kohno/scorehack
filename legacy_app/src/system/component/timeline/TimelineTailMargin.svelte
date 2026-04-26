<script lang="ts">
  import useReducerCache from "../../store/reducer/reducerCache";
  import store from "../../store/store";

  $: [left, width] = (() => {
    const { getChordBlockRight } = useReducerCache($store);
    let width = 0;
    const ref = $store.ref.grid;
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
