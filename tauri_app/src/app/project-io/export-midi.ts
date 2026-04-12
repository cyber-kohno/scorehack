import MidiWriter from "midi-writer-js";

export const exportMidi = (fileName: string) => {
  const track = new MidiWriter.Track();
  track.addEvent(new MidiWriter.ProgramChangeEvent({ instrument: 1 }));

  const writer = new MidiWriter.Writer(track);
  const link = document.createElement("a");
  link.href = writer.dataUri();
  link.download = `${fileName}.mid`;
  link.click();
};
