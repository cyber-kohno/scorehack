<script lang="ts">
  import type OutlineState from "../../../../store/state/data/outline-state";
  import MusicTheory from "../../../../domain/theory/music-theory";

  export let data!: OutlineState.DataInit;

  $: [keyScaleName, tsName, tempo] = (() => {
    const keyScaleName = MusicTheory.getScaleName(data.tonality);

    const tsName = MusicTheory.getTSName(data.ts);
    return [keyScaleName, tsName, data.tempo];
  })();
</script>

<div class="wrap">
  <div>{keyScaleName}</div>
  <div>{tsName}</div>
  <div>{tempo}</div>
</div>

<style>
  .wrap {
    display: inline-block;
    position: relative;
    width: 100%;
    /* background-color: #ffffff44; */
    /* より強調された影 */
    /* box-shadow: 0 8px 16px rgba(0, 0, 0, 0.6); */
    /* border: 1px solid #fff; */
    padding: 0 2px var(--init-record-margin) 2px;
    box-sizing: border-box;
    * {
      display: inline-block;
      position: relative;
      margin-top: var(--init-record-margin);
      width: 100%;
      background-color: #00a87e71;
      border-radius: 12px;
      color: rgb(255, 255, 255);

      height: var(--init-record-height);
      text-align: center;
      font-size: 22px;
      line-height: 28px;
      font-weight: 600;
      border: 1px solid rgb(207, 255, 233);
      box-sizing: border-box;
    }
  }
</style>
