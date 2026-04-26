<script lang="ts">
  import StoreCache from "../../store/props/storeCache";
  import ArrangeUtil from "../../store/reducer/arrangeUtil";
  import store from "../../store/store";
  import MusicTheory from "../../util/musicTheory";

  $: reducer = ArrangeUtil.useReducer($store);
  $: target = reducer.getArrange().target;
</script>

<div class="wrap">
  <div class="item">
    <div class="label">Chord</div>
    <div class="value">{MusicTheory.getKeyChordName(target.compiledChord.chord)}</div>
  </div>
  <div class="item">
    <div class="label">TS</div>
    <div class="value">{MusicTheory.getTSName(target.scoreBase.ts)}</div>
  </div>
  <div class="item">
    <div class="label">Beat</div>
    <div class="value">{StoreCache.getBeatInfo(target.beat)}</div>
  </div>
</div>

<style>
  .wrap {
    display: inline-block;
    position: relative;
    width: 100%;
    height: 33px;
    background-color: #ffffffaa;
  }
  .item {
    display: inline-block;
    position: relative;
    width: 33%;
    height: 100%;
  }
  .label {
    display: inline-block;
    position: relative;
    margin: 4px 0 0 4px;
    width: 100px;
    height: 26px;
    background-color: rgba(21, 119, 119, 0.267);
    color: rgb(133, 133, 133);
    font-size: 18px;
    font-weight: 600;
    font-style: italic;
    text-align: center;
    border: solid 1px #000;
    box-sizing: border-box;
    vertical-align: top;
    border-radius: 2px;
  }
  .value {
    display: inline-block;
    position: relative;
    margin: 4px 0 0 4px;
    padding: 0 0 0 4px;
    box-sizing: border-box;
    width: 100px;
    height: 26px;
    font-style: italic;
    /* background-color: rgb(236, 252, 252); */
    color: rgb(156, 15, 15);
    font-size: 18px;
    /* font-weight: 600; */
    text-align: left;
    vertical-align: top;
  }
</style>
