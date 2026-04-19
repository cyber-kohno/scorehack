<script lang="ts">
  import type StoreMelody from "../../domain/melody/melody-store";
  import LegacyMelodyUnitDisplay from "../../system/component/melody/UnitDisplay.svelte";

  export let note!: StoreMelody.Note;
</script>

<LegacyMelodyUnitDisplay {note} />
