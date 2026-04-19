<script lang="ts">
  import type { ScrollLimitProps } from "../../../state/session-state/scroll-limit-props";
  import BeatMeasureFrame from "../../../system/component/timeline/header/BeatMeasureFrame.svelte";

  export let scrollLimitProps: ScrollLimitProps;
</script>

<BeatMeasureFrame {scrollLimitProps} />


