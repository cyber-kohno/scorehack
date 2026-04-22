<script lang="ts">
  import Layout from "../../styles/tokens/layout-tokens";
import store from "../../state/root-store";
  import { envStore } from "../../state/session-state/env-store";
  import {
    getMelodyCursor,
    isMelodyCursorOverlap,
  } from "../../state/ui-state/melody-ui-store";
  import MelodyUnitDisplay from "./MelodyUnitDisplay.svelte";
  import StoreMelody from "../../domain/melody/melody-store";

  $: cursor = getMelodyCursor($store);
  $: beatLeft = StoreMelody.calcBeat(cursor.norm, cursor.pos);
  $: beatWidth = StoreMelody.calcBeat(cursor.norm, cursor.len);
  $: left = $envStore.beatWidth * beatLeft;
  $: width = $envStore.beatWidth * beatWidth;
  $: isOverlap = isMelodyCursorOverlap($store);
</script>

<div class="line" style:left="{left}px" data-isOverlap={isOverlap}>
  <div
    class="flag"
    style:top="{Layout.getPitchTop(cursor.pitch)}px"
    style:width="{width - 10}px"
  >
    <MelodyUnitDisplay note={cursor} />
  </div>
</div>

<style>
  .line {
    display: inline-block;
    position: absolute;
    top: var(--pitch-top-margin);
    z-index: 3;
    width: 10px;
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
    background-color: #d13333;
  }
</style>
