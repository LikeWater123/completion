const { searchCommands, getCommandInfo, addCustomCommand, deleteCustomCommand } = require('./out/commandDatabase');

// 运行用户体验测试
async function runUserExperienceTest() {
    console.log('Running user experience test...');
    
    // 测试启动时间
    console.log('Testing startup performance...');
    const start = performance.now();
    
    // 模拟插件启动过程
    for (let i = 0; i < 10; i++) {
        searchCommands('l');
        getCommandInfo('ls');
    }
    
    const end = performance.now();
    const startupTime = end - start;
    console.log(`Startup time (10 operations): ${startupTime.toFixed(2)}ms`);
    
    // 测试连续操作的性能
    console.log('\nTesting continuous operation performance...');
    const operations = [];
    
    // 模拟用户连续输入不同命令前缀
    const prefixes = ['l', 'g', 'n', 'd', 'k', 'c', 'e', 'm', 'r', 's'];
    
    for (const prefix of prefixes) {
        const opStart = performance.now();
        searchCommands(prefix);
        const opEnd = performance.now();
        operations.push({ prefix, time: opEnd - opStart });
    }
    
    // 计算平均操作时间
    const averageOperationTime = operations.reduce((sum, op) => sum + op.time, 0) / operations.length;
    console.log(`Average operation time: ${averageOperationTime.toFixed(2)}ms`);
    
    // 测试内存使用情况
    console.log('\nTesting memory usage...');
    const memoryBefore = process.memoryUsage();
    console.log(`Memory usage before: ${Math.round(memoryBefore.heapUsed / 1024 / 1024 * 100) / 100} MB`);
    
    // 执行大量操作以测试内存使用
    for (let i = 0; i < 1000; i++) {
        searchCommands(String.fromCharCode(97 + (i % 26))); // 循环使用a-z作为前缀
        if (i % 100 === 0) {
            getCommandInfo('ls');
        }
    }
    
    const memoryAfter = process.memoryUsage();
    console.log(`Memory usage after: ${Math.round(memoryAfter.heapUsed / 1024 / 1024 * 100) / 100} MB`);
    console.log(`Memory difference: ${Math.round((memoryAfter.heapUsed - memoryBefore.heapUsed) / 1024 / 1024 * 100) / 100} MB`);
    
    // 测试自定义命令管理的响应速度
    console.log('\nTesting custom command management...');
    
    const customCommand = {
        name: 'test-custom-command',
        description: 'Test custom command for user experience',
        usage: 'test-custom-command [options]',
        category: 'test'
    };
    
    // 测试添加自定义命令
    const addStart = performance.now();
    const addResult = addCustomCommand(customCommand);
    const addEnd = performance.now();
    console.log(`Add custom command: ${addEnd - addStart.toFixed(2)}ms (${addResult ? 'success' : 'failed'})`);
    
    // 测试搜索自定义命令
    const searchStart = performance.now();
    const searchResults = searchCommands('test');
    const searchEnd = performance.now();
    console.log(`Search custom command: ${searchEnd - searchStart.toFixed(2)}ms (${searchResults.length} results)`);
    
    // 测试删除自定义命令
    const deleteStart = performance.now();
    const deleteResult = deleteCustomCommand('test-custom-command');
    const deleteEnd = performance.now();
    console.log(`Delete custom command: ${deleteEnd - deleteStart.toFixed(2)}ms (${deleteResult ? 'success' : 'failed'})`);
    
    // 总结
    console.log('\n=== User Experience Test Results ===');
    console.log(`Startup time: ${startupTime.toFixed(2)}ms`);
    console.log(`Average operation time: ${averageOperationTime.toFixed(2)}ms`);
    console.log(`Memory usage change: ${Math.round((memoryAfter.heapUsed - memoryBefore.heapUsed) / 1024 / 1024 * 100) / 100} MB`);
    
    // 评估用户体验
    if (averageOperationTime < 50 && startupTime < 100 && (memoryAfter.heapUsed - memoryBefore.heapUsed) < 10 * 1024 * 1024) {
        console.log('✅ User experience test passed! Plugin runs smoothly.');
    } else {
        console.log('❌ User experience test failed! Plugin may not run smoothly.');
    }
}

// 运行测试
runUserExperienceTest().catch(console.error);
