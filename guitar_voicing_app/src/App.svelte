<script lang="ts">
  import Soundfont, { type Player } from 'soundfont-player';
  import {
    CHORD_SYMBOLS,
    MAX_FRET,
    ROOT_NOTES,
    STANDARD_TUNING,
    getChordNoteNames,
    getChordPitchClasses,
    isChordTone,
    noteNameFromMidi,
    type ChordSymbol,
    type RootNote
  } from './lib/music';

  type StringSelection = number | null;
  type PlaybackState = 'idle' | 'loading' | 'ready' | 'error';

  let selectedRoot: RootNote = 'C';
  let selectedSymbol: ChordSymbol = '';
  let selectedFrets: StringSelection[] = STANDARD_TUNING.map(() => null);
  let audioContext: AudioContext | null = null;
  let guitar: Player | null = null;
  let playbackState: PlaybackState = 'idle';
  let playbackMessage = 'Select frets to build a voicing.';

  $: chordName = `${selectedRoot}${selectedSymbol}`;
  $: chordPitchClasses = getChordPitchClasses(selectedRoot, selectedSymbol);
  $: chordNotes = getChordNoteNames(selectedRoot, selectedSymbol);
  $: frets = Array.from({ length: MAX_FRET + 1 }, (_, fret) => fret);
  $: voicedNotes = selectedFrets
    .map((fret, index) => fret === null ? null : STANDARD_TUNING[index].openMidi + fret)
    .filter((midi): midi is number => midi !== null);

  const resetVoicing = () => {
    selectedFrets = STANDARD_TUNING.map(() => null);
    playbackMessage = 'All strings are muted. Activate chord tones to build a voicing.';
  };

  const selectRoot = (root: RootNote) => {
    selectedRoot = root;
    resetVoicing();
  };

  const selectSymbol = (symbol: ChordSymbol) => {
    selectedSymbol = symbol;
    resetVoicing();
  };

  const selectFret = (stringIndex: number, fret: number) => {
    const midi = STANDARD_TUNING[stringIndex].openMidi + fret;

    if (!isChordTone(midi, chordPitchClasses)) {
      return;
    }

    selectedFrets = selectedFrets.map((current, index) => index === stringIndex ? fret : current);
    playbackMessage = 'Voicing updated.';
  };

  const muteString = (stringIndex: number) => {
    selectedFrets = selectedFrets.map((current, index) => index === stringIndex ? null : current);
    playbackMessage = 'String muted.';
  };

  const ensureInstrument = async () => {
    if (guitar) {
      return guitar;
    }

    playbackState = 'loading';
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) {
      throw new Error('Web Audio is not supported.');
    }

    audioContext = audioContext ?? new AudioContextClass();

    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    guitar = await Soundfont.instrument(audioContext, 'acoustic_guitar_nylon');
    playbackState = 'ready';

    return guitar;
  };

  const playStroke = async (direction: 'down' | 'up') => {
    if (voicedNotes.length === 0) {
      playbackMessage = 'No notes selected.';
      return;
    }

    try {
      const player = await ensureInstrument();
      const notes = direction === 'down' ? voicedNotes : [...voicedNotes].reverse();
      const start = audioContext?.currentTime ?? 0;

      notes.forEach((midi, index) => {
        player.play(noteNameFromMidi(midi), start + index * 0.045, {
          duration: 1.5,
          gain: 0.9
        });
      });

      playbackMessage = direction === 'down' ? 'Downstroke played.' : 'Upstroke played.';
    } catch (error) {
      console.error(error);
      playbackState = 'error';
      playbackMessage = 'Audio could not be loaded.';
    }
  };
</script>

<main class="app-shell">
  <aside class="sidebar" aria-label="Chord selector">
    <section class="selector-section root-section">
      <h2>Root</h2>
      <div class="button-grid root-grid">
        {#each ROOT_NOTES as root}
          <button
            class:active={selectedRoot === root}
            type="button"
            on:click={() => selectRoot(root)}
          >
            {root}
          </button>
        {/each}
      </div>
    </section>

    <section class="selector-section symbol-section">
      <h2>Symbol</h2>
      <div class="button-grid symbol-grid">
        {#each CHORD_SYMBOLS as symbol}
          <button
            class:active={selectedSymbol === symbol}
            type="button"
            on:click={() => selectSymbol(symbol)}
          >
            {symbol || 'maj'}
          </button>
        {/each}
      </div>
    </section>
  </aside>

  <section class="workspace">
    <header class="header-panel">
      <div>
        <span class="eyebrow">Current Chord</span>
        <h1>{chordName}</h1>
      </div>
      <div class="tone-list" aria-label="Chord tones">
        {#each chordNotes as note}
          <span>{note}</span>
        {/each}
      </div>
    </header>

    <section class="fretboard-panel" aria-label="Fret matrix">
      <div class="matrix fret-labels">
        <div class="corner-cell">String</div>
        <div class="mute-header">Mute</div>
        {#each frets as fret}
          <div class="fret-header">{fret}F</div>
        {/each}
      </div>

      {#each STANDARD_TUNING as string, stringIndex}
        <div class="matrix string-row">
          <div class="string-label">
            <strong>{string.number}</strong>
            <span>{string.openNote}</span>
          </div>

          <button
            class:active={selectedFrets[stringIndex] === null}
            class="mute-button"
            type="button"
            on:click={() => muteString(stringIndex)}
          >
            Mute
          </button>

          {#each frets as fret}
            {@const midi = string.openMidi + fret}
            {@const noteName = noteNameFromMidi(midi)}
            {@const active = isChordTone(midi, chordPitchClasses)}
            <button
              class:enabled={active}
              class:selected={selectedFrets[stringIndex] === fret}
              class="fret-cell"
              disabled={!active}
              type="button"
              on:click={() => selectFret(stringIndex, fret)}
              aria-label={`String ${string.number}, fret ${fret}, ${noteName}`}
            >
              {noteName}
            </button>
          {/each}
        </div>
      {/each}
    </section>

    <section class="play-panel" aria-label="Playback controls">
      <div>
        <span class="eyebrow">Playback</span>
        <p>{playbackMessage}</p>
      </div>
      <div class="stroke-buttons">
        <button type="button" on:click={() => playStroke('up')} disabled={playbackState === 'loading'}>
          Upstroke
        </button>
        <button type="button" on:click={() => playStroke('down')} disabled={playbackState === 'loading'}>
          Downstroke
        </button>
      </div>
    </section>
  </section>
</main>
