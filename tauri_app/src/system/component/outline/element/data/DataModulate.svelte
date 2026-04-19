<script lang="ts">
  import type { OutlineDataModulate } from "../../../../../domain/outline/outline-types";
  import { cacheStateStore } from "../../../../../state/cache-state/cache-store";
  import MusicTheory from "../../../../../domain/theory/music-theory";

  export let data!: OutlineDataModulate;
  export let elementSeq!: number;

  $: [method, val, prev, next] = (() => {
    const { elementCaches } = $cacheStateStore;
    const modulate = elementCaches[elementSeq].modulate;
    if (modulate == undefined)
      throw new Error("Modulation data must be defined.");
    const prev = MusicTheory.getScaleName(modulate.prev);
    const next = MusicTheory.getScaleName(modulate.next);
    return [data.method, data.val ?? "-", prev, next];
  })();
</script>

<div class="wrap">
  <div class="method">
    {method}
  </div>
  <div class="val">
    {val}
  </div>
  <div class="change">
    {`${prev} 竊・${next}`}
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
