<script lang="ts">
  import { writable } from "svelte/store";
  import type StoreTerminal from "../../store/props/storeTerminal";
  import store from "../../store/store";
  import HighlightText from "../common/HighlightText.svelte";

  export let helper!: StoreTerminal.HelperProps;

  //   $: [top, left] = (() => {
  //     const ref = $store.ref.cursor;
  //     if (ref != null) {
  //       const { left, bottom } = ref.getBoundingClientRect();
  //       return [bottom, left];
  //     }
  //     throw new Error();
  //   })();
  const pos = writable({ top: -1024, left: -1024 });

  $: {
    const ref = $store.ref.cursor;
    setTimeout(() => {
      if (ref != null) {
        const { left, bottom } = ref.getBoundingClientRect();
        pos.update(() => ({ left, top: bottom }));
      }
    }, 0);
  }
</script>

<div
  class="wrap"
  style:top="{$pos.top}px"
  style:left="{$pos.left}px"
  bind:this={$store.ref.helper}
>
  {#each helper.list as item, i}
    <div class="item" data-isFocus={helper.focus === i}>
      <HighlightText baseText={item} keyword={helper.keyword} color="#f44" />
    </div>
  {/each}
</div>

<style>
  .wrap {
    display: inline-block;
    position: absolute;
    width: 350px;
    /* height: 500px; */
    min-height: 150px;
    max-height: 300px;
    z-index: 6;
    background-color: rgba(3, 8, 46, 0.889);
    border: 1px solid #ffffff92;
    border-radius: 2px;
    overflow: hidden;
    box-shadow: 10px 10px 15px -10px;
  }
  .item {
    display: inline-block;
    position: relative;
    width: 100%;
    height: 26px;
    background: linear-gradient(to bottom, #ffffff22, #1b48ff2b, #ffffff22);
    color: rgba(140, 220, 255, 0.68);
    font-size: 18px;
    line-height: 22px;
    font-weight: 400;
    padding: 0 0 0 4px;
  }
  .item[data-isFocus="true"] {
    background-color: inherit;
    background-color: rgba(255, 255, 255, 0.384);
  }
</style>
