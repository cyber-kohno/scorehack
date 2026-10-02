import { get } from "svelte/store";
import TauriMcp from "../../infra/tauri/mcp";
import { fileStore, mcpStore } from "../../store/global-store";
import handleMcpRequest from "./mcp-tool-handler";

namespace McpSessionController {
    let unlisten: (() => void) | null = null;
    let unsubscribeDirty: (() => void) | null = null;
    let dirtyQueue = Promise.resolve();

    export const initialize = async (): Promise<void> => {
        // A WebView reload must not leave the previous session advertised.
        await TauriMcp.stopSession();
        mcpStore.set({ status: "stopped", details: null });
        unlisten?.();
        unlisten = await TauriMcp.onRequest((request) => {
            void TauriMcp.respond(handleMcpRequest(request)).catch((error) => {
                console.error("Failed to respond to MCP request:", error);
            });
        });
        unsubscribeDirty?.();
        unsubscribeDirty = fileStore.subscribe((file) => {
            if (get(mcpStore).status !== "available") return;
            dirtyQueue = dirtyQueue.then(() => TauriMcp.updateSessionDirty(file.isDirty)).catch((error) => {
                console.error("Failed to update MCP dirty state:", error);
            });
        });
    };

    export const start = async (): Promise<string | string[]> => {
        const current = get(mcpStore);
        if (current.status === "available") return "MCP session is already available.";
        if (current.status !== "stopped" && current.status !== "error") return "MCP session is busy.";
        mcpStore.set({ status: "starting", details: null });
        try {
            if (current.status === "error") await TauriMcp.stopSession();
            const file = get(fileStore);
            const details = await TauriMcp.startSession({
                projectDisplayName: file.score?.name ?? "Untitled score",
                dirty: file.isDirty,
            });
            await TauriMcp.probeSession();
            mcpStore.set({ status: "available", details });
            if (get(fileStore).isDirty !== file.isDirty) {
                await TauriMcp.updateSessionDirty(get(fileStore).isDirty);
            }
            return [
                "MCP session started.",
                `Session ID: ${details.sessionId}`,
                `Endpoint: ${details.endpoint}`,
                `PID: ${details.pid}`,
            ];
        } catch (error) {
            await TauriMcp.stopSession().catch(() => undefined);
            mcpStore.set({ status: "error", details: null });
            throw error;
        }
    };

    export const stop = async (): Promise<string> => {
        if (get(mcpStore).status === "stopped") return "MCP session is not running.";
        mcpStore.update((state) => ({ ...state, status: "stopping" }));
        try {
            await TauriMcp.stopSession();
            mcpStore.set({ status: "stopped", details: null });
            return "MCP session stopped.";
        } catch (error) {
            mcpStore.update((state) => ({ ...state, status: "error" }));
            throw error;
        }
    };

    export const status = async (): Promise<string> => {
        const state = get(mcpStore);
        if (state.status === "available") {
            try {
                await TauriMcp.probeSession();
            } catch (error) {
                mcpStore.update((current) => ({ ...current, status: "error" }));
                throw error;
            }
        }
        if (state.details == null) return `MCP status: ${state.status}.`;
        return `MCP status: ${state.status}; session ID: ${state.details.sessionId}; endpoint: ${state.details.endpoint}; PID: ${state.details.pid}`;
    };

    export const dispose = (): void => {
        unsubscribeDirty?.();
        unsubscribeDirty = null;
        unlisten?.();
        unlisten = null;
        void TauriMcp.stopSession().catch((error) => console.error("Failed to stop MCP session:", error));
    };
}

export default McpSessionController;
