import TerminalCommand from "../../terminal-command";

const createShortcutCatalog = (ctx: TerminalCommand.Context): TerminalCommand.Props => {
  const { logger, settings, terminal } = ctx;
  const defaultProps = TerminalCommand.createDefaultProps("system");
  const actions = ["list", "create", "update", "delete"];

  const shortcutKeys = () => settings.terminalShortcuts.map((shortcut) => shortcut.key);

  const findShortcutIndex = (key: string) => {
    return settings.terminalShortcuts.findIndex((shortcut) => shortcut.key === key);
  };

  const validateShortcutKey = (key: string | undefined) => {
    const shortcutKey = logger.validateRequired(key, 2);
    if (shortcutKey == null) return null;

    if (!shortcutKey.startsWith("@")) {
      logger.outputError(`Shortcut command must start with @. [${shortcutKey}]`);
      return null;
    }

    if (shortcutKey.length === 1) {
      logger.outputError("Shortcut command must contain a name after @.");
      return null;
    }

    return shortcutKey;
  };

  const validateCommand = (args: string[]) => {
    const command = args.join(" ").trim();
    if (command.length === 0) {
      logger.outputError("Replacement command is not specified.");
      return null;
    }

    return command;
  };

  const outputReference = () => {
    terminal.outputs.push({
      type: "table",
      table: {
        cols: [
          { headerName: "Command", width: 300, attr: "def" },
          { headerName: "Usage", width: 420, attr: "sentence" },
        ],
        table: [
          ["shortcut list", "Displays registered terminal shortcuts."],
          ["shortcut create <@key> <command...>", "Create a terminal shortcut."],
          ["shortcut update <@key> <command...>", "Update a terminal shortcut."],
          ["shortcut delete <@key>", "Delete a terminal shortcut."],
        ],
      },
    });
    ctx.commit.terminal();
  };

  const listShortcuts = () => {
    if (settings.terminalShortcuts.length === 0) {
      logger.outputInfo("No terminal shortcuts found.");
      ctx.commit.terminal();
      return;
    }

    terminal.outputs.push({
      type: "table",
      table: {
        cols: [
          { headerName: "Shortcut", width: 150, attr: "def" },
          { headerName: "Command", width: 520, attr: "sentence" },
        ],
        table: settings.terminalShortcuts.map((shortcut) => [
          shortcut.key,
          shortcut.command,
        ]),
      },
    });
    ctx.commit.terminal();
  };

  const createShortcut = (key: string | undefined, commandArgs: string[]) => {
    const shortcutKey = validateShortcutKey(key);
    if (shortcutKey == null) return;

    const command = validateCommand(commandArgs);
    if (command == null) return;

    if (findShortcutIndex(shortcutKey) !== -1) {
      logger.outputError(`Terminal shortcut already exists. [${shortcutKey}]`);
      return;
    }

    settings.terminalShortcuts.push({ key: shortcutKey, command });
    logger.outputInfo(`Created terminal shortcut. [${shortcutKey} => ${command}]`);
    ctx.commit.settings();
    ctx.commit.terminal();
  };

  const updateShortcut = (key: string | undefined, commandArgs: string[]) => {
    const shortcutKey = validateShortcutKey(key);
    if (shortcutKey == null) return;

    const command = validateCommand(commandArgs);
    if (command == null) return;

    const index = findShortcutIndex(shortcutKey);
    if (index === -1) {
      logger.outputError(`Terminal shortcut does not exist. [${shortcutKey}]`);
      return;
    }

    settings.terminalShortcuts[index].command = command;
    logger.outputInfo(`Updated terminal shortcut. [${shortcutKey} => ${command}]`);
    ctx.commit.settings();
    ctx.commit.terminal();
  };

  const deleteShortcut = (key: string | undefined) => {
    const shortcutKey = validateShortcutKey(key);
    if (shortcutKey == null) return;

    const index = findShortcutIndex(shortcutKey);
    if (index === -1) {
      logger.outputError(`Terminal shortcut does not exist. [${shortcutKey}]`);
      return;
    }

    settings.terminalShortcuts.splice(index, 1);
    logger.outputInfo(`Deleted terminal shortcut. [${shortcutKey}]`);
    ctx.commit.settings();
    ctx.commit.terminal();
  };

  return {
    sector: defaultProps.sector,
    kind: "multi",
    key: "shortcut",
    usage: "Manage terminal command shortcuts.",
    subCommands: [
      {
        key: "list",
        usage: "Displays terminal command shortcuts.",
        args: [],
        callback: () => listShortcuts(),
      },
      {
        key: "create",
        usage: "Create a terminal command shortcut.",
        args: [
          { name: "key" },
          { name: "command" },
        ],
        callback: (args) => createShortcut(args[0], args.slice(1)),
      },
      {
        key: "update",
        usage: "Update a terminal command shortcut.",
        args: [
          { name: "key", getCandidate: () => shortcutKeys() },
          { name: "command" },
        ],
        callback: (args) => updateShortcut(args[0], args.slice(1)),
      },
      {
        key: "delete",
        usage: "Delete a terminal command shortcut.",
        args: [{ name: "key", getCandidate: () => shortcutKeys() }],
        callback: (args) => deleteShortcut(args[0]),
      },
    ],
  };
};

export default createShortcutCatalog;
