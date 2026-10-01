<script lang="ts">
  import ElementCurrentInfo from "./ElementCurrentInfo.svelte";
  import ElementListFrame from "./ElementListFrame.svelte";
</script>

<div class="wrap">
  <ElementCurrentInfo />
  <ElementListFrame />
</div>

<style>
  .wrap {
    display: inline-block;
    position: relative;
    width: var(--outline-width);
    height: 100%;
    background-color: #82cce9;
    vertical-align: top;
  }
</style>
