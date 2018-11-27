import * as vscode from "vscode";

import { StatusIndicator } from "./nav-ext";

export class StatusBarIndicator implements StatusIndicator {
    private _statusBarItem: vscode.StatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);

    constructor() {
        this._statusBarItem.hide();
    }

    hideStatus(): void {
        this._statusBarItem.hide();
    }

    showStatus(): void {
        this._statusBarItem.show();
    }

    setStatus(status: string): void {
        this._statusBarItem.text = status;
    }
}