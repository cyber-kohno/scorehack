<script lang="ts">
  import ContextUtil from "../../../store/contextUtil";
  import MelodyState from "../../../store/state/data/melody-state";
  import { controlStore, dataStore } from "../../../store/global-store";
  import store from "../../../store/store";
  import useReducerCache from "../../../service/derived/reducerCache";
  import useMelodySelector from "../../../service/melody/melody-selector";

  $: reduerCache = useReducerCache($store);
  $: melodySelctor = useMelodySelector($controlStore, $dataStore);

  $: focusInfo = reduerCache.getFocusInfo();

  $: [noteLeft, noteWidth] = (() => {
    const notes = melodySelctor.getCurrScoreTrack().notes;
    const melody = $controlStore.melody;
    const note = melody.focus === -1 ? melody.cursor : notes[melody.focus];
    const side = MelodyState.calcBeatSide(note);
    return [side.pos, side.len].map((v) => v * $store.settings.beatWidth);
  })();
  $: isMelodyMode = $controlStore.mode === "melody";
  const isPreview = ContextUtil.get('isPreview');
</script>

{#if focusInfo.isChord}
  <div
    class="chord"
    style:left="{focusInfo.left}px"
    style:width="{focusInfo.width}px"
    data-isChord={focusInfo.isChord}
  ></div>
{/if}
{#if isMelodyMode && !$isPreview()}
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
