<script lang="ts">
  import type StoreMelody from "../../../domain/melody/melody-store";
  import type { ScrollLimitProps } from "../../../state/session-state/scroll-limit-props";
  import LegacyMelodyNote from "../../../system/component/melody/score/Note.svelte";

  export let note!: StoreMelody.Note;
  export let index!: number;
  export let scrollLimitProps!: ScrollLimitProps;
  export let cursorMiddle!: number;
</script>

<LegacyMelodyNote {note} {index} {scrollLimitProps} {cursorMiddle} />


