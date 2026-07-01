<script lang="ts">
  export let isRegular: boolean;
</script>

{#if isRegular}
  <div class="mark">
    <div class="inner"></div>
  </div>
{/if}

<style>
  .mark {
    display: inline-block;
    position: absolute;
    right: 5px;
    top: 5px;
    width: 22px;
    height: 22px;
    border: 3px solid rgb(255, 255, 255);
    box-sizing: border-box;
    border-radius: 22px;
    z-index: 3;
    opacity: 0.62;
  }

  .inner {
    display: inline-block;
    position: absolute;
    left: 2px;
    top: 2px;
    width: 12px;
    height: 12px;
    border: 3px solid rgb(255, 255, 255);
    box-sizing: border-box;
    border-radius: 12px;
  }
</style>
