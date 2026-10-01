<script lang="ts">
  export let name!: string;
  export let isActive!: boolean;
</script>

<div class="wrap" data-isActive={isActive}>{name}</div>

<style>
  .wrap {
    display: inline-block;
    position: relative;
    width: 200px;
    margin: 2px 0 0 2px;
    height: calc(100% - 4px);
    border-radius: 2px;
    box-sizing: border-box;
    color: white;
    font-size: 22px;
    font-weight: 600;
    text-align: center;
    border: 1px solid #fff;
    background-color: #aadcdd;
  }

  .wrap[data-isActive="true"] {
    background-color: #58cfc1;
  }
</style>
