<script lang="ts">
  import type DerivedState from "../../../store/state/derived-state";
  import type RefState from "../../../store/state/ref-state";
  import RhythmTheory from "../../../domain/theory/rhythm-theory";
  import StoreUtil from "../../../service/common/store-util";
  import { controlStore, derivedStore, settingsStore } from "../../../store/global-store";

  export let baseCache!: DerivedState.BaseCache;
  export let scrollLimitProps: RefState.ScrollLimitProps;

  $: barDivBeatCnt = RhythmTheory.getBarDivBeatCount(baseCache.scoreBase.ts);
  $: beatDiv16Count = RhythmTheory.getBeatDiv16Count(baseCache.scoreBase.ts);
  $: barDiv16Cnt = barDivBeatCnt * beatDiv16Count;

  $: beatWidth = $settingsStore.beatWidth * (beatDiv16Count / 4);
  $: left = baseCache.viewPosLeft;
  $: width = baseCache.viewPosWidth;

  $: memoriList = (() => {
    // console.log(baseCache);
    const list: {
      x: number;
      width: number;
      height: number;
      isBar: boolean;
      bar?: number;
    }[] = [];
    const num = baseCache.lengthBeat * beatDiv16Count;
    const focusPos = StoreUtil.getTimelineFocusPos(
      $derivedStore,
      $controlStore,
    );
    for (let i = 0; i < num; i++) {
      let bar: number | undefined = undefined;
      const left = (beatWidth / beatDiv16Count) * i;
      const absLeft = baseCache.viewPosLeft + left;
      if (
        Math.abs(scrollLimitProps.scrollMiddleX - absLeft) >
          scrollLimitProps.rectWidth &&
        Math.abs(focusPos - absLeft) > scrollLimitProps.rectWidth
      )
        continue;
      let width = 1;
      let height = 10;
      let isBar = false;
      if (i % barDiv16Cnt === 0) {
        width = 4;
        height = 20;
        isBar = true;
        bar = baseCache.startBar + Math.floor(i / barDiv16Cnt);
      } else if (i % beatDiv16Count === 0) {
        width = 2;
        height = 18;
      } else if (i % 2 === 0) {
        width = 2;
        height = 13;
      }
      list.push({ x: left, width, height, isBar, bar });
    }
    return list;
  })();
</script>

<div class="wrap" style:left="{left}px" style:width="{width}px">
  {#each memoriList as memori}
    <div
      class="memori"
      data-bar={memori.isBar}
      style:left="{memori.x}px"
      style:width="{memori.width}px"
      style:height="{memori.height}px"
    >
      {#if memori.bar != undefined}
        <div class="bar">{memori.bar}</div>
      {/if}
    </div>
  {/each}
</div>

<style>
  .wrap {
    display: inline-block;
    position: absolute;
    top: 0;
    height: 100%;
    /* background-color: rgb(166, 170, 198); */
    /* background: linear-gradient(to bottom, #ebebeb, rgb(145, 152, 185)); */
    /* background: linear-gradient(to bottom, #0e3465, rgb(0, 0, 0)); */
  }
  .memori {
    display: inline-block;
    position: absolute;
    top: 0;
    background-color: rgb(170, 184, 198);
  }
  .memori[data-bar="true"] {
    background-color: rgb(255, 98, 98);
  }
  .bar {
    display: inline-block;
    position: absolute;
    font-size: 18px;
    font-weight: 600;
    left: -22px;
    top: 16px;
    color: rgb(255, 98, 98);
    /* background-color: rgba(46, 123, 190, 0.198); */
    width: 50px;
    text-align: center;
  }
</style>
