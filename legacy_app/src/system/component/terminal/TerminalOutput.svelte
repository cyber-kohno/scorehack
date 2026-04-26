<script lang="ts">
  import type StoreTerminal from "../../store/props/storeTerminal";
  import TBRecord from "./output/TBRecord.svelte";
  import TBTable from "./output/TBTable.svelte";

  export let output!: StoreTerminal.OutputBlock;

  const convHtmlText = (str: string) => str.replace(/ /g, "\u00A0");
</script>

{#if output.type === "record"}
  <TBRecord record={output.record} />
{:else if output.type === "table"}
  <TBTable table={output.table} />
{/if}
