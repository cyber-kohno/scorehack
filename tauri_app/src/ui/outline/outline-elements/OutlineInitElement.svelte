<script lang="ts">
  import type { OutlineDataInit } from "../../../domain/outline/outline-types";
  import LegacyOutlineInitElement from "../../../system/component/outline/element/data/DataInit.svelte";

  export let data!: OutlineDataInit;
</script>

<LegacyOutlineInitElement {data} />
