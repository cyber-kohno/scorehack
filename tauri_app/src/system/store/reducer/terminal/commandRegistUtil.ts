import type StoreArrange from "../../props/arrange/storeArrange";
import type { OutlineElementType } from "../../../../domain/outline/outline-types";
import type { StoreProps } from "../../store";
import useReducerTermianl from "../reducerTerminal";
import useBuilderChord from "./sector/builderChord";
import useBuilderCommon from "./sector/builderCommon";
import useBuilderHarmonize from "./sector/builderHarmonize";
import useBuilderInit from "./sector/builderInit";
import useBuilderMelody from "./sector/builderMelody";
import useBuilderModulate from "./sector/builderModulate";
import useBuilderPianoEditor from "./sector/builderPianoEditor";
import useBuilderSection from "./sector/builderSection";

export type CommandFuncArg = {
  name: string;
  getCandidate?: () => string[];
};

export interface CommandFuncDefault {
  sector: string;
  usage: string;
  args: CommandFuncArg[];
  callback: (args: string[]) => void;
}

export interface CommandFunc extends CommandFuncDefault {
  funcKey: string;
}

export const createDefaultCommandProps = (
  sector: string,
): CommandFuncDefault => ({
  sector,
  usage: "",
  args: [],
  callback: () => [],
});

export const createCommandRegistry = (lastStore: StoreProps) => {
  const reducer = useReducerTermianl(lastStore);
  const terminal = reducer.getTerminal();

  const builderCommon = useBuilderCommon(lastStore);
  const builderHarmonize = useBuilderHarmonize(lastStore);
  const builderInit = useBuilderInit(lastStore);
  const builderSection = useBuilderSection(lastStore);
  const builderChord = useBuilderChord(lastStore);
  const builderMelody = useBuilderMelody(lastStore);
  const builderModulate = useBuilderModulate(lastStore);
  const builderPianoEditor = useBuilderPianoEditor(lastStore);

  const buildAvailableFunctions = () => {
    const items: CommandFunc[] = [];
    const add = (funcs: CommandFunc[]) => {
      items.push(...funcs);
    };

    const sectors = terminal.target.split("\\");

    add(builderCommon.get({ items }));

    switch (sectors[0]) {
      case "harmonize": {
        const harmonizeSector = sectors[1] as OutlineElementType | "arrange";
        if (harmonizeSector !== "arrange") {
          add(builderHarmonize.get());
          switch (harmonizeSector) {
            case "init":
              add(builderInit.get());
              break;
            case "section":
              add(builderSection.get());
              break;
            case "chord":
              add(builderChord.get());
              break;
            case "modulate":
              add(builderModulate.get());
              break;
          }
        } else {
          const arrangeSector = sectors[2] as StoreArrange.ArrangeMedhod;
          switch (arrangeSector) {
            case "piano":
              add(builderPianoEditor.get());
              break;
          }
        }
        break;
      }
      case "melody":
        add(builderMelody.get());
        break;
    }

    terminal.availableFuncs = items;
  };

  const execute = (_target: string, _funcKey: string, _args: string[]) => {};

  return {
    buildAvailableFunctions,
    execute,
  };
};

const CommandRegistUtil = {
  createDefaultProps: createDefaultCommandProps,
  useCommandRegister: createCommandRegistry,
};

export default CommandRegistUtil;
