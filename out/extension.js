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
exports.CommandAutocomplete = void 0;
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const commandDatabase_1 = require("./commandDatabase");
class CommandAutocomplete {
    constructor(context) {
        this.commandUsage = {};
        this.fileCache = new Map();
        this.directoryContextCache = new Map();
        this.baseCacheTimeout = 5000; // 基础缓存超时时间（毫秒）
        this.maxCacheTimeout = 30000; // 最大缓存超时时间（毫秒）
        this.minCacheTimeout = 1000; // 最小缓存超时时间（毫秒）
        this.currentOS = process.platform; // 当前操作系统
        // 排序结果缓存
        this.rankedCommandsCache = new Map();
        this.context = context;
        // 从存储加载命令使用记录
        this.loadCommandUsage();
        // 从存储加载自定义命令
        this.loadCustomCommands();
    }
    activate() {
        console.log('Command Autocomplete extension is now active!');
        // 注册命令补全提供者
        const provider = vscode.languages.registerCompletionItemProvider(['shellscript', 'bash', 'batch', 'cmd'], {
            provideCompletionItems: (document, position) => {
                return this.provideCompletionItems(document, position);
            },
            resolveCompletionItem: (item) => {
                // 解析命令详情
                const commandName = typeof item.label === 'string' ? item.label : item.label.label;
                const commandInfo = (0, commandDatabase_1.getCommandInfo)(commandName);
                if (commandInfo) {
                    item.documentation = this.getCommandDocumentation(commandInfo);
                }
                return item;
            }
        }, 
        // 触发补全的字符
        ' ', '-', '.', '/', '$', '~', '');
        // 注册终端命令补全
        const terminalDisposable = vscode.window.onDidOpenTerminal((terminal) => {
            this.setupTerminalCompletion(terminal);
        });
        // 为现有终端设置补全
        vscode.window.terminals.forEach(terminal => {
            this.setupTerminalCompletion(terminal);
        });
        // 注册命令执行监听器，用于统计命令使用频率
        const executeCommandDisposable = vscode.commands.registerCommand('workbench.action.terminal.sendSequence', (args) => {
            if (args && typeof args.text === 'string') {
                const command = args.text.trim().split(/\s+/)[0];
                if (command) {
                    this.updateCommandUsage(command);
                }
            }
        });
        // 注册显示命令详情的命令
        const showCommandDetailsDisposable = vscode.commands.registerCommand('command-autocomplete.showCommandDetails', (commandName) => {
            this.showCommandDetails(commandName);
        });
        // 注册示例命令
        const helloWorldDisposable = vscode.commands.registerCommand('command-autocomplete.helloWorld', () => {
            vscode.window.showInformationMessage('Hello from Command Autocomplete!');
        });
        // 注册自定义命令管理界面
        const manageCustomCommandsDisposable = vscode.commands.registerCommand('command-autocomplete.manageCustomCommands', () => {
            this.manageCustomCommands();
        });
        // 注册导出自定义命令
        const exportCustomCommandsDisposable = vscode.commands.registerCommand('command-autocomplete.exportCustomCommands', () => {
            this.exportCustomCommands();
        });
        // 注册导入自定义命令
        const importCustomCommandsDisposable = vscode.commands.registerCommand('command-autocomplete.importCustomCommands', () => {
            this.importCustomCommands();
        });
        this.context.subscriptions.push(provider);
        this.context.subscriptions.push(terminalDisposable);
        this.context.subscriptions.push(executeCommandDisposable);
        this.context.subscriptions.push(showCommandDetailsDisposable);
        this.context.subscriptions.push(helloWorldDisposable);
        this.context.subscriptions.push(manageCustomCommandsDisposable);
        this.context.subscriptions.push(exportCustomCommandsDisposable);
        this.context.subscriptions.push(importCustomCommandsDisposable);
    }
    // 为终端设置命令补全
    setupTerminalCompletion(terminal) {
        // 终端命令补全通过 VSCode 的内置补全机制实现
        // 当用户在终端中输入时，VSCode 会自动触发补全请求
    }
    /**
     * 检测工作目录上下文
     * 识别当前目录的项目类型和特征
     * @param document 当前文档
     * @returns 目录上下文信息
     */
    getDirectoryContext(document) {
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
        const directoryPath = workspaceFolder ? workspaceFolder.uri.fsPath : path.dirname(document.uri.fsPath);
        // 缓存目录上下文，避免重复计算
        const cacheKey = `directoryContext:${directoryPath}`;
        if (this.directoryContextCache.has(cacheKey)) {
            return this.directoryContextCache.get(cacheKey);
        }
        const fs = require('fs');
        const pathExists = (p) => {
            try {
                fs.accessSync(p);
                return true;
            }
            catch {
                return false;
            }
        };
        let isKubernetesProject = false;
        try {
            const files = fs.readdirSync(directoryPath);
            isKubernetesProject = files.some((file) => file.endsWith('.yaml') || file.endsWith('.yml'));
        }
        catch {
            // 忽略错误
        }
        const context = {
            path: directoryPath,
            isNodeProject: pathExists(path.join(directoryPath, 'package.json')),
            isPythonProject: pathExists(path.join(directoryPath, 'requirements.txt')) || pathExists(path.join(directoryPath, 'setup.py')),
            isGitRepo: pathExists(path.join(directoryPath, '.git')),
            isDockerProject: pathExists(path.join(directoryPath, 'Dockerfile')),
            isKubernetesProject
        };
        // 缓存结果
        this.directoryContextCache.set(cacheKey, context);
        // 设置缓存过期
        setTimeout(() => {
            this.directoryContextCache.delete(cacheKey);
        }, this.getCacheTimeout(cacheKey));
        return context;
    }
    provideCompletionItems(document, position) {
        // 获取当前行的文本
        const lineText = document.lineAt(position).text;
        const linePrefix = lineText.substring(0, position.character);
        // 解析当前输入的命令和参数
        const tokens = linePrefix.trim().split(/\s+/);
        const currentToken = tokens[tokens.length - 1] || '';
        const isFirstToken = tokens.length === 1 || (tokens.length === 0 && linePrefix.trim() === '');
        // 获取目录上下文
        const directoryContext = this.getDirectoryContext(document);
        const completionItems = [];
        if (isFirstToken) {
            // 补全命令
            const matchingCommands = this.getRankedCommands(currentToken, directoryContext);
            completionItems.push(...matchingCommands.map(cmd => {
                const item = new vscode.CompletionItem(cmd.name, vscode.CompletionItemKind.Keyword);
                item.detail = cmd.category;
                // 添加命令详情链接
                const md = new vscode.MarkdownString();
                md.appendMarkdown(`**${cmd.name}**\n${cmd.description}\n\n**Usage:** ${cmd.usage}\n\n`);
                md.appendMarkdown(`[View details](command:command-autocomplete.showCommandDetails?${encodeURIComponent(JSON.stringify(cmd.name))})`);
                md.isTrusted = true;
                item.documentation = md;
                // 根据使用频率和上下文设置排序权重
                item.sortText = this.getSortText(cmd.name, directoryContext);
                return item;
            }));
        }
        else {
            // 补全命令参数和选项
            const commandName = tokens[0];
            const commandInfo = (0, commandDatabase_1.getCommandInfo)(commandName);
            if (commandInfo && commandInfo.options) {
                // 过滤匹配的选项
                const matchingOptions = commandInfo.options.filter(option => option.flag.toLowerCase().startsWith(currentToken.toLowerCase()));
                completionItems.push(...matchingOptions.map(option => {
                    const item = new vscode.CompletionItem(option.flag, vscode.CompletionItemKind.EnumMember);
                    item.detail = 'Option';
                    item.documentation = new vscode.MarkdownString(`${option.description}`);
                    return item;
                }));
            }
            // 补全文件路径
            if (currentToken.startsWith('./') || currentToken.startsWith('../') || currentToken.startsWith('/') || currentToken.startsWith('~') || !currentToken.includes('=')) {
                const fileCompletionItems = this.getFileCompletions(currentToken, document);
                completionItems.push(...fileCompletionItems);
            }
            // 补全环境变量
            if (currentToken.startsWith('$')) {
                const envCompletionItems = this.getEnvironmentVariableCompletions(currentToken);
                completionItems.push(...envCompletionItems);
            }
        }
        return completionItems;
    }
    /**
     * 获取命令的上下文权重
     * 根据当前目录的项目类型和操作系统调整命令的优先级
     * @param command 命令名称
     * @param context 目录上下文信息
     * @returns 命令的上下文权重
     */
    getContextWeight(command, context) {
        let weight = 0;
        // 根据项目类型调整命令权重
        if (context.isNodeProject) {
            if (command === 'npm' || command === 'yarn')
                weight += 100;
        }
        if (context.isPythonProject) {
            if (command === 'pip')
                weight += 100;
        }
        if (context.isGitRepo) {
            if (command === 'git')
                weight += 80;
        }
        if (context.isDockerProject) {
            if (command === 'docker')
                weight += 90;
        }
        if (context.isKubernetesProject) {
            if (command === 'kubectl')
                weight += 90;
        }
        // 根据操作系统调整文件系统命令的权重
        if (this.currentOS === 'win32') {
            // Windows 文件系统命令
            if (['dir', 'mkdir', 'del', 'copy', 'move', 'type', 'find'].includes(command)) {
                weight += 60;
            }
        }
        else {
            // Linux/macOS 文件系统命令
            if (['ls', 'cd', 'pwd', 'mkdir', 'rm', 'cp', 'mv', 'cat', 'grep', 'find'].includes(command)) {
                weight += 60;
            }
        }
        // 通用命令在任何操作系统都有基础权重
        if (['echo', 'git', 'npm', 'yarn', 'pip', 'docker', 'kubectl'].includes(command)) {
            weight += 30;
        }
        return weight;
    }
    // 获取排序后的命令列表
    getRankedCommands(prefix, directoryContext) {
        // 生成缓存键
        const cacheKey = `${prefix.toLowerCase()}:${directoryContext.path}:${this.currentOS}`;
        // 检查缓存
        if (this.rankedCommandsCache.has(cacheKey)) {
            return this.rankedCommandsCache.get(cacheKey);
        }
        let matchingCommands = (0, commandDatabase_1.searchCommands)(prefix);
        // 过滤当前操作系统支持的命令
        matchingCommands = matchingCommands.filter(cmd => {
            // 如果命令没有指定操作系统，则默认为全平台支持
            if (!cmd.os) {
                return true;
            }
            // 检查当前操作系统是否在命令支持的列表中
            return cmd.os.includes(this.currentOS);
        });
        // 根据使用频率、时间因素和上下文权重排序
        const sortedCommands = matchingCommands.sort((a, b) => {
            const usageA = this.commandUsage[a.name] || { count: 0, lastUsed: 0 };
            const usageB = this.commandUsage[b.name] || { count: 0, lastUsed: 0 };
            const contextWeightA = this.getContextWeight(a.name, directoryContext);
            const contextWeightB = this.getContextWeight(b.name, directoryContext);
            // 计算时间衰减因子（越近使用的命令权重越高）
            const now = Date.now();
            const timeFactorA = Math.max(0, 1 - (now - usageA.lastUsed) / (7 * 24 * 60 * 60 * 1000)); // 7天衰减
            const timeFactorB = Math.max(0, 1 - (now - usageB.lastUsed) / (7 * 24 * 60 * 60 * 1000));
            // 综合计算权重：上下文权重 + 使用频率 * 时间因子
            const totalWeightA = contextWeightA + usageA.count * timeFactorA;
            const totalWeightB = contextWeightB + usageB.count * timeFactorB;
            return totalWeightB - totalWeightA;
        });
        // 缓存结果
        this.rankedCommandsCache.set(cacheKey, sortedCommands);
        // 设置缓存过期
        setTimeout(() => {
            this.rankedCommandsCache.delete(cacheKey);
        }, this.getCacheTimeout(cacheKey));
        return sortedCommands;
    }
    // 从存储加载命令使用记录
    loadCommandUsage() {
        const storedUsage = this.context.globalState.get('commandUsage');
        if (storedUsage) {
            this.commandUsage = storedUsage;
        }
    }
    // 保存命令使用记录到存储
    saveCommandUsage() {
        this.context.globalState.update('commandUsage', this.commandUsage);
    }
    // 更新命令使用记录
    updateCommandUsage(command) {
        if (this.commandUsage[command]) {
            this.commandUsage[command].count++;
            this.commandUsage[command].lastUsed = Date.now();
        }
        else {
            this.commandUsage[command] = {
                count: 1,
                lastUsed: Date.now()
            };
        }
        // 保存到存储
        this.saveCommandUsage();
    }
    // 获取排序文本
    getSortText(command, directoryContext) {
        const usage = this.commandUsage[command]?.count || 0;
        const contextWeight = this.getContextWeight(command, directoryContext);
        const totalWeight = contextWeight + usage;
        // 权重高的命令排序文本前缀更小，会排在前面
        return `${String.fromCharCode(9999 - totalWeight)}${command}`;
    }
    // 根据使用频率计算缓存时间
    getCacheTimeout(key) {
        // 对于目录上下文缓存，使用基础超时时间
        if (key.startsWith('directoryContext:')) {
            return this.baseCacheTimeout;
        }
        // 对于命令相关的缓存，根据使用频率调整
        if (key.includes(':')) {
            const parts = key.split(':');
            if (parts.length > 0) {
                const commandPrefix = parts[0];
                // 计算该前缀相关命令的平均使用频率
                let totalUsage = 0;
                let commandCount = 0;
                for (const command in this.commandUsage) {
                    if (command.toLowerCase().startsWith(commandPrefix)) {
                        totalUsage += this.commandUsage[command].count;
                        commandCount++;
                    }
                }
                if (commandCount > 0) {
                    const avgUsage = totalUsage / commandCount;
                    // 根据平均使用频率调整缓存时间
                    // 使用频率越高，缓存时间越长，但不超过最大值
                    const timeout = Math.min(this.maxCacheTimeout, Math.max(this.minCacheTimeout, this.baseCacheTimeout * (1 + avgUsage * 0.1)));
                    return timeout;
                }
            }
        }
        // 默认使用基础超时时间
        return this.baseCacheTimeout;
    }
    // 获取文件路径补全
    getFileCompletions(currentToken, document) {
        const cacheKey = `${document.uri.fsPath}:${currentToken}`;
        // 检查缓存
        if (this.fileCache.has(cacheKey)) {
            return this.fileCache.get(cacheKey);
        }
        const items = [];
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
        if (!workspaceFolder) {
            return items;
        }
        try {
            let resolvedPath = currentToken;
            // 处理 ~ 路径
            if (resolvedPath.startsWith('~')) {
                resolvedPath = resolvedPath.replace('~', process.env.HOME || '');
            }
            const basePath = path.dirname(path.join(workspaceFolder.uri.fsPath, resolvedPath));
            const fs = require('fs');
            // 同步读取目录，确保能够返回结果
            const files = fs.readdirSync(basePath);
            files.forEach((file) => {
                try {
                    const fullPath = path.join(basePath, file);
                    const stats = fs.statSync(fullPath);
                    const item = new vscode.CompletionItem(file, stats.isDirectory() ? vscode.CompletionItemKind.Folder : vscode.CompletionItemKind.File);
                    item.detail = stats.isDirectory() ? 'Directory' : 'File';
                    items.push(item);
                }
                catch (error) {
                    // 忽略错误
                }
            });
            // 缓存结果
            this.fileCache.set(cacheKey, items);
            setTimeout(() => {
                this.fileCache.delete(cacheKey);
            }, this.getCacheTimeout(cacheKey));
        }
        catch (error) {
            // 忽略错误
        }
        return items;
    }
    // 获取环境变量补全
    getEnvironmentVariableCompletions(currentToken) {
        const items = [];
        const envVarPrefix = currentToken.substring(1); // 移除 $ 符号
        Object.keys(process.env).forEach(envVar => {
            if (envVar.toLowerCase().startsWith(envVarPrefix.toLowerCase())) {
                const item = new vscode.CompletionItem(`$${envVar}`, vscode.CompletionItemKind.Variable);
                item.detail = 'Environment Variable';
                item.documentation = new vscode.MarkdownString(`Value: ${process.env[envVar]}`);
                items.push(item);
            }
        });
        return items;
    }
    /**
     * 生成命令的文档信息
     * @param commandInfo 命令信息
     * @returns 命令文档
     */
    getCommandDocumentation(commandInfo) {
        const md = new vscode.MarkdownString();
        md.appendMarkdown(`# ${commandInfo.name}\n\n`);
        md.appendMarkdown(`**Description:** ${commandInfo.description}\n\n`);
        md.appendMarkdown(`**Usage:** \`${commandInfo.usage}\`\n\n`);
        if (commandInfo.options && commandInfo.options.length > 0) {
            md.appendMarkdown(`**Options:**\n`);
            commandInfo.options.forEach(option => {
                md.appendMarkdown(`- \`${option.flag}\`: ${option.description}\n`);
            });
            md.appendMarkdown(`\n`);
        }
        if (commandInfo.examples && commandInfo.examples.length > 0) {
            md.appendMarkdown(`**Examples:**\n`);
            commandInfo.examples.forEach(example => {
                md.appendMarkdown(`- \`${example}\`\n`);
            });
        }
        return md;
    }
    /**
     * 显示命令详情面板
     * @param commandName 命令名称
     */
    showCommandDetails(commandName) {
        const commandInfo = (0, commandDatabase_1.getCommandInfo)(commandName);
        if (!commandInfo) {
            vscode.window.showErrorMessage(`Command ${commandName} not found in database`);
            return;
        }
        // 如果面板已经存在，显示它
        if (this.commandDetailsPanel) {
            this.commandDetailsPanel.reveal(vscode.ViewColumn.Beside);
            this.updateCommandDetailsPanel(commandInfo);
            return;
        }
        // 创建新的面板
        this.commandDetailsPanel = vscode.window.createWebviewPanel('commandDetails', `${commandName} Command Details`, vscode.ViewColumn.Beside, {
            enableScripts: false,
            retainContextWhenHidden: true
        });
        // 更新面板内容
        this.updateCommandDetailsPanel(commandInfo);
        // 处理面板关闭事件
        this.commandDetailsPanel.onDidDispose(() => {
            this.commandDetailsPanel = undefined;
        });
    }
    /**
     * 更新命令详情面板内容
     * @param commandInfo 命令信息
     */
    updateCommandDetailsPanel(commandInfo) {
        if (!this.commandDetailsPanel) {
            return;
        }
        let html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>${commandInfo.name} Command Details</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe WPC', 'Segoe UI', system-ui, 'Ubuntu', 'Droid Sans', sans-serif;
                    padding: 16px;
                    margin: 0;
                }
                h1 {
                    font-size: 24px;
                    margin-bottom: 16px;
                    color: #0e639c;
                }
                h2 {
                    font-size: 18px;
                    margin-top: 24px;
                    margin-bottom: 8px;
                    color: #1f3a93;
                }
                p {
                    margin: 8px 0;
                }
                code {
                    background-color: #f5f5f5;
                    padding: 2px 4px;
                    border-radius: 3px;
                    font-family: 'Consolas', 'Courier New', monospace;
                }
                pre {
                    background-color: #f5f5f5;
                    padding: 12px;
                    border-radius: 4px;
                    overflow-x: auto;
                    margin: 8px 0;
                }
                ul {
                    margin: 8px 0;
                    padding-left: 24px;
                }
                li {
                    margin: 4px 0;
                }
                .command-header {
                    border-bottom: 1px solid #e0e0e0;
                    padding-bottom: 12px;
                    margin-bottom: 16px;
                }
                .command-usage {
                    font-weight: bold;
                    margin: 12px 0;
                }
                .command-examples {
                    margin-top: 16px;
                }
                .example {
                    margin: 8px 0;
                }
            </style>
        </head>
        <body>
            <div class="command-header">
                <h1>${commandInfo.name}</h1>
                <p>${commandInfo.description}</p>
                <div class="command-usage">
                    <strong>Usage:</strong> <code>${commandInfo.usage}</code>
                </div>
                <p><strong>Category:</strong> ${commandInfo.category}</p>
                ${commandInfo.isCustom ? '<p><strong>Type:</strong> Custom Command</p>' : ''}
            </div>
        `;
        if (commandInfo.options && commandInfo.options.length > 0) {
            html += `
            <h2>Options</h2>
            <ul>
            `;
            commandInfo.options.forEach(option => {
                html += `<li><code>${option.flag}</code>: ${option.description}</li>`;
            });
            html += `
            </ul>
            `;
        }
        if (commandInfo.examples && commandInfo.examples.length > 0) {
            html += `
            <h2>Examples</h2>
            <div class="command-examples">
            `;
            commandInfo.examples.forEach(example => {
                html += `<div class="example"><code>${example}</code></div>`;
            });
            html += `
            </div>
            `;
        }
        html += `
        </body>
        </html>
        `;
        this.commandDetailsPanel.webview.html = html;
    }
    // 从存储加载自定义命令
    loadCustomCommands() {
        const storedCommands = this.context.globalState.get('customCommands');
        if (storedCommands) {
            (0, commandDatabase_1.loadCustomCommands)(storedCommands);
        }
    }
    // 保存自定义命令到存储
    saveCustomCommands() {
        const customCommands = (0, commandDatabase_1.getCustomCommands)();
        this.context.globalState.update('customCommands', customCommands);
    }
    // 管理自定义命令
    manageCustomCommands() {
        // 如果面板已经存在，显示它
        if (this.customCommandsPanel) {
            this.customCommandsPanel.reveal(vscode.ViewColumn.Beside);
            this.updateCustomCommandsPanel();
            return;
        }
        // 创建新的面板
        this.customCommandsPanel = vscode.window.createWebviewPanel('customCommands', 'Custom Commands', vscode.ViewColumn.Beside, {
            enableScripts: true,
            retainContextWhenHidden: true
        });
        // 更新面板内容
        this.updateCustomCommandsPanel();
        // 处理面板关闭事件
        this.customCommandsPanel.onDidDispose(() => {
            this.customCommandsPanel = undefined;
        });
        // 处理消息
        this.customCommandsPanel.webview.onDidReceiveMessage(message => {
            switch (message.command) {
                case 'addCommand':
                    this.addCustomCommand(message.commandInfo);
                    break;
                case 'editCommand':
                    this.editCustomCommand(message.commandInfo);
                    break;
                case 'deleteCommand':
                    this.deleteCustomCommand(message.commandName);
                    break;
            }
        }, undefined, this.context.subscriptions);
    }
    // 更新自定义命令面板
    updateCustomCommandsPanel() {
        if (!this.customCommandsPanel) {
            return;
        }
        const customCommands = (0, commandDatabase_1.getCustomCommands)();
        let html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Custom Commands</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe WPC', 'Segoe UI', system-ui, 'Ubuntu', 'Droid Sans', sans-serif;
                    padding: 16px;
                    margin: 0;
                }
                h1 {
                    font-size: 24px;
                    margin-bottom: 24px;
                    color: #0e639c;
                }
                h2 {
                    font-size: 18px;
                    margin-top: 24px;
                    margin-bottom: 12px;
                    color: #1f3a93;
                }
                .command-list {
                    list-style-type: none;
                    padding: 0;
                    margin: 0;
                }
                .command-item {
                    background-color: #f5f5f5;
                    border-radius: 4px;
                    padding: 12px;
                    margin-bottom: 12px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .command-info {
                    flex: 1;
                }
                .command-name {
                    font-weight: bold;
                    font-size: 16px;
                    margin-bottom: 4px;
                }
                .command-description {
                    font-size: 14px;
                    color: #666;
                    margin-bottom: 4px;
                }
                .command-usage {
                    font-size: 14px;
                    color: #888;
                    font-family: 'Consolas', 'Courier New', monospace;
                }
                .command-actions {
                    display: flex;
                    gap: 8px;
                }
                button {
                    background-color: #0e639c;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    padding: 6px 12px;
                    cursor: pointer;
                    font-size: 14px;
                }
                button:hover {
                    background-color: #1177bb;
                }
                button.delete {
                    background-color: #e74c3c;
                }
                button.delete:hover {
                    background-color: #c0392b;
                }
                .form-container {
                    background-color: #f9f9f9;
                    border-radius: 4px;
                    padding: 16px;
                    margin-bottom: 24px;
                }
                input, textarea, select {
                    width: 100%;
                    padding: 8px;
                    margin-bottom: 12px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    font-size: 14px;
                }
                textarea {
                    resize: vertical;
                    min-height: 80px;
                }
                .form-row {
                    margin-bottom: 12px;
                }
                .form-row label {
                    display: block;
                    margin-bottom: 4px;
                    font-weight: bold;
                }
                .options-container {
                    margin-top: 8px;
                }
                .option-item {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 8px;
                }
                .option-item input {
                    flex: 1;
                }
                .add-option, .remove-option {
                    align-self: flex-end;
                }
                .examples-container {
                    margin-top: 8px;
                }
                .example-item {
                    margin-bottom: 8px;
                }
                .add-example, .remove-example {
                    align-self: flex-end;
                }
            </style>
        </head>
        <body>
            <h1>Custom Commands</h1>
            
            <div class="form-container">
                <h2>Add New Command</h2>
                <form id="addCommandForm">
                    <div class="form-row">
                        <label for="name">Command Name:</label>
                        <input type="text" id="name" required>
                    </div>
                    <div class="form-row">
                        <label for="description">Description:</label>
                        <textarea id="description" required></textarea>
                    </div>
                    <div class="form-row">
                        <label for="usage">Usage:</label>
                        <input type="text" id="usage" required>
                    </div>
                    <div class="form-row">
                        <label for="category">Category:</label>
                        <input type="text" id="category" required>
                    </div>
                    <div class="form-row">
                        <label>Examples:</label>
                        <div class="examples-container" id="examplesContainer">
                            <div class="example-item">
                                <input type="text" placeholder="Example command">
                                <button type="button" class="remove-example">Remove</button>
                            </div>
                        </div>
                        <button type="button" class="add-example">Add Example</button>
                    </div>
                    <div class="form-row">
                        <label>Options:</label>
                        <div class="options-container" id="optionsContainer">
                            <div class="option-item">
                                <input type="text" placeholder="Flag (e.g., -f)" class="option-flag">
                                <input type="text" placeholder="Description" class="option-description">
                                <button type="button" class="remove-option">Remove</button>
                            </div>
                        </div>
                        <button type="button" class="add-option">Add Option</button>
                    </div>
                    <button type="submit">Add Command</button>
                </form>
            </div>
            
            <h2>Existing Custom Commands</h2>
            <ul class="command-list" id="commandList">
        `;
        if (customCommands.length === 0) {
            html += `
                <li class="command-item">
                    <div class="command-info">
                        <div class="command-name">No custom commands yet</div>
                        <div class="command-description">Add your first custom command above</div>
                    </div>
                </li>
            `;
        }
        else {
            customCommands.forEach(command => {
                html += `
                <li class="command-item">
                    <div class="command-info">
                        <div class="command-name">${command.name}</div>
                        <div class="command-description">${command.description}</div>
                        <div class="command-usage">${command.usage}</div>
                    </div>
                    <div class="command-actions">
                        <button onclick="editCommand('${command.name}')">Edit</button>
                        <button class="delete" onclick="deleteCommand('${command.name}')">Delete</button>
                    </div>
                </li>
                `;
            });
        }
        html += `
            </ul>
            
            <script>
                // 添加示例
                document.querySelector('.add-example').addEventListener('click', function() {
                    const container = document.getElementById('examplesContainer');
                    const exampleItem = document.createElement('div');
                    exampleItem.className = 'example-item';
                    exampleItem.innerHTML = "<input type=\"text\" placeholder=\"Example command\"><button type=\"button\" class=\"remove-example\">Remove</button>";
                    container.appendChild(exampleItem);
                    // 添加移除事件
                    exampleItem.querySelector('.remove-example').addEventListener('click', function() {
                        exampleItem.remove();
                    });
                });
                
                // 添加选项
                document.querySelector('.add-option').addEventListener('click', function() {
                    const container = document.getElementById('optionsContainer');
                    const optionItem = document.createElement('div');
                    optionItem.className = 'option-item';
                    optionItem.innerHTML = "<input type=\"text\" placeholder=\"Flag (e.g., -f)\" class=\"option-flag\"><input type=\"text\" placeholder=\"Description\" class=\"option-description\"><button type=\"button\" class=\"remove-option\">Remove</button>";
                    container.appendChild(optionItem);
                    // 添加移除事件
                    optionItem.querySelector('.remove-option').addEventListener('click', function() {
                        optionItem.remove();
                    });
                });
                
                // 移除示例
                document.querySelectorAll('.remove-example').forEach(function(button) {
                    button.addEventListener('click', function() {
                        button.parentElement.remove();
                    });
                });
                
                // 移除选项
                document.querySelectorAll('.remove-option').forEach(function(button) {
                    button.addEventListener('click', function() {
                        button.parentElement.remove();
                    });
                });
                
                // 表单提交
                document.getElementById('addCommandForm').addEventListener('submit', function(e) {
                    e.preventDefault();
                    
                    // 收集表单数据
                    const name = document.getElementById('name').value;
                    const description = document.getElementById('description').value;
                    const usage = document.getElementById('usage').value;
                    const category = document.getElementById('category').value;
                    
                    // 收集示例
                    const examples = [];
                    document.querySelectorAll('.example-item input').forEach(input => {
                        if (input.value.trim()) {
                            examples.push(input.value.trim());
                        }
                    });
                    
                    // 收集选项
                    const options = [];
                    document.querySelectorAll('.option-item').forEach(item => {
                        const flag = item.querySelector('.option-flag').value.trim();
                        const description = item.querySelector('.option-description').value.trim();
                        if (flag && description) {
                            options.push({ flag, description });
                        }
                    });
                    
                    // 发送消息到扩展
                    vscode.postMessage({
                        command: 'addCommand',
                        commandInfo: {
                            name,
                            description,
                            usage,
                            category,
                            examples: examples.length > 0 ? examples : undefined,
                            options: options.length > 0 ? options : undefined
                        }
                    });
                    
                    // 重置表单
                    document.getElementById('addCommandForm').reset();
                    const examplesContainer = document.getElementById('examplesContainer');
                    examplesContainer.innerHTML = "<div class=\"example-item\"><input type=\"text\" placeholder=\"Example command\"><button type=\"button\" class=\"remove-example\">Remove</button></div>";
                    const optionsContainer = document.getElementById('optionsContainer');
                    optionsContainer.innerHTML = "<div class=\"option-item\"><input type=\"text\" placeholder=\"Flag (e.g., -f)\" class=\"option-flag\"><input type=\"text\" placeholder=\"Description\" class=\"option-description\"><button type=\"button\" class=\"remove-option\">Remove</button></div>";
                });
                
                // 编辑命令
                function editCommand(commandName) {
                    // 这里可以实现编辑功能，暂时简单实现
                    vscode.postMessage({
                        command: 'editCommand',
                        commandInfo: { name: commandName }
                    });
                }
                
                // 删除命令
                function deleteCommand(commandName) {
                    if (confirm('Are you sure you want to delete this command?')) {
                        vscode.postMessage({
                            command: 'deleteCommand',
                            commandName
                        });
                    }
                }
            </script>
        </body>
        </html>
        `;
        this.customCommandsPanel.webview.html = html;
    }
    // 添加自定义命令
    addCustomCommand(commandInfo) {
        const success = (0, commandDatabase_1.addCustomCommand)(commandInfo);
        if (success) {
            this.saveCustomCommands();
            this.updateCustomCommandsPanel();
            vscode.window.showInformationMessage(`Command "${commandInfo.name}" added successfully`);
        }
        else {
            vscode.window.showErrorMessage(`Command "${commandInfo.name}" already exists`);
        }
    }
    // 编辑自定义命令
    editCustomCommand(commandInfo) {
        // 这里可以实现更复杂的编辑功能，暂时只做简单提示
        vscode.window.showInformationMessage(`Edit command: ${commandInfo.name}`);
    }
    // 删除自定义命令
    deleteCustomCommand(commandName) {
        const success = (0, commandDatabase_1.deleteCustomCommand)(commandName);
        if (success) {
            this.saveCustomCommands();
            this.updateCustomCommandsPanel();
            vscode.window.showInformationMessage(`Command "${commandName}" deleted successfully`);
        }
        else {
            vscode.window.showErrorMessage(`Command "${commandName}" not found`);
        }
    }
    // 导出自定义命令
    exportCustomCommands() {
        const customCommands = (0, commandDatabase_1.exportCustomCommands)();
        if (customCommands.length === 0) {
            vscode.window.showInformationMessage('No custom commands to export');
            return;
        }
        // 打开文件保存对话框
        vscode.window.showSaveDialog({
            filters: {
                'JSON Files': ['json']
            },
            defaultUri: vscode.Uri.file(path.join(process.env.HOME || '', 'custom-commands.json'))
        }).then(uri => {
            if (uri) {
                try {
                    fs.writeFileSync(uri.fsPath, JSON.stringify(customCommands, null, 2));
                    vscode.window.showInformationMessage(`Custom commands exported to ${uri.fsPath}`);
                }
                catch (error) {
                    vscode.window.showErrorMessage('Failed to export custom commands');
                }
            }
        });
    }
    // 导入自定义命令
    importCustomCommands() {
        // 打开文件选择对话框
        vscode.window.showOpenDialog({
            filters: {
                'JSON Files': ['json']
            },
            canSelectFiles: true,
            canSelectFolders: false,
            canSelectMany: false
        }).then(uris => {
            if (uris && uris.length > 0) {
                try {
                    const content = fs.readFileSync(uris[0].fsPath, 'utf8');
                    const commands = JSON.parse(content);
                    if (Array.isArray(commands)) {
                        const result = (0, commandDatabase_1.importCustomCommands)(commands);
                        this.saveCustomCommands();
                        vscode.window.showInformationMessage(`Imported ${result.success} commands, failed to import ${result.failed} commands`);
                    }
                    else {
                        vscode.window.showErrorMessage('Invalid JSON format: expected an array of commands');
                    }
                }
                catch (error) {
                    vscode.window.showErrorMessage('Failed to import custom commands');
                }
            }
        });
    }
}
exports.CommandAutocomplete = CommandAutocomplete;
let commandAutocomplete;
function activate(context) {
    commandAutocomplete = new CommandAutocomplete(context);
    commandAutocomplete.activate();
}
function deactivate() { }
//# sourceMappingURL=extension.js.map