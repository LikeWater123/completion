const { searchCommands, getCommandInfo, loadCustomCommands, addCustomCommand, deleteCustomCommand } = require('./out/commandDatabase');

// 模拟不同操作系统环境
const operatingSystems = ['win32', 'linux', 'darwin'];

// 运行稳定性测试
async function runStabilityTest() {
    console.log('Running stability test across different environments...');
    
    for (const os of operatingSystems) {
        console.log(`\n=== Testing on ${os} ===`);
        
        // 模拟操作系统环境
        const originalPlatform = process.platform;
        Object.defineProperty(process, 'platform', { value: os });
        
        try {
            // 测试命令搜索
            console.log('Testing command search...');
            const searchTestCases = ['l', 'g', 'n', 'd', 'k', 'c'];
            for (const prefix of searchTestCases) {
                const results = searchCommands(prefix);
                console.log(`  Search for '${prefix}': ${results.length} results`);
            }
            
            // 测试获取命令详情
            console.log('Testing command info retrieval...');
            const commandInfoTestCases = ['ls', 'git', 'npm', 'docker', 'kubectl', 'cd'];
            for (const command of commandInfoTestCases) {
                const info = getCommandInfo(command);
                if (info) {
                    console.log(`  Get info for '${command}': found`);
                } else {
                    console.log(`  Get info for '${command}': not found`);
                }
            }
            
            // 测试自定义命令管理
            console.log('Testing custom command management...');
            
            // 添加自定义命令
            const customCommand = {
                name: `testcmd-${os}`,
                description: `Test command for ${os}`,
                usage: `testcmd-${os} [options]`,
                category: 'test'
            };
            
            const addResult = addCustomCommand(customCommand);
            console.log(`  Add custom command: ${addResult ? 'success' : 'failed'}`);
            
            // 搜索自定义命令
            const customResults = searchCommands('testcmd');
            console.log(`  Search for custom command: ${customResults.length} results`);
            
            // 删除自定义命令
            const deleteResult = deleteCustomCommand(`testcmd-${os}`);
            console.log(`  Delete custom command: ${deleteResult ? 'success' : 'failed'}`);
            
            console.log(`✅ ${os} environment test passed!`);
            
        } catch (error) {
            console.error(`❌ ${os} environment test failed:`, error);
        } finally {
            // 恢复原始平台
            Object.defineProperty(process, 'platform', { value: originalPlatform });
        }
    }
    
    console.log('\n=== Stability test completed ===');
}

// 运行测试
runStabilityTest().catch(console.error);
