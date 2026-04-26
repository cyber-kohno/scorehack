<script lang="ts">
  import type StoreCache from "../../../store/props/storeCache";
  import type StoreRef from "../../../store/props/storeRef";
  import useReducerRoot from "../../../store/reducer/reducerRoot";
  import store from "../../../store/store";
  import MusicTheory from "../../../util/musicTheory";

  export let baseCache!: StoreCache.BaseCache;
  export let scrollLimitProps: StoreRef.ScrollLimitProps;

  $: barDivBeatCnt = MusicTheory.getBarDivBeatCount(baseCache.scoreBase.ts);
  $: beatDiv16Count = MusicTheory.getBeatDiv16Count(baseCache.scoreBase.ts);
  $: barDiv16Cnt = barDivBeatCnt * beatDiv16Count;

  $: beatWidth = $store.env.beatWidth * (beatDiv16Count / 4);
  $: left = baseCache.startBeat * beatWidth;
  $: width = baseCache.lengthBeat * beatWidth;

  $: memoriList = (() => {
    const { getTimelineFocusPos } = useReducerRoot($store);
    // console.log(baseCache);
    const list: {
      x: number;
      width: number;
      height: number;
      isBar: boolean;
      bar?: number;
    }[] = [];
    const num = baseCache.lengthBeat * beatDiv16Count;
    const focusPos = getTimelineFocusPos();
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
