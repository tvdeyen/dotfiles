'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const toSpecPath_1 = require("./utils/toSpecPath");
let lastCommandText;
let activeTerminals = {};
const SPEC_TERMINAL_NAME = 'Running Specs';
const ZEUS_TERMINAL_NAME = 'Zeus Start';
vscode.window.onDidCloseTerminal((terminal) => {
    if (activeTerminals[terminal.name]) {
        delete activeTerminals[terminal.name];
    }
});
function runSpecFile(options) {
    let editor = vscode.window.activeTextEditor, path = vscode.workspace.asRelativePath(options.path || editor.document.fileName, false), pattern = getTestFilePattern(), fileName = toSpecPath_1.default(path, pattern);
    if (!editor || !isSpecDirectory(fileName, pattern) && !isSpec(fileName, pattern) && !options.commandText) {
        return;
    }
    if (vscode.workspace.getConfiguration("ruby").get("specSaveFile")) {
        vscode.window.activeTextEditor.document.save();
    }
    let isZeusInit = isZeusActive() && !activeTerminals[getTerminalName(ZEUS_TERMINAL_NAME)];
    if (isZeusInit) {
        zeusTerminalInit();
    }
    if (isZeusInit) {
        let interval = getZeusStartTimeout();
        if (interval > 0) {
            vscode.window.showInformationMessage('Starting Zeus ...');
        }
        setTimeout(() => {
            executeInTerminal(fileName, options);
        }, interval);
    }
    else {
        executeInTerminal(fileName, options);
    }
}
exports.runSpecFile = runSpecFile;
function runLastSpec() {
    if (lastCommandText) {
        runSpecFile({ commandText: lastCommandText });
    }
}
exports.runLastSpec = runLastSpec;
function executeInTerminal(fileName, options) {
    const specTerminal = getOrCreateTerminal(SPEC_TERMINAL_NAME);
    const execute = () => executeCommand(specTerminal, fileName, options);
    if (shouldClearTerminal()) {
        vscode.commands.executeCommand('workbench.action.terminal.clear').then(execute);
    }
    else {
        execute();
    }
}
function executeCommand(specTerminal, fileName, options) {
    specTerminal.show(shouldFreserveFocus());
    let lineNumberText = options.lineNumber ? `:${options.lineNumber}` : '', commandText = options.commandText || `${getSpecCommand()} ${fileName}${lineNumberText}`;
    specTerminal.sendText(commandText);
    lastCommandText = commandText;
}
function getTerminalName(prefix) {
    return [
        prefix,
        vscode.workspace.getWorkspaceFolder(vscode.window.activeTextEditor.document.uri).name
    ].join(' ');
}
function getOrCreateTerminal(prefix) {
    const terminalName = getTerminalName(prefix);
    if (activeTerminals[terminalName]) {
        return activeTerminals[terminalName];
    }
    else {
        const terminal = vscode.window.createTerminal(terminalName);
        activeTerminals[terminalName] = terminal;
        return terminal;
    }
}
function getSpecCommand() {
    if (customSpecCommand()) {
        return customSpecCommand();
    }
    else if (isZeusActive()) {
        return 'zeus test';
    }
    else {
        return 'bundle exec rspec';
    }
}
function shouldFreserveFocus() {
    return !vscode.workspace.getConfiguration("ruby").get('specFocusTerminal');
}
function shouldClearTerminal() {
    return vscode.workspace.getConfiguration("ruby").get('specClearTerminal');
}
function customSpecCommand() {
    return vscode.workspace.getConfiguration("ruby").get('specCommand');
}
function isZeusActive() {
    return vscode.workspace.getConfiguration("ruby").get('specGem') == "zeus";
}
function getTestFilePattern() {
    return vscode.workspace.getConfiguration("ruby").get('specPattern');
}
function getZeusStartTimeout() {
    return vscode.workspace.getConfiguration("ruby").get('zeusStartTimeout');
}
function zeusTerminalInit() {
    const terminalName = getTerminalName(ZEUS_TERMINAL_NAME);
    let zeusTerminal = vscode.window.createTerminal(terminalName);
    activeTerminals[terminalName] = zeusTerminal;
    zeusTerminal.sendText("zeus start");
}
function isSpec(fileName, pattern) {
    return fileName.indexOf(`_${pattern}.rb`) > -1;
}
function isSpecDirectory(fileName, pattern) {
    return (fileName.indexOf(pattern) > -1) && fileName.indexOf('.rb') == -1;
}
//# sourceMappingURL=terminal.js.map