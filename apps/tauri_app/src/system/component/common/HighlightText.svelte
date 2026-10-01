<script lang="ts">
  export let baseText!: string;
  export let keyword!: string;
  export let color!: string;

  $: getItems = () => {
    if (keyword.length === 0) return [{ part: baseText, isMatch: false }];
    const regex = new RegExp(`(${keyword})`, "gi"); // 大文字・小文字を区別しない正規表現
    return baseText.split(regex).map((part) => {
      // キーワード部分は色を付け、その他の部分はそのまま返す
      return { part, isMatch: regex.test(part) };
    });
  };
</script>

{#each getItems() as item}
  <span style:color={item.isMatch ? color : "inherit"}>{item.part}</span>
{/each}
