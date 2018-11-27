import * as vscode from "vscode";
import { Editor } from "./nav-ext";

export class ActiveTextEditor implements Editor {
    private _decorations: vscode.TextEditorDecorationType[] = [];

    getText(): string {
        return vscode.window.activeTextEditor!!.document.getText();
    }

    decorate(position: vscode.Position, text: string): void {
        let editor = vscode.window.activeTextEditor!!;

        let decoration = vscode.window.createTextEditorDecorationType({
            after: {
                contentText: text,
                backgroundColor: '#efdb00',
                color: '#220000',
                margin: '2px'
            },
        });

        let hotSpots = [new vscode.Range(position, position)];
        editor.setDecorations(decoration, hotSpots);

        this._decorations.push(decoration);
    }

    clearDecorations(): void {
        this._decorations.forEach(d => d.dispose());
    }

    type(text: string): void {
        vscode.commands.executeCommand('default:type', {
            text: text
        });
    }

    deleteLeft(): void {
        vscode.commands.executeCommand('deleteLeft');
    }

    moveCursor(position: vscode.Position): void {
        let selection = new vscode.Selection(position, position);
        vscode.window.activeTextEditor!!.selection = selection;
    }

    scroll(direction: string, lines: number): void {
        vscode.commands.executeCommand('editorScroll', { to: direction, by: 'line', value: lines });
    }
}