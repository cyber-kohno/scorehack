<script lang="ts">
  import type StoreCache from "../../../state/cache-state/cache-store";
  import store from "../../../system/store/store";
  import FocusCover from "../../../system/component/common/FocusCover.svelte";
  import OutlineChordElement from "./OutlineChordElement.svelte";
  import OutlineInitElement from "./OutlineInitElement.svelte";
  import OutlineModulateElement from "./OutlineModulateElement.svelte";
  import OutlineSectionElement from "./OutlineSectionElement.svelte";
  import OutlineTempoElement from "./OutlineTempoElement.svelte";
  import { upsertOutlineElementRef } from "../../../state/session-state/outline-ref-store";
  import { outlineFocusStore } from "../../../state/session-state/outline-focus-store";

  export let element!: StoreCache.ElementCache;

  $: index = element.elementSeq;

  let ref: HTMLElement | null = null;
  $: {
    if (ref != null) {
      upsertOutlineElementRef(index, ref);
    }
  }

  $: [isFocus, isRange] = (() => {
    const { focus, focusLock } = $outlineFocusStore;

    let [st, ed] = [focus, focus];
    if (focusLock !== -1) {
      [st, ed] = focus < focusLock ? [focus, focusLock] : [focusLock, focus];
    }
    return [index >= st && index <= ed, st !== ed];
  })();

  $: data = element.data;
</script>

<div
  class="wrap"
  style:top="{element.outlineTop}px"
  data-type={element.type}
  bind:this={ref}
>
  {#if element.type === "init"}
    <OutlineInitElement {data} />
  {:else if element.type === "section"}
    <OutlineSectionElement data={element.data} />
  {:else if element.type === "chord"}
    <OutlineChordElement {data} elementSeq={index} />
  {:else if element.type === "modulate"}
    <OutlineModulateElement {data} elementSeq={index} />
  {:else if element.type === "tempo"}
    <OutlineTempoElement {data} elementSeq={index} />
  {/if}

  <FocusCover
    isDisplay={isFocus}
    bgColor={!isRange ? "#ffec3d6c" : "#ff88886c"}
  />
</div>

<style>
  .wrap {
    display: inline-block;
    position: absolute;
    width: 180px;
    left: 25px;
  }

  .wrap[data-type="init"] {
    left: 4px;
  }

  .wrap[data-type="section"] {
    left: 10px;
  }
</style>

