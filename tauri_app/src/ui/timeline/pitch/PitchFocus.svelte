<script lang="ts">
  import Layout from "../../../styles/tokens/layout-tokens";
import store from "../../../state/root-store";
  import { getCurrentMelodyPitch } from "../../../state/ui-state/melody-ui-store";

  const LP = Layout.pitch;

  $: pitchIndex = getCurrentMelodyPitch($store);
  $: top = LP.TOP_MARGIN + (LP.NUM - 1 - pitchIndex) * LP.ITEM_HEIGHT;
</script>

<div class="wrap" style:top="{top}px"></div>

<style>
  .wrap {
    display: inline-block;
    position: absolute;
    left: 0;
    width: 100%;
    height: var(--pitch-item-height);
    z-index: 2;
    background-color: rgba(179, 255, 0, 0.334);
  }
</style>
