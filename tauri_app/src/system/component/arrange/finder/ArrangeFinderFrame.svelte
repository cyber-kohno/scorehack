<script lang="ts">
  import { onMount } from "svelte";
  import ChordTheory from "../../../domain/theory/chord-theory";
  import ScrollRateFrame from "../../common/ScrollRateFrame.svelte";
  import FinderConditionHeader from "./condition/FinderConditionHeader.svelte";
  import { controlStore, dataStore, refStore } from "../../../store/global-store";
  import FinderState from "../../../store/state/data/arrange/finder-state";
  import APFinderPresetItem from "./list/piano/APFinderPresetItem.svelte";
  import ADFinderPatternItem from "./list/drum/ADFinderPatternItem.svelte";
  import AGFinderVoicingThumbnail from "./list/guitar/AGFinderVoicingThumbnail.svelte";
  import AGFinderBackingThumbnail from "./list/guitar/AGFinderBackingThumbnail.svelte";

  let ref: HTMLElement | null = null;

  const getScrollTop = (frame: HTMLElement) => {
    const rect = frame.getClientRects()[0];
    if (rect == undefined) return 0;
    if (method === "drum" && drumFinder != null) {
      const rowIndex = Math.floor(drumFinder.cursor / FinderState.Drum.ColumnCount);
      return Math.max(0, -rect.width / 2 + rowIndex * 71);
    }
    if (method === "guitar") return 0;
    if (pianoFinder == null) return 0;
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
    if (arrange.method !== "piano") return null;
    const finder = $controlStore.outline.arrange?.finder;
    if (finder == null) throw new Error("finder must not be null.");
    return finder as FinderState.PianoArrangeFinder;
  })();
  $: guitarFinder = (() => {
    if (arrange.method !== "guitar") return null;
    return arrange.finder as FinderState.Guitar.Finder;
  })();
  $: drumFinder = (() => {
    if (arrange.method !== "drum") return null;
    return arrange.finder as FinderState.Drum.Finder;
  })();
  $: request = arrange.finder.request;
  $: chordName = guitarFinder == null
    ? undefined
    : ChordTheory.getKeyChordName({
        key12: guitarFinder.key.root,
        symbol: guitarFinder.key.symbol,
        isFlat: false,
        on: guitarFinder.key.on == null
          ? undefined
          : {
              key12: guitarFinder.key.on,
              isFlat: false,
            },
      });
  $: cursorIndex = (() => {
    if (drumFinder != null) return drumFinder.cursor;
    if (guitarFinder != null) {
      return guitarFinder.cursor.target === "voicing"
        ? guitarFinder.cursor.voicing
        : guitarFinder.cursor.backing;
    }
    if (pianoFinder != null) return pianoFinder.cursor.backing;
    return 0;
  })();
  $: listLength = (() => {
    if (drumFinder != null) return drumFinder.list.length;
    if (guitarFinder != null) return guitarFinder.voicings.length + guitarFinder.backings.length;
    if (pianoFinder != null) return pianoFinder.list.length;
    return 0;
  })();
  $: getDrumPattern = (patternNo: number) => {
    if (track?.method !== "drum") throw new Error("Drum track must exist.");
    return FinderState.Drum.getPatternFromNo(patternNo, track.bank);
  };
  $: isDrumRegular = (patternNo: number) => {
    if (track?.method !== "drum") return false;
    return track.bank.regulars.some(regular => regular.patternNo === patternNo);
  };
  $: getGuitarVoicing = (voicingNo: number) => {
    if (track?.method !== "guitar") throw new Error("Guitar track must exist.");
    return FinderState.Guitar.getVoicingFromNo(voicingNo, track.bank);
  };
  $: getGuitarBacking = (backingNo: number) => {
    if (track?.method !== "guitar") throw new Error("Guitar track must exist.");
    return FinderState.Guitar.getBackingFromNo(backingNo, track.bank);
  };
  $: getGuitarItemClass = (
    target: FinderState.Guitar.Cursor["target"],
    index: number,
  ) => {
    if (guitarFinder == null) return "";
    const isFocus = guitarFinder.cursor.target === target && guitarFinder.cursor[target] === index;
    const isApply = guitarFinder.apply[target] === index;
    return [
      "guitar-item",
      isFocus ? "focus" : "",
      isApply ? "apply" : "",
    ].filter(Boolean).join(" ");
  };
