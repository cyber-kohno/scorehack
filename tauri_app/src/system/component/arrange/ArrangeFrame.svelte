<script lang="ts">
  import useReducerOutline from "../../store/reducer/reducerOutline";
  import store from "../../store/store";
  import ArrangePianoEditor from "./piano/ArrangePianoEditor.svelte";
  import ArrangeStatusBar from "./status/ArrangeStatusBar.svelte";

  $: reducerOutline = useReducerOutline($store);

  $: track = reducerOutline.getCurrHarmonizeTrack();
</script>

<div class="frame">
  <div class="wrap">
    <ArrangeStatusBar />
    <div class="maindiv">
      {#if track.method === "piano"}
        <ArrangePianoEditor />
      {:else if track.method === "guitar"}{/if}
    </div>
  </div>
</div>

<style>
  .frame {
    display: inline-block;
    position: absolute;
    z-index: 5;
    top: var(--arrange-frame-y);
    left: var(--arrange-frame-x);
    /* width: 700px;
    height: 700px; */
    /* background-color: #003650; */
    background-color: #cfcfd3;
    /* border: 2px solid #fb0000; */
    box-sizing: border-box;
    /* opacity: 0.99; */
    box-shadow: 10px 10px 15px -10px;
    /* border-radius: 4px; */
    padding: 4px;
  }

  .wrap {
    display: inline-block;
    position: relative;
    background-color: rgba(240, 248, 255, 0.101);
    overflow: hidden;

    /* min-height: 500px; */

    * {
      vertical-align: top;
    }
  }
  .maindiv {
    display: inline-block;
    position: relative;
    height: 100%;
    /* background-color: rgba(240, 248, 255, 0.101); */
  }
</style>
