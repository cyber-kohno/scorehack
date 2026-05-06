<script lang="ts">
  import RhythmTheory from "../../../../domain/theory/rhythm-theory";
  import { derivedStore } from "../../../../store/global-store";
  import type ElementState from "../../../../store/state/data/element-state";

  export let data!: ElementState.DataTS;
  export let elementSeq!: number;

  $: [nextTS, prev, next, isNoChange] = (() => {
    const ts = $derivedStore.elementCaches[elementSeq].ts;
    if (ts == undefined) throw new Error("ts must not be undefined.");

    return [
      RhythmTheory.formatTS(data.newTS),
      RhythmTheory.formatTS(ts.prev),
      RhythmTheory.formatTS(ts.next),
      RhythmTheory.formatTS(ts.prev) === RhythmTheory.formatTS(ts.next),
    ];
  })();
</script>

<div class="wrap">
  <div class="method">
    TS
  </div>
  <div class="val" data-isNoChange={isNoChange}>
    {nextTS}
  </div>
  <div class="change">
    {isNoChange ? "-" : `${prev} → ${next}`}
  </div>
</div>

<style>
  .wrap {
    display: inline-block;
    position: relative;
    width: 100%;
    border: 2px solid #ffea8b;
    box-sizing: border-box;
    border-radius: 18px;
    background-color: #1d7f974b;
  }
  .method {
    display: inline-block;
    position: relative;
    width: 100%;
    height: var(--modulate-record-height);
    text-align: center;
    font-size: 22px;
    font-weight: 600;
    color: rgb(239, 255, 236);
  }
  .val {
    display: inline-block;
    position: relative;
    width: 100%;
    height: var(--modulate-record-height);
    text-align: center;
    font-size: 22px;
    font-weight: 600;
    color: rgb(239, 255, 236);
  }
  .val[data-isNoChange="true"] {
    opacity: 0.45;
  }
  .change {
    display: inline-block;
    position: relative;
    width: 100%;
    height: var(--modulate-record-height);
    text-align: center;
    font-size: 16px;
    font-weight: 600;
    color: rgb(247, 239, 147);
  }
</style>
