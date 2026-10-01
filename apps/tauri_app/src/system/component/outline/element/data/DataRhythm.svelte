<script lang="ts">
  import RhythmTheory from "../../../../domain/theory/rhythm-theory";
  import { derivedStore } from "../../../../store/global-store";
  import type ElementState from "../../../../store/state/data/element-state";

  export let data!: ElementState.DataRhythm;
  export let elementSeq!: number;

  $: [nextRhythm, prev, next, isNoChange] = (() => {
    const rhythm = $derivedStore.elementCaches[elementSeq].rhythm;
    if (rhythm == undefined) throw new Error("rhythm must not be undefined.");

    return [
      RhythmTheory.formatRhythm(data.newRhythm),
      RhythmTheory.formatRhythm(rhythm.prev),
      RhythmTheory.formatRhythm(rhythm.next),
      RhythmTheory.formatRhythm(rhythm.prev) === RhythmTheory.formatRhythm(rhythm.next),
    ];
  })();
</script>

<div class="wrap">
  <div class="method">
    Rhythm
  </div>
  <div class="val" data-isNoChange={isNoChange}>
    {nextRhythm}
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
