import SoundFontFile from "../../../../infra/audio/soundfont-file";
import useScrollService from "../../../common/scroll-service";
import ArrangeState from "../../../../store/state/data/arrange/arrange-state";
import type MelodyState from "../../../../store/state/data/melody-state";
import TerminalCommand from "../../terminal-command";

type TrackCatalogKind = "harmonize" | "melody";

const createTrackCatalog = (
  ctx: TerminalCommand.Context,
  kind: TrackCatalogKind,
): TerminalCommand.Props => {
  const { control, data, logger, ref, terminal } = ctx;
  const defaultProps = TerminalCommand.createDefaultProps("track");
  const { resetScoreTrackRef } = useScrollService();
  const actions = ["list", "create", "use", "delete"];

  const getTrackNames = () => {
    switch (kind) {
      case "melody":
        return data.scoreTracks.map((track) => track.name);
      case "harmonize":
        return data.arrange.tracks.map((track) => track.name);
    }
  };

  const formatMelodyTrackSoundFont = (track: MelodyState.ScoreTrack) => {
    const instRef = track.instRef;
    if (instRef == undefined) return "";

    switch (instRef.source) {
      case "builtin": return instRef.name;
      case "soundfont": return `${instRef.definitionName} ${SoundFontFile.formatPresetKey(instRef)}`;
    }
  };

  const formatHarmonizeTrackSoundFont = (track: ArrangeState.Track) => {
    const instRef = track.instRef;
    if (instRef == undefined) return "";

    switch (instRef.source) {
      case "builtin": return instRef.name;
      case "soundfont": return `${instRef.definitionName} ${SoundFontFile.formatPresetKey(instRef)}`;
    }
  };

  const outputReference = () => {
    terminal.outputs.push({
      type: "table",
      table: {
        cols: [
          { headerName: "Command", width: 180, attr: "def" },
          { headerName: "Usage", width: 420, attr: "sentence" },
        ],
        table: [
          ["track list", "Displays a list of tracks."],
          ["track create <name?>", "Create a new track."],
          ["track use <name>", "Change the active track."],
          ["track delete <name>", "Delete a non-active track."],
        ],
      },
    });
    ctx.commit.terminal();
  };

  const listMelodyTracks = () => {
    const trackIndex = control.melody.trackIndex;
    const tracks = data.scoreTracks.map((track, index) => ({
      ...track,
      isActive: trackIndex === index,
    }));

    terminal.outputs.push({
      type: "table",
      table: {
        cols: [
          { headerName: "Index", width: 80, attr: "item", isNumber: true },
          { headerName: "Name", width: 120, attr: "item" },
          { headerName: "Soundfont", width: 220, attr: "def" },
          { headerName: "Vol", width: 80, attr: "sentence", isNumber: true },
          { headerName: "Mute", width: 80, attr: "sentence" },
          { headerName: "Notes", width: 80, attr: "sentence", isNumber: true },
        ],
        table: tracks.map((track, index) => {
          const active = track.isActive ? "*" : "";
          return [
            index.toString(),
            active + track.name,
            formatMelodyTrackSoundFont(track),
            track.volume.toString(),
            track.isMute ? "*" : "",
            track.notes.length.toString(),
          ];
        }),
      },
    });
  };

  const listHarmonizeTracks = () => {
    const trackIndex = control.outline.trackIndex;
    const tracks = data.arrange.tracks.map((track, index) => ({
      ...track,
      isActive: trackIndex === index,
    }));

    terminal.outputs.push({
      type: "table",
      table: {
        cols: [
          { headerName: "Index", width: 80, attr: "item", isNumber: true },
          { headerName: "Name", width: 120, attr: "item" },
          { headerName: "Method", width: 100, attr: "def" },
          { headerName: "Soundfont", width: 220, attr: "def" },
          { headerName: "Vol", width: 70, attr: "sentence", isNumber: true },
          { headerName: "Mute", width: 80, attr: "sentence" },
        ],
        table: tracks.map((track, index) => {
          const active = track.isActive ? "*" : "";
          return [
            index.toString(),
            active + track.name,
            track.method,
            formatHarmonizeTrackSoundFont(track),
            track.volume.toString(),
            track.isMute ? "*" : "",
          ];
        }),
      },
    });
  };

  const listTracks = () => {
    switch (kind) {
      case "melody":
        listMelodyTracks();
        break;
      case "harmonize":
        listHarmonizeTracks();
        break;
    }
  };

  const createMelodyTrack = (name: string) => {
    data.scoreTracks.push({
      name,
      isMute: false,
      volume: 10,
      notes: [],
    });
    ref.trackArr.push([]);
    ref.noteRefs.push([]);
  };

  const createHarmonizeTrack = (name: string) => {
    data.arrange.tracks.push(ArrangeState.createPianoTrackInitial(name));
    ref.trackArr.push([]);
  };

  const createTrack = (name: string | undefined) => {
    const tracks = kind === "melody" ? data.scoreTracks : data.arrange.tracks;
    const trackName = name ?? `track${tracks.length}`;

    switch (kind) {
      case "melody":
        createMelodyTrack(trackName);
        break;
      case "harmonize":
        createHarmonizeTrack(trackName);
        break;
    }

    logger.outputInfo(`Created a new track. [${trackName}]`);
    ctx.commit.data();
    ctx.commit.ref();
    listTracks();
  };

  const useMelodyTrack = (name: string) => {
    const tracks = data.scoreTracks;
    const nextIndex = tracks.findIndex((track) => track.name === name);
    if (nextIndex === -1) {
      logger.outputError(`The destination track does not exist. [${name}]`);
      return;
    }

    const prev = tracks[control.melody.trackIndex];
    control.melody.trackIndex = nextIndex;
    logger.outputInfo(`Active track changed. [${prev} -> ${name}]`);
    terminal.target = `melody\\${tracks[nextIndex].name}`;
    ctx.commit.control();
    ctx.commit.terminal();
    resetScoreTrackRef();
    listTracks();
  };

  const useHarmonizeTrack = (name: string) => {
    const tracks = data.arrange.tracks;
    const nextIndex = tracks.findIndex((track) => track.name === name);
    if (nextIndex === -1) {
      logger.outputError(`The destination track does not exist. [${name}]`);
      return;
    }

    const prev = tracks[control.outline.trackIndex];
    control.outline.trackIndex = nextIndex;
    logger.outputInfo(`Active track changed. [${prev} -> ${name}]`);
    ctx.commit.control();
    listTracks();
  };

  const useTrack = (name: string | undefined) => {
    const trackName = logger.validateRequired(name, 2);
    if (trackName == null) return;

    switch (kind) {
      case "melody":
        useMelodyTrack(trackName);
        break;
      case "harmonize":
        useHarmonizeTrack(trackName);
        break;
    }
  };

  const deleteMelodyTrack = (name: string) => {
    const tracks = data.scoreTracks;
    const deleteIndex = tracks.findIndex((track) => track.name === name);
    if (deleteIndex === -1) {
      logger.outputError(`The destination track does not exist. [${name}]`);
      return;
    }
    if (deleteIndex === control.melody.trackIndex) {
      logger.outputError(`The active track cannot be deleted. [${name}]`);
      return;
    }

    tracks.splice(deleteIndex, 1);
    ref.trackArr.splice(deleteIndex, 1);
    ref.noteRefs.splice(deleteIndex, 1);
    if (deleteIndex < control.melody.trackIndex) {
      control.melody.trackIndex--;
      ctx.commit.control();
    }

    logger.outputInfo(`Track deleted. [${name}].`);
    ctx.commit.data();
    ctx.commit.ref();
    listTracks();
  };

  const deleteHarmonizeTrack = (name: string) => {
    const tracks = data.arrange.tracks;
    const deleteIndex = tracks.findIndex((track) => track.name === name);
    if (deleteIndex === -1) {
      logger.outputError(`The destination track does not exist. [${name}]`);
      return;
    }
    if (deleteIndex === control.outline.trackIndex) {
      logger.outputError(`The active track cannot be deleted. [${name}]`);
      return;
    }

    tracks.splice(deleteIndex, 1);
    ref.trackArr.splice(deleteIndex, 1);
    if (deleteIndex < control.outline.trackIndex) {
      control.outline.trackIndex--;
      ctx.commit.control();
    }

    logger.outputInfo(`Track deleted. [${name}].`);
    ctx.commit.data();
    ctx.commit.ref();
    listTracks();
  };

  const deleteTrack = (name: string | undefined) => {
    const trackName = logger.validateRequired(name, 2);
    if (trackName == null) return;

    switch (kind) {
      case "melody":
        deleteMelodyTrack(trackName);
        break;
      case "harmonize":
        deleteHarmonizeTrack(trackName);
        break;
    }
  };

  const outputUnknownAction = (action: string) => {
    logger.outputError(`Unknown track action. [${action}]`);
    ctx.commit.terminal();
  };

  return {
    ...defaultProps,
    funcKey: "track",
    usage: "Show, create, or manage tracks.",
    args: [
      {
        name: "action: string",
        getCandidate: () => actions,
      },
      {
        name: "trackName?: string",
        getCandidate: (args) => (args[0] === "use" || args[0] === "delete" ? getTrackNames() : []),
      },
    ],
    callback: (args) => {
      const action = args[0];

      if (action == undefined || action === "") {
        outputReference();
        return;
      }

      switch (action) {
        case "list":
          listTracks();
          break;
        case "create":
          createTrack(args[1]);
          break;
        case "use":
          useTrack(args[1]);
          break;
        case "delete":
          deleteTrack(args[1]);
          break;
        default:
          outputUnknownAction(action);
          break;
      }
    },
  };
};

export default createTrackCatalog;
