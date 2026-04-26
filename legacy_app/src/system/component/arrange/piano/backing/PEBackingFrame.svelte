<script lang="ts">
  import { onMount } from "svelte";
  import ContextUtil from "../../../../store/contextUtil";
  import StorePianoBacking from "../../../../store/props/arrange/piano/storePianoBacking";
  import store from "../../../../store/store";
  import FocusableContent from "../../FocusableContent.svelte";
  import LenFrame from "./PEBColFrame.svelte";
  import MeasureFrame from "./PEBMeasureFrame.svelte";
  import PedalFrame from "./PEBPedalFrame.svelte";
  import RecordFrame from "./PEBRecordFrame.svelte";
  import PEBTargetLayer from "./PEBTargetLayer.svelte";
  import TableFrame from "./table/PEBTableFrame.svelte";
  import Layout from "../../../../const/layout";

  const editor = ContextUtil.get("pianoEditor");

  $: backing = (() => {
    const backing = $editor.backing;
    if (backing == null) throw new Error();
    return backing;
  })();

  const getColWidth = (col: StorePianoBacking.Col) => {
    return StorePianoBacking.getColWidthCriteriaBeatWidth(
      col,
      Layout.arrange.piano.DIV1_WIDTH
    );
  };

  $: getCurLayer = () => backing.layers[backing.layerIndex];
  $: getBackLayer = () => backing.layers[backing.layerIndex === 0 ? 1 : 0];
  $: getColFrameWidth = () => {
    let width = 0;
    backing.layers.forEach((l) => {
      const layerWidth = l.cols.reduce((total, cur, i) => {
        const width = getColWidth(cur);
        total += width + 1;
        if (i === l.cols.length - 1) total += 1;
        return total;
      }, 0);
      if (width < layerWidth) width = layerWidth;
    });
    return width;
  };
  $: {
    ContextUtil.set("backingProps", {
      backing,
      getCurLayer,
      getBackLayer,
      getColWidth,
      getColFrameWidth,
    });
  }

  // $: control = $editor.control;
  // $: {
  //   console.log(control);
  // }
</script>

<div class="wrap">
  <div class="left">
    <div class="headerdiv">
      <PEBTargetLayer />
    </div>
    <div class="recorddiv">
      <FocusableContent isFocus={$editor.control === "record"}
        ><RecordFrame /></FocusableContent
      >
    </div>
    <div class="pedaldiv"></div>
  </div>
  <div class="right">
    <div class="headerdiv">
      <FocusableContent isFocus={$editor.control === "col"}
        ><LenFrame /></FocusableContent
      >
      <MeasureFrame />
    </div>
    <div class="recorddiv">
      <FocusableContent isFocus={$editor.control === "notes"}
        ><TableFrame /></FocusableContent
      >
    </div>
    <div class="pedaldiv">
      <FocusableContent
        isFocus={$editor.control === "col" && backing.layerIndex === 0}
        ><PedalFrame /></FocusableContent
      >
    </div>
  </div>
</div>

<style>
  .wrap {
    display: inline-block;
    position: relative;
    /* width: 100%; */
    /* width: 100%;
    height: 100%; */
    /* background-color: #93d98d; */
    * {
      vertical-align: top;
    }
  }
  .left {
    display: inline-block;
    position: relative;
    width: var(--ap-backing-record-width);
    height: 100%;
    /* background-color: #073d02; */
  }
  .headerdiv {
    display: inline-block;
    position: relative;
    width: 100%;
    height: calc(var(--ap-backing-header-height) + 8px);
    /* background-color: #d342c78d; */
  }
  .recorddiv {
    display: inline-block;
    position: relative;
    width: 100%;
    height: calc(var(--ap-backing-table-height) + 8px);
    /* background-color: #d3c742aa; */
  }
  .pedaldiv {
    display: inline-block;
    position: relative;
    width: 100%;
    height: calc(var(--ap-backing-pedal-height) + 8px);
    /* background-color: #000000c5; */
  }
  .right {
    display: inline-block;
    position: relative;
    /* width: 100%; */
    width: calc(
      var(--ap-voicing-frame-width) - var(--ap-backing-record-width) + 8px
    );
    /* background-color: #bababa; */
  }
</style>
