<script lang="ts">
  import { confirmDialogStore } from "../../store/global-store";
  import { chooseConfirmDialogByKey } from "../../service/common/confirm-dialog-service";

  $: dialog = $confirmDialogStore;
</script>

{#if dialog != null}
  <div class="overlay">
    <div class="dialog" data-tone={dialog.tone}>
      {#if dialog.title != null && dialog.title !== ""}
        <div class="title">{dialog.title}</div>
      {/if}
      <div class="message">
        {#each dialog.messageLines as line}
          <div>{line}</div>
        {/each}
      </div>
      <div class="choices">
        {#each dialog.choices as choice}
          <button
            type="button"
            class="choice"
            data-role={choice.role ?? "neutral"}
            on:click={() => chooseConfirmDialogByKey(choice.key)}
          >
            <span class="key">{choice.key}</span>
            <span class="label">{choice.label}</span>
          </button>
        {/each}
      </div>
    </div>
  </div>
{/if}

<style>
  .overlay {
    position: fixed;
    z-index: 9000;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(0, 0, 0, 0.34);
  }

  .dialog {
    box-sizing: border-box;
    width: min(520px, calc(100vw - 32px));
    padding: 16px;
    border: solid 2px #4f7fa5;
    border-radius: 6px;
    background-color: #0d263a;
    box-shadow: 0 12px 32px #00000077;
    color: #c8f3ff;
  }

  .dialog[data-tone="danger"] {
    border-color: #c46f6f;
    background-color: #172536;
  }

  .title {
    margin-bottom: 10px;
    font-size: 18px;
    line-height: 24px;
    font-weight: 700;
  }

  .message {
    font-size: 14px;
    line-height: 21px;
  }

  .choices {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 16px;
  }

  .choice {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    min-height: 30px;
    padding: 4px 10px;
    border: solid 1px #6b9abc;
    border-radius: 5px;
    background-color: #16374f;
    color: #d8f7ff;
    font: inherit;
    font-size: 13px;
    line-height: 18px;
  }

  .choice[data-role="proceed"] {
    border-color: #77d0c4;
    background-color: #1c5b66;
    color: #e4fdff;
    font-weight: 700;
  }

  .dialog[data-tone="danger"] .choice[data-role="proceed"] {
    border-color: #e08989;
    background-color: #5a2f3e;
    color: #ffe7e7;
  }

  .choice[data-role="cancel"] {
    background-color: #20384c;
  }

  .key {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 22px;
    height: 20px;
    padding: 0 4px;
    border-radius: 4px;
    background-color: #d6f7ff;
    color: #0d263a;
    font-size: 12px;
    font-weight: 700;
  }

  .label {
    white-space: nowrap;
  }
</style>
