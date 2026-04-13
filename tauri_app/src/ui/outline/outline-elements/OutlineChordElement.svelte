<script lang="ts">
  import type { OutlineDataChord } from "../../../domain/outline/outline-types";
  import LegacyOutlineChordElement from "../../../system/component/outline/element/data/DataChord.svelte";

  export let data!: OutlineDataChord;
  export let elementSeq!: number;
</script>

<LegacyOutlineChordElement {data} {elementSeq} />
