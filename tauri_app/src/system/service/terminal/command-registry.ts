import type ArrangeState from "../../store/state/data/arrange/arrange-state";
import type ElementState from "../../store/state/data/element-state";
import TerminalCommand from "./terminal-command";
import createChordCommands from "./command/chord-command-provider";
import createCommonCommands from "./command/common-command-provider";
import createHarmonizeCommands from "./command/harmonize-command-provider";
import createInitCommands from "./command/init-command-provider";
import createMelodyCommands from "./command/melody-command-provider";
import createModulateCommands from "./command/modulate-command-provider";
import createPianoEditorCommands from "./command/piano-editor-command-provider";
import createSectionCommands from "./command/section-command-provider";

const createCommandRegistry = (ctx: TerminalCommand.Context) => {
    const { terminal } = ctx;

    const commonCommands = createCommonCommands(ctx);
    const harmonizeCommands = createHarmonizeCommands(ctx);
    const initCommands = createInitCommands(ctx);
    const sectionCommands = createSectionCommands(ctx);
    const chordCommands = createChordCommands(ctx);
    const melodyCommands = createMelodyCommands(ctx);
    const modulateCommands = createModulateCommands(ctx);
    const pianoEditorCommands = createPianoEditorCommands(ctx);

    const buildAvailableFunctions = () => {
        const items: TerminalCommand.Props[] = [];
        const add = (funcs: TerminalCommand.Props[]) => {
            items.push(...funcs);
        };

        const sectors = terminal.target.split("\\");

        add(commonCommands.list({ items }));

        switch (sectors[0]) {
            case "harmonize": {
                const harmonizeSector = sectors[1] as ElementState.ElementType | "arrange";
                if (harmonizeSector !== "arrange") {
                    add(harmonizeCommands.list());
                    switch (harmonizeSector) {
                        case "init": add(initCommands.list()); break;
                        case "section": add(sectionCommands.list()); break;
                        case "chord": add(chordCommands.list()); break;
                        case "modulate": add(modulateCommands.list()); break;
                    }
                } else {
                    const arrangeSector = sectors[2] as ArrangeState.ArrangeMedhod;
                    switch (arrangeSector) {
                        case "piano": add(pianoEditorCommands.list()); break;
                    }
                }
            } break;
            case "melody": add(melodyCommands.list()); break;
        }

        terminal.availableFuncs = items;
    };

    return {
        buildAvailableFunctions,
    };
};

export default createCommandRegistry;
