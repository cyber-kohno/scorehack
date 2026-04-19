<script lang="ts">
  import Layout from "../../../styles/tokens/layout-tokens";
  import { getMelodyCursorState } from "../../../app/melody/melody-cursor-state";
  import { envStore } from "../../../state/session-state/env-store";
  import { melodyOverlapStore } from "../../../state/session-state/melody-overlap-store";
  import StoreMelody from "../../../domain/melody/melody-store";
  import store from "../../store/store";
  import UnitDisplay from "./UnitDisplay.svelte";

  $: noteInfo = (() => {
    const cursor = getMelodyCursorState($store);
    const beatSize = StoreMelody.calcBeat(cursor.norm, cursor.pos);
    const left = $envStore.beatWidth * beatSize;
    const pitch = cursor.pitch;
    const isOverlap = $melodyOverlapStore;
    return { left, pitch, isOverlap };
  })();

  $: width = (() => {
    const cursor = getMelodyCursorState($store);
    const beatSize = StoreMelody.calcBeat(cursor.norm, cursor.len);
    return $envStore.beatWidth * beatSize;
  })();
</script>

<div
  class="line"
  style:left="{noteInfo.left}px"
  data-isOverlap={noteInfo.isOverlap}
>
  <div
    class="flag"
    style:top="{Layout.getPitchTop(noteInfo.pitch)}px"
    style:width="{width - 10}px"
  >
    <UnitDisplay note={getMelodyCursorState($store)} />
  </div>
</div>

<style>
  .line {
    display: inline-block;
    position: absolute;
    top: var(--pitch-top-margin);
    z-index: 3;
    width: 10px;
    /* height: calc(var(--pitch-top-margin) + var(--pitch-frame-height)); */
    height: var(--pitch-frame-height);
    background-color: #4bd137;
    opacity: 0.8;
  }
  .flag {
    display: inline-block;
    position: absolute;
    left: 10px;
    z-index: 2;
    height: var(--pitch-item-height);
    background-color: #4bd137;
    border-radius: 0 2px 2px 0;
  }

  .line[data-isOverlap="true"],
  .line[data-isOverlap="true"] .flag {
    background-color: #d13333; /* lineとflagの背景色 */
  }
</style>
