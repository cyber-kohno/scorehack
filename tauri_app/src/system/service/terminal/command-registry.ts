import type ArrangeState from "../../store/state/data/arrange/arrange-state";
import type ElementState from "../../store/state/data/element-state";
import TerminalCommand from "./terminal-command";
import createChordProvider from "./command/provider/chord-provider";
import createGlobalProvider from "./command/provider/global-provider";
import createHarmonizeProvider from "./command/provider/harmonize-provider";
import createInitProvider from "./command/provider/init-provider";
import createLibraryProvider from "./command/provider/library-provider";
import createMelodyProvider from "./command/provider/melody-provider";
import createModulateProvider from "./command/provider/modulate-provider";
import createPianoEditorProvider from "./command/provider/piano-editor-provider";
import createSectionProvider from "./command/provider/section-provider";

const createCommandRegistry = (ctx: TerminalCommand.Context) => {
    const { terminal } = ctx;

    const globalProvider = createGlobalProvider(ctx);
    const harmonizeProvider = createHarmonizeProvider(ctx);
    const initProvider = createInitProvider(ctx);
    const libraryProvider = createLibraryProvider(ctx);
    const sectionProvider = createSectionProvider(ctx);
    const chordProvider = createChordProvider(ctx);
    const melodyProvider = createMelodyProvider(ctx);
    const modulateProvider = createModulateProvider(ctx);
    const pianoEditorProvider = createPianoEditorProvider(ctx);

    const buildAvailableFunctions = () => {
        const items: TerminalCommand.Props[] = [];
        const sectors = terminal.target.split("\\");
        const add = (funcs: TerminalCommand.Props[], sector: string) => {
            items.push(...funcs.map((func) => ({
                ...func,
                sector,
            })));
        };

        add(globalProvider.commands({ items }), "system");

        switch (sectors[0]) {
            case "harmonize": {
                const harmonizeSector = sectors[1] as ElementState.ElementType | "arrange" | "library";
                if (harmonizeSector === "library") {
                    add(libraryProvider.commands(), "library");
                } else if (harmonizeSector !== "arrange") {
                    add(harmonizeProvider.commands(), "harmonize");
                    switch (harmonizeSector) {
                        case "init": add(initProvider.commands(), "init"); break;
                        case "section": add(sectionProvider.commands(), "section"); break;
                        case "chord": add(chordProvider.commands(), "chord"); break;
                        case "modulate": add(modulateProvider.commands(), "modulate"); break;
                    }
                } else {
                    const arrangeSector = sectors[2] as ArrangeState.ArrangeMedhod;
                    switch (arrangeSector) {
                        case "piano": add(pianoEditorProvider.commands(), "piano"); break;
                    }
                }
            } break;
            case "melody": add(melodyProvider.commands(), "melody"); break;
        }

        terminal.availableFuncs = items;
    };

    return {
        buildAvailableFunctions,
    };
};

export default createCommandRegistry;
