<script lang="ts">
  import GuitarEditorState from "../../../../../store/state/data/arrange/guitar/guitar-editor-state";

  export let frets: GuitarEditorState.StringSelection[];

  $: displayStrings = GuitarEditorState.STANDARD_TUNING
    .map((string, stringIndex) => ({ string, stringIndex }))
    .reverse();
  $: fretIndexes = Array.from(
    { length: GuitarEditorState.MAX_FRET + 1 },
    (_, fret) => fret,
  );
</script>

<div class="wrap">
  {#each displayStrings as { stringIndex }}
    <div class="string-row">
      {#each fretIndexes as fret}
        <div class="fret-cell" data-on={frets[stringIndex] === fret}></div>
      {/each}
    </div>
  {/each}
</div>

<style>
  .wrap {
    display: grid;
    grid-template-rows: repeat(6, 1fr);
    width: 100%;
    height: 100%;
    gap: 1px;
    box-sizing: border-box;
  }

  .string-row {
    display: grid;
    grid-template-columns: repeat(13, 1fr);
    gap: 1px;
    min-height: 0;
  }

  .fret-cell {
    min-width: 0;
    min-height: 0;
    border-radius: 1px;
    background-color: rgba(225, 241, 243, 0.22);
  }

  .fret-cell[data-on="true"] {
    background-color: rgba(255, 164, 74, 0.94);
    box-shadow: 0 0 4px rgba(255, 178, 88, 0.84);
  }
</style>
