import FileUtil from "../../../infra/file/fileUtil";
import { get } from "svelte/store";
import { dataStore } from "../../../store/global-store";
import PlaybackState from "../../../store/state/playback-state";
import TerminalCommand from "../terminal-command";
import useSoundfontLoader from "../../playback/soundfont-loader";

const createCommonCommands = (ctx: TerminalCommand.Context) => {
  const { data, logger, terminal } = ctx;
  const { isLoadSoundFont, loadSoundFont } = useSoundfontLoader();

  const fileUtil = FileUtil.getUtil();

  const list = (props: {
    items: TerminalCommand.Props[];
  }): TerminalCommand.Props[] => {
    // const { loadSFPlayer } = useReducerMelody(lastStore);

    const defaultProps = TerminalCommand.createDefaultProps("system");
    return [
      {
        ...defaultProps,
        funcKey: "clear",
        usage: "Delete all output from the terminal.",
        args: [],
        callback: () => {
          terminal.outputs.length = 0;
        },
      },
      {
        ...defaultProps,
        funcKey: "help",
        usage: "Lists the available help commands.",
        args: [],
        callback: () => {
          terminal.outputs.push({
            type: "table",
            table: {
              cols: [
                { headerName: "Sector", width: 110, attr: "category" },
                { headerName: "Command", width: 150, attr: "def" },
                { headerName: "Usage", width: 400, attr: "sentence" },
              ],
              table: (() =>
                props.items.map((item) => {
                  return [item.sector, item.funcKey, item.usage];
                }))(),
            },
          });
        },
      },
      {
        ...defaultProps,
        funcKey: "save",
        usage: "Save the music score data.",
        args: [],
        callback: () => {
          logger.outputInfo("Select the file to save.");
          terminal.wait = true;
          fileUtil.saveScoreFile({
                    success: (handle) => {
              logger.outputInfo(`File saved successfully. [${handle.name}]`);
              terminal.wait = false;
              ctx.commit.terminal();
            },
            cancel() {
              logger.outputInfo("File saveing was canceled.");
              terminal.wait = false;
              ctx.commit.terminal();
            },
          });
        },
      },
      {
        ...defaultProps,
        funcKey: "load",
        usage: "Loads music score data.",
        args: [],
        callback: () => {
          terminal.wait = true;
          fileUtil.loadScoreFile(
            (handle) => {
              logger.outputInfo(`File load successfully. [${handle.name}]`);
              const loadedData = get(dataStore);
              const sfNames = Array.from(
                new Set(
                  [
                    ...loadedData.scoreTracks.map((track) => track.soundFont),
                    ...loadedData.arrange.tracks.map((track) => track.soundFont),
                  ].filter((sfName) => sfName !== ""),
                ),
              ).map((sfName) => PlaybackState.validateSFName(sfName));

              (async () => {
                for (const sfName of sfNames) {
                  if (isLoadSoundFont(sfName)) continue;
                  logger.outputInfo(`Loading... [${sfName}]`);
                  ctx.commit.terminal();
                  await loadSoundFont(sfName);
                }
                return;
              })().then(() => {
                logger.outputInfo(`Soundfont load successfully`);
                terminal.wait = false;
                ctx.commit.terminal();
              });
              ctx.commit.terminal();
            },
            () => {
              logger.outputInfo("File loading was canceled.");
              terminal.wait = false;
              ctx.commit.terminal();
            },
          );
        },
      },
    ];
  };
  return {
    list,
  };
};
export default createCommonCommands;
