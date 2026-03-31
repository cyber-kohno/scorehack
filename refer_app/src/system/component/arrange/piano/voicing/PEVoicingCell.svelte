<script lang="ts">
  import MusicTheory from "../../../../util/musicTheory";

  export let octaveIndex: number;
  export let structKey12: number;

  export let isSelected: boolean;
  export let isOver: boolean;
  export let isFocus: boolean;
</script>

<div class="struct-item" >
  <div class="label-inner"data-selected={isSelected} data-over={isOver}>
    {#if isFocus}
      <div class="focus"></div>
    {/if}
    {MusicTheory.getKey12FullName(structKey12 + octaveIndex * 12)}
  </div>
</div>

<style>
  .struct-item {
    display: inline-block;
    position: relative;
    border-radius: 4px;
    width: var(--ap-voicing-item-width);
    height: var(--ap-voicing-item-height);
    vertical-align: top;
    /* margin: 0 0 0 1px; */
  }
  .label-inner {
    display: inline-block;
    position: relative;
    margin: 1px 0 0 1px;
    width: calc(100% - 2px);
    height: calc(100% - 2px);
    text-align: center;
    font-size: 20px;
    line-height: 24px;
    font-weight: 500;
    color: rgba(11, 0, 160, 0.616);
    border: 1px solid #0008ff71;
    background-color: rgba(135, 222, 228, 0.516);
    box-sizing: border-box;
    border-radius: 4px;
  }
  .label-inner[data-selected="true"] {
    background-color: rgba(153, 251, 34, 0.568);
  }
  .label-inner[data-over="true"] {
    background-color: rgba(255, 65, 65, 0.726);
  }
  .focus {
    display: inline-block;
    position: absolute;
    left: 0;
    top: 0;
    z-index: 2;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 247, 158, 0.223);
  }
</style>
