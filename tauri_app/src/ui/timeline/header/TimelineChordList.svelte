<script lang="ts">
  import type StoreRef from "../../../system/store/props/storeRef";
  import ChordListFrame from "../../../system/component/timeline/header/ChordListFrame.svelte";

  export let scrollLimitProps: StoreRef.ScrollLimitProps;
</script>

<ChordListFrame {scrollLimitProps} />
