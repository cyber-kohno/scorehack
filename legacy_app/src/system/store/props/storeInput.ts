namespace StoreInput {

    export type Props = {
        holdE: boolean;
        holdD: boolean;
        holdF: boolean;
        holdC: boolean;
        holdX: boolean;
        holdG: boolean;
        holdShift: boolean;
        holdCtrl: boolean;
    };

    export const INITIAL: Props = {
        holdE: false,
        holdD: false,
        holdF: false,
        holdC: false,
        holdX: false,
        holdG: false,
        holdShift: false,
        holdCtrl: false,
    };

    export type Callbacks = {
        [K in keyof Props]?: () => void;
    };
}
export default StoreInput;