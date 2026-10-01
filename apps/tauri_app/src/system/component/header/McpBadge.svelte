<script lang="ts">
  import { mcpStore } from "../../store/global-store";
</script>

{#if $mcpStore.status === "available"}
  <div class="badge" title="The current score is available to local MCP agents">MCP ON</div>
{/if}

<style>
  .badge {
    position: absolute;
    top: 6px;
    right: 12px;
    padding: 4px 10px;
    border-radius: 12px;
    background: #23645b;
    color: white;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.04em;
  }
</style>
