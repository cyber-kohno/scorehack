<script lang="ts">
  import type { TerminalOutputBlock } from "../../../state/session-state/terminal-store";
  import TBRecord from "./output/TBRecord.svelte";
  import TBTable from "./output/TBTable.svelte";

  export let output!: TerminalOutputBlock;

  const convHtmlText = (str: string) => str.replace(/ /g, "\u00A0");
</script>

{#if output.type === "record"}
  <TBRecord record={output.record} />
{:else if output.type === "table"}
  <TBTable table={output.table} />
{/if}
