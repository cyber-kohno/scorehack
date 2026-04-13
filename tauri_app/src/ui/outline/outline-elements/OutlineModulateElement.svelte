<script lang="ts">
  import type { OutlineDataModulate } from "../../../domain/outline/outline-types";
  import LegacyOutlineModulateElement from "../../../system/component/outline/element/data/DataModulate.svelte";

  export let data!: OutlineDataModulate;
  export let elementSeq!: number;
</script>

<LegacyOutlineModulateElement {data} {elementSeq} />
