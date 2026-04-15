<script lang="ts">
  import type StoreRef from "../../../system/store/props/storeRef";
  import BeatMeasureFrame from "../../../system/component/timeline/header/BeatMeasureFrame.svelte";

  export let scrollLimitProps: StoreRef.ScrollLimitProps;
</script>

<BeatMeasureFrame {scrollLimitProps} />
