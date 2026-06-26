<script lang="ts">
  import createArrangeSelector from "../../../service/arrange/arrange-selector";
  import { controlStore, dataStore } from "../../../store/global-store";

  $: selector = createArrangeSelector({
    control: $controlStore,
    data: $dataStore,
  });
  $: editor = selector.getDrumEditor();

  $: isFocus = (index: number) => {
    return (
      index === editor.cursorY &&
      editor.control === "record" &&
      editor.phase === "edit"
    );
  };
</script>

<div class="frame">
  {#each Array.from({ length: editor.records.length }, (_, i) => editor.records.length - 1 - i) as index}
    <div class="record">
      <div class="inner"></div>
      {#if isFocus(index)}
        <div class="focus"></div>
      {/if}
    </div>
  {/each}
</div>

<style>
  .frame {
    display: inline-block;
    position: relative;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    background-color: rgba(255, 255, 255, 0.38);
    color: #234250;
    font-size: 14px;
    font-weight: 700;
    * {
      vertical-align: top;
    }
  }

  .record {
    display: inline-block;
    position: relative;
    margin: 1px 0 0 0;
    width: 100%;
    height: var(--ap-backing-record-height);
    padding: 0;
    background-color: rgb(204, 228, 228);
  }

  .inner {
    display: inline-block;
    position: relative;
    margin: 1px;
    background-color: rgba(209, 209, 209, 0.411);
    border-radius: 2px;
    border: 1px solid rgb(48, 48, 48);
    box-sizing: border-box;
    width: calc(100% - 2px);
    height: calc(100% - 2px);
  }

  .focus {
    display: inline-block;
    position: absolute;
    left: 0;
    top: 0;
    z-index: 2;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 237, 134, 0.473);
  }
</style>
