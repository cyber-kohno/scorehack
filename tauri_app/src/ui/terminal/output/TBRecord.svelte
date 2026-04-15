<script lang="ts">
  import type StoreTerminal from "../../../system/store/props/storeTerminal";
  import LegacyTBRecord from "../../../system/component/terminal/output/TBRecord.svelte";

  export let record!: StoreTerminal.RecordProps | undefined;
</script>

<LegacyTBRecord {record} />
