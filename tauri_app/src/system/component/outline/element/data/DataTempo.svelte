<script lang="ts">
  import type ElementState from "../../../../store/state/data/element-state";
  import { derivedStore } from "../../../../store/global-store";

  export let data!: ElementState.DataTempo;
  export let elementSeq!: number;

  const formatVal = (data: ElementState.DataTempo) => {
    if (data.method === "rate") return `${data.val}%`;
    return data.val > 0 ? `+${data.val}` : data.val.toString();
  };

  $: [method, val, prev, next, isNoChange] = (() => {
    const { elementCaches } = $derivedStore;
    const tempo = elementCaches[elementSeq].tempo;
    if (tempo == undefined) throw new Error("tempo must not be undefined.");

    return [
      data.method,
      formatVal(data),
      tempo.prev.toString(),
      tempo.next.toString(),
      tempo.prev === tempo.next,
    ];
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
