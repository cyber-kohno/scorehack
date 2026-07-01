<script lang="ts">
  import { onMount } from "svelte";
  import ScrollRateFrame from "../../common/ScrollRateFrame.svelte";
  import FinderConditionHeader from "./condition/FinderConditionHeader.svelte";
  import { controlStore, dataStore, refStore } from "../../../store/global-store";
  import FinderState from "../../../store/state/data/arrange/finder-state";
  import APFinderPresetItem from "./list/piano/APFinderPresetItem.svelte";
  import ADFinderPatternItem from "./list/drum/ADFinderPatternItem.svelte";

  let ref: HTMLElement | null = null;

  const getScrollTop = (frame: HTMLElement) => {
    const rect = frame.getClientRects()[0];
    if (rect == undefined) return 0;
    if (method === "drum" && drumFinder != null) {
      const rowIndex = Math.floor(drumFinder.cursor / FinderState.Drum.ColumnCount);
      return Math.max(0, -rect.width / 2 + rowIndex * 71);
    }
    return Math.max(0, -rect.width / 2 + pianoFinder.cursor.backing * 71);
  };

  onMount(() => {
    const refState = $refStore;
    const finderRefs = refState.arrange.finder;
    if (ref != null) {
      finderRefs.frame = ref;
      ref.scrollTo({ top: getScrollTop(ref) });
      refStore.set({ ...refState });
    }

    return () => {
      const refState = $refStore;
      const finderRefs = refState.arrange.finder;
      finderRefs.frame = undefined;
      refStore.set({ ...refState });
    };
  });

  $: arrange = (() => {
    const arrange = $controlStore.outline.arrange;
    if (arrange == null || arrange.finder == null) throw new Error("finder must not be null.");
    return arrange;
  })();
  $: method = arrange.method;
  $: track = $dataStore.arrange.tracks[$controlStore.outline.trackIndex];
  $: pianoFinder = (() => {
    const finder = $controlStore.outline.arrange?.finder;
    if (finder == null) throw new Error("finder must not be null.");
    return finder as FinderState.PianoArrangeFinder;
  })();
  $: drumFinder = (() => {
    if (arrange.method !== "drum") return null;
    return arrange.finder as FinderState.Drum.Finder;
  })();
  $: request = arrange.finder.request;
  $: cursorIndex = drumFinder?.cursor ?? pianoFinder.cursor.backing;
  $: listLength = drumFinder?.list.length ?? pianoFinder.list.length;
  $: getDrumPattern = (patternNo: number) => {
    if (track?.method !== "drum") throw new Error("Drum track must exist.");
    return FinderState.Drum.getPatternFromNo(patternNo, track.bank);
  };
  $: isDrumRegular = (patternNo: number) => {
    if (track?.method !== "drum") return false;
    return track.bank.regulars.some(regular => regular.patternNo === patternNo);
  };
</script>

<div class="wrap">
  <FinderConditionHeader {request} {method} />
  <div class="list-base">
    <ScrollRateFrame
      {ref}
      dir={"y"}
      frameLength={300}
      frameWidth={10}
      dependencies={[cursorIndex]}
    />
    <div class="list-inner" bind:this={ref}>
      {#if listLength === 0}
        <div class="msg">No matching presets found.</div>
      {:else if method === "drum" && drumFinder != null && track?.method === "drum"}
        <div class="drum-grid">
          {#each drumFinder.list as item, patternIndex}
            <ADFinderPatternItem
              finder={drumFinder}
              {item}
              index={patternIndex}
              pattern={getDrumPattern(item.patternNo)}
              mappings={track.bank.mappings}
              isRegular={isDrumRegular(item.patternNo)}
            />
          {/each}
        </div>
      {:else if method === "piano"}
        {#each pianoFinder.list as preset, backingIndex}
          <APFinderPresetItem finder={pianoFinder} usageBkg={preset} {backingIndex} />
        {/each}
      {/if}
    </div>
  </div>
</div>

<style>
  .wrap {
    display: inline-block;
    position: absolute;
    top: var(--arrange-frame-y);
    left: var(--arrange-frame-x);
    width: 500px;
    height: 600px;
    border: 1px solid #1efe00;
    box-sizing: border-box;
    z-index: 7;
    border-radius: 4px;
    opacity: 0.99;
  }

  .list-base {
    display: inline-block;
    position: relative;
    width: 100%;
    height: calc(100% - 40px);
  }

  .list-inner {
    display: inline-block;
    position: absolute;
    left: 0;
    top: 0;
    background-color: rgb(44, 44, 44);
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .msg {
    display: inline-block;
    position: relative;
    width: 100%;
    height: 30px;
    font-size: 18px;
    line-height: 22px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.658);
    padding: 0 0 0 4px;
    box-sizing: border-box;
  }

  .drum-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    position: relative;
    width: 100%;
  }
</style>
