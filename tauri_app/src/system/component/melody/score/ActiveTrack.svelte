<script lang="ts">
  import MelodyState from "../../../store/state/data/melody-state";
  import RefState from "../../../store/state/ref-state";

  import { controlStore, dataStore, derivedStore, inputStore, playbackStore, refStore, settingsStore } from "../../../store/global-store";  import Note from "./Note.svelte";
  import useMelodySelector from "../../../service/melody/melody-selector";

  $: selector = useMelodySelector({ control: $controlStore, data: $dataStore });

  $: notes = selector.getCurrScoreTrack().notes;
  $: melody = $controlStore.melody;
  $: trackIndex = melody.trackIndex;

  $: scrollLimitProps = RefState.getScrollLimitProps($refStore.grid);
  $: beatWidth = $settingsStore.view.timeline.beatWidth;
  $: isPlayback = $playbackStore.timerKeys != null;
  $: input = $inputStore;
  $: focusRange = (() => {
    if (melody.focusLock === -1) return [melody.focus, melody.focus];
    return melody.focus < melody.focusLock
      ? [melody.focus, melody.focusLock]
      : [melody.focusLock, melody.focus];
  })();

  type OperationStatus =
    | "move"
    | "len"
    | "scale"
    | "range"
    | "octave"
    | "playback"
    | "focus"
    | "none";

  const getOperation = (isFocus: boolean): OperationStatus => {
    if (isPlayback) return "playback";
    if (!isFocus) return "focus";

    if (input.holdD) return "move";
    if (input.holdF && melody.focusLock === -1) return "len";
    if (input.holdC) return "scale";
    if (input.holdX) return "octave";
    if (input.holdShift || melody.focusLock !== -1) return "range";
    return "none";
  };

  const registerEffectRef = (index: number, ref: HTMLElement | null) => {
    const refs = $refStore.trackArr[trackIndex];
    const existsIndex = refs.findIndex((r) => r.seq === index);

    if (ref == null) {
      if (existsIndex !== -1) refs.splice(existsIndex, 1);
      return;
    }

    if (existsIndex === -1) {
      refs.push({ seq: index, ref });
      return;
    }

    refs[existsIndex].ref = ref;
  };

  $: cursorMiddle = (() => {
    const melody = $controlStore.melody;
    const note = melody.focus === -1 ? melody.cursor : notes[melody.focus];
    const beatSide = MelodyState.calcBeatSide(note);
    const [left, width] = [beatSide.pos, beatSide.len].map((v) => v * beatWidth);
    return left + width / 2;
  })();

  $: visibleNotes = (() => {
    if (scrollLimitProps == null) return [];

    return notes
      .map((note, index) => {
        const beatSide = MelodyState.calcBeatSide(note);
        const [left, width] = [beatSide.pos, beatSide.len].map(
          (v) => v * beatWidth
        );
        const middle = left + width / 2;
        const isDisp =
          Math.abs(scrollLimitProps.scrollMiddleX - middle) <=
            scrollLimitProps.rectWidth ||
          Math.abs(cursorMiddle - middle) <= scrollLimitProps.rectWidth;
        const base = $derivedStore.baseCaches.find((base) => {
          return (
            base.startBeatNote <= beatSide.pos &&
            beatSide.pos < base.startBeatNote + base.lengthBeatNote
          );
        });
        if (base == undefined) throw new Error();

        return {
          index,
          isCriteria: $controlStore.mode === "melody" && melody.focus === index,
          isDisp,
          isFocus:
            $controlStore.mode === "melody" &&
            focusRange[0] <= index &&
            focusRange[1] >= index,
          note,
          scoreBase: base.scoreBase,
        };
      })
      .filter((item) => item.isDisp);
  })();
</script>

{#if scrollLimitProps != null}
  {#each visibleNotes as item (item.index)}
    <Note
      note={item.note}
      index={item.index}
      {scrollLimitProps}
      {cursorMiddle}
      {beatWidth}
      {isPlayback}
      isCriteria={item.isCriteria}
      operation={getOperation(item.isFocus)}
      cursor={melody.cursor}
      scoreBase={item.scoreBase}
      {registerEffectRef}
    />
  {/each}
{/if}
