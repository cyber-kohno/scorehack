import Layout from "../const/layout";
import type StoreInput from "../store/props/storeInput";
import StoreMelody from "../store/props/storeMelody";
import StorePreview from "../store/props/storePreview";
import useReducerCache from "../store/reducer/reducerCache";
import useReducerMelody from "../store/reducer/reducerMelody";
import useReducerOutline from "../store/reducer/reducerOutline";
import useReducerRef from "../store/reducer/reducerRef";
import type { StoreUtil } from "../store/store";
import MusicTheory from "../util/musicTheory";
import PreviewUtil from "../util/preview/previewUtil";

const useInputMelody = (storeUtil: StoreUtil) => {
    const { lastStore, commit } = storeUtil;

    const { adjustGridScrollYFromCursor, adjustGridScrollXFromNote, adjustOutlineScroll } = useReducerRef(lastStore);
    const reducerOutline = useReducerOutline(lastStore);
    const reducerCache = useReducerCache(lastStore);
    const reducerMelody = useReducerMelody(lastStore);
    // const { isPreview } = useAccessorPreview(lastStore);

    const { startTest, stopTest } = PreviewUtil.useUpdater(storeUtil);

    const melody = lastStore.control.melody;
    const playSF = (pitchIndex: number) => {
        const track = lastStore.data.scoreTracks[melody.trackIndex] as StoreMelody.ScoreTrack;
        if (track.soundFont === '') return;
        const sfName = StorePreview.validateSFName(track.soundFont);
        const sf = lastStore.preview.sfItems.find(item => item.instrumentName === sfName);
        if (sf == undefined || sf.player == undefined) return;
        sf.player.stop();
        const soundName = MusicTheory.getKey12FullName(pitchIndex);
        sf.player.play(soundName, 0, { gain: 5, duration: 0.5 });
    }

    const isCursor = () => melody.focus === -1;
    const getFocusNote = () => {
        const notes = reducerMelody.getCurrScoreTrack().notes;
        return notes[melody.focus];
    }

    const movePitch = (note: StoreMelody.Note, dir: number) => {
        const max = Layout.pitch.NUM - 1;
        let temp = note.pitch + dir;
        if (temp < 0) temp = 0;
        if (temp > max) temp = max;
        note.pitch = temp;
        playSF(note.pitch);
        adjustGridScrollYFromCursor(note);
        commit();
    }

    const notes = reducerMelody.getCurrScoreTrack().notes;
    const moveFocus = (dir: -1 | 1) => {
        const prev = getFocusNote();
        const temp = melody.focus + dir;
        if (temp < 0 || temp > notes.length - 1) return;
        melody.focus = temp;
        const note = getFocusNote();
        StoreMelody.normalize(prev);
        reducerOutline.syncChordSeqFromNote(note);
        adjustGridScrollXFromNote(note);
        adjustGridScrollYFromCursor(note);
    }

    const isPreview = lastStore.preview.timerKeys != null;

    const control = (eventKey: string) => {
        const cursor = melody.cursor;
        // const getFocusNote = () => notes[melody.focus];

        const changeCursorDiv = (div: number) => {
            const prev = cursor.norm.div;
            const rate = div / prev;
            cursor.norm.div = div;
            cursor.norm.tuplets = undefined;
            cursor.pos = Math.floor(cursor.pos * rate);

            reducerMelody.judgeOverlap();
            commit();
        }

        if (isPreview) {

            switch (eventKey) {
                case ' ': stopTest();
            }

            return;
        }

        switch (eventKey) {
            case ' ': startTest({ target: 'all' });
        }
        if (isCursor()) {
            const moveCursor = (dir: -1 | 1) => {
                const temp = cursor.pos + dir;
                const [tempPos, tempLen] = [temp, cursor.len].map(size => StoreMelody.calcBeat(cursor.norm, size));
                const tailBeatNote = reducerCache.getBeatNoteTail();
                if (tempPos < 0 || tempPos + tempLen > tailBeatNote) return;
                cursor.pos = temp;
                adjustGridScrollXFromNote(cursor);
                reducerOutline.syncChordSeqFromNote(cursor);
                adjustOutlineScroll();
                reducerMelody.judgeOverlap();
                commit();
            }
            switch (eventKey) {
                case 'ArrowLeft': moveCursor(-1); break;
                case 'ArrowRight': moveCursor(1); break;
                case '1': { changeCursorDiv(4); } break;
                case '2': { changeCursorDiv(2); } break;
                case '3': { changeCursorDiv(1); } break;
                case 'ArrowUp': movePitch(cursor, 1); break;
                case 'ArrowDown': movePitch(cursor, -1); break;

                case 'a': {
                    if (!melody.isOverlap) {
                        reducerMelody.addNoteFromCursor();
                        // reducerMelody.judgeOverlap();
                        reducerMelody.focusInNearNote(1);
                        playSF(getFocusNote().pitch);
                        commit();
                    }
                } break;
            }
        } else {
            const changeFocusNoteDiv = (div: number) => {
                const note = getFocusNote();
                const prev = note.norm.div;
                const rate = div / prev;
                const tempPos = note.pos * rate;
                const tempLen = note.len * rate;
                if (!Number.isInteger(tempPos) || !Number.isInteger(tempLen)) return;
                note.norm.div = div;
                note.pos = tempPos;
                note.len = tempLen;
                commit();
            }

            const moveFocusNormal = (dir: -1 | 1) => {
                moveFocus(dir);
                melody.focusLock = -1;
                const note = getFocusNote();
                playSF(note.pitch);
                commit();
            }

            const movePitchFocusNotes = (dir: -1 | 1) => {
                if (melody.focusLock === -1) movePitch(getFocusNote(), dir);
                else {
                    const [start, end] = reducerMelody.getFocusRange();
                    notes.slice(start, end + 1).forEach(n => {
                        n.pitch += dir;
                    });
                    adjustGridScrollYFromCursor(getFocusNote());
                    commit();
                }
            }
            switch (eventKey) {
                case 'ArrowLeft': moveFocusNormal(-1); break;
                case 'ArrowRight': moveFocusNormal(1); break;
                case 'ArrowUp': movePitchFocusNotes(1); break;
                case 'ArrowDown': movePitchFocusNotes(-1); break;
                case 'Delete': {
                    const [start, end] = reducerMelody.getFocusRange();
                    reducerMelody.focusOutNoteSide(notes[start], -1);
                    notes.splice(start, end - start + 1);
                    melody.isOverlap = false;
                    melody.focusLock = -1;
                    commit();
                } break;
                case 'a': {
                    const tempNote: StoreMelody.Note = JSON.parse(JSON.stringify(getFocusNote()));
                    tempNote.pos += tempNote.len;
                    tempNote.len = 1;
                    if (!notes.find(n => StoreMelody.judgeOverlapNotes(n, tempNote))) {
                        reducerMelody.addNote(tempNote);
                        StoreMelody.normalize(getFocusNote());
                        melody.focus++;

                        const note = getFocusNote();
                        reducerOutline.syncChordSeqFromNote(note);
                        adjustGridScrollXFromNote(note);
                        playSF(note.pitch);
                        commit();
                    }
                } break;
                case '1': { changeFocusNoteDiv(4); } break;
                case '2': { changeFocusNoteDiv(2); } break;
                case '3': { changeFocusNoteDiv(1); } break;
            }
        }
    }

    const getHoldCallbacks = (eventKey: string): StoreInput.Callbacks => {
        const callbacks: StoreInput.Callbacks = {};
        const cursor = melody.cursor;
        const notes = reducerMelody.getCurrScoreTrack().notes;
        /**
         * lenの単位、長さ（pos）分だけ、ノーツ（n）を移動する
         * @param n 移動対象のノーツ
         * @param len 移動する長さ
         */
        const moveLen = (n: StoreMelody.Note, len: StoreMelody.Note) => {
            const dir = len.pos;
            if (n.norm.div >= len.norm.div) {
                const tuplets = n.norm.tuplets ?? 1;
                const rate = (n.norm.div * tuplets) / len.norm.div;
                n.pos += (dir * rate);
            } else {
                const rate = len.norm.div / n.norm.div;
                n.norm.div = len.norm.div;
                n.pos *= rate;
                n.len *= rate;
                n.pos += dir;
            }
        }

        const sortTrackNotes = (track: StoreMelody.ScoreTrack) => {
            track.notes.sort((a, b) => {
                const [aX, bX] = [a, b].map(n => StoreMelody.calcBeatSide(n).pos);
                return aX - bX;
            });
        }

        // プレビュー中は処理しない。
        // if (isPreview()) return callbacks;

        callbacks.holdX = () => {

            if (isCursor()) {
                switch (eventKey) {
                    case 'ArrowUp': movePitch(cursor, 12); break;
                    case 'ArrowDown': movePitch(cursor, -12); break;
                }
            } else {
                if (melody.focusLock === -1) {
                    switch (eventKey) {
                        case 'ArrowUp': movePitch(getFocusNote(), 12); break;
                        case 'ArrowDown': movePitch(getFocusNote(), -12); break;
                    }
                } else {
                    const movePitchRange = (dir: number) => {
                        const [start, end] = reducerMelody.getFocusRange();
                        const targets = notes.slice(start, end + 1);
                        if (targets.find(n => !StoreMelody.validatePitch(n.pitch)) != undefined) return;

                        targets.forEach(n => n.pitch += dir);
                        adjustGridScrollYFromCursor(getFocusNote());
                        commit();
                    }
                    switch (eventKey) {
                        case 'ArrowUp': movePitchRange(12); break;
                        case 'ArrowDown': movePitchRange(-12); break;
                    }
                }
            }
        }
        callbacks.holdE = () => {

            const focusInNearNote = (dir: -1 | 1) => {
                reducerMelody.focusInNearNote(dir);
                commit();
            }
            const focusOutNoteSide = (dir: -1 | 1) => {
                reducerMelody.focusOutNoteSide(getFocusNote(), dir);
                melody.focusLock = -1;
                commit();
            }

            if (isCursor()) {
                switch (eventKey) {
                    case 'ArrowLeft': focusInNearNote(-1); break;
                    case 'ArrowRight': focusInNearNote(1); break;
                }
            } else {
                switch (eventKey) {
                    case 'ArrowLeft': focusOutNoteSide(-1); break;
                    case 'ArrowRight': focusOutNoteSide(1); break;
                    case 'Delete': {
                        const focus = melody.focus;
                        if (focus >= 1) {
                            notes.splice(focus, 1);
                            melody.focus--;
                            commit();
                        }
                    }
                }
            }
        }
        callbacks.holdF = () => {

            if (!isCursor()) {
                const notes = reducerMelody.getCurrScoreTrack().notes;

                /**
                 * ノーツの長さを変更する
                 */
                const scaleNote = (note: StoreMelody.Note, dir: -1 | 1) => {
                    if (melody.focusLock !== -1) return;
                    const temp: StoreMelody.Note = JSON.parse(JSON.stringify(note));
                    temp.len += dir;
                    if (temp.len === 0) return;
                    const vNotes = notes.slice();
                    vNotes.splice(melody.focus, 1);
                    const matchNode = vNotes.find(n => StoreMelody.judgeOverlapNotes(n, temp));
                    if (matchNode != undefined) return;
                    note.len = temp.len;
                    adjustGridScrollXFromNote(note);
                    commit();
                }
                switch (eventKey) {
                    case 'ArrowLeft': scaleNote(getFocusNote(), -1); break;
                    case 'ArrowRight': scaleNote(getFocusNote(), 1); break;
                }
            }
        }
        callbacks.holdD = () => {

            if (!isCursor()) {

                if (melody.focusLock === -1) {
                    const moveNote = (dir: -1 | 1) => {
                        const note = getFocusNote();
                        const temp: StoreMelody.Note = JSON.parse(JSON.stringify(note));
                        temp.pos += dir;
                        const vNotes = notes.slice();
                        vNotes.splice(melody.focus, 1);
                        const matchNode = vNotes.find(n => StoreMelody.judgeOverlapNotes(n, temp));
                        if (matchNode != undefined) return;
                        note.pos = temp.pos;
                        reducerOutline.syncChordSeqFromNote(note);
                        adjustGridScrollXFromNote(note);
                        adjustOutlineScroll();
                        commit();
                    }
                    switch (eventKey) {
                        case 'ArrowLeft': moveNote(-1); break;
                        case 'ArrowRight': moveNote(1); break;
                    }
                } else {
                    const moveRangeNotes = (dir: 1 | -1) => {

                        const range = reducerMelody.getFocusRange();
                        const [start, end] = range;

                        const criteria = getFocusNote();

                        // 基準が連符の場合移動しない
                        if (criteria.norm.tuplets != undefined) return;

                        const move = (n: StoreMelody.Note) => {
                            const criteria = getFocusNote();
                            moveLen(n, { ...criteria, pos: dir });
                        }

                        const clone = (index: number) => JSON.parse(JSON.stringify(notes[index])) as StoreMelody.Note;
                        const temp = clone(dir === -1 ? start : end);
                        move(temp);

                        // 移動可否チェック
                        if (dir === -1) {
                            if (temp.pos < 0) return;
                            if (start > 0) {
                                const leftNoteSide = StoreMelody.calcBeatSide(notes[start - 1]);
                                const leftNoteRight = leftNoteSide.pos + leftNoteSide.len;
                                const tempNoteLeft = StoreMelody.calcBeatSide(temp).pos;
                                // console.log(temp.pos);
                                if (tempNoteLeft < leftNoteRight) return;
                            }
                        } else if (dir === 1) {
                            const side = StoreMelody.calcBeatSide(temp);
                            const tempRight = side.pos + side.len;
                            const baseTail = reducerCache.getBeatNoteTail();
                            if (tempRight > baseTail) return;

                            if (end < notes.length - 1) {
                                // console.log(`tempRight:${tempRight}, baseTail:${baseTail}`);
                                const rightNoteLeft = StoreMelody.calcBeatSide(notes[end + 1]).pos;
                                const tempNoteSide = StoreMelody.calcBeatSide(temp);
                                const tempNoteRight = tempNoteSide.pos + tempNoteSide.len;
                                if (tempNoteRight > rightNoteLeft) return;
                            }
                        }

                        // カーソルの単位と違う連符がある場合、移動できない
                        if (notes.slice(start, end + 1).find(n => {
                            const tuplets = n.norm.tuplets;
                            if (n.norm.div !== criteria.norm.div && tuplets != undefined) {
                                if (n.pos % tuplets !== 0) return true;
                            }
                            return false;
                        }) != undefined) return;


                        // 全てのノートを移動する
                        notes.slice(start, end + 1).forEach((n, i) => {
                            move(n);
                            // フォーカスノート以外はノーマライズする
                            if (melody.focus !== start + i) StoreMelody.normalize(n);
                        });
                        reducerOutline.syncChordSeqFromNote(criteria);
                        adjustGridScrollXFromNote(criteria);
                        adjustOutlineScroll();
                        commit();
                    }
                    switch (eventKey) {
                        case 'ArrowLeft': moveRangeNotes(-1); break;
                        case 'ArrowRight': moveRangeNotes(1); break;
                    }
                }
            } else {

                const moveSpace = (dir: 1 | -1) => {

                    // カーソルが連符である場合、移動できない。
                    if (cursor.norm.tuplets != undefined) return;

                    /** カーソルよりも右にあるノーツのインデックスを取得 */
                    const startIndex = notes.findIndex(n => {
                        const cur = StoreMelody.calcBeatSide(cursor).pos;
                        const t = StoreMelody.calcBeatSide(n).pos;
                        return cur <= t;
                    });

                    if (startIndex === -1) return;

                    const clone = (index: number) => JSON.parse(JSON.stringify(notes[index])) as StoreMelody.Note;
                    const temp = clone(dir === -1 ? startIndex : notes.length - 1);

                    const move = (n: StoreMelody.Note) => {
                        if (n.norm.div >= cursor.norm.div) {
                            const tuplets = n.norm.tuplets ?? 1;
                            const rate = (n.norm.div * tuplets) / cursor.norm.div;
                            n.pos += (dir * rate);
                        } else {
                            const rate = cursor.norm.div / n.norm.div;
                            n.norm.div = cursor.norm.div;
                            n.pos *= rate;
                            n.len *= rate;
                            n.pos += dir;
                        }
                    }
                    move(temp);

                    // 空間を縮める場合は、カーソルより左に超えないかチェックする
                    if (dir === -1) {
                        const cur = StoreMelody.calcBeatSide(cursor).pos;
                        const t = StoreMelody.calcBeatSide(temp).pos;
                        if (cur > t) return;
                    } else {
                        const baseTail = reducerCache.getBeatNoteTail();
                        // const notes = reducerMelody.getCurrScoreTrack().notes;
                        const tailNoteSide = StoreMelody.calcBeatSide(temp);
                        const tailNoteRight = tailNoteSide.pos + tailNoteSide.len;
                        // console.log(`tailNoteRight:${tailNoteRight}, baseTail:${baseTail}`);
                        if (tailNoteRight > baseTail) return;
                    }
                    // カーソルの単位と違う連符がある場合、移動できない
                    if (notes.slice(startIndex).find(n => {
                        const tuplets = n.norm.tuplets;
                        if (n.norm.div !== cursor.norm.div && tuplets != undefined) {
                            if (n.pos % tuplets !== 0) return true;
                        }
                        return false;
                    }) != undefined) return;

                    // 全てのノートを移動する
                    notes.slice(startIndex).forEach(n => {
                        move(n);
                        StoreMelody.normalize(n);
                    });
                    commit();
                }
                switch (eventKey) {
                    case 'ArrowLeft': moveSpace(-1); break;
                    case 'ArrowRight': moveSpace(1); break;
                }
            }
        }
        callbacks.holdC = () => {
            const { getCurBase } = reducerCache;
            const tonality = getCurBase().scoreBase.tonality;

            const movePitchLockScale = (note: StoreMelody.Note, dir: -1 | 1) => {
                const max = Layout.pitch.NUM - 1;
                let temp = note.pitch;
                while (true) {
                    temp += dir;
                    const isScale = MusicTheory.isScale(temp, tonality);
                    if (isScale) break;
                }
                // console.log(temp);
                if (temp < 0) temp = 0;
                if (temp > max) temp = max;
                note.pitch = temp;
                playSF(note.pitch);
                adjustGridScrollYFromCursor(note);
                commit();
            }
            if (isCursor()) {
                switch (eventKey) {
                    case 'ArrowUp': movePitchLockScale(cursor, 1); break;
                    case 'ArrowDown': movePitchLockScale(cursor, -1); break;
                }
            } else {
                if (melody.focusLock === -1) {
                    switch (eventKey) {
                        case 'ArrowUp': movePitchLockScale(getFocusNote(), 1); break;
                        case 'ArrowDown': movePitchLockScale(getFocusNote(), -1); break;
                    }
                } else {
                    const movePitchLockScaleRange = (dir: -1 | 1) => {
                        const [start, end] = reducerMelody.getFocusRange();
                        const targets = notes.slice(start, end + 1);

                        const getMovedPitch = (pitchIndex: number) => {
                            while (true) {
                                pitchIndex += dir;
                                const isScale = MusicTheory.isScale(pitchIndex, tonality);
                                if (isScale) break;
                            }
                            return pitchIndex;
                        }
                        if (targets.find(n => !StoreMelody.validatePitch(getMovedPitch(n.pitch))) != undefined) return;

                        targets.forEach(n => n.pitch = getMovedPitch(n.pitch));
                        adjustGridScrollYFromCursor(getFocusNote());
                        commit();
                    }
                    switch (eventKey) {
                        case 'ArrowUp': movePitchLockScaleRange(1); break;
                        case 'ArrowDown': movePitchLockScaleRange(-1); break;
                    }
                }
            }
        }
        callbacks.holdShift = () => {

            const changeCursorTuplets = (tuplets: number) => {
                if (![1, 2].includes(cursor.norm.div)) return;
                const prev = cursor.norm.tuplets ?? 1;
                if (prev === tuplets) tuplets = 1;
                const rate = tuplets / prev;
                cursor.norm.tuplets = tuplets;
                cursor.pos = Math.floor(cursor.pos * rate);

                if (cursor.norm.tuplets === 1) cursor.norm.tuplets = undefined;
                reducerMelody.judgeOverlap();
                commit();
            }
            if (isCursor()) {
                switch (eventKey) {
                    case '#': changeCursorTuplets(3); break;
                }
            } else {
                const moveFocusRange = (dir: -1 | 1) => {
                    if (melody.focusLock === -1) melody.focusLock = melody.focus;
                    moveFocus(dir);
                    commit();
                }
                switch (eventKey) {
                    case 'ArrowLeft': moveFocusRange(-1); break;
                    case 'ArrowRight': moveFocusRange(1); break;
                }
            }
        }

        callbacks.holdCtrl = () => {
            const track = reducerMelody.getCurrScoreTrack();

            const getRangeProps = () => {
                let start = melody.focus;
                let cnt = 1;
                if (melody.focusLock !== -1) {
                    start = melody.focus <= melody.focusLock ? melody.focus : melody.focusLock;
                    cnt = Math.abs(melody.focus - melody.focusLock) + 1;
                }
                return [start, cnt];
            }
            const copyNotes = () => {
                const [start, cnt] = getRangeProps();
                const notes = track.notes.filter((_, i) => {
                    return i >= start && i < start + cnt;
                });
                melody.clipboard.notes = JSON.parse(JSON.stringify(notes));
            }

            switch (eventKey) {
                case 'a': {
                    // timeline.focus = 0;
                    // timeline.focusLock = layer.notes.length - 1;
                    // update();
                } break;
                case 'c': {
                    copyNotes();
                    melody.focusLock = -1;
                    commit();
                } break;
                // case 'x': {
                //     copyNotes();
                //     delRangeNotes(timeline);
                //     melody.focusLock = -1;
                //     commit();
                // } break;
                case 'v': {

                    const clipNotes = melody.clipboard.notes;
                    // フォーカスしていない時のみ利用可能
                    if (clipNotes != null && melody.focus === -1) {
                        const criteria: StoreMelody.Note = JSON.parse(JSON.stringify(clipNotes[0]));
                        criteria.pos *= -1;
                        clipNotes.forEach(n => {
                            moveLen(n, criteria);
                            moveLen(n, cursor);
                            track.notes.push(n);
                        });
                        sortTrackNotes(track);
                        // ペースト後、ペーストしたノーツ群を範囲選択した状態にする
                        const focusIndex = track.notes.findIndex(n => n == clipNotes[0]);
                        melody.focus = focusIndex;
                        melody.focusLock = focusIndex + clipNotes.length - 1;
                        melody.clipboard.notes = null;
                        commit();
                    }
                } break;
            }
        }
        return callbacks;
    }

    return {
        control,
        getHoldCallbacks
    };
}
export default useInputMelody;