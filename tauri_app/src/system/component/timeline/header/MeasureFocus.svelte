<script lang="ts">
  import MelodyState from "../../../store/state/data/melody-state";
  import { controlStore, dataStore, derivedStore, playbackStore, settingsStore } from "../../../store/global-store";  import useMelodySelector from "../../../service/melody/melody-selector";
  import useDerivedSelector from "../../../service/derived/derived-selector";

  $: derivedSelector = useDerivedSelector($derivedStore, $controlStore);
  $: melodySelctor = useMelodySelector({ control: $controlStore, data: $dataStore });

  $: focusInfo = derivedSelector.getFocusInfo();

  $: [noteLeft, noteWidth] = (() => {
    const notes = melodySelctor.getCurrScoreTrack().notes;
    const melody = $controlStore.melody;
    const note = melody.focus === -1 ? melody.cursor : notes[melody.focus];
    const side = MelodyState.calcBeatSide(note);
    return [side.pos, side.len].map((v) => v * $settingsStore.beatWidth);
  })();
  $: isMelodyMode = $controlStore.mode === "melody";
  $: isPreview = $playbackStore.timerKeys != null;
</script>

{#if focusInfo.isChord}
  <div
    class="chord"
    style:left="{focusInfo.left}px"
    style:width="{focusInfo.width}px"
    data-isChord={focusInfo.isChord}
  ></div>
{/if}
{#if isMelodyMode && !isPreview}
  <div class="note" style:left="{noteLeft}px" style:width="{noteWidth}px"></div>
{/if}

<style>
  .chord {
    display: inline-block;
    position: absolute;
    top: 0;
    height: 100%;
    z-index: 2;
    background-color: #f6be224f;
  }
  .chord[data-isChord="false"] {
    background-color: #d90000;
  }
  .note {
    display: inline-block;
    position: absolute;
    top: calc(100% - 20px);
    height: 20px;
    z-index: 3;
    background-color: #fcae1b88;
  }
</style>
