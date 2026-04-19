<script lang="ts">
  import type StoreCache from "../../../../state/cache-state/cache-store";
  import store from "../../../store/store";
  import FocusCover from "../../common/FocusCover.svelte";
  import DataChord from "./data/DataChord.svelte";
  import DataInit from "./data/DataInit.svelte";
  import DataModulate from "./data/DataModulate.svelte";
  import DataSection from "./data/DataSection.svelte";
  import DataTempo from "./data/DataTempo.svelte";
  import { upsertOutlineElementRef } from "../../../../state/session-state/outline-ref-store";
  import { outlineFocusStore } from "../../../../state/session-state/outline-focus-store";

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
    <DataInit {data} />
  {:else if element.type === "section"}
    <DataSection data={element.data} />
  {:else if element.type === "chord"}
    <DataChord {data} elementSeq={index} />
  {:else if element.type === "modulate"}
    <DataModulate {data} elementSeq={index} />
  {:else if element.type === "tempo"}
    <DataTempo {data} elementSeq={index} />
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
