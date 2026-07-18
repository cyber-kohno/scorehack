<script lang="ts">
  export let isFocus: boolean;
</script>

<div class="wrap" data-focus={isFocus}>
  <div class="focus-frame"></div>
  {#if !isFocus}
    <div class="blind"></div>
  {/if}
  <slot />
</div>

<style>
  .wrap {
    display: block;
    position: relative;
    box-sizing: border-box;
    padding: 4px;
  }
  .focus-frame {
    display: inline-block;
    position: absolute;
    z-index: 2;
    inset: 0;
    border: 4px solid rgba(255, 255, 255, 0.463);
    box-sizing: border-box;
    pointer-events: none;
  }
  .blind {
    display: inline-block;
    position: absolute;
    z-index: 1;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 12, 83, 0.299);
  }
  .wrap[data-focus="true"] .focus-frame {
    border-color: rgb(255, 0, 0);
  }
</style>
