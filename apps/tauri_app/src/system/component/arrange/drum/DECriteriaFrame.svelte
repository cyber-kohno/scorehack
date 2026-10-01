<script lang="ts">
  import createArrangeSelector from "../../../service/arrange/arrange-selector";
  import { controlStore, dataStore, refStore } from "../../../store/global-store";
  import DrumEditorState from "../../../store/state/data/arrange/drum/drum-editor-state";

  $: selector = createArrangeSelector({ control: $controlStore, data: $dataStore });
  $: arrange = selector.getArrange();
  $: editor = selector.getDrumEditor();
  $: criteriaDiv = DrumEditorState.getEffectiveCriteriaDiv(
    editor.criteriaDiv,
    arrange.target.beat,
    arrange.target.scoreBase.rhythm.ts,
  );
  $: label = DrumEditorState.getCriteriaDivLabel(
    criteriaDiv,
    arrange.target.scoreBase.rhythm.ts,
  );
</script>

<div class="frame" bind:this={$refStore.arrange.drum.criteria}>
  <div class="label">Criteria</div>
  <div class="value">{label}</div>
</div>

<style>
  .frame {
    display: inline-block;
    position: relative;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    padding: 8px;
    background-color: rgba(255, 255, 255, 0.46);
    color: #234250;
    font-weight: 700;
  }

  .label {
    display: block;
    position: relative;
    color: rgba(35, 66, 80, 0.72);
    font-size: 12px;
    line-height: 16px;
  }

  .value {
    display: block;
    position: relative;
    margin-top: 4px;
    font-size: 18px;
    line-height: 24px;
  }
</style>
