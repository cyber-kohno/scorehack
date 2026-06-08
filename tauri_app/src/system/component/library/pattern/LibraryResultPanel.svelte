<script lang="ts">
  import ChordTheory from "../../../domain/theory/chord-theory";
  import ArrangeLibrary from "../../../store/state/data/arrange/arrange-library";
  import type ArrangeState from "../../../store/state/data/arrange/arrange-state";
  import { controlStore, dataStore, libraryStore } from "../../../store/global-store";
  import FinderConditionHeader from "../../arrange/finder/condition/FinderConditionHeader.svelte";
  import APFinderPresetItem from "../../arrange/finder/list/piano/APFinderPresetItem.svelte";

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
    if (library == null || track == undefined || track.method !== "piano") return null;
    const condition = library.condition;

    const request: ArrangeLibrary.SearchRequest = {
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
      list: ArrangeLibrary.searchPianoPatterns({
        req: request,
        arrTrack: track as ArrangeState.Track,
        isFilterPatternOnly: false,
      }),
    };
  })();
</script>

<div class="panel">
  {#if finder != null && track != undefined}
    <FinderConditionHeader request={finder.request} method={track.method} />
  {:else}
    <div class="condition-placeholder"></div>
  {/if}
  <div class="list-base">
    {#if track == undefined}
      <div class="msg">No arrange track found.</div>
    {:else if track.method !== "piano"}
      <div class="msg">Piano patterns are available for piano tracks only.</div>
    {:else if finder == null || finder.list.length === 0}
      <div class="msg">No matching presets found.</div>
    {:else}
      <div class="list-inner">
        {#each finder.list as preset, backingIndex}
          <APFinderPresetItem {finder} usageBkg={preset} {backingIndex} />
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
