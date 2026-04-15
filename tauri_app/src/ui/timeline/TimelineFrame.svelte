<script lang="ts">
  import store from "../../system/store/store";
  import PianoViewFrame from "../../system/component/timeline/grid/PianoViewFrame.svelte";
  import TimelineHeader from "./header/TimelineHeader.svelte";
  import TimelinePitchColumn from "./pitch/TimelinePitchColumn.svelte";
  import TimelineGrid from "./grid/TimelineGrid.svelte";
  import {
    getTimelineHeaderScrollLimitProps,
    getTimelinePianoInfo,
  } from "../../state/ui-state/timeline-ui-store";

  $: scrollLimitProps = getTimelineHeaderScrollLimitProps($store);
  $: pianoInfo = getTimelinePianoInfo($store);
</script>

<div class="wrap">
  <div class="header">
    <div class="blank"></div>
    <div class="active" bind:this={$store.ref.header}>
      {#if scrollLimitProps != null}
        <TimelineHeader {scrollLimitProps} />
      {/if}
    </div>
  </div>
  <div class="main">
    <TimelinePitchColumn />
    <TimelineGrid />

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
    width: 100%;
    height: var(--timeline-header-height);
    overflow: hidden;
  }
  .blank {
    display: inline-block;
    position: relative;
    width: var(--pitch-width);
    height: 100%;
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
  }
</style>
