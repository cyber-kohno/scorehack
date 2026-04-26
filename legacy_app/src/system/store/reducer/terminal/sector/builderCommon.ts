import FileUtil from "../../../../util/fileUtil";
import PreviewUtil from "../../../../util/preview/previewUtil";
import type StoreMelody from "../../../props/storeMelody";
import StorePreview from "../../../props/storePreview";
import { createStoreUtil, type StoreProps } from "../../../store";
import useReducerMelody from "../../reducerMelody";
import useReducerTermianl from "../../reducerTerminal";
import CommandRegistUtil from "../commandRegistUtil";
import useTerminalLogger from "../terminalLogger";

const useBuilderCommon = (lastStore: StoreProps) => {
  const { commit } = createStoreUtil(lastStore);
  const reducer = useReducerTermianl(lastStore);
  const terminal = reducer.getTerminal();
  const { loadSoundFont } = PreviewUtil.useReducer(lastStore);

  const fileUtil = FileUtil.getUtil(lastStore);
  const logger = useTerminalLogger(terminal);

  const get = (props: {
    items: CommandRegistUtil.FuncProps[];
  }): CommandRegistUtil.FuncProps[] => {
    // const { loadSFPlayer } = useReducerMelody(lastStore);

    const defaultProps = CommandRegistUtil.createDefaultProps("system");
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
              commit();
            },
            cancel() {
              logger.outputInfo("File saveing was canceled.");
              terminal.wait = false;
              commit();
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
              const tracks = lastStore.data.scoreTracks;
              (async () => {
                for (const track of tracks) {
                  if (track.soundFont !== "") {
                    const sfName = StorePreview.validateSFName(track.soundFont);
                    logger.outputInfo(`Loading... [${sfName}]`);
                    commit();
                    await loadSoundFont(sfName);
                  }
                }
                return;
              })().then(() => {
                logger.outputInfo(`Soundfont load successfully`);
                terminal.wait = false;
                commit();
              });
              commit();
            },
            () => {
              logger.outputInfo("File loading was canceled.");
              terminal.wait = false;
              commit();
            },
          );
        },
      },
    ];
  };
  return {
    get,
  };
};
export default useBuilderCommon;
