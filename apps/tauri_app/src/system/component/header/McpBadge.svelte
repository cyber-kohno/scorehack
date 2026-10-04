<script lang="ts">
  import { getMcpDisplayId } from "../../service/mcp/mcp-session-id";
  import { mcpStore } from "../../store/global-store";

  let copyFeedback: { sessionId: string; message: string } | null = null;

  $: sessionId = $mcpStore.details?.sessionId ?? null;
  $: feedback = copyFeedback?.sessionId === sessionId ? copyFeedback?.message ?? "" : "";

  const copySessionId = async () => {
    if (sessionId === null) return;
    const id = sessionId;
    try {
      await navigator.clipboard.writeText(id);
      copyFeedback = { sessionId: id, message: "Session ID copied." };
    } catch {
      copyFeedback = { sessionId: id, message: "Could not copy. Use mcp status to get the session ID." };
    }
  };
</script>

{#if $mcpStore.status === "available" && sessionId !== null}
  <button
    type="button"
    class="badge"
    title={`${feedback ? `${feedback}\n` : ""}Session ID: ${sessionId}\nClick to copy the full session ID for your agent.`}
    aria-label={`MCP session ${getMcpDisplayId(sessionId)} is available. Copy the full session ID.`}
    on:click={copySessionId}
  >MCP <span class="session-id">{getMcpDisplayId(sessionId)}</span></button>
  <span class="copy-feedback" role="status">{feedback}</span>
{/if}

<style>
  .badge {
    position: absolute;
    top: 6px;
    right: 12px;
    padding: 4px 10px;
    border: none;
    border-radius: 12px;
    background: #d2e3e4;
    color: #16445c;
    font-family: inherit;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.04em;
    cursor: pointer;
  }

  .session-id {
    color: #637b79;
  }

  .badge:focus-visible {
    outline: 2px solid #16445c;
    outline-offset: 2px;
  }

  .copy-feedback {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
</style>
