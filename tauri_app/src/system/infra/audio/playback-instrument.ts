export type PlaybackNote = string | number;

export type PlaybackNoteOptions = {
    gain?: number;
    duration?: number;
};

export type PlaybackInstrument = {
    play: (
        note: PlaybackNote,
        when?: number,
        options?: PlaybackNoteOptions,
    ) => unknown;
    stop: () => void;
};
