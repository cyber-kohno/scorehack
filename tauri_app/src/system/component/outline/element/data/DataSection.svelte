<script lang="ts">
  import type OutlineState from "../../../../store/state/data/outline-state";

  export let data!: OutlineState.DataSection;
</script>

<div class="label">{data.name}</div>
<div class="border"></div>

<style>
  .label {
    display: inline-block;
    position: relative;
    font-size: 22px;
    font-weight: 600;
    line-height: 24px;
    color: #f00;
    text-align: center;
    width: 100%;
    margin-top: var(--section-top-margin);
    height: var(--section-label-height);
    /* background-color: #5c75b634; */
  }

  .border {
    display: inline-block;
    position: relative;
    width: 100%;
    height: var(--section-border-height);
    margin-bottom: var(--section-bottom-margin);
    background-color: red;
    border-radius: 4px;
  }
</style>
