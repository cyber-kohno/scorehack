import SoundFont, { type InstrumentName } from "soundfont-player";

export const createSoundFontPlayer = async (sfName: InstrumentName) => {
  return await SoundFont.instrument(new AudioContext(), sfName);
};
