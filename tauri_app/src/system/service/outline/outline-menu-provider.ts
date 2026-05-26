import { get } from "svelte/store";
import createOutlineActions from "../../actions/outline/outline-actions";
import ChordTheory from "../../domain/theory/chord-theory";
import RhythmTheory from "../../domain/theory/rhythm-theory";
import TonalityTheory from "../../domain/theory/tonality-theory";
import DegreeBasis from "../notation/degree-basis";
import { controlStore, dataStore, derivedStore, settingsStore } from "../../store/global-store";
import ActionMenuState from "../../store/state/action-menu-state";
import ElementState from "../../store/state/data/element-state";

namespace OutlineMenuProvider {
    const labelCurrent = (label: string, isCurrent: boolean) => {
        return `${isCurrent ? "*" : ""}${label}`;
    };

    const formatFeelLabel = (feel: RhythmTheory.RhythmFeel) => {
        return feel.type === "straight" ? "straight" : `swing ${feel.target}`;
    };

    const createInsertChildren = (
        outlineActions: ReturnType<typeof createOutlineActions>,
    ): ActionMenuState.Item[] => {
        const { action, parent } = ActionMenuState.createFactory();
        return [
            action("Chord", outlineActions.insertChord),
            action("Section", outlineActions.insertSection),
            parent("Event", [
                action("Modulation", outlineActions.insertEventMod),
                action("Tempo Change", outlineActions.insertEventTempo),
                action("Rhythm Change", outlineActions.insertEventRhythm),
            ]),
        ];
    };

    const createChordDeleteItems = (
        outlineActions: ReturnType<typeof createOutlineActions>,
    ): ActionMenuState.Item[] => {
        const { action } = ActionMenuState.createFactory();
        return [
            action("Block", outlineActions.removeFocusElement, "danger"),
            action("Chord", outlineActions.deleteChord, "danger"),
            action("Arrange", outlineActions.removeBacking, "danger"),
        ];
    };

    const createChordEditChildren = (
        chordData: ElementState.DataChord,
        outlineActions: ReturnType<typeof createOutlineActions>,
    ): ActionMenuState.Item[] => {
        const { action, parent } = ActionMenuState.createFactory();
        const derived = get(derivedStore);
        const settings = get(settingsStore);
        const isSameDegreeKey = (
            left: ChordTheory.DegreeKey | undefined,
            right: ChordTheory.DegreeKey | undefined,
        ) => {
            if (left == undefined || right == undefined) return left == undefined && right == undefined;
            return left?.index === right.index && left.semitone === right.semitone;
        };
        const isSameDegreeChord = (
            left: ChordTheory.DegreeChord | undefined,
            right: ChordTheory.DegreeChord,
        ) => {
            return isSameDegreeKey(left, right) &&
                left?.symbol === right.symbol &&
                isSameDegreeKey(left.on, right.on);
        };
        const tonality = derived.baseCaches[derived.elementCaches[get(controlStore).outline.focus].baseSeq].scoreBase.tonality;
        const displayTonality = DegreeBasis.getDisplayTonality(tonality, settings.notation.degreeBasis);
        const diatonicItems = [0, 1, 2, 3, 4, 5, 6].map(scaleIndex => {
            const displayDegree = ChordTheory.getDiatonicDegreeChord(displayTonality.scale, scaleIndex);
            const storedDegree = DegreeBasis.toStoredDegree(displayDegree, tonality, settings.notation.degreeBasis);
            return action(
                labelCurrent(
                    ChordTheory.getDegreeChordName(displayDegree),
                    isSameDegreeChord(chordData.degree, storedDegree),
                ),
                () => outlineActions.setDegree(scaleIndex),
                { keepOpen: true },
            );
        });
        const rootItems = [
            ChordTheory.DEGREE12_SHARP_LIST[0],
            ChordTheory.DEGREE12_SHARP_LIST[1],
            ChordTheory.DEGREE12_FLAT_LIST[1],
            ChordTheory.DEGREE12_SHARP_LIST[2],
            ChordTheory.DEGREE12_SHARP_LIST[3],
            ChordTheory.DEGREE12_FLAT_LIST[3],
            ChordTheory.DEGREE12_SHARP_LIST[4],
            ChordTheory.DEGREE12_SHARP_LIST[5],
            ChordTheory.DEGREE12_SHARP_LIST[6],
            ChordTheory.DEGREE12_FLAT_LIST[6],
            ChordTheory.DEGREE12_SHARP_LIST[7],
            ChordTheory.DEGREE12_SHARP_LIST[8],
            ChordTheory.DEGREE12_FLAT_LIST[8],
            ChordTheory.DEGREE12_SHARP_LIST[9],
            ChordTheory.DEGREE12_SHARP_LIST[10],
            ChordTheory.DEGREE12_FLAT_LIST[10],
            ChordTheory.DEGREE12_SHARP_LIST[11],
        ];
        const eatItems = [
            { label: "-1/8", value: -2 },
            { label: "-1/16", value: -1 },
            { label: "none", value: 0 },
            { label: "+1/16", value: 1 },
            { label: "+1/8", value: 2 },
        ];
        const symbolItems = ChordTheory.SymbolTable.map((symbols, index) =>
            parent(
                labelCurrent(
                    `${index + 3} tones`,
                    chordData.degree != undefined && symbols.includes(chordData.degree.symbol),
                ),
                symbols.map(symbol =>
                    action(
                        labelCurrent(symbol === "" ? "(none)" : symbol, symbol === chordData.degree?.symbol),
                        () => outlineActions.setChordSymbol(symbol),
                        { keepOpen: true },
                    )
                ),
            )
        );

        return [
            parent("Diatonic", diatonicItems),
            parent(
                "Root",
                rootItems.map(root =>
                    action(
                        labelCurrent(
                            ChordTheory.getDegreeKeyName(root),
                            isSameDegreeKey(chordData.degree, root),
                        ),
                        () => outlineActions.setChordRoot(root),
                        { keepOpen: true },
                    )
                ),
            ),
            parent(
                "On",
                [
                    action(
                        labelCurrent("none", chordData.degree?.on == undefined),
                        () => outlineActions.setChordOn(undefined),
                        { keepOpen: true },
                    ),
                    ...rootItems.map(root =>
                        action(
                            labelCurrent(
                                ChordTheory.getDegreeKeyName(root),
                                isSameDegreeKey(chordData.degree?.on, root),
                            ),
                            () => outlineActions.setChordOn(root),
                            { keepOpen: true },
                        )
                    ),
                ],
            ),
            parent("Symbol", symbolItems),
            parent(
                "Beat",
                [1, 2, 3, 4].map(beat =>
                    action(
                        labelCurrent(`${beat}`, beat === chordData.beat),
                        () => outlineActions.setChordBeat(beat),
                        { keepOpen: true },
                    )
                ),
            ),
            parent(
                "Eat",
                eatItems.map(item =>
                    action(
                        labelCurrent(item.label, item.value === chordData.eat),
                        () => outlineActions.setChordEat(item.value),
                        { keepOpen: true },
                    )
                ),
            ),
        ];
    };

