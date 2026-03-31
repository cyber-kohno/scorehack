<script lang="ts">
  import ContextUtil from "../../../store/contextUtil";
  import StoreMelody from "../../../store/props/storeMelody";
  import useReducerCache from "../../../store/reducer/reducerCache";
  import useReducerMelody from "../../../store/reducer/reducerMelody";
  import store from "../../../store/store";

  $: reduerCache = useReducerCache($store);
  $: reducerMelody = useReducerMelody($store);

  $: focusInfo = reduerCache.getFocusInfo();

  $: [noteLeft, noteWidth] = (() => {
    const notes = reducerMelody.getCurrScoreTrack().notes;
    const melody = $store.control.melody;
    const note = melody.focus === -1 ? melody.cursor : notes[melody.focus];
    const side = StoreMelody.calcBeatSide(note);
    return [side.pos, side.len].map((v) => v * $store.env.beatWidth);
  })();
  $: isMelodyMode = $store.control.mode === "melody";
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
