<script lang="ts">
  import Layout from "../../../layout/layout-constant";
  import useMelodySelector from "../../../service/melody/melody-selector";
  import { controlStore, dataStore } from "../../../store/global-store";

  $: selector = useMelodySelector($controlStore, $dataStore);

  const LP = Layout.pitch;

  $: top = (() => {
    const notes = selector.getCurrScoreTrack().notes;
    const melody = $controlStore.melody;
    const { pitch: pitchIndex } =
      melody.focus === -1 ? melody.cursor : notes[melody.focus];
    return LP.TOP_MARGIN + (LP.NUM - 1 - pitchIndex) * LP.ITEM_HEIGHT;
  })();
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