</script>

<div class="wrap">
  <FinderConditionHeader {request} {method} {chordName} />
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
      {:else if method === "guitar" && guitarFinder != null}
        <div class="guitar-finder">
          <div class:active-section={guitarFinder.cursor.target === "voicing"} class="guitar-section voicing">
            <div class="guitar-title">Voicing</div>
            <div class="guitar-grid">
              {#each guitarFinder.voicings as item, index}
                <div class={getGuitarItemClass("voicing", index)}>
                  {#if item.voicingNo === -1}
                    None
                  {:else}
                    {@const voicing = getGuitarVoicing(item.voicingNo)}
                    <div class="guitar-item-label">#{item.voicingNo}</div>
                    <div class="guitar-thumbnail">
                      <AGFinderVoicingThumbnail frets={voicing.frets} />
                    </div>
                  {/if}
                </div>
              {/each}
            </div>
          </div>
          <div class:active-section={guitarFinder.cursor.target === "backing"} class="guitar-section backing">
            <div class="guitar-title">Backing</div>
            <div class="guitar-grid">
              {#each guitarFinder.backings as item, index}
                <div class={getGuitarItemClass("backing", index)}>
                  {#if item.backingNo === -1}
                    None
                  {:else}
                    {@const backing = getGuitarBacking(item.backingNo)}
                    <div class="guitar-item-label">#{item.backingNo}</div>
                    <div class="guitar-thumbnail">
                      <AGFinderBackingThumbnail backing={backing.backing} ts={request.ts} />
                    </div>
                  {/if}
                </div>
              {/each}
            </div>
          </div>
        </div>
      {:else if method === "piano" && pianoFinder != null}
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

  .guitar-finder {
    display: block;
    position: relative;
    width: 100%;
    height: 100%;
    padding: 0;
    box-sizing: border-box;
  }

  .guitar-section {
    display: block;
    position: relative;
    width: 100%;
    padding: 5px 6px 7px;
    box-sizing: border-box;
    overflow: hidden;
    background-color: rgba(82, 91, 112, 0.34);
  }

  .guitar-section.voicing {
    height: 162px;
  }

  .guitar-section.backing {
    height: calc(100% - 162px);
    margin-top: 0;
  }

  .guitar-section.active-section {
    background-color: rgba(114, 130, 154, 0.58);
  }

  .guitar-title {
    display: block;
    width: 100%;
    height: 22px;
    color: rgba(214, 247, 255, 0.84);
    font-size: 14px;
    font-weight: 800;
    line-height: 22px;
  }

  .guitar-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
    width: 100%;
  }

  .guitar-item {
    display: flex;
    position: relative;
    align-items: center;
    justify-content: center;
    height: 58px;
    border: 1px solid rgba(120, 169, 182, 0.58);
    box-sizing: border-box;
    background-color: rgba(98, 122, 142, 0.72);
    color: rgba(242, 252, 255, 0.84);
    font-size: 16px;
    font-weight: 800;
    overflow: hidden;
  }

  .guitar-item.focus {
    border-color: #ff382e;
    outline: 2px solid #ff382e;
    outline-offset: -2px;
    background-color: rgba(143, 125, 88, 0.85);
  }

  .guitar-item.apply {
    box-shadow: inset 0 0 0 3px rgba(94, 255, 113, 0.58);
  }

  .guitar-item-label {
    display: inline-block;
    position: absolute;
    left: 4px;
    top: 3px;
    z-index: 1;
    height: 12px;
    color: rgba(235, 250, 255, 0.78);
    font-size: 10px;
    font-weight: 800;
    line-height: 12px;
  }

  .guitar-thumbnail {
    display: inline-block;
    position: absolute;
    left: 8px;
    right: 8px;
    top: 16px;
    bottom: 7px;
  }
</style>
