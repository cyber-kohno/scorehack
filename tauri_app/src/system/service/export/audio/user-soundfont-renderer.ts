import { BasicMIDI } from "spessasynth_core";
import { WorkletSynthesizer } from "spessasynth_lib";
import processorUrl from "spessasynth_lib/dist/spessasynth_processor.min.js?url";
import NoteName from "../../../infra/audio/note-name";
import UserSoundFontPath from "../../../infra/audio/user-soundfont-path";
import { readBinaryFile } from "../../../infra/tauri/fs";
import type { TrackInstRef } from "../../../store/state/data/track-inst-ref";
import type SettingsState from "../../../store/state/settings-state";

const MELODY_CHANNEL = 0;
const DRUM_CHANNEL = 9;
const BANK_SELECT_MSB = 0;
const BANK_SELECT_LSB = 32;
const TICKS_PER_QUARTER = 480;
const BPM = 120;
const TICKS_PER_SECOND = TICKS_PER_QUARTER * (BPM / 60);
const DEFAULT_GAIN_MAX = 5;
const workletReadyMap = new WeakMap<OfflineAudioContext, Promise<void>>();

const clamp = (value: number, min: number, max: number) => {
  return Math.max(min, Math.min(max, value));
};

const toArrayBuffer = (bytes: Uint8Array) => {
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  ) as ArrayBuffer;
};

const ensureWorkletReady = async (context: OfflineAudioContext) => {
  let workletReady = workletReadyMap.get(context);
  if (workletReady == undefined) {
    workletReady = context.audioWorklet.addModule(processorUrl);
    workletReadyMap.set(context, workletReady);
  }
  await workletReady;
};

const writeUint16BE = (bytes: number[], value: number) => {
  bytes.push((value >> 8) & 0xff, value & 0xff);
};

const writeUint32BE = (bytes: number[], value: number) => {
  bytes.push(
    (value >> 24) & 0xff,
    (value >> 16) & 0xff,
    (value >> 8) & 0xff,
    value & 0xff,
  );
};

const createVariableLengthQuantity = (value: number) => {
  let buffer = value & 0x7f;
  const bytes: number[] = [];

  while ((value >>= 7) > 0) {
    buffer <<= 8;
    buffer |= ((value & 0x7f) | 0x80);
  }

  while (true) {
    bytes.push(buffer & 0xff);
    if ((buffer & 0x80) === 0) break;
    buffer >>= 8;
  }

  return bytes;
};

const writeMidiTrack = (events: number[]) => {
  const bytes: number[] = [0x4d, 0x54, 0x72, 0x6b];
  writeUint32BE(bytes, events.length);
  bytes.push(...events);
  return bytes;
};

const createMidiFile = (trackEvents: number[]) => {
  const bytes: number[] = [0x4d, 0x54, 0x68, 0x64];
  writeUint32BE(bytes, 6);
  writeUint16BE(bytes, 0);
  writeUint16BE(bytes, 1);
  writeUint16BE(bytes, TICKS_PER_QUARTER);
  bytes.push(...writeMidiTrack(trackEvents));
  return new Uint8Array(bytes).buffer;
};

const toTick = (sec: number) => {
  return Math.max(0, Math.round(sec * TICKS_PER_SECOND));
};

const toVelocity = (gain: number) => {
  return clamp(Math.round((gain / DEFAULT_GAIN_MAX) * 127), 1, 127);
};

const getChannel = (
  ref: Extract<TrackInstRef, { source: "soundfont" }>,
) => {
  return ref.bank === 128 ? DRUM_CHANNEL : MELODY_CHANNEL;
};

const createMidi = (track: UserSoundFontRenderer.TrackEvents) => {
  const events: { tick: number; order: number; data: number[] }[] = [];
  const addEvent = (tick: number, order: number, data: number[]) => {
    events.push({ tick, order, data });
  };

  const tempoMicroseconds = Math.round(60_000_000 / BPM);
  addEvent(0, 0, [
    0xff,
    0x51,
    0x03,
    (tempoMicroseconds >> 16) & 0xff,
    (tempoMicroseconds >> 8) & 0xff,
    tempoMicroseconds & 0xff,
  ]);

  const ref = track.ref;
  const channel = getChannel(ref);
  if (ref.bank !== 128) {
    addEvent(0, 1, [0xb0 | channel, BANK_SELECT_MSB, clamp(ref.bank, 0, 127)]);
    addEvent(0, 2, [0xb0 | channel, BANK_SELECT_LSB, 0]);
  }
  addEvent(0, 3, [0xc0 | channel, clamp(ref.program, 0, 127)]);

  track.notes.forEach((note) => {
    const startTick = toTick(note.startSec);
    const endTick = Math.max(startTick + 1, toTick(note.startSec + note.durationSec));
    const midiNote = clamp(NoteName.toMidiNumber(note.pitchName), 0, 127);

    addEvent(startTick, 5, [0x90 | channel, midiNote, toVelocity(note.gain)]);
    addEvent(endTick, 4, [0x80 | channel, midiNote, 0x40]);
  });
  addEvent(Math.max(0, ...events.map((event) => event.tick)), 9, [0xff, 0x2f, 0x00]);

  const sortedEvents = events.sort((a, b) => {
    return a.tick - b.tick || a.order - b.order;
  });
  let currentTick = 0;
  const midiTrackEvents: number[] = [];
  sortedEvents.forEach((event) => {
    midiTrackEvents.push(...createVariableLengthQuantity(event.tick - currentTick), ...event.data);
    currentTick = event.tick;
  });

  return BasicMIDI.fromArrayBuffer(createMidiFile(midiTrackEvents), "scorehack-user-soundfont.mid");
};

namespace UserSoundFontRenderer {
  export type NoteEvent = {
    pitchName: string;
    gain: number;
    startSec: number;
    durationSec: number;
  };

  export type TrackEvents = {
    ref: Extract<TrackInstRef, { source: "soundfont" }>;
    notes: NoteEvent[];
  };

  export type RenderProps = {
    context: OfflineAudioContext;
    settings: SettingsState.Value;
    track: TrackEvents;
  };

  export const render = async (props: RenderProps) => {
    const { context, settings, track } = props;
    const definition = settings.userSoundFonts.find((soundFont) => {
      return soundFont.name === track.ref.definitionName;
    });
    if (definition == undefined) {
      throw new Error(`User SoundFont definition was not found. [${track.ref.definitionName}]`);
    }

    const filePath = UserSoundFontPath.resolvePath(definition, settings);
    if (filePath === "") {
      throw new Error(`User SoundFont file path was not found. [${track.ref.definitionName}]`);
    }

    await ensureWorkletReady(context);

    const synth = new WorkletSynthesizer(context);
    synth.connect(context.destination);

    const bytes = await readBinaryFile(filePath);
    await synth.startOfflineRender({
      midiSequence: createMidi(track),
      loopCount: 0,
      soundBankList: [
        {
          bankOffset: 0,
          soundBankBuffer: toArrayBuffer(bytes),
        },
      ],
      sequencerOptions: {},
    });

    return synth;
  };
}

export default UserSoundFontRenderer;
