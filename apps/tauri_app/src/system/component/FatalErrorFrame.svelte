<script lang="ts">
  import type AppErrorState from "../store/state/app-error-state";
  import AppErrorStateUtil from "../store/state/app-error-state";

  export let error!: AppErrorState.Value;

  $: detail = AppErrorStateUtil.format(error);

  const reload = () => {
    window.location.reload();
  };

  const copyDetail = () => {
    void navigator.clipboard?.writeText(detail);
  };
</script>

<div class="wrap">
  <section class="panel">
    <div class="label">Application Error</div>
    <h1>The app stopped after an unexpected error.</h1>
    <p>
      Continuing after an exception can leave editor state inconsistent, so the normal UI has been suspended.
    </p>

    <div class="meta">
      <div>
        <span>Source</span>
        <strong>{error.source}</strong>
      </div>
      <div>
        <span>Time</span>
        <strong>{error.occurredAt}</strong>
      </div>
    </div>

    <pre>{detail}</pre>

    <div class="actions">
      <button type="button" on:click={reload}>Reload</button>
      <button type="button" on:click={copyDetail}>Copy Detail</button>
    </div>
  </section>
</div>

<style>
  .wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    min-height: 100vh;
    padding: 24px;
    box-sizing: border-box;
    background: #15191d;
    color: #e7f1f4;
  }

  .panel {
    width: min(900px, 100%);
    max-height: calc(100vh - 48px);
    padding: 24px;
    box-sizing: border-box;
    border: 1px solid #804b4b;
    border-radius: 6px;
    background: #241b1f;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.42);
    overflow: hidden;
  }

  .label {
    color: #ffb1b1;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0;
    text-transform: uppercase;
  }

  h1 {
    margin: 8px 0 8px;
    font-size: 24px;
    line-height: 1.25;
  }

  p {
    margin: 0 0 18px;
    color: #c8d4d7;
    font-size: 14px;
    line-height: 1.55;
  }

  .meta {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin: 0 0 12px;
  }

  .meta div {
    padding: 10px;
    border: 1px solid #5a3b43;
    border-radius: 4px;
    background: #1a2024;
  }

  .meta span {
    display: block;
    color: #91a3aa;
    font-size: 12px;
  }

  .meta strong {
    display: block;
    margin-top: 4px;
    color: #f5fbfd;
    font-size: 13px;
    font-weight: 600;
    overflow-wrap: anywhere;
  }

  pre {
    max-height: 42vh;
    margin: 0;
    padding: 12px;
    box-sizing: border-box;
    border: 1px solid #47565c;
    border-radius: 4px;
    background: #0e1114;
    color: #d9e7ea;
    font-size: 12px;
    line-height: 1.45;
    white-space: pre-wrap;
    overflow: auto;
  }

  .actions {
    display: flex;
    gap: 8px;
    margin-top: 16px;
  }

  button {
    height: 34px;
    padding: 0 14px;
    border: 1px solid #79a9b6;
    border-radius: 4px;
    background: #16313a;
    color: #dff8ff;
    font: inherit;
    font-size: 13px;
  }

  button:hover {
    background: #214b58;
  }
</style>
