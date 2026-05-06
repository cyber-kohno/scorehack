<script lang="ts">
  import type DerivedState from "../../../store/state/derived-state";
  import type RefState from "../../../store/state/ref-state";
  import { controlStore, derivedStore } from "../../../store/global-store";
  import ChordTheory from "../../../domain/theory/chord-theory";
  import TimelineLastMargin from "../TimelineTailMargin.svelte";
  import StoreUtil from "../../../service/common/store-util";

  export let scrollLimitProps: RefState.ScrollLimitProps;

  $: focus = $controlStore.outline.focus;

  $: chordCaches = (() => {
    const focusPos = StoreUtil.getTimelineFocusPos(
      $derivedStore,
      $controlStore,
    );
    return $derivedStore.chordCaches.filter((c) => {
      const middle = c.viewPosLeft + c.viewPosWidth / 2;
      return (
        Math.abs(scrollLimitProps.scrollMiddleX - middle) <
          scrollLimitProps.rectWidth ||
        Math.abs(focusPos - middle) < scrollLimitProps.rectWidth
      );
    });
  })();

  const getChordName = (cache: DerivedState.ChordCache) => {
    const compiledChord = cache.compiledChord;
    if (compiledChord == undefined) return "-";
    return ChordTheory.getKeyChordName(compiledChord.chord);
  };
</script>

<div class="wrap">
  {#each chordCaches as chordCache}
    <div
      class="item"
      style:left="{chordCache.viewPosLeft}px"
      style:width="{chordCache.viewPosWidth}px"
    >
      <div
        class="inner"
        data-isFocus={focus === chordCache.elementSeq}
        data-isError={chordCache.error != undefined}
      >
        {getChordName(chordCache)}
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
    color: #ffffffc5;
    text-align: center;
  }

  .inner[data-isFocus="true"] {
    background-color: #16c4b885;
  }

  .inner[data-isError="true"] {
    background-color: #c92929d9;
  }
</style>
