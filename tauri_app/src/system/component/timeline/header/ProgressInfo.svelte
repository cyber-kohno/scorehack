<script lang="ts">
  import type { ScrollLimitProps } from "../../../../state/session-state/scroll-limit-props";
  import store from "../../../store/store";
  import { getTimelineProgressItems } from "../../../../state/ui-state/timeline-ui-store";

  export let scrollLimitProps: ScrollLimitProps;

  type Diff = {
    prev: string;
    next: string;
  };
  $: ({ chordList, changeList } = getTimelineProgressItems(
    $store,
    scrollLimitProps,
  ) as {
    chordList: {
      x: number;
      time: number;
    }[];
    changeList: {
      x: number;
      section?: string;
      modulate?: Diff;
      tempo?: Diff;
    }[];
  });

  const formatNumber = (num: number) => {
    // toFixedで持E��した桁数にフォーマッチE
    const formattedNumber = num.toFixed(2);

    // parseFloatを使って余�Eな0を削除し、フォーマットを保つ
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
          {`${change.modulate.prev} ↁE${change.modulate.next}`}
        </div>
      {/if}
      {#if change.tempo != undefined}
        <div class="scale">
          {`${change.tempo.prev} ↁE${change.tempo.next}`}
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




