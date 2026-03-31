<script lang="ts">
  import ContextUtil from "../../../../store/contextUtil";

  $: bp = ContextUtil.get("backingProps");
  $: backing = $bp.backing;
  $: isActive = (i: number) => {
    return backing.layerIndex === i;
  };
</script>

<div class="wrap">
  <div class="item" data-active={isActive(0)}>layer1</div>
  <div class="item" data-active={isActive(1)}>layer2</div>
</div>

<style>
  .wrap {
    display: inline-block;
    position: relative;
    width: 100%;
    height: 100%;
    /* background-color: rgb(161, 175, 171); */
    padding: 3px 0 0 0;
    box-sizing: border-box;
  }
  .item {
    display: inline-block;
    position: relative;
    width: calc(100% - 2px);
    height: 24px;
    border: 1px solid #fdfdfd;
    border-radius: 12px;
    color: rgb(255, 255, 255);
    margin: 2px 0 0 1px;
    box-sizing: border-box;
    font-size: 14px;
    font-weight: 600;
    text-align: center;
    opacity: 0.5;
  }
  .item[data-active="true"] {
    opacity: 1;
    background-color: rgb(28, 81, 109);
  }
</style>