    const createInitEditChildren = (
        initData: ElementState.DataInit,
        outlineActions: ReturnType<typeof createOutlineActions>,
    ): ActionMenuState.Item[] => {
        const { action, parent } = ActionMenuState.createFactory();
        const currentKey = initData.tonality.key12;
        const currentScale = initData.tonality.scale;
        const currentTS = RhythmTheory.formatTS(initData.rhythm.ts);
        const currentFeel = initData.rhythm.feel;

        return [
            parent(
                "Key",
                (currentScale === "major"
                    ? TonalityTheory.KEY12_MAJOR_SCALE_LIST
                    : TonalityTheory.KEY12_MINOR_SCALE_LIST
                ).map((keyName, key12) =>
                    action(
                        labelCurrent(keyName, key12 === currentKey),
                        () => outlineActions.setInitKey(key12),
                        { keepOpen: true },
                    )
                ),
            ),
            parent(
                "Scale",
                (["major", "minor"] as const).map(scale =>
                    action(
                        labelCurrent(scale, scale === currentScale),
                        () => outlineActions.setInitScale(scale),
                        { keepOpen: true },
                    )
                ),
            ),
            parent(
                "TimeSignature",
                RhythmTheory.getTSNames().map(tsName =>
                    action(
                        labelCurrent(tsName, tsName === currentTS),
                        () => outlineActions.setInitRhythm(tsName),
                        { keepOpen: true },
                    )
                ),
            ),
            parent(
                "Feel",
                RhythmTheory.getAvailableFeels(initData.rhythm.ts).map(feel =>
                    action(
                        labelCurrent(
                            formatFeelLabel(feel),
                            RhythmTheory.isSameFeel(feel, currentFeel),
                        ),
                        () => outlineActions.setInitFeel(feel),
                        { keepOpen: true },
                    )
                ),
            ),
            action("Tempo", outlineActions.openInitTempoInput),
        ];
    };

    const createRhythmEditChildren = (
        rhythmData: ElementState.DataRhythm,
        outlineActions: ReturnType<typeof createOutlineActions>,
    ): ActionMenuState.Item[] => {
        const { action, parent } = ActionMenuState.createFactory();
        const currentTS = RhythmTheory.formatTS(rhythmData.newRhythm.ts);
        const currentFeel = rhythmData.newRhythm.feel;

        return [
            parent(
                "TimeSignature",
                RhythmTheory.getTSNames().map(tsName =>
                    action(
                        labelCurrent(tsName, tsName === currentTS),
                        () => outlineActions.setEventTS(tsName),
                        { keepOpen: true },
                    )
                ),
            ),
            parent(
                "Feel",
                RhythmTheory.getAvailableFeels(rhythmData.newRhythm.ts).map(feel =>
                    action(
                        labelCurrent(
                            formatFeelLabel(feel),
                            RhythmTheory.isSameFeel(feel, currentFeel),
                        ),
                        () => outlineActions.setEventFeel(feel),
                        { keepOpen: true },
                    )
                ),
            ),
        ];
    };

