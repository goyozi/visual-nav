'use strict';

import * as vscode from 'vscode';
import { ActiveTextEditor } from './editor';
import { StatusBarIndicator } from './indicator';
import { NavExt } from './nav-ext';

export function activate(context: vscode.ExtensionContext) {
    function registerCommandNice(commandId: string, run: (...args: any[]) => void): void {
        context.subscriptions.push(vscode.commands.registerCommand(commandId, run));
    }

    let navExt = new NavExt(
        new ActiveTextEditor(),
        new StatusBarIndicator(),
        vscode.workspace.getConfiguration('visualNav')
    );

    registerCommandNice('type', (args) => {
        if (vscode.window.activeTextEditor) {
            navExt.type(args.text);
        }
    });

    registerCommandNice('visualNav.onBackspace', (args) => {
        if (vscode.window.activeTextEditor) {
            navExt.deleteLeft();
        }
    });

    registerCommandNice('visualNav.toggleNav', (args) => {
        if (vscode.window.activeTextEditor) {
            navExt.toggleNavMode();
        }
    });
}

export function deactivate() {
}
