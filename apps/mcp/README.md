# Scorehack MCP adapter

`scorehack-mcp` is a local stdio MCP server. It starts independently of the Scorehack desktop app. The Tool catalog remains fixed while the app starts and stops.

Build with `cargo build --release` in this directory. Register the resulting `scorehack-mcp` executable as a local stdio MCP server in the agent client. The adapter writes only MCP messages to stdout.

## Current Tools

- `ping`: verifies the adapter without Scorehack.
- `list_scorehack_sessions`: returns active app sessions, or an empty list if none are published.
- `get_score_overview`: forwards a read-only request to one specified live session and returns the current score overview.

In Scorehack's terminal, `mcp start` publishes the current in-memory score, `mcp status` checks the session, and `mcp stop` closes it. The header shows `MCP ON` while the session is published. After starting, call `list_scorehack_sessions`, copy its `sessionId`, and call `get_score_overview` with that ID. Editing notes without saving should change the returned counts on the next call.

## App-side bridge contract

The app publishes a descriptor named `<sessionId>.json` under its local app-data directory, in `com.scorehack.desktop/mcp/sessions`. The descriptor contains `sessionId` (UUID), `pid`, `endpoint` (`http://127.0.0.1:<port>`), `token` (64 hex characters), `dirty`, and `createdAtEpochMs`. The token must stay private to the local user. Stop and app exit remove the descriptor and close the listener.

The app listens on a dynamically allocated IPv4 loopback port. `GET /health` and `POST /bridge` require `Authorization: Bearer <token>`. Health returns `{"ok":true,"sessionId":"..."}`. A bridge request has `{"method":"getScoreOverview","params":{}}` and returns `{"ok":true,"result":{...}}` or `{"ok":false,"error":{"code":"...","message":"..."}}`. The overview includes `scoreName`, `dirty`, `scoreTrackCount`, `audioTrackCount`, `totalNoteCount`, and `scoreTracks` with each track's index, name, and note count. Values come from the current in-memory state, including unsaved edits.

The adapter rejects non-loopback endpoints and stale or unauthenticated descriptors. Each Tool call revalidates the selected session. No score-editing Tool is exposed.
