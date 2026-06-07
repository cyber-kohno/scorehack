<script lang="ts">
  import { tick } from "svelte";
  import { libraryStore } from "../../../store/global-store";
  import LSIBeat from "./item/LSIBeat.svelte";
  import LSIEatHead from "./item/LSIEatHead.svelte";
  import LSIEatTail from "./item/LSIEatTail.svelte";
  import LSIMethod from "./item/LSIMethod.svelte";
  import LSIOnChord from "./item/LSIOnChord.svelte";
  import LSIRoot from "./item/LSIRoot.svelte";
  import LSISymbol from "./item/LSISymbol.svelte";
  import LSISymbolTones from "./item/LSISymbolTones.svelte";
  import LSITimeSignature from "./item/LSITimeSignature.svelte";
  import type LibraryState from "../../../store/state/library-state";

  let panelRef: HTMLElement | null = null;

  const getLibrary = () => {
    const library = $libraryStore;
    if (library == null) throw new Error("library must not be null.");
    return library;
  };

  const getFocus = (condition: LibraryState.Condition) => {
    const library = getLibrary();
    return library.focus.finder == null && library.focus.condition === condition;
  };

  const adjustActiveScroll = async () => {
    const panel = panelRef;
    if (panel == null) return;

    await tick();

    const active = panel.querySelector(".active-item") as HTMLElement | null;
    if (active == null) return;

    const target = active.offsetTop + active.offsetHeight / 2 - panel.clientHeight / 2;
    panel.scrollTo({
      top: Math.max(0, Math.min(target, panel.scrollHeight - panel.clientHeight)),
      behavior: "smooth",
    });
  };

  $: {
    getLibrary().focus.condition;
    void adjustActiveScroll();
  }

  $: library = getLibrary();
  $: condition = library.condition;
</script>

<div class="panel" bind:this={panelRef}>
  <LSIMethod isFocus={getFocus("medhod")} method={condition.method} />
  <LSITimeSignature isFocus={getFocus("ts")} ts={condition.ts} />
  <LSIBeat isFocus={getFocus("beat")} beat={condition.beat} />
  <LSIEatHead isFocus={getFocus("eat-head")} eatHead={condition.eatHead} />
  <LSIEatTail isFocus={getFocus("eat-tail")} eatTail={condition.eatTail} />
  <LSIRoot isFocus={getFocus("root")} root={condition.root} />
  <LSIOnChord isFocus={getFocus("on")} on={condition.on} />
  <LSISymbolTones isFocus={getFocus("symbol-tones")} symbol={condition.symbol} />
  <LSISymbol isFocus={getFocus("symbol")} symbol={condition.symbol} />
</div>

<style>
  .panel {
    display: inline-block;
    position: relative;
    width: 100%;
    height: 100%;
    padding: 6px;
    box-sizing: border-box;
    background-color: rgba(229, 240, 244, 0.88);
    overflow: hidden;
  }
</style>
