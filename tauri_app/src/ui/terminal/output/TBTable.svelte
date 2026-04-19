<script lang="ts">
  import type { TerminalTableProps } from "../../../state/session-state/terminal-store";
  import LegacyTBTable from "../../../system/component/terminal/output/TBTable.svelte";

  export let table!: TerminalTableProps | undefined;
</script>

<LegacyTBTable {table} />
