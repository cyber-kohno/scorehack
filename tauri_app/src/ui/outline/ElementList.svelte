<script lang="ts">
  import store from "../../system/store/store";
  import OutlineElement from "./outline-elements/OutlineElement.svelte";
  import ChordSelectorOverlay from "./ChordSelectorOverlay.svelte";
  import {
    outlineRefStore,
    setOutlineFrameRef,
  } from "../../state/session-state/outline-ref-store";
  import {
    getOutlineTailPos,
    getVisibleOutlineElements,
    isOutlineChordSelectorVisible,
  } from "../../state/ui-state/outline-ui-store";

  $: dispElements = (() => {
    $outlineRefStore;
    return getVisibleOutlineElements($store);
  })();
  $: isDispChordSelector = isOutlineChordSelectorVisible($store);
  $: outlineTailPos = (() => {
    $outlineRefStore;
    return getOutlineTailPos($store);
  })();
  let outlineRef: HTMLDivElement | undefined;
  $: setOutlineFrameRef(outlineRef);
</script>

<div class="wrap">
  <div class="list-main" bind:this={outlineRef}>
    {#each dispElements as element}
      <OutlineElement {element} />
    {/each}
    <div
      class="lastmargin"
      style:top="{outlineTailPos}px"
      style:height="{300}px"
    ></div>
  </div>
  <div class="list-second">
    {#if isDispChordSelector}
      <ChordSelectorOverlay />
    {/if}
  </div>
</div>

<style>
  .wrap {
    display: inline-block;
    position: relative;
    width: 100%;
    height: var(--element-list-height);
    background: linear-gradient(to right, #91a2b6, #b1b1b1);
  }

  .lastmargin {
    display: inline-block;
    position: absolute;
    z-index: 1;
    left: 0;
    width: 100%;
  }

  .list-main {
    display: inline-block;
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    overflow: hidden;
  }

  .list-second {
    display: inline-block;
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
  }
</style>