    const createTempoEditChildren = (
        tempoData: ElementState.DataTempo,
        outlineActions: ReturnType<typeof createOutlineActions>,
    ): ActionMenuState.Item[] => {
        const { action } = ActionMenuState.createFactory();
        return ElementState.TempoMedhods.map(method =>
            action(
                labelCurrent(method, method === tempoData.method),
                () => outlineActions.openEventTempoInput(method),
            )
        );
    };

    const createModulateValueChildren = (
        modData: ElementState.DataModulate,
        method: Extract<ElementState.ModulateMedhod, "domm" | "key">,
        outlineActions: ReturnType<typeof createOutlineActions>,
    ): ActionMenuState.Item[] => {
        const { action } = ActionMenuState.createFactory();
        const values = [-3, -2, -1, 0, 1, 2, 3];
        const formatValue = (val: number) => {
            if (val === 0) return "±0";
            return val > 0 ? `+${val}` : `${val}`;
        };

        return values.map(val =>
            action(
                labelCurrent(
                    formatValue(val),
                    modData.method === method && (modData.val ?? 0) === val,
                ),
                () => outlineActions.setEventModMethodValue(method, val),
                { keepOpen: true },
            )
        );
    };

    const createModulateEditChildren = (
        modData: ElementState.DataModulate,
        outlineActions: ReturnType<typeof createOutlineActions>,
    ): ActionMenuState.Item[] => {
        const { action, parent } = ActionMenuState.createFactory();
        return [
            parent(
                labelCurrent("domm", modData.method === "domm"),
                createModulateValueChildren(modData, "domm", outlineActions),
            ),
            action(
                labelCurrent("parallel", modData.method === "parallel"),
                () => outlineActions.setEventModMethod("parallel"),
                { keepOpen: true },
            ),
            action(
                labelCurrent("relative", modData.method === "relative"),
                () => outlineActions.setEventModMethod("relative"),
                { keepOpen: true },
            ),
            parent(
                labelCurrent("key", modData.method === "key"),
                createModulateValueChildren(modData, "key", outlineActions),
            ),
        ];
    };

    export const createItems = (): ActionMenuState.Item[] => {
        const control = get(controlStore);
        const data = get(dataStore);
        const element = data.elements[control.outline.focus];
        if (element == undefined) throw new Error();

        const outlineActions = createOutlineActions();
        const { action, parent } = ActionMenuState.createFactory();

        switch (element.type) {
            case "init":
                const initData = element.data as ElementState.DataInit;
                return [
                    action("Insert Section", outlineActions.insertSection),
                    parent("Edit", createInitEditChildren(initData, outlineActions)),
                ];
            case "section":
                return [
                    action("Rename", outlineActions.openSectionNameInput),
                    parent("Insert", createInsertChildren(outlineActions)),
                    action("Delete", outlineActions.removeFocusElement),
                ];
            case "chord": {
                const chordData = element.data as ElementState.DataChord;
                const items: ActionMenuState.Item[] = [
                    parent("Insert", createInsertChildren(outlineActions)),
                    parent("Edit", createChordEditChildren(chordData, outlineActions)),
                    parent("Delete", createChordDeleteItems(outlineActions)),
                ];

                if (chordData.degree != undefined) {
                    items.push(parent("Open", [
                        action("Arrange Editor", outlineActions.openArrangeEditor),
                        action("Arrange Finder", outlineActions.openArrangeFinder),
                    ]));
                }

                return items;
            }
            case "rhythm":
                const rhythmData = element.data as ElementState.DataRhythm;
                return [
                    parent("Insert", createInsertChildren(outlineActions)),
                    parent("Edit", createRhythmEditChildren(rhythmData, outlineActions)),
                    action("Delete", outlineActions.removeFocusElement, "warning"),
                ];
            case "tempo":
                const tempoData = element.data as ElementState.DataTempo;
                return [
                    parent("Insert", createInsertChildren(outlineActions)),
                    parent("Edit", createTempoEditChildren(tempoData, outlineActions)),
                    action("Delete", outlineActions.removeFocusElement, "warning"),
                ];
            case "modulate":
                const modData = element.data as ElementState.DataModulate;
                return [
                    parent("Insert", createInsertChildren(outlineActions)),
                    parent("Edit", createModulateEditChildren(modData, outlineActions)),
                    action("Delete", outlineActions.removeFocusElement, "warning"),
                ];
            case "change":
                return [
                    parent("Insert", createInsertChildren(outlineActions)),
                    action("Delete", outlineActions.removeFocusElement, "warning"),
                ];
        }
    };
}

export default OutlineMenuProvider;
