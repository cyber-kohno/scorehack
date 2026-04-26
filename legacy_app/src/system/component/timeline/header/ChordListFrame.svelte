<script lang="ts">
  import type StoreCache from "../../../store/props/storeCache";
  import type StoreRef from "../../../store/props/storeRef";
  import useReducerRoot from "../../../store/reducer/reducerRoot";
  import store from "../../../store/store";
  import MusicTheory from "../../../util/musicTheory";
  import TimelineLastMargin from "../TimelineTailMargin.svelte";

  export let scrollLimitProps: StoreRef.ScrollLimitProps;

  $: focus = $store.control.outline.focus;

  $: chordCaches = (() => {
    const { getTimelineFocusPos } = useReducerRoot($store);
    const focusPos = getTimelineFocusPos();
    return $store.cache.chordCaches.filter((c) => {
      const middle = c.viewPosLeft + c.viewPosWidth / 2;
      return (
        Math.abs(scrollLimitProps.scrollMiddleX - middle) <
          scrollLimitProps.rectWidth ||
        Math.abs(focusPos - middle) < scrollLimitProps.rectWidth
      );
    });
  })();

  const getChordName = (cache: StoreCache.ChordCache) => {
    const compiledChord = cache.compiledChord;
    if (compiledChord == undefined) return "-";
    return MusicTheory.getKeyChordName(compiledChord.chord);
  };
</script>

<div class="wrap">
  {#each chordCaches as chordCache}
    <div
      class="item"
      style:left="{chordCache.viewPosLeft}px"
      style:width="{chordCache.viewPosWidth}px"
    >
      <div class="inner" data-isFocus={focus === chordCache.elementSeq}>
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
</style>
