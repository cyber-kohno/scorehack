// Match the displayId returned by the MCP adapter. Use the full ID for requests.
export const getMcpDisplayId = (sessionId: string): string => sessionId.slice(0, 8);
