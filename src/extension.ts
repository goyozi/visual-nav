'use strict';

import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    function registerCommandNice(commandId: string, run: (...args: any[]) => void): void {
        context.subscriptions.push(vscode.commands.registerCommand(commandId, run));
    }

    let navExt = new NavExt();

    registerCommandNice('type', (args) => {
        if (vscode.window.activeTextEditor) {
            navExt.type(args.text);
        }
    });

    registerCommandNice('extension.onBackspace', (args) => {
        if (vscode.window.activeTextEditor) {
            navExt.deleteLeft();
        }
    });

    registerCommandNice('extension.toggleNav', (args) => {
        if (vscode.window.activeTextEditor) {
            navExt.toggleNavMode();
        }
    });
}

export function deactivate() {
}

class NavExt {
    readonly codes = "qweasdzxcrtyghvbnuioklmp".split("");

    private _navMode: boolean;
    private _statusBarItem: vscode.StatusBarItem;
    private _decorations: vscode.TextEditorDecorationType[];
    private _combinations: Map<string, vscode.Position>;
    private _input: string;

    constructor() {
        this._navMode = false;
        this._statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        this._statusBarItem.hide();
        this._decorations = [];
        this._combinations = new Map();
        this._input = "";
    }

    toggleNavMode() {
        this._navMode = !this._navMode;

        if (this._navMode) {
            let editor = vscode.window.activeTextEditor!!;

            let candidates = this._findMoveCandidates(editor.document.getText());
            let combinations = this._assignCodes(candidates);

            combinations.forEach((position, code) => {
                let decoration = vscode.window.createTextEditorDecorationType({
                    after: {
                        contentText: code,
                        backgroundColor: '#efdb00',
                        color: '#220000',
                        margin: '2px'
                    },
                });

                let hotSpots = [new vscode.Range(position, position)];
                editor.setDecorations(decoration, hotSpots);

                this._decorations.push(decoration);
            });

            this._combinations = combinations;
            this._input = "";

            this._updateStatusBar();
            this._statusBarItem.show();
        } else {
            this._decorations.forEach(d => d.dispose());
            this._statusBarItem.hide();
        }
    }

    private _findMoveCandidates(text: string): vscode.Position[] {
        let result: vscode.Position[] = [];
        let lines = text.split(/\r?\n/);
        for (let i = 0; i < lines.length; ++i) {
            let indices: number[] = [];

            let start = lines[i].search(/[^\s\\]/);
            if (start !== -1) {
                indices.push(start);
            }

            if (lines[i].trim().length > 0) {
                indices.push(lines[i].length);
            }

            let dots = this._findAll(lines[i], /\./g);
            dots.forEach((index) => indices.push(index));

            let commas = this._findAll(lines[i], /\, /g);
            commas.forEach((index) => indices.push(index));

            let colons = this._findAll(lines[i], /\: /g);
            colons.forEach((index) => indices.push(index));

            let brackets = this._findAll(lines[i], /\(|\[|\{/g);
            brackets.forEach((index) => indices.push(index));

            let tags = this._findAll(lines[i], />/g);
            tags.forEach((index) => indices.push(index));

            let loneEquals = this._findAll(lines[i], /= /g);
            loneEquals.forEach((index) => indices.push(index));

            let friendlyEquals = this._findAll(lines[i], /=[^ ]/g);
            friendlyEquals.forEach((index) => indices.push(index - 1));

            indices.sort((a,b) => a-b);

            let lastIndex = -3;
            let actualIndices: number[] = [];
            for(let index of indices) {
                if (index - lastIndex > 2) {
                    actualIndices.push(index);
                    lastIndex = index;
                }
            }

            actualIndices.forEach((index) => result.push(new vscode.Position(i, index)));
        }
        return result;
    }

    private _findAll(text: string, regexp: RegExp): number[] {
        let result: number[] = [];
        while (regexp.exec(text)) {
            result.push(regexp.lastIndex);
        }
        return result;
    }

    private _assignCodes(positions: vscode.Position[]): Map<string, vscode.Position> {
        let codeLen = 1;
        while (Math.pow(this.codes.length, codeLen) < positions.length) {
            codeLen++;
        }

        let positionIndex = [];
        for (let i = 0; i < codeLen; ++i) {
            positionIndex.push(0);
        }

        let result = new Map<string, vscode.Position>();
        for (let pos of positions) {
            result.set(this._toCode(positionIndex), pos);
            positionIndex = this._nextPositionIndex(positionIndex);
        }

        return result;
    }

    private _toCode(positionIndex: number[]): string {
        let code = "";
        for (let index of positionIndex) {
            code += this.codes[index];
        }
        return code;
    }

    private _nextPositionIndex(positionIndex: number[]): number[] {
        let newIndex = [];
        let incrementNext = true;
        for (let i = 1; i <= positionIndex.length; ++i) {
            let index = positionIndex[positionIndex.length - i];

            if (incrementNext) {
                let next = index + 1;
                if (next < this.codes.length) {
                    incrementNext = false;
                } else {
                    next = 0;
                    incrementNext = true;
                }
                newIndex.unshift(next);
            } else {
                newIndex.unshift(index);
            }
        }
        return newIndex;
    }

    type(text: String) {
        if (this._navMode) {
            if (text === "f") {
                this._scroll('up');
            } else if (text === "j") {
                this._scroll('down');
            } else {
                this._navType(text);
            }
        } else {
            vscode.commands.executeCommand('default:type', {
                text: text
            });
        }
    }

    private _scroll(direction: string) {
        vscode.commands.executeCommand('editorScroll', { to: direction, by: 'line', value: 5 });
    }

    private _navType(text: String) {
        this._input += text;
        if (this._combinations.has(this._input)) {
            let position = this._combinations.get(this._input)!!;
            let selection = new vscode.Selection(position, position);
            vscode.window.activeTextEditor!!.selection = selection;
            this.toggleNavMode();
        }
        else {
            this._updateStatusBar();
        }
    }

    deleteLeft() {
        if (this._navMode) {
            this._input = this._input.substring(0, this._input.length - 1);
            this._updateStatusBar();
        } else {
            vscode.commands.executeCommand('deleteLeft')
        }
    }

    private _updateStatusBar() {
        this._statusBarItem.text = "Nav: " + (this._input ? this._input : "*empty*");
    }
}