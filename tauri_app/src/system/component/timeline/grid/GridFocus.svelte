<script lang="ts">
    import useDerivedSelector from "../../../service/derived/derived-selector";
    import { controlStore, derivedStore } from "../../../store/global-store";

  $: derivedSelector = useDerivedSelector($derivedStore, $controlStore);

  $: values = derivedSelector.getFocusInfo();
</script>

<div
  class="wrap"
  style:left="{values.left}px"
  style:width="{values.width}px"
  data-isChord={values.isChord}
></div>

<style>
  .wrap {
    display: inline-block;
    position: absolute;
    top: var(--pitch-top-margin);
    height: var(--pitch-frame-height);
    z-index: 1;
    background-color: rgba(177, 169, 0, 0.169);
  }
  .wrap[data-isChord="false"] {
    background-color: #d90000;
  }
</style>
