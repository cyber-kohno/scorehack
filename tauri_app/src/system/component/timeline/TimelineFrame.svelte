<script lang="ts">
  import GridRootFrame from "./grid/GridRootFrame.svelte";
  import BeatMeasureFrame from "./header/BeatMeasureFrame.svelte";
  import ChordListFrame from "./header/ChordListFrame.svelte";
  import ProgressInfo from "./header/ProgressInfo.svelte";
  import PitchListFrame from "./pitch/PitchListFrame.svelte";  import RefState from "../../store/state/ref-state";
  import PianoViewFrame from "./grid/PianoViewFrame.svelte";
  import ChordTheory from "../../domain/theory/chord-theory";
  import TonalityTheory from "../../domain/theory/tonality-theory";
  import { controlStore, derivedStore, refStore } from "../../store/global-store";
    import useDerivedSelector from "../../service/derived/derived-selector";

  $: scrollLimitProps = RefState.getScrollLimitProps($refStore.header);

  $: derivedSelector = useDerivedSelector($derivedStore, $controlStore);
  $: isArrangeEditorActive =
    $controlStore.outline.arrange?.editor != undefined;

  $: pianoInfo = (() => {
    const element = derivedSelector.getCurElement();

    // コード要素以外では表示しない。
    if (element.type !== "chord") return null;

    const chordCache = derivedSelector.getCurChord();

    const base = derivedSelector.getCurBase();
    const tonality = base.scoreBase.tonality;
    const scaleList = TonalityTheory.getScaleKeyIndexesFromTonality(tonality);

    let uses: number[] = [];

    const compiledChord = chordCache.compiledChord;
    if (compiledChord) {
      const chord = compiledChord.chord;
      uses = ChordTheory.getSymbolProps(chord.symbol).structs.map((s) => {
        return chord.key12 + ChordTheory.getIntervalFromRelation(s);
      });

      const on = chord.on;
      if (on != undefined && !uses.map((v) => v % 12).includes(on.key12)) {
        uses.push(on.key12);
      }
    }

    return {
      scaleList,
      uses,
    };
  })();
</script>

<div class="wrap" data-isArrangeEditorActive={isArrangeEditorActive}>
  <div class="header">
    <div class="blank"></div>
    <div class="active" bind:this={$refStore.header}>
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
    transition:
      filter 120ms ease,
      opacity 120ms ease;
  }
  .wrap[data-isArrangeEditorActive="true"] {
    filter: blur(3px) saturate(0.85) brightness(1.08);
    opacity: 0.78;
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
