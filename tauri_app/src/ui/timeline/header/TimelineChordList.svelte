<script lang="ts">
  import type { ScrollLimitProps } from "../../../state/session-state/scroll-limit-props";
  import ChordListFrame from "../../../system/component/timeline/header/ChordListFrame.svelte";

  export let scrollLimitProps: ScrollLimitProps;
</script>

<ChordListFrame {scrollLimitProps} />


