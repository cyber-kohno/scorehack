declare module 'soundfont-player' {
  export type InstrumentName = string;

  export type Player = {
    play(note: string, when?: number, options?: { duration?: number; gain?: number }): void;
  };

  const Soundfont: {
    instrument(audioContext: AudioContext, name: InstrumentName): Promise<Player>;
  };

  export default Soundfont;
}
