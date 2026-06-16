import SoundFont, { type InstrumentName } from "soundfont-player";
import RhythmTheory from "../../../domain/theory/rhythm-theory";
import FilePathRef from "../../../infra/file/file-path-ref";
import { readBinaryFile } from "../../../infra/tauri/fs";
import type DataState from "../../../store/state/data/data-state";
import MelodyState from "../../../store/state/data/melody-state";
import GuitarEditorState from "../../../store/state/data/arrange/guitar/guitar-editor-state";
import PianoEditorState from "../../../store/state/data/arrange/piano/piano-editor-state";
import type DerivedState from "../../../store/state/derived-state";
import type SettingsState from "../../../store/state/settings-state";
import GuitarArrangePlaybackUtil from "../../playback/arrange/guitar-arrange-playback-util";
import PianoArrangePlaybackUtil from "../../playback/arrange/piano-arrange-playback-util";
import convertNoteToPlayer from "../../playback/timeline/convert-note-to-player";
import UserSoundFontRenderer from "./user-soundfont-renderer";

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

type AudioTrackEvent = {
  buffer: AudioBuffer;
  startSec: number;
  offsetSec: number;
  gain: number;
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

const collectUserSoundFontMelodyTrackEvents = (props: CreateScoreWavProps) => {
  const { data, derived, settings } = props;

  return data.scoreTracks
    .filter((track) => !track.isMute)
    .map((track): UserSoundFontRenderer.TrackEvents | null => {
      const ref = track.instRef;
      if (ref?.source !== "soundfont") return null;

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
        ref,
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

const collectUserSoundFontArrangeTrackEvents = (props: CreateScoreWavProps) => {
  const { data, derived, settings } = props;
  const { baseCaches, chordCaches } = derived;

  return data.arrange.tracks
    .filter((track) => !track.isMute)
    .map((track, trackIndex): UserSoundFontRenderer.TrackEvents | null => {
      const ref = track.instRef;
      if (ref?.source !== "soundfont") return null;

      const notes: UserSoundFontRenderer.TrackEvents["notes"] = [];

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
        ref,
        notes,
      };
    })
    .filter((track) => track != null);
};

const toArrayBuffer = (bytes: Uint8Array) => {
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  ) as ArrayBuffer;
};

const collectAudioTrackEvents = async (
  props: CreateScoreWavProps,
  sampleRate: number,
) => {
  const { data, settings } = props;
  const decoder = new OfflineAudioContext({
    numberOfChannels: 2,
    length: 1,
    sampleRate,
  });
  const events: AudioTrackEvent[] = [];

  for (const track of data.audioTracks) {
    if (track.isMute) continue;
    if (track.pathRef == undefined) continue;

    const path = FilePathRef.resolvePath(track.pathRef, settings.envs.HOME_DIR);
    if (path === "") continue;

    const bytes = await readBinaryFile(path);
    const buffer = await decoder.decodeAudioData(toArrayBuffer(bytes));
    const adjustSec = track.adjust / 1000;
    const startSec = Math.max(0, adjustSec);
    const offsetSec = Math.max(0, -adjustSec);
    if (offsetSec >= buffer.duration) continue;

    events.push({
      buffer,
      startSec,
      offsetSec,
      gain: Math.max(0, Math.min(1, track.volume / 10)),
    });
  }

  return events;
};

const scheduleAudioTrackEvents = (
  context: OfflineAudioContext,
  events: AudioTrackEvent[],
) => {
  events.forEach((event) => {
    const source = context.createBufferSource();
    const gain = context.createGain();
    source.buffer = event.buffer;
    gain.gain.value = event.gain;
    source.connect(gain).connect(context.destination);
    source.start(event.startSec, event.offsetSec);
  });
};

const createScoreWav = async (props: CreateScoreWavProps) => {
  const sampleRate = props.sampleRate ?? 44100;
  const builtinTracks = [
    ...collectMelodyTrackEvents(props),
    ...collectArrangeTrackEvents(props),
  ];
  const userSoundFontTracks = [
    ...collectUserSoundFontMelodyTrackEvents(props),
    ...collectUserSoundFontArrangeTrackEvents(props),
  ];
  const tracks = [
    ...builtinTracks,
    ...userSoundFontTracks,
  ];
  const audioTrackEvents = await collectAudioTrackEvents(props, sampleRate);

  const lastNoteSec = tracks.length === 0 ? 0 : Math.max(
    ...tracks.flatMap((track) =>
      track.notes.map((note) => note.startSec + note.durationSec),
    ),
  );
  const lastAudioSec = audioTrackEvents.length === 0 ? 0 : Math.max(
    ...audioTrackEvents.map((event) =>
      event.startSec + event.buffer.duration - event.offsetSec,
    ),
  );
  if (tracks.length === 0 && audioTrackEvents.length === 0) {
    throw new Error("No notes or audio tracks to export.");
  }

  const durationSec = Math.max(lastNoteSec, lastAudioSec) + 0.5;
  const context = new OfflineAudioContext({
    numberOfChannels: 2,
    length: Math.ceil(sampleRate * durationSec),
    sampleRate,
  });

  const userSoundFontSynths = [];
  for (const track of userSoundFontTracks) {
    const synth = await UserSoundFontRenderer.render({
      context,
      settings: props.settings,
      track,
    });
    userSoundFontSynths.push(synth);
  }

  for (const track of builtinTracks) {
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

  scheduleAudioTrackEvents(context, audioTrackEvents);

  const buffer = await context.startRendering();
  userSoundFontSynths.forEach((synth) => synth.destroy());
  return encodeWav(buffer);
};

export default createScoreWav;
