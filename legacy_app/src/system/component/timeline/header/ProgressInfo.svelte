<script lang="ts">
  import type StoreRef from "../../../store/props/storeRef";
  import useReducerRoot from "../../../store/reducer/reducerRoot";
  import store from "../../../store/store";
  import MusicTheory from "../../../util/musicTheory";

  export let scrollLimitProps: StoreRef.ScrollLimitProps;

  type Diff = {
    prev: string;
    next: string;
  };
  $: [chordList, changeList] = (() => {
    const chordList: {
      x: number;
      time: number;
    }[] = [];
    const changeList: {
      x: number;
      section?: string;
      modulate?: Diff;
      tempo?: Diff;
    }[] = [];
    const { getTimelineFocusPos } = useReducerRoot($store);
    const focusPos = getTimelineFocusPos();
    $store.cache.chordCaches.forEach((chordCache) => {
      const x = chordCache.viewPosLeft;
      const middle = chordCache.viewPosLeft + chordCache.viewPosWidth / 2;
      if (
        Math.abs(scrollLimitProps.scrollMiddleX - middle) >
          scrollLimitProps.rectWidth &&
        Math.abs(focusPos - middle) > scrollLimitProps.rectWidth
      )
        return 1;
      chordList.push({
        x,
        time: chordCache.startTime,
      });

      const section = chordCache.sectionStart;
      const modulateCache = chordCache.modulate;
      const tempoCache = chordCache.tempo;
      if (
        section != undefined ||
        modulateCache != undefined ||
        tempoCache != undefined
      ) {
        let modulate: Diff | undefined = undefined;
        let tempo: Diff | undefined = undefined;
        if (modulateCache != undefined) {
          modulate = {
            prev: MusicTheory.getScaleName(modulateCache.prev),
            next: MusicTheory.getScaleName(modulateCache.next),
          };
        } else if (tempoCache != undefined) {
          tempo = {
            prev: tempoCache.prev.toString(),
            next: tempoCache.next.toString(),
          };
        }
        changeList.push({
          x,
          section,
          modulate,
          tempo,
        });
      }
    });
    // console.log(list.length);
    return [chordList, changeList];
  })();

  const formatNumber = (num: number) => {
    // toFixedで指定した桁数にフォーマット
    const formattedNumber = num.toFixed(2);

    // parseFloatを使って余分な0を削除し、フォーマットを保つ
    return parseFloat(formattedNumber).toString();
  };
</script>

<div class="wrap">
  {#each chordList as chord}
    <div class="chord" style:left="{chord.x}px" style:top="0">
      <div class="time">{formatNumber(chord.time * 0.001)}s</div>
    </div>
  {/each}

  {#each changeList as change}
    <div class="chord" style:left=" {change.x}px" style:top="20px">
      {#if change.section != undefined}
        <div class="section">
          {`${change.section}`}
        </div>
      {/if}
      {#if change.modulate != undefined}
        <div class="scale">
          {`${change.modulate.prev} → ${change.modulate.next}`}
        </div>
      {/if}
      {#if change.tempo != undefined}
        <div class="scale">
          {`${change.tempo.prev} → ${change.tempo.next}`}
        </div>
      {/if}
    </div>
  {/each}
</div>

<style>
  .wrap {
    display: inline-block;
    position: relative;
    background-color: rgba(36, 121, 131, 0.467);
    min-width: 100%;
    width: var(--beat-sum);
    height: var(--info-height);
  }

  .chord {
    display: inline-block;
    position: absolute;
    height: 100%;
    /* border: 1px solid #aaaaaa; */
    /* box-sizing: border-box; */
    padding: 2px 0 0 0;
    /* background-color: rgb(0, 47, 255); */
    * {
      display: inline-block;
      position: relative;
      font-size: 16px;
      line-height: 18px;
      font-weight: 600;
      padding: 2px 2px;
      height: 50%;
      box-sizing: border-box;
      /* background-color: red; */
    }
  }
  .time {
    color: rgb(255, 255, 255);
    /* background-color: rgba(255, 255, 255, 0.18); */
  }
  .section {
    color: rgb(250, 241, 145);
    /* background-color: rgba(127, 255, 212, 0.18); */
  }
  .scale {
    color: rgb(231, 0, 96);
    background-color: rgba(168, 234, 212, 0.261);
  }
</style>
