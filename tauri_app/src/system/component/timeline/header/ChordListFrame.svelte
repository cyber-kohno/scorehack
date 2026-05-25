<script lang="ts">
  import type DerivedState from "../../../store/state/derived-state";
  import type RefState from "../../../store/state/ref-state";
  import { controlStore, dataStore, derivedStore, settingsStore } from "../../../store/global-store";
  import ChordTheory from "../../../domain/theory/chord-theory";
  import TimelineLastMargin from "../TimelineTailMargin.svelte";
  import useDerivedSelector from "../../../service/derived/derived-selector";
  import type ElementState from "../../../store/state/data/element-state";
  import DegreeBasis from "../../../service/notation/degree-basis";

  export let scrollLimitProps: RefState.ScrollLimitProps;

  $: focus = $controlStore.outline.focus;
  $: chordNameMode = $settingsStore.view.timeline.chordNameMode;

  $: chordCaches = (() => {
    const focusPos = useDerivedSelector($derivedStore, $controlStore).getTimelineFocusPos();
    return $derivedStore.chordCaches.filter((c) => {
      const middle = c.viewPosLeft + c.viewPosWidth / 2;
      return (
        Math.abs(scrollLimitProps.scrollMiddleX - middle) <
          scrollLimitProps.rectWidth ||
        Math.abs(focusPos - middle) < scrollLimitProps.rectWidth
      );
    });
  })();

  const getChordName = (
    cache: DerivedState.ChordCache,
    mode: typeof chordNameMode,
    elements: typeof $dataStore.elements,
  ) => {
    if (mode === "degree") {
      const element = elements[cache.elementSeq];
      if (element.type !== "chord") return "-";

      const data = element.data as ElementState.DataChord;
      if (data.degree == undefined) return "-";
      return ChordTheory.getDegreeChordName(
        DegreeBasis.toDisplayDegree(
          data.degree,
          $derivedStore.baseCaches[cache.baseSeq].scoreBase.tonality,
          $settingsStore.notation.degreeBasis,
        ),
      );
    }

    const compiledChord = cache.compiledChord;
    if (compiledChord == undefined) return "-";
    return ChordTheory.getKeyChordName(compiledChord.chord);
  };

  const isScaleSafe = (
    cache: DerivedState.ChordCache,
    elements: typeof $dataStore.elements,
  ) => {
    const element = elements[cache.elementSeq];
    if (element.type !== "chord") return true;

    const data = element.data as ElementState.DataChord;
    if (data.degree == undefined) return true;

    const tonality = $derivedStore.baseCaches[cache.baseSeq].scoreBase.tonality;
    return ChordTheory.isScaleSafeDegreeChord(tonality, data.degree);
  };

  $: chordItems = chordCaches.map((chordCache) => ({
    ...chordCache,
    name: getChordName(chordCache, chordNameMode, $dataStore.elements),
    isScaleSafe: isScaleSafe(chordCache, $dataStore.elements),
  }));
</script>

<div class="wrap">
  {#each chordItems as chordCache}
    <div
      class="item"
      style:left="{chordCache.viewPosLeft}px"
      style:width="{chordCache.viewPosWidth}px"
    >
      <div
        class="inner"
        data-isFocus={focus === chordCache.elementSeq}
        data-isError={chordCache.error != undefined}
        data-isBorrowed={!chordCache.isScaleSafe}
      >
        {chordCache.name}
      </div>
    </div>
  {/each}
  <TimelineLastMargin />
</div>

<style>
  .wrap {
    display: inline-block;
    position: relative;
    /* background-color: #cd68cb; */
    min-width: 100%;
    width: var(--beat-sum);
    height: var(--block-height);
  }

  .item {
    display: inline-block;
    position: absolute;
    z-index: 1;
    background-color: #354886d4;
    height: var(--block-height);
  }

  .inner {
    background-color: #a4b3b78f;
    margin: 2px 0 0 2px;
    width: calc(100% - 4px);
    font-size: 22px;
    line-height: 36px;
    color: #ffffffed;
    font-weight: 600;
    text-align: center;
  }

  .inner[data-isFocus="true"] {
    background-color: #16c4b885;
  }

  .inner[data-isError="true"] {
    background-color: #c92929d9;
  }

  .inner[data-isBorrowed="true"] {
    color: #ffe35a;
  }
</style>
