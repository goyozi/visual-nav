import { Position } from 'vscode';

export class NavExt {
    readonly codes = "qweasdzxcrtyghvbnuioklmp".split("");

    private _editor: Editor;
    private _indicator: StatusIndicator;
    private _config: any;

    private _navMode: boolean;
    private _combinations: Map<string, Position>;
    private _input: string;

    constructor(editor: Editor, indicator: StatusIndicator, config: any) {
        this._editor = editor;
        this._indicator = indicator;
        this._config = config;
        this._navMode = false;
        this._combinations = new Map();
        this._input = "";
    }

    resetState() {
        this._navMode = false;
        this._combinations = new Map();
        this._input = "";
        this._editor.clearDecorations();
        this._updateStatusBar();
    }

    toggleNavMode() {
        this._navMode = !this._navMode;

        if (this._navMode) {
            let candidates = this._findMoveCandidates(this._editor.getText());
            let combinations = this._assignCodes(candidates);

            combinations.forEach((position, code) => {
                this._editor.decorate(position, code);
            });

            this._combinations = combinations;
            this._input = "";
        } else {
            this._editor.clearDecorations();
        }

        this._updateStatusBar();
    }

    private _findMoveCandidates(text: string): Position[] {
        let result: Position[] = [];
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

            let commas = this._findAll(lines[i], /, /g);
            commas.forEach((index) => indices.push(index));

            let colons = this._findAll(lines[i], /: */g);
            colons.forEach((index) => indices.push(index));

            let brackets = this._findAll(lines[i], /[([{]+ */g);
            brackets.forEach((index) => indices.push(index));

            let tags = this._findAll(lines[i], /> */g);
            tags.forEach((index) => indices.push(index));

            let equalsCombos = this._findAll(lines[i], /[+\-\*/<>]?=+>? */g);
            equalsCombos.forEach((index) => indices.push(index));

            indices.sort((a, b) => a - b);

            let lastIndex = -this._config.minimumGap;
            let actualIndices: number[] = [];
            for (let index of indices) {
                if (index - lastIndex >= this._config.minimumGap) {
                    actualIndices.push(index);
                    lastIndex = index;
                }
            }

            actualIndices.forEach((index) => result.push(new Position(i, index)));
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

    private _assignCodes(positions: Position[]): Map<string, Position> {
        let codeLen = 1;
        while (Math.pow(this.codes.length, codeLen) < positions.length) {
            codeLen++;
        }

        let positionIndex = [];
        for (let i = 0; i < codeLen; ++i) {
            positionIndex.push(0);
        }

        let result = new Map<string, Position>();
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

    type(text: string) {
        if (this._navMode) {
            if (text === "f") {
                this._scroll('up');
            } else if (text === "j") {
                this._scroll('down');
            } else {
                this._navType(text);
            }
        } else {
            this._editor.type(text);
        }
    }

    private _scroll(direction: string) {
        this._editor.scroll(direction, this._config.scrollStep);
    }

    private _navType(text: String) {
        this._input += text;
        if (this._combinations.has(this._input)) {
            let position = this._combinations.get(this._input)!!;
            this._editor.moveCursor(position);
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
            this._editor.deleteLeft();
        }
    }

    private _updateStatusBar() {
        if (this._navMode) {
            this._indicator.setStatus("Nav: " + (this._input ? this._input : "*empty*"));
            this._indicator.showStatus();
        } else {
            this._indicator.hideStatus();
        }
    }
}

export interface Editor {
    getText(): string;

    decorate(position: Position, text: string): void;
    clearDecorations(): void;

    type(text: string): void;
    deleteLeft(): void;

    moveCursor(position: Position): void;
    scroll(direction: string, lines: number): void;
}

export interface StatusIndicator {
    hideStatus(): void;
    showStatus(): void;
    setStatus(status: string): void;
}