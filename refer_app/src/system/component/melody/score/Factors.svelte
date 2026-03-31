<script lang="ts">
  import StoreMelody from "../../../store/props/storeMelody";
  import store from "../../../store/store";

  type Type = "4div" | "8div" | "16div" | "4div3t" | "8div3t";

  export let note: StoreMelody.Note;

  $: norms = (() => {
    const norms: StoreMelody.Norm[] = [];
    const n = note;
    let pos = n.pos;
    const tail = n.pos + n.len;

    let cnt = 0;
    while (true) {
      if (cnt > 50) throw new Error("cntが50を超えた。");
      if (n.norm.div === 1) {
        if (!n.norm.tuplets) {
          norms.push({ div: 1 });
          pos++;
        } else {
          if (pos % 3 === 0 && pos + 3 <= tail) {
            norms.push({ div: 1 });
            pos += 3;
          } else {
            norms.push({ div: 1, tuplets: 3 });
            pos++;
          }
        }
      } else if (n.norm.div === 2) {
        if (!n.norm.tuplets) {
          if (pos % 2 === 0 && pos + 2 <= tail) {
            norms.push({ div: 1 });
            pos += 2;
          } else {
            norms.push({ div: 2 });
            pos++;
          }
        } else {
          if (pos % 3 === 0 && pos + 3 <= tail) {
            norms.push({ div: 2 });
            pos += 3;
          } else {
            norms.push({ div: 2, tuplets: 3 });
            pos++;
          }
        }
      } else if (n.norm.div === 4) {
        if (pos % 4 === 0 && pos + 4 <= tail) {
          norms.push({ div: 1 });
          pos += 4;
        } else if (pos % 2 === 0 && pos + 2 <= tail) {
          norms.push({ div: 2 });
          pos += 2;
        } else {
          norms.push({ div: 4 });
          pos++;
        }
      }
      if (pos === tail) break;

      cnt++;
    }
    return norms;
  })();

  const buildType = (norm: StoreMelody.Norm) =>
    `${norm.div * 4}div${!norm.tuplets ? "" : norm.tuplets + "t"}` as Type;
</script>

{#each norms as norm}
  <div
    class="item"
    data-type={buildType(norm)}
    style:width="{$store.env.beatWidth / norm.div / (norm.tuplets ?? 1)}px"
  ></div>
{/each}

<style>
  .item {
    display: inline-block;
    position: relative;
    vertical-align: top;
    border-radius: 4px;
    background-color: #7d7d7d85;
    border: solid 1px #000000d2;
    box-sizing: border-box;
  }

  .item[data-type="4div"] {
    margin-top: calc(var(--factor-center) - 6px);
    height: 12px;
    border-radius: 6px;
  }
  .item[data-type="4div3t"] {
    margin-top: calc(var(--factor-center) - 6px);
    height: 12px;
    border-radius: 6px;
    background-color: #f3717185;
    border: solid 1px #ba6c6cd2;
  }
  .item[data-type="8div"] {
    margin-top: calc(var(--factor-center) - 5px);
    height: 10px;
    border-radius: 5px;
    background-color: #81949385;
    border: solid 1px #364040d2;
  }
  .item[data-type="8divt3"] {
    margin-top: calc(var(--factor-center) - 5px);
    height: 10px;
    border-radius: 5px;
    background-color: #f3717185;
    border: solid 1px #ba6c6cd2;
  }
  .item[data-type="16div"] {
    margin-top: calc(var(--factor-center) - 4px);
    height: 8px;
    border-radius: 4px;
    background-color: #6fa6a885;
    border: solid 1px #6fb5b1d2;
  }
</style>
