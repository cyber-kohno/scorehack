namespace EditorPlaybackResult {
    export type Value =
        | { ok: true }
        | { ok: false; reason: "ignored" | "inst-not-set" | "player-not-ready" };

    export const ok = (): Value => ({ ok: true });

    export const ignored = (): Value => ({ ok: false, reason: "ignored" });

    export const instNotSet = (): Value => ({ ok: false, reason: "inst-not-set" });

    export const playerNotReady = (): Value => ({ ok: false, reason: "player-not-ready" });
}

export default EditorPlaybackResult;
