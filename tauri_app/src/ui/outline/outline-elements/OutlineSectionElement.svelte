<script lang="ts">
  import type { OutlineDataSection } from "../../../domain/outline/outline-types";

  export let data!: OutlineDataSection;
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