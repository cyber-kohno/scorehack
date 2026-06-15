import SoundFont, { type InstrumentName } from "soundfont-player";
import RhythmTheory from "../../../domain/theory/rhythm-theory";
import type DataState from "../../../store/state/data/data-state";
import MelodyState from "../../../store/state/data/melody-state";
import GuitarEditorState from "../../../store/state/data/arrange/guitar/guitar-editor-state";
import PianoEditorState from "../../../store/state/data/arrange/piano/piano-editor-state";
import type DerivedState from "../../../store/state/derived-state";
import type SettingsState from "../../../store/state/settings-state";
import GuitarArrangePlaybackUtil from "../../playback/arrange/guitar-arrange-playback-util";
import PianoArrangePlaybackUtil from "../../playback/arrange/piano-arrange-playback-util";
import convertNoteToPlayer from "../../playback/timeline/convert-note-to-player";

type CreateScoreWavProps = {
  data: DataState.Value;
  derived: DerivedState.Value;
  settings: SettingsState.Value;
  sampleRate?: number;
};

type TrackEvents = {
  instrumentName: InstrumentName;
  notes: {
    pitchName: string;
    gain: number;
    startSec: number;
    durationSec: number;
  }[];
};

const writeAscii = (
  view: DataView,
  offset: number,
  value: string,
) => {
  for (let i = 0; i < value.length; i++) {
    view.setUint8(offset + i, value.charCodeAt(i));
  }
};

const encodeWav = (buffer: AudioBuffer) => {
  const channelCount = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const bytesPerSample = 2;
  const blockAlign = channelCount * bytesPerSample;
  const dataSize = buffer.length * blockAlign;
  const bytes = new Uint8Array(44 + dataSize);
  const view = new DataView(bytes.buffer);

  writeAscii(view, 0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeAscii(view, 8, "WAVE");
  writeAscii(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channelCount, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bytesPerSample * 8, true);
  writeAscii(view, 36, "data");
  view.setUint32(40, dataSize, true);

  const channels = Array.from({ length: channelCount }, (_, index) =>
    buffer.getChannelData(index),
  );
  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let ch = 0; ch < channelCount; ch++) {
      const sample = Math.max(-1, Math.min(1, channels[ch][i]));
      view.setInt16(
        offset,
        sample < 0 ? sample * 0x8000 : sample * 0x7fff,
        true,
      );
      offset += bytesPerSample;
    }
  }

  return bytes;
};

const collectMelodyTrackEvents = (props: CreateScoreWavProps) => {
  const { data, derived, settings } = props;

  return data.scoreTracks
    .filter((track) => !track.isMute)
    .map((track): TrackEvents | null => {
      const ref = track.instRef;
      if (ref?.source !== "builtin") return null;

      const notes = track.notes
        .map((note) => convertNoteToPlayer(
          derived.baseCaches,
          0,
          note,
          track.volume,
          settings.playback.swing,
        ))
        .filter((note) => note != null)
        .map((note) => ({
          pitchName: note.pitchName,
          gain: note.gain,
          startSec: note.startMs / 1000,
          durationSec: note.sustainMs / 1000,
        }));

      if (notes.length === 0) return null;

      return {
        instrumentName: ref.name as InstrumentName,
        notes,
      };
    })
    .filter((track) => track != null);
};

