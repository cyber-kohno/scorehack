<script lang="ts">
  import StoreOutline from "../../store/props/storeOutline";
  import useReducerCache from "../../store/reducer/reducerCache";
  import store from "../../store/store";
  import MusicTheory from "../../util/musicTheory";

  $: reducerCache = useReducerCache($store);

  $: scoreBase = reducerCache.getCurBase().scoreBase;

  $: elementCache = $store.cache.elementCaches[$store.control.outline.focus];
</script>

{#if scoreBase !== null}
  <div class="wrap">
    <div class="record">
      <div class="title">scale:</div>
      <div class="value">{MusicTheory.getScaleName(scoreBase.tonality)}</div>
    </div>
    <div class="record">
      <div class="title">ts:</div>
      <div class="value">{MusicTheory.getTSName(scoreBase.ts)}</div>
    </div>
    <div class="record">
      <div class="title">tempo:</div>
      <div class="value">{scoreBase.tempo}</div>
    </div>
    {#if elementCache.curSection !== ""}
      <div class="record">
        <div class="title">section:</div>
        <div class="value">{elementCache.curSection}</div>
      </div>
    {/if}
  </div>
{/if}

<style>
  .wrap {
    display: inline-block;
    position: relative;
    width: 100%;
    height: var(--outline-header-height);
    background-color: rgb(55, 77, 110);
    padding: 2px 4px 2px 4px;
    box-sizing: border-box;
  }
  .record {
    display: inline-block;
    position: relative;
    margin: 2px 0 0 0;
    background-color: rgba(211, 224, 252, 0.298);
    width: 100%;
    height: 22px;
    /* border-radius: 8px; */
  }
  .record * {
    display: inline-block;
    font-size: 16px;
    font-weight: 600;
    line-height: 20px;
    height: 100%;
    vertical-align: top;
    padding: 0 0 0 4px;
    box-sizing: border-box;
  }
  .title {
    width: 80px;
    background-color: rgba(127, 255, 212, 0.182);
    color: rgba(255, 255, 255, 0.497);
    font-style: italic;
  }
  .value {
    width: calc(100% - 80px);
    color: rgba(255, 255, 254, 0.822);
    font-style: italic;
    overflow: hidden;
  }
</style>
