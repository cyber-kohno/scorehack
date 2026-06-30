<script lang="ts">
  import { get } from "svelte/store";
  import { onDestroy, tick } from "svelte";
  import ChordTheory from "../../../domain/theory/chord-theory";
  import FinderState from "../../../store/state/data/arrange/finder-state";
  import ScrollRateFrame from "../../common/ScrollRateFrame.svelte";
  import { controlStore, dataStore, libraryStore, refStore } from "../../../store/global-store";
  import FinderConditionHeader from "../../arrange/finder/condition/FinderConditionHeader.svelte";
  import APFinderPresetItem from "../../arrange/finder/list/piano/APFinderPresetItem.svelte";
  import LibraryDrumPatternItem from "./drum/LibraryDrumPatternItem.svelte";

  let listRef: HTMLElement | null = null;
  let recordRefs: HTMLElement[] = [];

  const syncRecordRefs = (length: number) => {
    const refState = get(refStore);
    refState.library.finder.frame = listRef ?? undefined;
    refState.library.finder.records = recordRefs
      .slice(0, length)
      .map((ref, seq) => ({ seq, ref }))
      .filter(item => item.ref != undefined);
    refStore.set({ ...refState });
  };

  const clearRecordRefs = () => {
    const refState = get(refStore);
    refState.library.finder.frame = undefined;
    refState.library.finder.records = [];
    refStore.set({ ...refState });
  };

  onDestroy(clearRecordRefs);

  const createStructCount = (library: NonNullable<typeof $libraryStore>) => {
    const condition = library.condition;
    const chord = {
      key12: condition.root,
      isFlat: false,
      symbol: condition.symbol,
      on: condition.on === -1
        ? undefined
        : {
          key12: condition.on,
          isFlat: false,
        },
    };

    return ChordTheory.getStructsFromKeyChord(chord).length;
  };

  $: track = $dataStore.arrange.tracks[$controlStore.outline.trackIndex];
  $: pianoFinder = (() => {
    const library = $libraryStore;
    if (library == null || track == undefined) return null;
    if (track.method !== "piano") return null;

    const condition = library.condition;
    const request: FinderState.SearchRequest = {
      ts: condition.ts,
      beat: condition.beat,
      eatHead: condition.eatHead,
      eatTail: condition.eatTail,
      structCnt: createStructCount(library),
    };

    return {
      request,
      cursor: library.focus.finder?.cursor ?? { backing: -1, sounds: -1 },
      apply: { backing: -1, sounds: -1 },
      list: FinderState.searchPianoPatterns({
        req: request,
        arrTrack: track,
        isFilterPatternOnly: false,
      }),
    };
  })();

  $: drumFinder = (() => {
    const library = $libraryStore;
    if (library == null || track == undefined) return null;
    if (track.method !== "drum") return null;

    const condition = library.condition;
    const request: FinderState.SearchRequest = {
      ts: condition.ts,
      beat: condition.beat,
      eatHead: condition.eatHead,
      eatTail: condition.eatTail,
      structCnt: 0,
    };

    return {
      request,
      cursor: library.focus.finder?.cursor.backing ?? -1,
      list: FinderState.Drum.searchPatterns({
        req: request,
        arrTrack: track,
      }),
    };
  })();

  $: request = pianoFinder?.request ?? drumFinder?.request ?? null;
  $: cursorIndex = pianoFinder?.cursor.backing ?? drumFinder?.cursor ?? -1;
  $: listLength = pianoFinder?.list.length ?? drumFinder?.list.length ?? 0;
  $: isDrumRegular = (patternNo: number) => {
    return track?.method === "drum" && track.bank.regulars.some(regular => {
      return regular.patternNo === patternNo;
    });
  };

  $: {
    tick().then(() => syncRecordRefs(listLength));
  }
</script>

<div class="panel">
  {#if request != null && track != undefined}
    <FinderConditionHeader {request} method={track.method} />
  {:else}
    <div class="condition-placeholder"></div>
  {/if}
  <div class="list-base">
    <ScrollRateFrame
      ref={listRef}
      dir={"y"}
      frameLength={300}
      frameWidth={10}
      dependencies={[cursorIndex]}
    />
    {#if track == undefined}
      <div class="msg">No arrange track found.</div>
    {:else if track.method !== "piano" && track.method !== "drum"}
      <div class="msg">Piano patterns are available for piano tracks only.</div>
    {:else if listLength === 0}
      <div class="msg">No matching presets found.</div>
    {:else}
      <div class="list-inner" bind:this={listRef}>
        {#if track.method === "drum" && drumFinder != null}
          <div class="drum-grid">
            {#each drumFinder.list as item, patternIndex}
              <div class="drum-cell record-ref" bind:this={recordRefs[patternIndex]}>
                <LibraryDrumPatternItem
                  finder={drumFinder}
                  {item}
                  index={patternIndex}
                  isRegular={isDrumRegular(item.patternNo)}
                />
              </div>
            {/each}
          </div>
        {:else if pianoFinder != null}
          {#each pianoFinder.list as preset, backingIndex}
            <div class="record-ref" bind:this={recordRefs[backingIndex]}>
              <APFinderPresetItem finder={pianoFinder} usageBkg={preset} {backingIndex} />
            </div>
          {/each}
        {/if}
      </div>
    {/if}
  </div>
</div>

<style>
  .panel {
    display: inline-block;
    position: relative;
    width: 100%;
    height: 100%;
    background-color: rgb(0, 0, 0);
    overflow: hidden;
  }

  .condition-placeholder {
    display: inline-block;
    position: relative;
    width: 100%;
    height: 40px;
    background-color: #0d263a;
  }

  .list-base {
    display: inline-block;
    position: relative;
    width: 100%;
    height: calc(100% - 40px);
  }

  .list-inner {
    display: inline-block;
    position: relative;
    width: 100%;
    height: 100%;
    background-color: rgb(44, 44, 44);
    overflow: hidden;
  }

  .record-ref {
    display: inline-block;
    position: relative;
    width: 100%;
    height: 71px;
  }

  .drum-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    position: relative;
    width: 100%;
  }

  .drum-cell {
    width: 100%;
  }

  .msg {
    display: inline-block;
    position: relative;
    width: 100%;
    height: 30px;
    padding: 0 0 0 4px;
    box-sizing: border-box;
    color: rgba(255, 255, 255, 0.658);
    font-size: 18px;
    font-weight: 600;
    line-height: 22px;
  }
</style>
