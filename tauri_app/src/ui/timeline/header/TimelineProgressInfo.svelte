<script lang="ts">
  import type StoreRef from "../../../system/store/props/storeRef";
  import ProgressInfo from "../../../system/component/timeline/header/ProgressInfo.svelte";

  export let scrollLimitProps: StoreRef.ScrollLimitProps;
</script>

<ProgressInfo {scrollLimitProps} />
