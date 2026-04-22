import StoreMelody from "../../domain/melody/melody-store";
import MusicTheory from "../../domain/theory/music-theory";
import { getScoreTrack } from "../../state/project-data/melody-project-data";
import { getMelodyTrackIndex } from "../../state/session-state/melody-track-store";
import { validatePreviewInstrumentName } from "../../state/session-state/preview-store";
import type { StoreProps } from "../../state/root-store";
import { getLoadedSoundFonts } from "../../state/ui-state/playback-ui-store";

export const playMelodyPreviewPitch = (
  lastStore: StoreProps,
  pitchIndex: number,
) => {
  const track = getScoreTrack(
    lastStore,
    getMelodyTrackIndex(),
  ) as StoreMelody.ScoreTrack;
  if (track.soundFont === "") return;

  const soundFontName = validatePreviewInstrumentName(track.soundFont);
  const soundFont = getLoadedSoundFonts().find(
    (item) => item.instrumentName === soundFontName,
  );
  if (soundFont == undefined || soundFont.player == undefined) return;

  soundFont.player.stop();
  const soundName = MusicTheory.getKey12FullName(pitchIndex);
  soundFont.player.play(soundName, 0, { gain: 5, duration: 0.5 });
};
