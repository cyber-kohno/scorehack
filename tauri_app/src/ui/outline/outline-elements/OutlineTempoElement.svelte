<script lang="ts">
  import type { OutlineDataTempo } from "../../../domain/outline/outline-types";

  export let data!: OutlineDataTempo;
  export let elementSeq!: number;

  $: void data;
  $: void elementSeq;
</script>