import SoundFontFile from "../../../../infra/audio/soundfont-file";
import { openTextFilePath, saveTextFilePath } from "../../../../infra/tauri/dialog";
import { readUtf8TextFile, writeUtf8TextFile } from "../../../../infra/tauri/fs";
import useScrollService from "../../../common/scroll-service";
import TextCompression from "../../../common/text-compression";
import ArrangeState from "../../../../store/state/data/arrange/arrange-state";
import MelodyState from "../../../../store/state/data/melody-state";
import TerminalCommand from "../../terminal-command";

type TrackCatalogKind = "harmonize" | "melody";
type MelodyTrackNotesFile = {
  type: "scorehack.melody-track-notes";
  version: 1;
  notes: MelodyState.VocalNote[];
};

const MELODY_TRACK_NOTES_FILE_EXTENSION = "shn";
const MELODY_TRACK_NOTES_FILE_FILTER_NAME = "Scorehack Melody Track Notes";

const createTrackCatalog = (
  ctx: TerminalCommand.Context,
  kind: TrackCatalogKind,
): TerminalCommand.Props => {
  const { control, data, logger, ref, terminal } = ctx;
  const defaultProps = TerminalCommand.createDefaultProps("track");
  const { resetScoreTrackRef } = useScrollService();
  const actions = kind === "melody"
    ? ["list", "create", "copy", "export", "import", "use", "delete"]
    : ["list", "create", "use", "delete"];

  const finishWaiting = () => {
    terminal.wait = false;
    ctx.commit.terminal();
  };

  const getTrackNames = () => {
    switch (kind) {
      case "melody":
        return data.scoreTracks.map((track) => track.name);
      case "harmonize":
        return data.arrange.tracks.map((track) => track.name);
    }
  };

  const isTrackNameUsed = (name: string) => {
    return getTrackNames().includes(name);
  };

  const getDefaultTrackName = () => {
    let index = 0;
    while (isTrackNameUsed(`track${index}`)) {
      index++;
    }
    return `track${index}`;
  };

  const getNewTrackName = (name: string | undefined) => {
    return name == undefined || name.trim() === ""
      ? getDefaultTrackName()
      : name.trim();
  };

  const getFileName = (path: string) => {
    const normalized = path.replaceAll("\\", "/");
    const segments = normalized.split("/");
    return segments[segments.length - 1] || path;
  };

  const getMelodyTrackIndex = (name: string | undefined) => {
    if (name == undefined || name.trim() === "") return control.melody.trackIndex;

    const index = data.scoreTracks.findIndex((track) => track.name === name.trim());
    if (index === -1) {
      logger.outputError(`The destination track does not exist. [${name}]`);
      return null;
    }
    return index;
  };

  const cloneNotes = (notes: MelodyState.VocalNote[]) => {
    return JSON.parse(JSON.stringify(notes)) as MelodyState.VocalNote[];
  };

  const getNotesTailBeatNote = (notes: MelodyState.VocalNote[]) => {
    return notes.reduce((tail, note) => {
      const side = MelodyState.calcBeatSide(note);
      return Math.max(tail, side.pos + side.len);
    }, 0);
  };

  const validateImportedNotesRange = (notes: MelodyState.VocalNote[]) => {
    const notesTailBeatNote = getNotesTailBeatNote(notes);
    const outlineTailBeatNote = ctx.selectors.derived.getBeatNoteTail();
    if (notesTailBeatNote > outlineTailBeatNote + 1e-9) {
      logger.outputError(
        `Cannot import: outline chord blocks are too short. [notes tail: ${notesTailBeatNote}, outline tail: ${outlineTailBeatNote}]`,
      );
      return false;
    }
    return true;
  };

  const isObject = (value: unknown): value is Record<string, unknown> => {
    return typeof value === "object" && value !== null;
  };

  const isMelodyTrackNotesFile = (value: unknown): value is MelodyTrackNotesFile => {
    return isObject(value)
      && value.type === "scorehack.melody-track-notes"
      && value.version === 1
      && Array.isArray(value.notes);
  };

  const parseMelodyTrackNotesFile = (text: string) => {
    return JSON.parse(TextCompression.unzip(text)) as unknown;
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
          ...(kind === "melody"
            ? [
              ["track copy <sourceName> <name?>", "Copy a melody track."],
              ["track export <name?>", "Export melody notes from a track."],
              ["track import <name?>", "Import melody notes into a track."],
            ]
            : []),
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
    const trackName = getNewTrackName(name);

    if (isTrackNameUsed(trackName)) {
      logger.outputError(`Track already exists. [${trackName}]`);
      return;
    }

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

  const copyMelodyTrack = (sourceName: string, destName: string | undefined) => {
    const sourceTrack = data.scoreTracks.find((track) => track.name === sourceName);
    if (sourceTrack == undefined) {
      logger.outputError(`The source track does not exist. [${sourceName}]`);
      return;
    }

    const trackName = getNewTrackName(destName);
    if (isTrackNameUsed(trackName)) {
      logger.outputError(`Track already exists. [${trackName}]`);
      return;
    }

    const copiedTrack: MelodyState.ScoreTrack = JSON.parse(JSON.stringify({
      ...sourceTrack,
      name: trackName,
    }));
    data.scoreTracks.push(copiedTrack);
    ref.trackArr.push([]);
    ref.noteRefs.push([]);

    logger.outputInfo(`Copied track. [${sourceName} -> ${trackName}]`);
    ctx.commit.data();
    ctx.commit.ref();
    listTracks();
  };

  const copyTrack = (sourceName: string | undefined, destName: string | undefined) => {
    if (kind !== "melody") {
      outputUnknownAction("copy");
      return;
    }

    const sourceTrackName = logger.validateRequired(sourceName, 2);
    if (sourceTrackName == null) return;

    copyMelodyTrack(sourceTrackName, destName);
  };

  const exportMelodyTrackNotes = (trackName: string | undefined) => {
    const trackIndex = getMelodyTrackIndex(trackName);
    if (trackIndex == null) return;

    const track = data.scoreTracks[trackIndex];
    if (track == undefined) throw new Error("Melody track must exist.");

    const payload: MelodyTrackNotesFile = {
      type: "scorehack.melody-track-notes",
      version: 1,
      notes: cloneNotes(track.notes),
    };

    logger.outputInfo("Select the file to export melody notes.");
    terminal.wait = true;
    ctx.commit.terminal();

    (async () => {
      const path = await saveTextFilePath({
        extension: MELODY_TRACK_NOTES_FILE_EXTENSION,
        name: MELODY_TRACK_NOTES_FILE_FILTER_NAME,
      });
      if (path == null) {
        logger.outputInfo("Melody notes export was canceled.");
        return;
      }

      const exportPath = path.toLowerCase().endsWith(`.${MELODY_TRACK_NOTES_FILE_EXTENSION}`)
        ? path
        : `${path}.${MELODY_TRACK_NOTES_FILE_EXTENSION}`;
      await writeUtf8TextFile(exportPath, TextCompression.zip(JSON.stringify(payload)));
      logger.outputInfo(`Melody notes exported. [${track.name} -> ${getFileName(exportPath)}]`);
    })().catch((error) => {
      console.error("Failed to export melody notes:", error);
      logger.outputError("Failed to export melody notes.");
    }).finally(finishWaiting);
  };

  const importMelodyTrackNotes = (trackName: string | undefined) => {
    const trackIndex = getMelodyTrackIndex(trackName);
    if (trackIndex == null) return;

    const track = data.scoreTracks[trackIndex];
    if (track == undefined) throw new Error("Melody track must exist.");

    logger.outputInfo("Select the file to import melody notes.");
    terminal.wait = true;
    ctx.commit.terminal();

    (async () => {
      const path = await openTextFilePath({
        extension: MELODY_TRACK_NOTES_FILE_EXTENSION,
        name: MELODY_TRACK_NOTES_FILE_FILTER_NAME,
      });
      if (path == null) {
        logger.outputInfo("Melody notes import was canceled.");
        return;
      }

      const text = await readUtf8TextFile(path);
      const payload = parseMelodyTrackNotesFile(text);
      if (!isMelodyTrackNotesFile(payload)) {
        logger.outputError("Invalid melody notes file.");
        return;
      }

      const importedNotes = cloneNotes(payload.notes);
      if (!validateImportedNotesRange(importedNotes)) return;

      track.notes = importedNotes;
      ref.noteRefs[trackIndex] = [];
      logger.outputInfo(`Melody notes imported. [${getFileName(path)} -> ${track.name}]`);
      ctx.commit.data();
      ctx.commit.ref();
      listTracks();
    })().catch((error) => {
      console.error("Failed to import melody notes:", error);
      logger.outputError("Failed to import melody notes.");
    }).finally(finishWaiting);
  };

  const exportTrack = (trackName: string | undefined) => {
    if (kind !== "melody") {
      outputUnknownAction("export");
      return;
    }
    exportMelodyTrackNotes(trackName);
  };

  const importTrack = (trackName: string | undefined) => {
    if (kind !== "melody") {
      outputUnknownAction("import");
      return;
    }
    importMelodyTrackNotes(trackName);
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
        getCandidate: (args) => (
          args[0] === "use"
          || args[0] === "delete"
          || args[0] === "copy"
          || args[0] === "export"
          || args[0] === "import"
            ? getTrackNames()
            : []
        ),
      },
      {
        name: "newTrackName?: string",
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
        case "copy":
          copyTrack(args[1], args[2]);
          break;
        case "export":
          exportTrack(args[1]);
          break;
        case "import":
          importTrack(args[1]);
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
