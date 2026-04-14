const { CommandAutocomplete } = require('./out/extension');

// 模拟文档对象
class MockDocument {
    constructor(content) {
        this.content = content;
    }
    
    getText() {
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
            range: {
                start: { line: 0, character: 0 },
                end: { line: 0, character: text.length }
            },
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
                return { line: i, character: offset - currentOffset };
            }
            currentOffset += lineLength;
        }
        return { line: lines.length - 1, character: lines[lines.length - 1].length };
    }
    
    get uri() {
        return { fsPath: __dirname + '/test.sh' };
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
            setKeysForSync: () => {}
        };
        this.workspaceState = {
            get: () => undefined,
            update: () => Promise.resolve(),
            keys: () => []
        };
        this.extensionPath = __dirname;
        this.asAbsolutePath = (relativePath) => __dirname + '/' + relativePath;
        this.storagePath = __dirname;
        this.logPath = __dirname;
        this.extensionUri = { fsPath: __dirname };
        this.environmentVariableCollection = {
            replace: () => {},
            append: () => {},
            prepend: () => {},
            delete: () => {},
            clear: () => {},
            getScoped: () => ({})
        };
        this.secrets = {
            get: () => Promise.resolve(undefined),
            store: () => Promise.resolve(),
            delete: () => Promise.resolve(),
            keys: () => Promise.resolve([]),
            onDidChange: () => ({ dispose: () => {} })
        };
        this.storageUri = { fsPath: __dirname };
        this.globalStorageUri = { fsPath: __dirname };
        this.globalStoragePath = __dirname;
        this.logUri = { fsPath: __dirname };
    }
}

// 运行性能测试
async function runPerformanceTest() {
    console.log('Running performance test...');
    
    const context = new MockExtensionContext();
    const commandAutocomplete = new CommandAutocomplete(context);
    commandAutocomplete.activate();
    
    // 测试用例
    const testCases = [
        { content: 'ls -', position: { line: 0, character: 3 } },
        { content: 'g', position: { line: 0, character: 1 } },
        { content: 'git ', position: { line: 0, character: 4 } },
        { content: 'npm ', position: { line: 0, character: 4 } },
        { content: 'docker ', position: { line: 0, character: 7 } },
        { content: 'kubectl ', position: { line: 0, character: 9 } },
    ];
    
    // 预热缓存
    console.log('Warming up cache...');
    for (const testCase of testCases) {
        const document = new MockDocument(testCase.content);
        await commandAutocomplete.provideCompletionItems(document, testCase.position);
    }
    
    // 测量响应时间
    console.log('Measuring response times...');
    const times = [];
    for (const testCase of testCases) {
        const document = new MockDocument(testCase.content);
        const start = performance.now();
        await commandAutocomplete.provideCompletionItems(document, testCase.position);
        const end = performance.now();
        const time = end - start;
        times.push(time);
        console.log(`Command '${testCase.content.trim()}' response time: ${time.toFixed(2)}ms`);
    }
    
    // 计算平均响应时间
    const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
    console.log(`\nAverage response time: ${averageTime.toFixed(2)}ms`);
    
    // 检查是否符合要求
    if (averageTime < 200) {
        console.log('✅ Performance test passed! Average response time is less than 200ms.');
    } else {
        console.log('❌ Performance test failed! Average response time exceeds 200ms.');
    }
    
    return averageTime;
}

// 运行测试
runPerformanceTest().catch(console.error);
