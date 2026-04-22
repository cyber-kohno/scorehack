import type StoreArrange from "../../domain/arrange/arrange-store";
import type { OutlineElementType } from "../../domain/outline/outline-types";
import type { RootStoreToken } from "../../state/root-store";
import useReducerTermianl from "./terminal-reducer";
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

export const createCommandRegistry = (rootStoreToken: RootStoreToken) => {
  const reducer = useReducerTermianl(rootStoreToken);
  const terminal = reducer.getTerminal();

  const builderCommon = useBuilderCommon(rootStoreToken);
  const builderHarmonize = useBuilderHarmonize(rootStoreToken);
  const builderInit = useBuilderInit(rootStoreToken);
  const builderSection = useBuilderSection(rootStoreToken);
  const builderChord = useBuilderChord(rootStoreToken);
  const builderMelody = useBuilderMelody(rootStoreToken);
  const builderModulate = useBuilderModulate(rootStoreToken);
  const builderPianoEditor = useBuilderPianoEditor(rootStoreToken);

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
