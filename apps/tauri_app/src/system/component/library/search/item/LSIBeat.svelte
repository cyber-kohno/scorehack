<script lang="ts">
  import LSItemFrame from "./common/LSItemFrame.svelte";

  const beats = [1, 2, 3, 4];

  export let isFocus = false;
  export let beat!: number;
</script>

<LSItemFrame title="Beat" {isFocus}>
  <div class="tips">
    {#each beats as item}
      <div class="beattip" class:active={beat >= item}></div>
    {/each}
  </div>
</LSItemFrame>

<style>
  .tips {
    display: inline-block;
    position: relative;
    width: 100%;
    height: 24px;
    line-height: 0;
    text-align: left;
  }

  .beattip {
    display: inline-block;
    position: relative;
    width: 20px;
    height: 20px;
    margin: 2px 2px 0 2px;
    border: 1px solid #0000005d;
    border-radius: 2px;
    box-sizing: border-box;
    background-color: rgba(206, 193, 203, 0.22);
  }

  .beattip.active {
    background-color: #cec1cbbc;
  }
</style>
