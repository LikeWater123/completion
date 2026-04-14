"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const extension_1 = require("../extension");
// 模拟文档对象
class MockDocument {
    constructor(content) {
        this.content = content;
    }
    getText(range) {
        return this.content;
    }
    get lineCount() {
        return this.content.split('\n').length;
    }
    lineAt(line) {
        const lines = this.content.split('\n');
        const text = lines[typeof line === 'number' ? line : line.line];
        return {
            text,
            range: new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, text.length)),
            firstNonWhitespaceCharacterIndex: text.search(/\S/),
            isEmptyOrWhitespace: /^\s*$/.test(text),
        };
    }
    offsetAt(position) {
        const lines = this.content.split('\n');
        let offset = 0;
        for (let i = 0; i < position.line; i++) {
            offset += lines[i].length + 1; // +1 for newline
        }
        return offset + position.character;
    }
    positionAt(offset) {
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
    get uri() {
        return vscode.Uri.file(path.join(__dirname, 'test.sh'));
    }
    get fileName() {
        return 'test.sh';
    }
    get isUntitled() {
        return false;
    }
    get languageId() {
        return 'shellscript';
    }
    get version() {
        return 1;
    }
    get isDirty() {
        return false;
    }
    get isClosed() {
        return false;
    }
    save() {
        return Promise.resolve(true);
    }
}
// 模拟扩展上下文
class MockExtensionContext {
    constructor() {
        this.subscriptions = [];
        this.globalState = {
            get: () => undefined,
            update: () => Promise.resolve(),
        };
        this.workspaceState = {
            get: () => undefined,
            update: () => Promise.resolve(),
        };
        this.extensionPath = __dirname;
        this.asAbsolutePath = (relativePath) => path.join(__dirname, relativePath);
        this.storagePath = __dirname;
        this.logPath = __dirname;
        this.extensionUri = vscode.Uri.file(__dirname);
        this.environmentVariableCollection = {
            replace: () => { },
            append: () => { },
            prepend: () => { },
            delete: () => { },
            clear: () => { },
        };
        this.secrets = {
            get: () => Promise.resolve(undefined),
            store: () => Promise.resolve(),
            delete: () => Promise.resolve(),
        };
    }
}
describe('Command Autocomplete Performance', () => {
    let commandAutocomplete;
    let context;
    beforeEach(() => {
        context = new MockExtensionContext();
        commandAutocomplete = new extension_1.CommandAutocomplete(context);
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
        const times = [];
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
        const times = [];
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
//# sourceMappingURL=performance.test.js.map