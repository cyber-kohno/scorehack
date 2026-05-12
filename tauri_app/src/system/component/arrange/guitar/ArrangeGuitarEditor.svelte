<script lang="ts">
  import ChordInfoHeader from "../ChordInfoHeader.svelte";
  import FocusableContent from "../FocusableContent.svelte";
  import createArrangeSelector from "../../../service/arrange/arrange-selector";
  import GuitarEditorState from "../../../store/state/data/arrange/guitar/guitar-editor-state";
  import { controlStore, dataStore } from "../../../store/global-store";

  const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

  $: selector = createArrangeSelector({ control: $controlStore, data: $dataStore });
  $: arrange = selector.getArrange();
  $: editor = selector.getGuitarEditor();
  $: pitchClasses = arrange.target.compiledChord.structs.map((s) => ((s.key12 % 12) + 12) % 12);
  $: frets = Array.from({ length: GuitarEditorState.MAX_FRET + 1 }, (_, fret) => fret);

  const getMidi = (stringIndex: number, fret: number) => {
    return GuitarEditorState.STANDARD_TUNING[stringIndex].openMidi + fret;
  };

  const getNoteName = (midi: number) => {
    const pitchClass = ((midi % 12) + 12) % 12;
    const octave = Math.floor(midi / 12) - 1;
    return `${NOTE_NAMES[pitchClass]}${octave}`;
  };

  const isChordTone = (midi: number) => {
    return pitchClasses.includes(((midi % 12) + 12) % 12);
  };
</script>

<div class="wrap">
  <ChordInfoHeader />
  <FocusableContent isFocus={true}>
    <div class="fretboard">
      <div class="row header">
        <div class="string-label">String</div>
        <div class="mute-cell">Mute</div>
        {#each frets as fret}
          <div class="fret-header">{fret}F</div>
        {/each}
      </div>

      {#each GuitarEditorState.STANDARD_TUNING as string, stringIndex}
        <div class="row">
          <div class="string-label">
            <strong>{string.number}</strong>
            <span>{string.openNote}</span>
          </div>
          <div
            class:current={editor.cursorString === stringIndex && editor.frets[stringIndex] === null}
            class:selected={editor.frets[stringIndex] === null}
            class="mute-cell"
          >
            X
          </div>

          {#each frets as fret}
            {@const midi = getMidi(stringIndex, fret)}
            {@const enabled = isChordTone(midi)}
            <div
              class:enabled
              class:selected={editor.frets[stringIndex] === fret}
              class:current={editor.cursorString === stringIndex && editor.cursorFret === fret}
              class="fret-cell"
            >
              {getNoteName(midi)}
            </div>
          {/each}
        </div>
      {/each}
    </div>
  </FocusableContent>
</div>

<style>
  .wrap {
    display: inline-block;
    position: relative;
    width: 100%;
    height: 100%;
    background-color: #d8ece1;
  }

  .fretboard {
    display: inline-block;
    position: relative;
    padding: 8px;
    background-color: #f7f8f4;
    border: solid 1px #6d746b;
    box-sizing: border-box;
  }

  .row {
    display: grid;
    grid-template-columns: 64px 46px repeat(13, 46px);
    height: 34px;
  }

  .header {
    height: 28px;
  }

  .string-label,
  .mute-cell,
  .fret-header,
  .fret-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    border: solid 1px #a7aba2;
    box-sizing: border-box;
    font-size: 13px;
  }

  .string-label {
    gap: 5px;
    background-color: #e9eadf;
  }

  .string-label span {
    color: #676b63;
  }

  .mute-cell {
    background-color: #e7e0dd;
    color: #704b43;
    font-weight: 600;
  }

  .fret-header {
    background-color: #dbded2;
    color: #4d544a;
    font-weight: 600;
  }

  .fret-cell {
    background-color: #eceee8;
    color: #9a9d96;
  }

  .fret-cell.enabled {
    background-color: #fffdf4;
    color: #24352b;
    font-weight: 600;
  }

  .mute-cell.selected,
  .fret-cell.selected,
  .fret-cell.enabled.selected {
    background-color: #f5cb64;
    color: #271b08;
  }

  .current {
    outline: solid 3px #1f6f8b;
    outline-offset: -3px;
  }
</style>
