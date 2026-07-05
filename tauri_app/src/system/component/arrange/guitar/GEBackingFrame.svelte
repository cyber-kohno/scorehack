<script lang="ts">
  import createArrangeSelector from "../../../service/arrange/arrange-selector";
  import { controlStore, dataStore, refStore } from "../../../store/global-store";
  import FocusableContent from "../FocusableContent.svelte";
  import GEColFrame from "./GEColFrame.svelte";
  import GEMeasureFrame from "./GEMeasureFrame.svelte";
  import GEPatternFrame from "./GEPatternFrame.svelte";
  import GERecordFrame from "./GERecordFrame.svelte";

  $: selector = createArrangeSelector({ control: $controlStore, data: $dataStore });
  $: editor = selector.getGuitarEditor();
</script>

<div class="wrap">
  <div class="left">
    <div class="headerdiv"></div>
    <div class="recorddiv">
      <FocusableContent isFocus={false}>
        <GERecordFrame />
      </FocusableContent>
    </div>
  </div>
  <div class="right">
    <div class="headerdiv">
      <FocusableContent isFocus={editor.control === "col"}>
        <GEColFrame />
      </FocusableContent>
      <GEMeasureFrame />
    </div>
    <div class="recorddiv">
      <FocusableContent isFocus={editor.control === "pattern"}>
        <GEPatternFrame />
      </FocusableContent>
    </div>
  </div>
</div>

<style>
  .wrap {
    display: inline-block;
    position: relative;
    width: 100%;
    max-width: 100%;
    height: calc(100% - 300px);
    min-height: 170px;
    box-sizing: border-box;
    overflow: hidden;
    * {
      vertical-align: top;
    }
  }

  .left {
    display: inline-block;
    position: relative;
    width: var(--ap-backing-record-width);
    height: 100%;
    overflow: hidden;
  }

  .right {
    display: inline-block;
    position: relative;
    width: calc(100% - var(--ap-backing-record-width));
    height: 100%;
    overflow: hidden;
  }

  .headerdiv {
    display: inline-block;
    position: relative;
    width: 100%;
    height: calc(var(--ap-backing-header-height) + 8px);
    overflow: hidden;
  }

  .recorddiv {
    display: inline-block;
    position: relative;
    width: 100%;
    height: calc((var(--ap-backing-record-height) + 1px) * 6 + 1px + 8px);
    overflow: hidden;
  }

  .recorddiv > :global(.wrap) {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
</style>
