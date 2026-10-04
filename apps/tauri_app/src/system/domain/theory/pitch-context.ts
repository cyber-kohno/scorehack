import ChordTheory from "./chord-theory";
import TonalityTheory from "./tonality-theory";

export const pitchClass = (pitch: number): number => ((pitch % 12) + 12) % 12;

export const describeKey = (key: TonalityTheory.Tonality) => ({
    tonicPitchClass: pitchClass(key.key12),
    mode: key.scale,
    name: TonalityTheory.getScaleName(key),
});

export const describePitchInKey = (pitch: number, key: TonalityTheory.Tonality) => {
    const semitonesAboveTonic = pitchClass(pitch - key.key12);
    const scale = key.scale === "major" ? TonalityTheory.MAJOR_SCALE_INTERVALS : TonalityTheory.MINOR_SCALE_INTERVALS;
    const scaleIndex = scale.indexOf(semitonesAboveTonic);
    const minorLabels = ["1", "2", "b3", "4", "5", "b6", "b7"];
    const alternatives: Record<number, string[]> = { 1: ["#1", "b2"], 3: ["#2", "b3"], 6: ["#4", "b5"], 8: ["#5", "b6"], 10: ["#6", "b7"] };
    return {
        semitonesAboveTonic,
        degree: key.scale === "minor" && scaleIndex >= 0 ? minorLabels[scaleIndex] : TonalityTheory.getScaleDegreeLabel(semitonesAboveTonic),
        degreeConvention: "local-tonic-major-scale" as const,
        spellingAlternatives: alternatives[semitonesAboveTonic] ?? null,
        diatonicScaleStep: scaleIndex < 0 ? null : scaleIndex + 1,
        isInScale: scaleIndex >= 0,
    };
};

export const describePitchInChord = (pitch: number, chord: ChordTheory.KeyChordProps) => {
    const semitonesAboveRoot = pitchClass(pitch - chord.key12);
    const memberRelations = ChordTheory.getSymbolProps(chord.symbol).structs.filter(
        relation => pitchClass(ChordTheory.getIntervalFromRelation(relation)) === semitonesAboveRoot,
    );
    return {
        semitonesAboveRoot,
        memberRelations,
        isChordTone: memberRelations.length > 0,
        isBassPitchClass: pitchClass(pitch) === pitchClass(chord.on?.key12 ?? chord.key12),
    };
};
