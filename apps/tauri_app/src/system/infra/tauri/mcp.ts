import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import type { McpBridgeRequest, McpBridgeResponse, McpSessionDetails } from "../../service/mcp/mcp-types";

namespace TauriMcp {
    export const startSession = (request: { projectDisplayName: string; dirty: boolean }): Promise<McpSessionDetails> =>
        invoke("mcp_start_session", { request });

    export const stopSession = (): Promise<void> => invoke("mcp_stop_session");

    export const probeSession = (): Promise<unknown> => invoke("mcp_probe_session");

    export const updateSessionDirty = (dirty: boolean): Promise<void> =>
        invoke("mcp_update_session_dirty", { dirty });

    export const respond = (response: McpBridgeResponse): Promise<void> =>
        invoke("mcp_respond", { response });

    export const onRequest = (handler: (request: McpBridgeRequest) => void): Promise<() => void> =>
        listen<McpBridgeRequest>("scorehack://mcp/request", (event) => handler(event.payload));
}

export default TauriMcp;
