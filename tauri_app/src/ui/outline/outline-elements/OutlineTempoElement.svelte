<script lang="ts">
  import type { OutlineDataTempo } from "../../../domain/outline/outline-types";
  import LegacyOutlineTempoElement from "../../../system/component/outline/element/data/DataTempo.svelte";

  export let data!: OutlineDataTempo;
  export let elementSeq!: number;
</script>

<LegacyOutlineTempoElement {data} {elementSeq} />
