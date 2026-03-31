<script lang="ts">
  import GridRootFrame from "./grid/GridRootFrame.svelte";
  import BeatMeasureFrame from "./header/BeatMeasureFrame.svelte";
  import ChordListFrame from "./header/ChordListFrame.svelte";
  import ProgressInfo from "./header/ProgressInfo.svelte";
  import PitchListFrame from "./pitch/PitchListFrame.svelte";
  import store from "../../store/store";
  import StoreRef from "../../store/props/storeRef";
  import PianoViewFrame from "./grid/PianoViewFrame.svelte";
  import useReducerCache from "../../store/reducer/reducerCache";
  import MusicTheory from "../../util/musicTheory";

  $: scrollLimitProps = StoreRef.getScrollLimitProps($store.ref.header);

  $: reducerCache = useReducerCache($store);

  $: pianoInfo = (() => {
    const element = reducerCache.getCurElement();

    // コード要素以外では表示しない。
    if (element.type !== "chord") return null;

    const chordCache = reducerCache.getCurChord();

    const base = reducerCache.getCurBase();
    const tonality = base.scoreBase.tonality;
    const scaleList = MusicTheory.getScaleKeyIndexesFromTonality(tonality);

    let uses: number[] = [];

    const compiledChord = chordCache.compiledChord;
    if (compiledChord) {
      uses = compiledChord.structs.map((s) => s.key12);
    }


    return {
      scaleList,
      uses,
    };
  })();
</script>

<div class="wrap">
  <div class="header">
    <div class="blank"></div>
    <div class="active" bind:this={$store.ref.header}>
      {#if scrollLimitProps != null}
        <ChordListFrame {scrollLimitProps} />
        <ProgressInfo {scrollLimitProps} />
        <BeatMeasureFrame {scrollLimitProps} />
      {/if}
    </div>
  </div>
  <div class="main">
    <PitchListFrame />
    <GridRootFrame />

    {#if pianoInfo != null}
      <div class="piano">
        <PianoViewFrame
          uiParam={{ width: 380, height: 80, wKeyNum: 14 }}
          scaleList={pianoInfo.scaleList}
          uses={pianoInfo.uses}
        />
      </div>
    {/if}
  </div>
</div>

<style>
  .wrap {
    display: inline-block;
    position: relative;
    width: calc(100% - var(--outline-width));
    height: 100%;
    background-color: #c6dee1;
    vertical-align: top;
  }
  .header {
    display: inline-block;
    position: relative;
    /* background-color: #c416c1; */
    width: 100%;
    height: var(--timeline-header-height);
    overflow: hidden;
  }

  .blank {
    display: inline-block;
    position: relative;
    width: var(--pitch-width);
    height: 100%;
    /* background-color: #2fd4f9; */
  }
  .active {
    display: inline-block;
    position: relative;
    width: calc(100% - var(--pitch-width));
    height: 100%;
    overflow: hidden;
    background-color: aliceblue;
  }
  .main {
    display: inline-block;
    position: relative;
    /* background-color: #5b6466; */
    width: 100%;
    height: calc(100% - var(--timeline-header-height));
  }
  .piano {
    display: inline-block;
    position: absolute;
    right: 5px;
    bottom: 5px;
    z-index: 4;
    opacity: 0.95;
    /* width: 300px;
        height: 200px; */
  }
</style>
