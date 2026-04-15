<script lang="ts">
  import type StoreMelody from "../../../system/store/props/storeMelody";
  import type StoreRef from "../../../system/store/props/storeRef";
  import LegacyMelodyNote from "../../../system/component/melody/score/Note.svelte";

  export let note!: StoreMelody.Note;
  export let index!: number;
  export let scrollLimitProps!: StoreRef.ScrollLimitProps;
  export let cursorMiddle!: number;
</script>

<LegacyMelodyNote {note} {index} {scrollLimitProps} {cursorMiddle} />
