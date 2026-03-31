<script lang="ts">
  import type StoreOutline from "../../../../store/props/storeOutline";
  import store from "../../../../store/store";
  import MusicTheory from "../../../../util/musicTheory";

  export let data!: StoreOutline.DataModulate;
  export let elementSeq!: number;

  $: [method, val, prev, next] = (() => {
    const { elementCaches } = $store.cache;
    const modulate = elementCaches[elementSeq].modulate;
    if (modulate == undefined)
      throw new Error("modulateがundefinedであってはならない。");
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
    {`${prev} → ${next}`}
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
