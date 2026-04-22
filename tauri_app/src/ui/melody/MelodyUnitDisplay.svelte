<script lang="ts">
  import StoreMelody from "../../domain/melody/melody-store";
  import type { MelodyNote } from "../../domain/melody/melody-types";

  export let note!: MelodyNote;

  $: unit = StoreMelody.getUnitText(note);
</script>

<div class="unit">{unit}</div>

<style>
  .unit {
    display: inline-block;
    position: absolute;
    left: 4px;
    top: -52px;
    z-index: 2;
    font-size: 18px;
    font-weight: 600;
    line-height: 24px;
    white-space: nowrap;
    background-color: rgba(75, 0, 0, 0.699);
    padding: 0 6px;
    border-radius: 4px;
    color: #ffffff;
  }
</style>
