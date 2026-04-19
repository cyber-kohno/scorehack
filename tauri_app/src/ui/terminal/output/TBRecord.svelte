<script lang="ts">
  import type { TerminalRecordProps } from "../../../state/session-state/terminal-store";
  import LegacyTBRecord from "../../../system/component/terminal/output/TBRecord.svelte";

  export let record!: TerminalRecordProps | undefined;
</script>

<LegacyTBRecord {record} />
