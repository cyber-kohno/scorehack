<script lang="ts">
  import type FinderState from "../../../../../store/state/data/arrange/finder-state";
  import type PianoEditorState from "../../../../../store/state/data/arrange/piano/piano-editor-state";
  import createArrangeSelector from "../../../../../service/arrange/arrange-selector";
  import APFinderBacking from "./APFinderBacking.svelte";
  import APFinderVoicsFrame from "./APFinderVoicsFrame.svelte";
  import { controlStore, dataStore } from "../../../../../store/global-store";

  export let finder: FinderState.PianoArrangeFinder;
  export let usageBkg: PianoEditorState.Regular;
  export let backingIndex: number;

  $: [backing, sndsPatts] = (() => {
    const { getCurTrack } = createArrangeSelector({ control: $controlStore, data: $dataStore });
    const track = getCurTrack();
    if (track.method !== "piano") throw new Error();
    const lib = track.bank;
    const bkgPatt = usageBkg.backingNo === -1
      ? undefined
      : lib.backingPatterns.find(
        (bkgPatt) => bkgPatt.no === usageBkg.backingNo,
      );
    if (usageBkg.backingNo !== -1 && bkgPatt == undefined)
      throw new Error("bkgPatt must exist.");

    // const sndsPatts = lib.soundsPatterns.filter((sndsPatt) => {
    //     // return (
    //     //     sndsPatt.category.structCnt === finder.info.structCnt &&
    //     //     sndsPatt.sounds.length === bkgPatt.backing.recordNum
    //     // );
    //     return usageBkg.soundsNos.includes(sndsPatt.no);
    // });
    const sndsPatts = usageBkg.soundsNos.map((vNo) => {
      const sounds = lib.soundsPatterns.find((s) => s.no === vNo);
      if (sounds == undefined)
        throw new Error("sounds must exist.");
      return sounds;
    });
    return [bkgPatt?.backing ?? null, sndsPatts];
  })();

  $: isRecordFocus = backingIndex === finder.cursor.backing;
  $: isRecordApply = backingIndex === finder.apply.backing;
</script>

<div class="wrap">
  {#if isRecordFocus}
    <div class="focus"></div>
  {/if}
  <div class="inner">
    <div class="backing">
      {#if backing == null}
        <div class="none-backing" data-focus={isRecordFocus} data-apply={isRecordApply}>
          None
        </div>
      {:else}
        <APFinderBacking
          layers={backing.layers}
          voicingCnt={backing.recordNum}
          {isRecordFocus}
          {isRecordApply}
          {usageBkg}
          ts={finder.request.ts}
        />
      {/if}
    </div>
    <div class="voicing">
      <APFinderVoicsFrame
        {finder}
        {sndsPatts}
        {isRecordFocus}
        {backingIndex}
        {usageBkg}
      />
    </div>
  </div>
</div>

<style>
  .wrap {
    display: inline-block;
    position: relative;
    width: calc(100% - 2px);
    height: 70px;
    margin: 1px 0 0 1px;
    background-color: rgb(0, 0, 0);
  }
  .focus {
    display: inline-block;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.206);
    z-index: 1;
  }
  .inner {
    display: inline-block;
    position: relative;
    margin: 2px 0 0 2px;
    width: calc(100% - 4px);
    height: calc(100% - 4px);
    /* box-sizing: border-box;
        border: 1px solid rgba(255, 255, 255, 0.181); */
    * {
      display: inline-block;
      position: relative;
      vertical-align: top;
      height: 100%;
    }
  }
  .voicing {
    width: calc(100% - 150px);
    background-color: rgb(0, 46, 109);
  }
  .backing {
    width: 148px;
    background-color: rgb(133, 4, 8);
  }
  .none-backing {
    display: inline-block;
    position: relative;
    margin: 2px 0 0 2px;
    width: calc(100% - 4px);
    height: calc(100% - 2px);
    box-sizing: border-box;
    color: rgba(234, 246, 251, 0.92);
    font-size: 18px;
    font-weight: 700;
    line-height: 64px;
    text-align: center;
  }
  .none-backing[data-apply="true"] {
    background-color: rgba(232, 161, 74, 0.623);
  }
  .none-backing[data-focus="true"] {
    border: 1px solid rgb(241, 229, 0);
    background-color: rgba(240, 236, 0, 0.137);
  }
</style>
