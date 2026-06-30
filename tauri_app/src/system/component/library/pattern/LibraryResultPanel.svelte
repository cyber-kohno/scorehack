<script lang="ts">
  import { get } from "svelte/store";
  import { onDestroy, tick } from "svelte";
  import ChordTheory from "../../../domain/theory/chord-theory";
  import FinderState from "../../../store/state/data/arrange/finder-state";
  import ScrollRateFrame from "../../common/ScrollRateFrame.svelte";
  import { controlStore, dataStore, libraryStore, refStore } from "../../../store/global-store";
  import FinderConditionHeader from "../../arrange/finder/condition/FinderConditionHeader.svelte";
  import APFinderPresetItem from "../../arrange/finder/list/piano/APFinderPresetItem.svelte";

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
  $: finder = (() => {
    const library = $libraryStore;
    if (library == null || track == undefined) return null;
    if (track.method !== "piano" && track.method !== "drum") return null;

    const condition = library.condition;

    const request: FinderState.SearchRequest = {
      ts: condition.ts,
      beat: condition.beat,
      eatHead: condition.eatHead,
      eatTail: condition.eatTail,
      structCnt: createStructCount(library),
    };

    if (track.method === "drum") {
      return {
        request,
        cursor: library.focus.finder?.cursor ?? { backing: -1, sounds: -1 },
        apply: { backing: -1, sounds: -1 },
        list: [],
      };
    }

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

  $: {
    const length = finder?.list.length ?? 0;
    tick().then(() => syncRecordRefs(length));
  }
</script>

<div class="panel">
  {#if finder != null && track != undefined}
    <FinderConditionHeader request={finder.request} method={track.method} />
  {:else}
    <div class="condition-placeholder"></div>
  {/if}
  <div class="list-base">
    <ScrollRateFrame
      ref={listRef}
      dir={"y"}
      frameLength={300}
      frameWidth={10}
      dependencies={[finder?.cursor.backing]}
    />
    {#if track == undefined}
      <div class="msg">No arrange track found.</div>
    {:else if track.method !== "piano" && track.method !== "drum"}
      <div class="msg">Piano patterns are available for piano tracks only.</div>
    {:else if finder == null || finder.list.length === 0}
      <div class="msg">No matching presets found.</div>
    {:else}
      <div class="list-inner" bind:this={listRef}>
        {#each finder.list as preset, backingIndex}
          <div class="record-ref" bind:this={recordRefs[backingIndex]}>
            <APFinderPresetItem {finder} usageBkg={preset} {backingIndex} />
          </div>
        {/each}
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
