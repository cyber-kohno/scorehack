<script lang="ts">
  export let bgColor!: string;
  export let isDisplay!: boolean;

</script>

{#if isDisplay}
  <div class="wrap" style:background-color={bgColor}></div>
{/if}

<style>
  .wrap {
    display: inline-block;
    position: absolute;
    left: 0;
    top: 0;
    z-index: 1;
    width: 100%;
    height: 100%;
    /* background-color: aqua; */
  }
</style>
