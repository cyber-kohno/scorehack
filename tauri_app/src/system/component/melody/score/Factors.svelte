<script lang="ts">
  import { settingsStore } from "../../../store/global-store";
  import type RhythmTheory from "../../../domain/theory/rhythm-theory";
  import MelodyState from "../../../store/state/data/melody-state";
  import { splitNoteDisplayFactors, type NoteDisplayUnit } from "./note-display-util";

  export let note: MelodyState.Note;
  export let ts: RhythmTheory.TimeSignature;

  $: factors = splitNoteDisplayFactors(note, ts);

  const buildType = (unit: NoteDisplayUnit) => unit;
</script>

{#each factors as factor}
  <div
    class="item"
    data-type={buildType(factor.unit)}
    style:width="{factor.length * $settingsStore.view.timeline.beatWidth}px"
  ></div>
{/each}

<style>
  .item {
    display: inline-block;
    position: relative;
    vertical-align: top;
    border-radius: 4px;
    background-color: #7d7d7d85;
    border: solid 1px #000000d2;
    box-sizing: border-box;
  }

  .item[data-type="beat"] {
    margin-top: calc(var(--factor-center) - 6px);
    height: 12px;
    border-radius: 6px;
  }
  .item[data-type="triplet"] {
    margin-top: calc(var(--factor-center) - 6px);
    height: 12px;
    border-radius: 6px;
    background-color: #f3717185;
    border: solid 1px #ba6c6cd2;
  }
  .item[data-type="eighth"] {
    margin-top: calc(var(--factor-center) - 5px);
    height: 10px;
    border-radius: 5px;
    background-color: #81949385;
    border: solid 1px #364040d2;
  }
  .item[data-type="sixteenth"] {
    margin-top: calc(var(--factor-center) - 4px);
    height: 8px;
    border-radius: 4px;
    background-color: #6fa6a885;
    border: solid 1px #6fb5b1d2;
  }
</style>
