<script lang="ts">
  import StoreMelody from "../../../store/props/storeMelody";
  import StoreRef from "../../../store/props/storeRef";
  import useReducerMelody from "../../../store/reducer/reducerMelody";
  import store from "../../../store/store";
  import Note from "./Note.svelte";

  $: reducer = useReducerMelody($store);

  $: notes = reducer.getCurrScoreTrack().notes;

  $: scrollLimitProps = StoreRef.getScrollLimitProps($store.ref.grid);

  $: cursorMiddle = (() => {
    const melody = $store.control.melody;
    const note = melody.focus === -1 ? melody.cursor : notes[melody.focus];
    const beatSide = StoreMelody.calcBeatSide(note);
    const [left, width] = [beatSide.pos, beatSide.len].map(
      (v) => v * $store.env.beatWidth
    );
    return left + width / 2;
  })();
</script>

{#if scrollLimitProps != null}
  {#each notes as note, index}
    <Note {note} {index} {scrollLimitProps} {cursorMiddle} />
  {/each}
{/if}
