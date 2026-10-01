import { WorkletSynthesizer } from "spessasynth_lib";
import processorUrl from "spessasynth_lib/dist/spessasynth_processor.min.js?url";
import { readBinaryFile } from "../tauri/fs";
import NoteName from "./note-name";
import type { PlaybackInstrument, PlaybackNoteOptions } from "./playback-instrument";

const CHANNELS = Array.from({ length: 16 }, (_, index) => index);
const BANK_SELECT_MSB = 0;
const BANK_SELECT_LSB = 32;
const DEFAULT_GAIN_MAX = 5;

let audioContext: AudioContext | null = null;
let workletReady: Promise<void> | null = null;

const clamp = (value: number, min: number, max: number) => {
    return Math.max(min, Math.min(max, value));
};

const getAudioContext = () => {
    audioContext ??= new AudioContext();
    return audioContext;
};

const ensureWorkletReady = async (context: AudioContext) => {
    workletReady ??= context.audioWorklet.addModule(processorUrl);
    await workletReady;
};

const toArrayBuffer = (bytes: Uint8Array) => {
    return bytes.buffer.slice(
        bytes.byteOffset,
        bytes.byteOffset + bytes.byteLength,
    ) as ArrayBuffer;
};

const toVelocity = (options?: PlaybackNoteOptions) => {
    const gain = options?.gain ?? DEFAULT_GAIN_MAX;
    return clamp(Math.round((gain / DEFAULT_GAIN_MAX) * 127), 1, 127);
};

export type SpessaSynthInstrumentOptions = {
    filePath: string;
    bank: number;
    program: number;
};

export const createSpessaSynthInstrument = async (
    options: SpessaSynthInstrumentOptions,
): Promise<PlaybackInstrument> => {
    const context = getAudioContext();
    await ensureWorkletReady(context);

    const synth = new WorkletSynthesizer(context);
    synth.connect(context.destination);
    const bytes = await readBinaryFile(options.filePath);
    await synth.soundBankManager.addSoundBank(toArrayBuffer(bytes), "main");
    await synth.isReady;

    const isDrums = options.bank === 128;
    CHANNELS.forEach((channel) => {
        synth.setDrums(channel, isDrums);
        if (!isDrums) {
            synth.controllerChange(channel, BANK_SELECT_MSB, clamp(options.bank, 0, 127));
            synth.controllerChange(channel, BANK_SELECT_LSB, 0);
        }
        synth.programChange(channel, options.program);
    });

    let channelCursor = 0;
    let timerKeys: number[] = [];

    return {
        play: (note, when = 0, playOptions) => {
            void context.resume();

            const midiNote = clamp(NoteName.toMidiNumber(note), 0, 127);
            const velocity = toVelocity(playOptions);
            const channel = CHANNELS[channelCursor];
            channelCursor = (channelCursor + 1) % CHANNELS.length;

            const start = () => {
                synth.noteOn(channel, midiNote, velocity);

                const duration = playOptions?.duration;
                if (duration == undefined) return;

                const offKey = window.setTimeout(() => {
                    synth.noteOff(channel, midiNote);
                    timerKeys = timerKeys.filter((key) => key !== offKey);
                }, duration * 1000);
                timerKeys.push(offKey);
            };

            if (when <= 0) {
                start();
                return;
            }

            const onKey = window.setTimeout(() => {
                start();
                timerKeys = timerKeys.filter((key) => key !== onKey);
            }, when * 1000);
            timerKeys.push(onKey);
        },
        stop: () => {
            timerKeys.forEach((key) => window.clearTimeout(key));
            timerKeys = [];
            synth.stopAll(true);
        },
    };
};
