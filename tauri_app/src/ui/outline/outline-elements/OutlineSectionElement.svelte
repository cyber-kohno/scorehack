<script lang="ts">
  import type { OutlineDataSection } from "../../../domain/outline/outline-types";
  import LegacyOutlineSectionElement from "../../../system/component/outline/element/data/DataSection.svelte";

  export let data!: OutlineDataSection;
</script>

<LegacyOutlineSectionElement {data} />
