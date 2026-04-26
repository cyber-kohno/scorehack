<script lang="ts">
  import StoreOutline from "../../store/props/storeOutline";
  import StoreRef from "../../store/props/storeRef";
  import store from "../../store/store";
  import Element from "./element/Element.svelte";
  import ChordSelector from "./item/ChordSelector.svelte";

  $: dispElements = (() => {
    const elementSeq = $store.control.outline.focus;
    const elementCaches = $store.cache.elementCaches;
    const limitProps = StoreRef.getScrollLimitProps($store.ref.outline);
    if (limitProps == null) return [];
    // let start = elementSeq - 12;
    // if (start < 0) start = 0;
    // let end = elementSeq + 12;
    // if (end > elementCaches.length) end = elementCaches.length;
    return elementCaches.filter(
      (el, i) =>
        Math.abs(elementSeq - i) < 12 ||
        Math.abs(
          limitProps.scrollMiddleY -
            // (el.outlineTop + StoreOutline.getElementViewHeight(el) / 2)
            (el.outlineTop + el.viewHeight / 2)
        ) <= limitProps.rectHeight
    );
  })();

  $: isDispChordSelector = (() => {
    const elements = $store.cache.elementCaches;
    const control = $store.control;
    const element = elements[control.outline.focus];
    return (
      // control.melody.dialog == null &&
      control.mode === "harmonize" &&
      control.outline.arrange == null &&
      $store.input.holdC &&
      element.type === "chord" &&
      (element.data as StoreOutline.DataChord).degree != undefined
    );
  })();
</script>

<div class="wrap">
  <div class="list-main" bind:this={$store.ref.outline}>
    {#each dispElements as element}
      <Element {element} />
    {/each}
    <div
      class="lastmargin"
      style:top="{$store.cache.outlineTailPos}px"
      style:height="{300}px"
    ></div>
  </div>
  <div class="list-second">
    {#if isDispChordSelector}
      <ChordSelector />
    {/if}
  </div>
</div>

<style>
  .wrap {
    display: inline-block;
    position: relative;
    width: 100%;
    height: var(--element-list-height);
    /* background-color: #ced3e9; */
    background: linear-gradient(to right, #91a2b6, #b1b1b1);
  }

  .lastmargin {
    display: inline-block;
    position: absolute;
    z-index: 1;
    left: 0;
    width: 100%;
    /* background-color: aliceblue; */
  }
  .list-main {
    display: inline-block;
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    /* background-color: rgba(243, 200, 126, 0.482); */
    overflow: hidden;
  }
  .list-second {
    display: inline-block;
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    /* background-color: rgba(128, 243, 126, 0.482); */
  }
</style>
