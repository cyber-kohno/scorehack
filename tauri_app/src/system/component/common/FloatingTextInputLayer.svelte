<script lang="ts">
  import { floatingTextInputStore } from "../../store/global-store";

  $: textInput = $floatingTextInputStore;
  $: before = textInput == null ? "" : textInput.value.slice(0, textInput.cursor);
  $: after = textInput == null ? "" : textInput.value.slice(textInput.cursor);
</script>

{#if textInput != null}
  <div
    class="frame"
    style:left="{textInput.left}px"
    style:top="{textInput.top}px"
    style:min-width="{textInput.width}px"
  >
    <span>{before}</span><span class="cursor"></span><span>{after}</span>
  </div>
{/if}

<style>
  .frame {
    display: inline-block;
    position: absolute;
    z-index: 20;
    min-height: 24px;
    padding: 3px 6px;
    border: solid 1px #ffffffa8;
    border-radius: 3px;
    box-sizing: border-box;
    background-color: #000;
    color: #fff;
    font-family: Consolas, monospace;
    font-size: 14px;
    font-weight: 600;
    line-height: 18px;
    white-space: pre;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.55);
  }

  .cursor {
    display: inline-block;
    width: 1px;
    height: 16px;
    margin: 0 1px;
    background-color: #fff;
    vertical-align: -3px;
  }
</style>
