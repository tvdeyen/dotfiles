'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const terminal = require("./terminal");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "rails-run-spec-vscode" is now active!');
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    context.subscriptions.push(vscode.commands.registerCommand('extension.runAllSpecFiles', () => terminal.runSpecFile({ path: "/" })));
    context.subscriptions.push(vscode.commands.registerCommand('extension.runFileSpecs', () => terminal.runSpecFile({})));
    context.subscriptions.push(vscode.commands.registerCommand('extension.runSpecsFromMenu', (fileUri) => {
        terminal.runSpecFile({ path: fileUri.fsPath });
    }));
    context.subscriptions.push(vscode.commands.registerCommand('extension.runSpecLine', () => {
        let currentPosition = vscode.window.activeTextEditor.selection.active;
        terminal.runSpecFile({ lineNumber: currentPosition.line + 1 });
    }));
    context.subscriptions.push(vscode.commands.registerCommand('extension.runLastSpec', terminal.runLastSpec));
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map