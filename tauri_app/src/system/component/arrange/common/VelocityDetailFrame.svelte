<script lang="ts">
  export let velocity: number;
  export let left = 0;
  export let top = 0;

  $: velocityWidth = `${Math.floor(velocity * 5)}%`;
</script>

<div class="wrap" style:left={`${left}px`} style:top={`${top}px`}>
  <div class="label">velocity</div>
  <div class="record">
    <div class="vel-frame">
      <div class="vel-value" style:width={velocityWidth}></div>
    </div>
  </div>
</div>

<style>
  .wrap {
    display: inline-block;
    position: fixed;
    width: 200px;
    height: 40px;
    background-color: rgba(216, 223, 223, 0.897);
    border: 1px solid #494949;
    border-radius: 4px;
    z-index: 20;
    white-space: normal;
  }

  .label {
    display: block;
    position: relative;
    width: 100%;
    height: 20px;
    box-sizing: border-box;
    padding: 0 0 0 2px;
    color: rgb(175, 0, 0);
    font-size: 14px;
    font-weight: 600;
    line-height: 22px;
  }

  .record {
    display: block;
    position: relative;
    width: 100%;
    height: 20px;
  }

  .vel-frame {
    display: block;
    position: relative;
    margin: 3px 0 0 6px;
    width: calc(100% - 12px);
    height: 14px;
    box-sizing: border-box;
    border: 1px solid #000;
    background-color: rgba(231, 231, 231, 0.897);
  }

  .vel-value {
    display: block;
    height: 100%;
    background-color: rgba(103, 181, 218, 0.897);
  }
</style>
