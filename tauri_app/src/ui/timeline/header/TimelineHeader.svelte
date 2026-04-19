<script lang="ts">
  import type { ScrollLimitProps } from "../../../state/session-state/scroll-limit-props";
  import TimelineChordList from "./TimelineChordList.svelte";
  import TimelineProgressInfo from "./TimelineProgressInfo.svelte";
  import TimelineBeatMeasure from "./TimelineBeatMeasure.svelte";

  export let scrollLimitProps: ScrollLimitProps;
</script>

<TimelineChordList {scrollLimitProps} />
<TimelineProgressInfo {scrollLimitProps} />
<TimelineBeatMeasure {scrollLimitProps} />


