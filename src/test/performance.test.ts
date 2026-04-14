import * as vscode from 'vscode';
import * as path from 'path';
import { CommandAutocomplete } from '../extension';

// 模拟文档对象
class MockDocument implements vscode.TextDocument {
    constructor(private content: string) {}
    
    getText(range?: vscode.Range): string {
        return this.content;
    }
    
    get lineCount(): number {
        return this.content.split('\n').length;
    }
    
    lineAt(line: number | vscode.Position): vscode.TextLine {
        const lines = this.content.split('\n');
        const text = lines[typeof line === 'number' ? line : line.line];
        return {
            text,
            range: new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, text.length)),
            firstNonWhitespaceCharacterIndex: text.search(/\S/),
            isEmptyOrWhitespace: /^\s*$/.test(text),
        } as vscode.TextLine;
    }
    
    offsetAt(position: vscode.Position): number {
        const lines = this.content.split('\n');
        let offset = 0;
        for (let i = 0; i < position.line; i++) {
            offset += lines[i].length + 1; // +1 for newline
        }
        return offset + position.character;
    }
    
    positionAt(offset: number): vscode.Position {
        const lines = this.content.split('\n');
        let currentOffset = 0;
        for (let i = 0; i < lines.length; i++) {
            const lineLength = lines[i].length + 1; // +1 for newline
            if (currentOffset + lineLength > offset) {
                return new vscode.Position(i, offset - currentOffset);
            }
            currentOffset += lineLength;
        }
        return new vscode.Position(lines.length - 1, lines[lines.length - 1].length);
    }
    
    get uri(): vscode.Uri {
        return vscode.Uri.file(path.join(__dirname, 'test.sh'));
    }
    
    get fileName(): string {
        return 'test.sh';
    }
    
    get isUntitled(): boolean {
        return false;
    }
    
    get languageId(): string {
        return 'shellscript';
    }
    
    get version(): number {
        return 1;
    }
    
    get isDirty(): boolean {
        return false;
    }
    
    get isClosed(): boolean {
        return false;
    }
    
    save(): Thenable<boolean> {
        return Promise.resolve(true);
    }
}

// 模拟扩展上下文
class MockExtensionContext implements vscode.ExtensionContext {
    subscriptions: vscode.Disposable[] = [];
    globalState: vscode.Memento = {
        get: () => undefined,
        update: () => Promise.resolve(),
    } as vscode.Memento;
    workspaceState: vscode.Memento = {
        get: () => undefined,
        update: () => Promise.resolve(),
    } as vscode.Memento;
    extensionPath: string = __dirname;
    asAbsolutePath: (relativePath: string) => string = (relativePath) => path.join(__dirname, relativePath);
    storagePath: string | undefined = __dirname;
    logPath: string | undefined = __dirname;
    extensionUri: vscode.Uri = vscode.Uri.file(__dirname);
    environmentVariableCollection: vscode.EnvironmentVariableCollection = {
        replace: () => {},
        append: () => {},
        prepend: () => {},
        delete: () => {},
        clear: () => {},
    } as vscode.EnvironmentVariableCollection;
    secrets: vscode.SecretStorage = {
        get: () => Promise.resolve(undefined),
        store: () => Promise.resolve(),
        delete: () => Promise.resolve(),
    } as vscode.SecretStorage;
}

describe('Command Autocomplete Performance', () => {
    let commandAutocomplete: CommandAutocomplete;
    let context: MockExtensionContext;
    
    beforeEach(() => {
        context = new MockExtensionContext();
        commandAutocomplete = new CommandAutocomplete(context);
        commandAutocomplete.activate();
    });
    
    it('should respond to completion requests within 200ms', async () => {
        const document = new MockDocument('ls -');
        const position = new vscode.Position(0, 3);
        
        // 预热缓存
        for (let i = 0; i < 5; i++) {
            await commandAutocomplete['provideCompletionItems'](document, position);
        }
        
        // 测量响应时间
        const times: number[] = [];
        for (let i = 0; i < 10; i++) {
            const start = performance.now();
            await commandAutocomplete['provideCompletionItems'](document, position);
            const end = performance.now();
            times.push(end - start);
        }
        
        // 计算平均响应时间
        const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
        console.log(`Average response time: ${averageTime.toFixed(2)}ms`);
        
        // 确保平均响应时间不超过200ms
        expect(averageTime).toBeLessThan(200);
    });
    
    it('should handle multiple completion requests efficiently', async () => {
        const testCases = [
            { content: 'g', position: new vscode.Position(0, 1) },
            { content: 'git ', position: new vscode.Position(0, 4) },
            { content: 'npm ', position: new vscode.Position(0, 4) },
            { content: 'docker ', position: new vscode.Position(0, 7) },
            { content: 'kubectl ', position: new vscode.Position(0, 9) },
        ];
        
        // 预热缓存
        for (const testCase of testCases) {
            const document = new MockDocument(testCase.content);
            await commandAutocomplete['provideCompletionItems'](document, testCase.position);
        }
        
        // 测量响应时间
        const times: number[] = [];
        for (const testCase of testCases) {
            const document = new MockDocument(testCase.content);
            const start = performance.now();
            await commandAutocomplete['provideCompletionItems'](document, testCase.position);
            const end = performance.now();
            times.push(end - start);
        }
        
        // 计算平均响应时间
        const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
        console.log(`Average response time for multiple requests: ${averageTime.toFixed(2)}ms`);
        
        // 确保平均响应时间不超过200ms
        expect(averageTime).toBeLessThan(200);
    });
});
