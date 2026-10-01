export type McpSessionStatus = "stopped" | "starting" | "available" | "stopping" | "error";

export type McpSessionDetails = {
    sessionId: string;
    endpoint: string;
    pid: number;
};

export type McpBridgeRequest = {
    id: string;
    method: string;
    params: unknown;
};

export type McpBridgeResponse = {
    id: string;
    result?: unknown;
    error?: { code: string; message: string };
};

export type McpState = {
    status: McpSessionStatus;
    details: McpSessionDetails | null;
};
