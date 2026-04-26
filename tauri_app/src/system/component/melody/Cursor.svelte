<script lang="ts">
  import Layout from "../../layout/layout-constant";
  import MelodyState from "../../store/state/data/melody-state";
  import { controlStore } from "../../store/global-store";
  import store from "../../store/store";
  import UnitDisplay from "./UnitDisplay.svelte";

  $: noteInfo = (() => {
    const melody = $controlStore.melody;
    const cursor = melody.cursor;
    const beatSize = MelodyState.calcBeat(cursor.norm, cursor.pos);
    const left = $store.settings.beatWidth * beatSize;
    const pitch = cursor.pitch;
    const isOverlap = melody.isOverlap;
    return { left, pitch, isOverlap };
  })();

  $: width = (() => {
    const melody = $controlStore.melody;
    const cursor = melody.cursor;
    const beatSize = MelodyState.calcBeat(cursor.norm, cursor.len);
    return $store.settings.beatWidth * beatSize;
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
    <UnitDisplay note={$controlStore.melody.cursor} />
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
