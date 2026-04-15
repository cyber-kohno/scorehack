<script lang="ts">
  import type StoreRef from "../../../system/store/props/storeRef";
  import TimelineChordList from "./TimelineChordList.svelte";
  import TimelineProgressInfo from "./TimelineProgressInfo.svelte";
  import TimelineBeatMeasure from "./TimelineBeatMeasure.svelte";

  export let scrollLimitProps: StoreRef.ScrollLimitProps;
</script>

<TimelineChordList {scrollLimitProps} />
<TimelineProgressInfo {scrollLimitProps} />
<TimelineBeatMeasure {scrollLimitProps} />
