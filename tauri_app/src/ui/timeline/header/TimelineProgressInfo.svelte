<script lang="ts">
  import type { ScrollLimitProps } from "../../../state/session-state/scroll-limit-props";
  import ProgressInfo from "../../../system/component/timeline/header/ProgressInfo.svelte";

  export let scrollLimitProps: ScrollLimitProps;
</script>

<ProgressInfo {scrollLimitProps} />


