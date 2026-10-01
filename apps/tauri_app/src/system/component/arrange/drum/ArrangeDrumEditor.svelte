<script lang="ts">
  import createArrangeSelector from "../../../service/arrange/arrange-selector";
  import { controlStore, dataStore } from "../../../store/global-store";
  import BackingMeasureFrame from "../common/BackingMeasureFrame.svelte";
  import ChordInfoHeader from "../ChordInfoHeader.svelte";
  import FocusableContent from "../FocusableContent.svelte";
  import DEColFrame from "./DEColFrame.svelte";
  import DECriteriaFrame from "./DECriteriaFrame.svelte";
  import DEPatternFrame from "./DEPatternFrame.svelte";
  import DERecordFrame from "./DERecordFrame.svelte";

  $: selector = createArrangeSelector({ control: $controlStore, data: $dataStore });
  $: arrange = selector.getArrange();
  $: target = arrange.target;
  $: editor = selector.getDrumEditor();
</script>

<div class="wrap">
  <ChordInfoHeader />
  <div class="body">
    <div class="criteria">
      <FocusableContent isFocus={editor.control === "criteria"}>
        <DECriteriaFrame />
      </FocusableContent>
    </div>
    <div class="col">
      <div class="col-frame">
        <FocusableContent isFocus={editor.control === "col"}>
          <DEColFrame />
        </FocusableContent>
      </div>
      <BackingMeasureFrame ts={target.scoreBase.rhythm.ts} beat={target.beat} />
    </div>
    <div class="record">
      <FocusableContent isFocus={editor.control === "record"}>
        <DERecordFrame />
      </FocusableContent>
    </div>
    <div class="pattern">
      <FocusableContent isFocus={editor.control === "hits"}>
        <DEPatternFrame />
      </FocusableContent>
    </div>
  </div>
</div>

<style>
  .wrap {
    display: inline-block;
    position: relative;
    width: 700px;
    height: 360px;
    background-color: #b8d8df;
  }

  .body {
    display: grid;
    position: relative;
    width: 100%;
    height: calc(100% - 33px);
    box-sizing: border-box;
    padding: 4px;
    grid-template-columns: 128px 1fr;
    grid-template-rows: calc(var(--ap-backing-header-height) + 8px) 1fr;
  }

  .criteria,
  .col,
  .record,
  .pattern {
    position: relative;
    box-sizing: border-box;
  }

  .criteria {
    grid-column: 1;
    grid-row: 1;
  }

  .col {
    grid-column: 2;
    grid-row: 1;
  }

  .col-frame {
    position: relative;
    width: 100%;
  }

  .record {
    grid-column: 1;
    grid-row: 2;
  }

  .pattern {
    grid-column: 2;
    grid-row: 2;
  }

  .criteria > :global(.wrap),
  .record > :global(.wrap),
  .pattern > :global(.wrap),
  .col-frame > :global(.wrap) {
    width: 100%;
    height: 100%;
  }
</style>