const collectArrangeTrackEvents = (props: CreateScoreWavProps) => {
  const { data, derived, settings } = props;
  const { baseCaches, chordCaches } = derived;

  return data.arrange.tracks
    .filter((track) => !track.isMute)
    .map((track, trackIndex): TrackEvents | null => {
      const ref = track.instRef;
      if (ref?.source !== "builtin") return null;

      const notes: TrackEvents["notes"] = [];

      switch (track.method) {
        case "piano": {
          chordCaches.forEach((chordCache) => {
            if (chordCache.error.arrange.overLengthTrackIndexes.includes(trackIndex)) return;

            const arrPattern = PianoEditorState.getArrangePatternFromRelation(
              chordCache.chordSeq,
              track,
            );
            if (arrPattern == undefined) return;

            const compiledChord = chordCache.compiledChord;
            if (compiledChord == undefined) return;

            const baseCache = baseCaches[chordCache.baseSeq];
            const beatDiv16Cnt = RhythmTheory.getBeatDiv16Count(
              baseCache.scoreBase.rhythm.ts,
            );
            const beatRate = beatDiv16Cnt / 4;
            const startBeat =
              chordCache.startBeat * beatRate +
              (chordCache.beat.eatHead / beatDiv16Cnt) * beatRate;
            const patternNotes = PianoArrangePlaybackUtil.convertPatternToNotes(
              arrPattern,
              compiledChord.chord,
              { sustainBeat: chordCache.lengthBeatNote },
            );

            patternNotes.forEach((note) => {
              const targetNote = MelodyState.calcAddBeat(note, startBeat);
              const playInfo = convertNoteToPlayer(
                baseCaches,
                0,
                targetNote,
                track.volume * (note.velocity / 10),
                settings.playback.swing,
              );
              if (playInfo == null) return;

              notes.push({
                pitchName: playInfo.pitchName,
                gain: playInfo.gain,
                startSec: playInfo.startMs / 1000,
                durationSec: playInfo.sustainMs / 1000,
              });
            });
          });
          break;
        }
        case "guitar": {
          chordCaches.forEach((chordCache) => {
            const arrPattern = GuitarEditorState.getArrangePatternFromRelation(
              chordCache.chordSeq,
              track,
            );
            if (arrPattern == undefined) return;

            const baseCache = baseCaches[chordCache.baseSeq];
            const beatDiv16Cnt = RhythmTheory.getBeatDiv16Count(
              baseCache.scoreBase.rhythm.ts,
            );
            const beatRate = beatDiv16Cnt / 4;
            const startBeat =
              chordCache.startBeat * beatRate +
              (chordCache.beat.eatHead / beatDiv16Cnt) * beatRate;
            const patternNotes = GuitarArrangePlaybackUtil.convertPatternToNotes(
              arrPattern,
              {
                sustainBeat: chordCache.lengthBeatNote,
                stroke: GuitarEditorState.createDefaultStrokeProps(),
              },
            );

            patternNotes.forEach((note) => {
              const targetNote = MelodyState.calcAddBeat(note, startBeat);
              const playInfo = convertNoteToPlayer(
                baseCaches,
                0,
                targetNote,
                track.volume,
                settings.playback.swing,
              );
              if (playInfo == null) return;

              notes.push({
                pitchName: playInfo.pitchName,
                gain: playInfo.gain,
                startSec: playInfo.startMs / 1000,
                durationSec: playInfo.sustainMs / 1000,
              });
            });
          });
          break;
        }
      }

      if (notes.length === 0) return null;

      return {
        instrumentName: ref.name as InstrumentName,
        notes,
      };
    })
    .filter((track) => track != null);
};

const createScoreWav = async (props: CreateScoreWavProps) => {
  const sampleRate = props.sampleRate ?? 44100;
  const tracks = [
    ...collectMelodyTrackEvents(props),
    ...collectArrangeTrackEvents(props),
  ];
  if (tracks.length === 0) {
    throw new Error("No builtin notes to export.");
  }

  const lastNoteSec = Math.max(
    ...tracks.flatMap((track) =>
      track.notes.map((note) => note.startSec + note.durationSec),
    ),
  );
  const durationSec = lastNoteSec + 0.5;
  const context = new OfflineAudioContext({
    numberOfChannels: 2,
    length: Math.ceil(sampleRate * durationSec),
    sampleRate,
  });

  for (const track of tracks) {
    const preloadNotes = [...new Set(track.notes.map((note) => note.pitchName))];
    const player = await SoundFont.instrument(
      context as unknown as AudioContext,
      track.instrumentName,
      {
        notes: preloadNotes,
        destination: context.destination,
        gain: 1,
      },
    );

    track.notes.forEach((note) => {
      player.play(note.pitchName, note.startSec, {
        duration: note.durationSec,
        gain: note.gain,
      });
    });
  }

  const buffer = await context.startRendering();
  return encodeWav(buffer);
};

export default createScoreWav;
