import ChordTheory from "../../domain/theory/chord-theory";
import TonalityTheory from "../../domain/theory/tonality-theory";
import type SettingsState from "../../store/state/settings-state";

namespace DegreeBasis {
    const getBasisTonality = (
        tonality: TonalityTheory.Tonality,
        basis: SettingsState.DegreeBasis,
    ): TonalityTheory.Tonality => {
        if (basis !== "relative-major" || tonality.scale !== "minor") {
            return tonality;
        }

        return {
            key12: (tonality.key12 + 3) % 12,
            scale: "major",
        };
    };

    const convertDegreeKey = (
        degree: ChordTheory.DegreeKey,
        fromKey12: number,
        toKey12: number,
    ): ChordTheory.DegreeKey => {
        const absoluteKey12 = (fromKey12 + ChordTheory.getDegree12Index(degree)) % 12;
        const degree12Index = (12 + absoluteKey12 - toKey12) % 12;
        return ChordTheory.getDegree12Props(degree12Index, degree.semitone === -1);
    };

    const convertDegreeChord = (
        degree: ChordTheory.DegreeChord,
        fromKey12: number,
        toKey12: number,
    ): ChordTheory.DegreeChord => {
        const root = convertDegreeKey(degree, fromKey12, toKey12);
        return {
            ...root,
            symbol: degree.symbol,
            on: degree.on == undefined
                ? undefined
                : convertDegreeKey(degree.on, fromKey12, toKey12),
        };
    };

    export const getDisplayTonality = getBasisTonality;

    export const toDisplayDegree = (
        degree: ChordTheory.DegreeChord,
        tonality: TonalityTheory.Tonality,
        basis: SettingsState.DegreeBasis,
    ): ChordTheory.DegreeChord => {
        const displayTonality = getBasisTonality(tonality, basis);
        return convertDegreeChord(degree, tonality.key12, displayTonality.key12);
    };

    export const toStoredDegree = (
        degree: ChordTheory.DegreeChord,
        tonality: TonalityTheory.Tonality,
        basis: SettingsState.DegreeBasis,
    ): ChordTheory.DegreeChord => {
        const displayTonality = getBasisTonality(tonality, basis);
        return convertDegreeChord(degree, displayTonality.key12, tonality.key12);
    };

    export const getScaleDegreeLabel = (
        pitch: number,
        tonality: TonalityTheory.Tonality,
        basis: SettingsState.DegreeBasis,
    ) => {
        const displayTonality = getBasisTonality(tonality, basis);
        const scaleIndex = (12 + pitch - displayTonality.key12) % 12;
        return TonalityTheory.getScaleDegreeLabel(scaleIndex);
    };
}

export default DegreeBasis;
