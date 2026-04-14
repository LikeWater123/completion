"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.builtinCommandDatabase = void 0;
exports.getCommandDatabase = getCommandDatabase;
exports.getCommandsByCategory = getCommandsByCategory;
exports.searchCommands = searchCommands;
exports.getCommandInfo = getCommandInfo;
exports.loadCustomCommands = loadCustomCommands;
exports.getCustomCommands = getCustomCommands;
exports.addCustomCommand = addCustomCommand;
exports.updateCustomCommand = updateCustomCommand;
exports.deleteCustomCommand = deleteCustomCommand;
exports.exportCustomCommands = exportCustomCommands;
exports.importCustomCommands = importCustomCommands;
// 内置命令数据库
exports.builtinCommandDatabase = [
    {
        name: 'ls',
        description: '列出目录内容',
        usage: 'ls [选项] [路径]',
        category: '文件系统',
        examples: [
            'ls -la',
            'ls -h',
            'ls /path/to/directory'
        ],
        options: [
            { flag: '-l', description: '以长格式显示' },
            { flag: '-a', description: '显示隐藏文件' },
            { flag: '-h', description: '以人类可读格式显示文件大小' }
        ],
        os: ['linux', 'darwin']
    },
    {
        name: 'cd',
        description: '切换目录',
        usage: 'cd [目录路径]',
        category: '文件系统',
        os: ['linux', 'darwin', 'win32']
    },
    {
        name: 'pwd',
        description: '显示当前工作目录',
        usage: 'pwd',
        category: '文件系统',
        os: ['linux', 'darwin']
    },
    {
        name: 'mkdir',
        description: '创建新目录',
        usage: 'mkdir [选项] 目录名',
        category: '文件系统',
        options: [
            { flag: '-p', description: '递归创建目录' }
        ],
        os: ['linux', 'darwin']
    },
    {
        name: 'rm',
        description: '删除文件或目录',
        usage: 'rm [选项] 文件或目录',
        category: '文件系统',
        options: [
            { flag: '-r', description: '递归删除目录' },
            { flag: '-f', description: '强制删除，不提示' }
        ],
        os: ['linux', 'darwin']
    },
    {
        name: 'cp',
        description: '复制文件或目录',
        usage: 'cp [选项] 源 目标',
        category: '文件系统',
        options: [
            { flag: '-r', description: '递归复制目录' },
            { flag: '-i', description: '覆盖前提示' }
        ],
        os: ['linux', 'darwin']
    },
    {
        name: 'mv',
        description: '移动或重命名文件或目录',
        usage: 'mv [选项] 源 目标',
        category: '文件系统',
        options: [
            { flag: '-i', description: '覆盖前提示' }
        ],
        os: ['linux', 'darwin']
    },
    {
        name: 'cat',
        description: '查看文件内容',
        usage: 'cat [选项] 文件',
        category: '文件系统',
        os: ['linux', 'darwin']
    },
    {
        name: 'grep',
        description: '在文件中搜索模式',
        usage: 'grep [选项] 模式 文件',
        category: '文件系统',
        options: [
            { flag: '-i', description: '忽略大小写' },
            { flag: '-r', description: '递归搜索' },
            { flag: '-n', description: '显示行号' }
        ],
        os: ['linux', 'darwin']
    },
    {
        name: 'find',
        description: '查找文件',
        usage: 'find 路径 [选项] 表达式',
        category: '文件系统',
        options: [
            { flag: '-name', description: '按名称查找' },
            { flag: '-type', description: '按类型查找' },
            { flag: '-size', description: '按大小查找' }
        ],
        os: ['linux', 'darwin']
    },
    {
        name: 'dir',
        description: '列出目录内容',
        usage: 'dir [选项] [路径]',
        category: '文件系统',
        os: ['win32']
    },
    {
        name: 'mkdir',
        description: '创建新目录',
        usage: 'mkdir [选项] 目录名',
        category: '文件系统',
        os: ['win32']
    },
    {
        name: 'del',
        description: '删除文件',
        usage: 'del [选项] 文件',
        category: '文件系统',
        os: ['win32']
    },
    {
        name: 'copy',
        description: '复制文件',
        usage: 'copy [选项] 源 目标',
        category: '文件系统',
        os: ['win32']
    },
    {
        name: 'move',
        description: '移动或重命名文件',
        usage: 'move [选项] 源 目标',
        category: '文件系统',
        os: ['win32']
    },
    {
        name: 'type',
        description: '查看文件内容',
        usage: 'type 文件',
        category: '文件系统',
        os: ['win32']
    },
    {
        name: 'find',
        description: '查找文件',
        usage: 'find 路径 [选项]',
        category: '文件系统',
        os: ['win32']
    },
    {
        name: 'git',
        description: '版本控制系统',
        usage: 'git [命令] [选项]',
        category: '开发工具',
        examples: [
            'git add .',
            'git commit -m "Add new feature"',
            'git push origin main',
            'git pull',
            'git status'
        ],
        options: [
            { flag: 'add', description: '添加文件到暂存区' },
            { flag: 'commit', description: '提交更改' },
            { flag: 'push', description: '推送更改到远程仓库' },
            { flag: 'pull', description: '从远程仓库拉取更改' },
            { flag: 'status', description: '查看状态' }
        ],
        os: ['linux', 'darwin', 'win32']
    },
    {
        name: 'npm',
        description: 'Node.js包管理器',
        usage: 'npm [命令] [选项]',
        category: '开发工具',
        examples: [
            'npm install',
            'npm install express',
            'npm start',
            'npm test',
            'npm run build'
        ],
        options: [
            { flag: 'install', description: '安装包' },
            { flag: 'start', description: '启动应用' },
            { flag: 'test', description: '运行测试' },
            { flag: 'run', description: '运行脚本' }
        ],
        os: ['linux', 'darwin', 'win32']
    },
    {
        name: 'yarn',
        description: 'JavaScript包管理器',
        usage: 'yarn [命令] [选项]',
        category: '开发工具',
        options: [
            { flag: 'add', description: '添加依赖' },
            { flag: 'install', description: '安装依赖' },
            { flag: 'start', description: '启动应用' },
            { flag: 'test', description: '运行测试' }
        ],
        os: ['linux', 'darwin', 'win32']
    },
    {
        name: 'pip',
        description: 'Python包管理器',
        usage: 'pip [命令] [选项]',
        category: '开发工具',
        options: [
            { flag: 'install', description: '安装包' },
            { flag: 'uninstall', description: '卸载包' },
            { flag: 'list', description: '列出已安装的包' }
        ],
        os: ['linux', 'darwin', 'win32']
    },
    {
        name: 'docker',
        description: '容器化平台',
        usage: 'docker [命令] [选项]',
        category: '开发工具',
        options: [
            { flag: 'run', description: '运行容器' },
            { flag: 'build', description: '构建镜像' },
            { flag: 'ps', description: '列出容器' },
            { flag: 'images', description: '列出镜像' }
        ],
        os: ['linux', 'darwin', 'win32']
    },
    {
        name: 'kubectl',
        description: 'Kubernetes命令行工具',
        usage: 'kubectl [命令] [选项]',
        category: '开发工具',
        options: [
            { flag: 'get', description: '获取资源' },
            { flag: 'apply', description: '应用配置' },
            { flag: 'delete', description: '删除资源' },
            { flag: 'logs', description: '查看日志' }
        ],
        os: ['linux', 'darwin', 'win32']
    },
    {
        name: 'echo',
        description: '输出文本',
        usage: 'echo [选项] 字符串',
        category: 'shell内置',
        os: ['linux', 'darwin', 'win32']
    },
    {
        name: 'export',
        description: '设置环境变量',
        usage: 'export 变量名=值',
        category: 'shell内置',
        os: ['linux', 'darwin']
    },
    {
        name: 'unset',
        description: '取消设置环境变量',
        usage: 'unset 变量名',
        category: 'shell内置',
        os: ['linux', 'darwin']
    },
    {
        name: 'alias',
        description: '创建命令别名',
        usage: 'alias 别名=命令',
        category: 'shell内置',
        os: ['linux', 'darwin']
    },
    {
        name: 'set',
        description: '设置环境变量',
        usage: 'set 变量名=值',
        category: 'shell内置',
        os: ['win32']
    },
    {
        name: 'unset',
        description: '取消设置环境变量',
        usage: 'set 变量名=',
        category: 'shell内置',
        os: ['win32']
    }
];
// 自定义命令数据库
let customCommandDatabase = [];
// 命令搜索结果缓存
const commandSearchCache = new Map();
const commandInfoCache = new Map();
// 当自定义命令发生变化时清除缓存
function clearCaches() {
    commandSearchCache.clear();
    commandInfoCache.clear();
}
// 合并内置命令和自定义命令
function getCommandDatabase() {
    return [...exports.builtinCommandDatabase, ...customCommandDatabase];
}
// 按类别组织命令
function getCommandsByCategory() {
    const allCommands = getCommandDatabase();
    return allCommands.reduce((acc, command) => {
        if (!acc[command.category]) {
            acc[command.category] = [];
        }
        acc[command.category].push(command);
        return acc;
    }, {});
}
// 搜索命令
function searchCommands(prefix) {
    const cacheKey = prefix.toLowerCase();
    if (commandSearchCache.has(cacheKey)) {
        return commandSearchCache.get(cacheKey);
    }
    const allCommands = getCommandDatabase();
    const result = allCommands.filter(cmd => cmd.name.toLowerCase().startsWith(cacheKey));
    commandSearchCache.set(cacheKey, result);
    return result;
}
// 获取命令详情
function getCommandInfo(commandName) {
    if (commandInfoCache.has(commandName)) {
        return commandInfoCache.get(commandName);
    }
    const allCommands = getCommandDatabase();
    const result = allCommands.find(cmd => cmd.name === commandName);
    commandInfoCache.set(commandName, result);
    return result;
}
// 加载自定义命令
function loadCustomCommands(commands) {
    customCommandDatabase = commands;
    clearCaches();
}
// 获取自定义命令
function getCustomCommands() {
    return customCommandDatabase;
}
// 添加自定义命令
function addCustomCommand(command) {
    // 检查命令是否已存在
    if (getCommandInfo(command.name)) {
        return false;
    }
    // 添加到自定义命令数据库
    customCommandDatabase.push({
        ...command,
        isCustom: true
    });
    clearCaches();
    return true;
}
// 更新自定义命令
function updateCustomCommand(command) {
    const index = customCommandDatabase.findIndex(cmd => cmd.name === command.name);
    if (index === -1) {
        return false;
    }
    customCommandDatabase[index] = {
        ...command,
        isCustom: true
    };
    clearCaches();
    return true;
}
// 删除自定义命令
function deleteCustomCommand(commandName) {
    const index = customCommandDatabase.findIndex(cmd => cmd.name === commandName);
    if (index === -1) {
        return false;
    }
    customCommandDatabase.splice(index, 1);
    clearCaches();
    return true;
}
// 导出自定义命令
function exportCustomCommands() {
    return customCommandDatabase;
}
// 导入自定义命令
function importCustomCommands(commands) {
    let success = 0;
    let failed = 0;
    commands.forEach(command => {
        // 检查是否为有效的命令
        if (command.name && command.description && command.usage && command.category) {
            // 检查是否已存在
            if (!getCommandInfo(command.name)) {
                addCustomCommand(command);
                success++;
            }
            else {
                failed++;
            }
        }
        else {
            failed++;
        }
    });
    return { success, failed };
}
//# sourceMappingURL=commandDatabase.js.map