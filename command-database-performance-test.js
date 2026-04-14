const { searchCommands, getCommandInfo, loadCustomCommands, addCustomCommand } = require('./out/commandDatabase');

// 运行性能测试
async function runPerformanceTest() {
    console.log('Running command database performance test...');
    
    // 测试搜索命令的性能
    const searchTestCases = ['l', 'g', 'n', 'd', 'k', 'c'];
    
    // 预热缓存
    console.log('Warming up cache...');
    for (const prefix of searchTestCases) {
        searchCommands(prefix);
    }
    
    // 测量搜索响应时间
    console.log('Measuring search response times...');
    const searchTimes = [];
    for (const prefix of searchTestCases) {
        const start = performance.now();
        const results = searchCommands(prefix);
        const end = performance.now();
        const time = end - start;
        searchTimes.push(time);
        console.log(`Search for '${prefix}' (${results.length} results): ${time.toFixed(2)}ms`);
    }
    
    // 计算平均搜索响应时间
    const averageSearchTime = searchTimes.reduce((sum, time) => sum + time, 0) / searchTimes.length;
    console.log(`\nAverage search response time: ${averageSearchTime.toFixed(2)}ms`);
    
    // 测试获取命令详情的性能
    const commandInfoTestCases = ['ls', 'git', 'npm', 'docker', 'kubectl', 'cd'];
    
    // 预热缓存
    console.log('Warming up command info cache...');
    for (const command of commandInfoTestCases) {
        getCommandInfo(command);
    }
    
    // 测量获取命令详情的响应时间
    console.log('Measuring command info response times...');
    const infoTimes = [];
    for (const command of commandInfoTestCases) {
        const start = performance.now();
        const info = getCommandInfo(command);
        const end = performance.now();
        const time = end - start;
        infoTimes.push(time);
        console.log(`Get info for '${command}': ${time.toFixed(2)}ms`);
    }
    
    // 计算平均获取命令详情响应时间
    const averageInfoTime = infoTimes.reduce((sum, time) => sum + time, 0) / infoTimes.length;
    console.log(`\nAverage command info response time: ${averageInfoTime.toFixed(2)}ms`);
    
    // 测试添加自定义命令的性能
    console.log('Testing custom command addition...');
    const customCommand = {
        name: 'testcmd',
        description: 'Test command',
        usage: 'testcmd [options]',
        category: 'test'
    };
    
    const start = performance.now();
    const result = addCustomCommand(customCommand);
    const end = performance.now();
    const addTime = end - start;
    console.log(`Add custom command: ${addTime.toFixed(2)}ms (${result ? 'success' : 'failed'})`);
    
    // 计算总体平均响应时间
    const allTimes = [...searchTimes, ...infoTimes, addTime];
    const overallAverageTime = allTimes.reduce((sum, time) => sum + time, 0) / allTimes.length;
    console.log(`\nOverall average response time: ${overallAverageTime.toFixed(2)}ms`);
    
    // 检查是否符合要求
    if (overallAverageTime < 200) {
        console.log('✅ Performance test passed! Average response time is less than 200ms.');
    } else {
        console.log('❌ Performance test failed! Average response time exceeds 200ms.');
    }
    
    return overallAverageTime;
}

// 运行测试
runPerformanceTest().catch(console.error);
