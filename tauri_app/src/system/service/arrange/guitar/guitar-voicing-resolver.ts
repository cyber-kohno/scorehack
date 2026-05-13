import type ChordTheory from "../../../domain/theory/chord-theory";
import GuitarEditorState from "../../../store/state/data/arrange/guitar/guitar-editor-state";

namespace GuitarVoicingResolver {
    export type ResolveArgs = {
        structs: ChordTheory.ChordStruct[];
    };

    type Candidate = {
        frets: GuitarEditorState.StringSelection[];
        score: number;
    };

    const SPAN_MAX = 4;
    const STRING_COUNT = GuitarEditorState.STANDARD_TUNING.length;

    export const resolve = (args: ResolveArgs): GuitarEditorState.StringSelection[] => {
        const pitchClasses = getPitchClasses(args.structs);
        if (pitchClasses.length === 0) return GuitarEditorState.createMutedFrets();

        const stringCandidates = GuitarEditorState.STANDARD_TUNING.map((string) => {
            const frets: GuitarEditorState.StringSelection[] = [null];
            for (let fret = 0; fret <= GuitarEditorState.MAX_FRET; fret++) {
                const pitchClass = (string.openMidi + fret) % 12;
                if (pitchClasses.includes(pitchClass)) frets.push(fret);
            }
            return frets;
        });

        const candidates: Candidate[] = [];
        collectCandidates(stringCandidates, 0, [], pitchClasses, candidates);
        const best = candidates.sort((a, b) => b.score - a.score)[0];

        return best?.frets ?? GuitarEditorState.createMutedFrets();
    };

    const getPitchClasses = (structs: ChordTheory.ChordStruct[]) => {
        return [...new Set(structs.map((struct) => ((struct.key12 % 12) + 12) % 12))]
            .sort((a, b) => a - b);
    };

    const collectCandidates = (
        stringCandidates: GuitarEditorState.StringSelection[][],
        stringIndex: number,
        current: GuitarEditorState.StringSelection[],
        pitchClasses: number[],
        candidates: Candidate[],
    ) => {
        if (stringIndex >= STRING_COUNT) {
            const score = scoreVoicing(current, pitchClasses);
            if (score == null) return;
            candidates.push({ frets: current.slice(), score });
            return;
        }

        stringCandidates[stringIndex].forEach((fret) => {
            current.push(fret);
            collectCandidates(stringCandidates, stringIndex + 1, current, pitchClasses, candidates);
            current.pop();
        });
    };

    const scoreVoicing = (
        frets: GuitarEditorState.StringSelection[],
        pitchClasses: number[],
    ) => {
        const sounding = frets
            .map((fret, stringIndex) => fret == null ? null : {
                fret,
                stringIndex,
                pitchClass: (GuitarEditorState.STANDARD_TUNING[stringIndex].openMidi + fret) % 12,
            })
            .filter((item): item is NonNullable<typeof item> => item != null);

        if (sounding.length < Math.min(3, pitchClasses.length)) return null;

        const pressedFrets = sounding.map(item => item.fret).filter(fret => fret > 0);
        const minPressed = pressedFrets.length === 0 ? 0 : Math.min(...pressedFrets);
        const maxPressed = pressedFrets.length === 0 ? 0 : Math.max(...pressedFrets);
        const span = maxPressed - minPressed;
        if (span > SPAN_MAX) return null;

        const usedPitchClasses = [...new Set(sounding.map(item => item.pitchClass))];
        const missingCount = pitchClasses.filter(pc => !usedPitchClasses.includes(pc)).length;
        if (missingCount > Math.max(0, pitchClasses.length - 3)) return null;

        let score = 0;
        score += sounding.length * 12;
        score += usedPitchClasses.length * 18;
        score -= missingCount * 35;
        score -= span * 8;
        score -= minPressed * 3;

        const openCount = sounding.filter(item => item.fret === 0).length;
        score += openCount * 5;

        const muteCount = frets.filter(fret => fret == null).length;
        score -= muteCount * 2;

        const firstSoundingString = frets.findIndex(fret => fret != null);
        if (firstSoundingString >= 0) {
            const bassFret = frets[firstSoundingString];
            if (bassFret != null) {
                const bassPitchClass =
                    (GuitarEditorState.STANDARD_TUNING[firstSoundingString].openMidi + bassFret) % 12;
                if (bassPitchClass === pitchClasses[0]) score += 25;
                else score -= 8;
            }
        }

        score += getContiguousStringBonus(frets);
        return score;
    };

    const getContiguousStringBonus = (frets: GuitarEditorState.StringSelection[]) => {
        const first = frets.findIndex(fret => fret != null);
        if (first === -1) return 0;
        let last = first;
        frets.forEach((fret, index) => {
            if (fret != null) last = index;
        });
        const innerMutes = frets
            .slice(first, last + 1)
            .filter(fret => fret == null)
            .length;

        return (last - first + 1) * 3 - innerMutes * 12;
    };
}

export default GuitarVoicingResolver;
