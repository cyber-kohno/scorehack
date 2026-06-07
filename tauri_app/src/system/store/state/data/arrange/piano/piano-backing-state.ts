import type MelodyState from "../../melody-state";

namespace PianoBackingState {

    export interface DataProps {
        layers: Layer[];
        recordNum: number;
    }

    export interface EditorProps extends DataProps {
        layerIndex: number;
        cursorX: number;
        cursorY: number;
    }

    export const createInitialBackingProps = (): EditorProps => {
        return {
            cursorX: -1,
            cursorY: -1,
            layerIndex: 0,
            recordNum: 0,
            layers: createInitialLayers()
        }
    }

    export type Layer = {
        cols: Col[];
        items: string[];
    }
    export type NoteItem = {
        colIndex: number;
        recordIndex: number;
        velocity: number;
        delay: number;
    };
    export type PedalState = 0 | 1 | 2;
    export interface Col extends MelodyState.Norm {
        dot?: number;
        pedal: PedalState;
    }
    export const createInitialLayers = (): Layer[] => {
        return [{ cols: [], items: [] }, { cols: [], items: [] }]
    }

    export const convRemoveOptionNotes = (items: string[]) => {
        return items.map((item) => {
            const note = convNotesInfo(item);
            return `${note.colIndex}.${note.recordIndex}`;
        });
    };

    export const convNotesInfo = (src: string): NoteItem => {
        const items = src.split(".").map((v) => Number(v));
        const [colIndex, recordIndex] = items;
        let velocity = 10;
        let delay = 0;
        if (items.length !== 2) {
            velocity = items[2];
            delay = items[3];
        }
        return { colIndex, recordIndex, velocity, delay };
    };

    export const formatNoteItem = (note: NoteItem) => {
        const base = `${note.colIndex}.${note.recordIndex}`;
        if (note.velocity === 10 && note.delay === 0) return base;
        return `${base}.${note.velocity}.${note.delay}`;
    };

    export const getDotRate = (dot?: number) => {
        switch (dot ?? 0) {
            case 0: return 1;
            case 1: return 1.5;
            case 2: return 1.75;
        }
        throw new Error(`Unsupported backing column dot. [${dot}]`);
    };

    export const getColWidthCriteriaBeatWidth = (
        col: PianoBackingState.Col,
        beatWidth: number
    ) => {
        return Math.floor((beatWidth / col.div) * getDotRate(col.dot));
    };

    export const getLayerBeatNoteLength = (cols: Col[]) => {
        return cols.reduce((total, col) => {
            return total + getDotRate(col.dot) / col.div / (col.tuplets ?? 1);
        }, 0);
    };

    export const getBeatNoteLength = (layers: Layer[]) => {
        return layers.reduce((max, layer) => {
            return Math.max(max, getLayerBeatNoteLength(layer.cols));
        }, 0);
    };

};
export default PianoBackingState;
