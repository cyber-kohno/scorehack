<script lang="ts">
  import type StoreTerminal from "../../../system/store/props/storeTerminal";
  import LegacyTBTable from "../../../system/component/terminal/output/TBTable.svelte";

  export let table!: StoreTerminal.TableProps | undefined;
</script>

<LegacyTBTable {table} />
