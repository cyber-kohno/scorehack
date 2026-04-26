<script lang="ts">
  import MelodyState from "../../../store/state/data/melody-state";
  import RefState from "../../../store/state/ref-state";

  import { controlStore, dataStore } from "../../../store/global-store";
  import store from "../../../store/store";
  import Note from "./Note.svelte";
  import useMelodySelector from "../../../service/melody/melody-selector";

  $: selector = useMelodySelector($controlStore, $dataStore);

  $: notes = selector.getCurrScoreTrack().notes;

  $: scrollLimitProps = RefState.getScrollLimitProps($store.ref.grid);

  $: cursorMiddle = (() => {
    const melody = $controlStore.melody;
    const note = melody.focus === -1 ? melody.cursor : notes[melody.focus];
    const beatSide = MelodyState.calcBeatSide(note);
    const [left, width] = [beatSide.pos, beatSide.len].map(
      (v) => v * $store.settings.beatWidth
    );
    return left + width / 2;
  })();
</script>

{#if scrollLimitProps != null}
  {#each notes as note, index}
    <Note {note} {index} {scrollLimitProps} {cursorMiddle} />
  {/each}
{/if}
