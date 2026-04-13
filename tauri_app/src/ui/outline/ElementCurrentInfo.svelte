<script lang="ts">
  import store from "../../system/store/store";
  import { getOutlineHeaderInfo } from "../../state/ui-state/outline-ui-store";

  $: headerInfo = getOutlineHeaderInfo($store);
</script>

{#if headerInfo != null}
  <div class="wrap">
    <div class="record">
      <div class="title">scale:</div>
      <div class="value">{headerInfo.scaleName}</div>
    </div>
    <div class="record">
      <div class="title">ts:</div>
      <div class="value">{headerInfo.tsName}</div>
    </div>
    <div class="record">
      <div class="title">tempo:</div>
      <div class="value">{headerInfo.tempo}</div>
    </div>
    {#if headerInfo.sectionName !== ""}
      <div class="record">
        <div class="title">section:</div>
        <div class="value">{headerInfo.sectionName}</div>
      </div>
    {/if}
  </div>
{/if}

<style>
  .wrap {
    display: inline-block;
    position: relative;
    width: 100%;
    height: var(--outline-header-height);
    background-color: rgb(55, 77, 110);
    padding: 2px 4px 2px 4px;
    box-sizing: border-box;
  }
  .record {
    display: inline-block;
    position: relative;
    margin: 2px 0 0 0;
    background-color: rgba(211, 224, 252, 0.298);
    width: 100%;
    height: 22px;
  }
  .record * {
    display: inline-block;
    font-size: 16px;
    font-weight: 600;
    line-height: 20px;
    height: 100%;
    vertical-align: top;
    padding: 0 0 0 4px;
    box-sizing: border-box;
  }
  .title {
    width: 80px;
    background-color: rgba(127, 255, 212, 0.182);
    color: rgba(255, 255, 255, 0.497);
    font-style: italic;
  }
  .value {
    width: calc(100% - 80px);
    color: rgba(255, 255, 254, 0.822);
    font-style: italic;
    overflow: hidden;
  }
</style>
