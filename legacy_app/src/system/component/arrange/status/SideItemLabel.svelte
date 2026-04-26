<script lang="ts">
  export let label: string;
  export let type: undefined | "control" | "switch" = undefined;
  export let active: boolean = false;

  export let margin: undefined | "connect" | "next" = undefined;
</script>

<div class="wrap" data-type={type} data-active={active} data-margin={margin}>
  {label}
</div>

<style>
  .wrap {
    display: inline-block;
    position: relative;
    width: 100%;
    height: 30px;

    font-size: 20px;
    line-height: 26px;
    font-weight: 600;
    background-color: rgb(189, 189, 189);
    color: white;
    text-align: center;
    border-radius: 4px;
    border: 1px solid white;
    box-sizing: border-box;
  }

  .wrap[data-type="control"] {
    background-color: rgb(161, 171, 190);
  }
  .wrap[data-type="control"][data-active="true"] {
    background-color: rgb(99, 127, 176);
  }
  .wrap[data-margin="connect"] {
    margin: 2px 0 0 0;
  }
  .wrap[data-margin="next"] {
    margin: 20px 0 0 0;
  }
</style>
