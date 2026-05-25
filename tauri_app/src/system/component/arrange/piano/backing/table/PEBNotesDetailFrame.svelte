<script lang="ts">
  import { getPianoBacking } from "../../piano-editor-context";
  import Layout from "../../../../../layout/layout-constant";
  import { refStore } from "../../../../../store/global-store";
  import PianoBackingState from "../../../../../store/state/data/arrange/piano/piano-backing-state";

  export let colIndex!: number;
  export let recordIndex!: number;

  const bp = getPianoBacking();

  $: note = (() => {
    const item = $bp.getCurLayer().items.find((item) => {
      const info = PianoBackingState.convNotesInfo(item);
      return info.colIndex === colIndex && info.recordIndex === recordIndex;
    });
    if (item == undefined) return { velocity: 10, delay: 0 };
    return PianoBackingState.convNotesInfo(item);
  })();

  $: velocityWidth = `${Math.floor(note.velocity * 5)}%`;
  $: delayLeft = `${6 + ((200 - 12 - 10) / (3 * 2)) * (3 + note.delay)}px`;

  $: frameStyle = (() => {
    const table = $refStore.arrange.piano.table;
    if (table == undefined) return "";
    const rect = table.getBoundingClientRect();
    const colLeft =
      1 +
      $bp
        .getCurLayer()
        .cols.slice(0, colIndex)
        .reduce((total, col) => total + $bp.getColWidth(col) + 1, 0);
    const rowIndex = $bp.backing.recordNum - 1 - recordIndex;
    const rowTop = 1 + rowIndex * (Layout.arrange.piano.BACKING_RECORD_HEIGHT + 1);
    const left = rect.left + colLeft - table.scrollLeft;
    const top = rect.top + rowTop + 24 - table.scrollTop;
    return `left: ${left}px; top: ${top}px;`;
  })();
</script>

<div class="wrap" style={frameStyle}>
  <div class="label">velocity</div>
  <div class="record">
    <div class="vel-frame">
      <div class="vel-value" style:width={velocityWidth}></div>
    </div>
  </div>
  <div class="label">delay</div>
  <div class="record">
    <div class="delay-line"></div>
    <div class="delay-center"></div>
    <div class="delay-pointer" style:left={delayLeft}></div>
  </div>
</div>

<style>
  .wrap {
    display: inline-block;
    position: fixed;
    width: 200px;
    height: 80px;
    background-color: rgba(216, 223, 223, 0.897);
    border: 1px solid #494949;
    border-radius: 4px;
    z-index: 20;
    white-space: normal;
  }
  .label {
    display: inline-block;
    position: relative;
    width: 100%;
    height: 20px;
    font-size: 14px;
    line-height: 22px;
    font-weight: 600;
    color: rgb(175, 0, 0);
    padding: 0 0 0 2px;
    box-sizing: border-box;
  }
  .record {
    display: inline-block;
    position: relative;
    width: 100%;
    height: 20px;
  }
  .vel-frame {
    display: inline-block;
    position: relative;
    margin: 3px 0 0 6px;
    width: calc(100% - 12px);
    height: 14px;
    background-color: rgba(231, 231, 231, 0.897);
    border: 1px solid #000;
    box-sizing: border-box;
  }
  .vel-value {
    display: inline-block;
    height: 100%;
    background-color: rgba(103, 181, 218, 0.897);
  }
  .delay-line {
    display: inline-block;
    position: absolute;
    top: 8px;
    left: 6px;
    width: calc(100% - 12px);
    height: 4px;
    background-color: rgba(0, 41, 75, 0.897);
  }
  .delay-center {
    display: inline-block;
    position: absolute;
    top: 2px;
    left: calc(50% - 2px);
    width: 4px;
    height: 16px;
    background-color: rgba(0, 41, 75, 0.897);
  }
  .delay-pointer {
    display: inline-block;
    position: absolute;
    top: 5px;
    width: 10px;
    height: 10px;
    background-color: rgba(255, 0, 0, 0.842);
    border: 1px solid #fff;
    box-sizing: border-box;
  }
</style>
