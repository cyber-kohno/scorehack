<script lang="ts">
  import type StoreMelody from "../../system/store/props/storeMelody";
  import LegacyMelodyUnitDisplay from "../../system/component/melody/UnitDisplay.svelte";

  export let note!: StoreMelody.Note;
</script>

<LegacyMelodyUnitDisplay {note} />
