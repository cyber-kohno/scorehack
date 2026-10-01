<script lang="ts">
  import TonalityTheory from "../../../../domain/theory/tonality-theory";
  import ElementState from "../../../../store/state/data/element-state";
  import { derivedStore } from "../../../../store/global-store";

  export let data: ElementState.DataModulate;
  export let elementSeq!: number;

  const formatVal = (val: number | undefined) => {
    if (val == undefined) return "-";
    return val > 0 ? `+${val}` : val.toString();
  };

  $: [method, val, prev, next, isNoChange] = (() => {
    const { elementCaches } = $derivedStore;
    const modulate = elementCaches[elementSeq].modulate;
    if (modulate == undefined)
      throw new Error("modulate must not be undefined.");
    const prev = TonalityTheory.getScaleName(modulate.prev);
    const next = TonalityTheory.getScaleName(modulate.next);
    return [data.method, formatVal(data.val), prev, next, prev === next];
  })();
</script>

<div class="wrap">
  <div class="method">
    {method}
  </div>
  <div class="val" data-isNoChange={isNoChange}>
    {val}
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
    /* background-color: #001c1c7a; */
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
    /* background-color: #001c1c7a; */
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
    /* background-color: #7a8aa07a; */
    width: 100%;
    height: var(--modulate-record-height);
    text-align: center;
    font-size: 16px;
    font-weight: 600;
    color: rgb(247, 239, 147);
  }
</style>
