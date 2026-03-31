import StoreMelody from "./storeMelody";
import StoreOutline from "./storeOutline";

namespace StoreControl {

    /** export defaultのエラー解消のため暫定対処 */
    // export const DUMMY = {};

    export type Props = {
        mode: "harmonize" | "melody";

        outline: StoreOutline.Props,
        melody: StoreMelody.Props;
    }

    export const INITIAL: Props = {
        mode: "harmonize",
        outline: StoreOutline.INITIAL,
        melody: StoreMelody.INITIAL
    }
}
export default StoreControl;