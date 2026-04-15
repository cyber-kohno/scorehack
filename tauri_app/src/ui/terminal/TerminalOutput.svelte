<script lang="ts">
  import type StoreTerminal from "../../system/store/props/storeTerminal";
  import TBRecord from "./output/TBRecord.svelte";
  import TBTable from "./output/TBTable.svelte";

  export let output!: StoreTerminal.OutputBlock;
</script>

{#if output.type === "record"}
  <TBRecord record={output.record} />
{:else if output.type === "table"}
  <TBTable table={output.table} />
{/if}
