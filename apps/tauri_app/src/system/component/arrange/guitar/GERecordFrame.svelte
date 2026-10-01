<script lang="ts">
  import GuitarEditorState from "../../../store/state/data/arrange/guitar/guitar-editor-state";
  import createArrangeSelector from "../../../service/arrange/arrange-selector";
  import { controlStore, dataStore } from "../../../store/global-store";
  import TonalityTheory from "../../../domain/theory/tonality-theory";

  $: selector = createArrangeSelector({ control: $controlStore, data: $dataStore });
  $: editor = selector.getGuitarEditor();

  $: records = GuitarEditorState.STANDARD_TUNING.map((string, stringIndex) => {
    const fret = editor.frets[stringIndex];
    if (fret == null) return "-";

    return TonalityTheory.getKey12FullName(string.openPitchIndex + fret);
  });
  $: displayStrings = GuitarEditorState.STANDARD_TUNING
    .map((string, stringIndex) => ({ string, stringIndex }))
    .reverse();
</script>

<div class="wrap">
  {#each displayStrings as { string, stringIndex }}
    <div class="record">
      <div class="struct">
        {string.number} {records[stringIndex]}
      </div>
    </div>
  {/each}
</div>

<style>
  .wrap {
    display: inline-block;
    position: relative;
    width: 100%;
    height: 100%;
  }

  .record {
    display: inline-block;
    position: relative;
    margin: 1px 0 0 0;
    width: 100%;
    height: var(--ap-backing-record-height);
    padding: 0;
    background-color: rgb(204, 228, 228);
  }

  .struct {
    display: inline-block;
    position: relative;
    margin: 1px;
    width: calc(100% - 2px);
    height: calc(100% - 2px);
    box-sizing: border-box;
    border: 1px solid rgb(48, 48, 48);
    border-radius: 2px;
    background-color: rgba(209, 209, 209, 0.411);
    color: rgb(255, 21, 21);
    font-size: 14px;
    font-weight: 600;
    line-height: 24px;
    overflow: hidden;
    padding: 0 0 0 4px;
    white-space: nowrap;
  }
</style>
