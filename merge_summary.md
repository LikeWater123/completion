此次合并主要添加了 TypeScript ESLint 相关依赖包、ESLint 核心依赖包、yargs 命令行工具及其依赖，以及其他工具包，为项目提供了完整的 TypeScript 代码检查和命令行解析能力。
| 文件 | 变更 |
|------|---------|
| node_modules/@typescript-eslint/eslint-plugin | 添加了 TypeScript ESLint 插件，包含各种 TypeScript 相关的 ESLint 规则和工具函数 |
| node_modules/@typescript-eslint/parser | 添加了 TypeScript ESLint 解析器，用于解析 TypeScript 代码 |
| node_modules/@typescript-eslint/scope-manager | 添加了 TypeScript ESLint 作用域管理器，用于分析 TypeScript 代码的作用域 |
| node_modules/@typescript-eslint/type-utils | 添加了 TypeScript ESLint 类型工具，提供类型相关的工具函数 |
| node_modules/@typescript-eslint/types | 添加了 TypeScript ESLint 类型定义，为其他包提供类型支持 |
| node_modules/@typescript-eslint/typescript-estree | 添加了 TypeScript ESLint 的 TypeScript 到 ESTree 转换器 |
| node_modules/@typescript-eslint/utils | 添加了 TypeScript ESLint 工具函数，为规则和插件提供通用功能 |
| node_modules/@typescript-eslint/visitor-keys | 添加了 TypeScript ESLint 访问者键，用于 AST 遍历 |
| node_modules/@eslint-community/eslint-utils | 添加了 ESLint 工具函数，为 ESLint 规则提供通用功能 |
| node_modules/@eslint-community/regexpp | 添加了正则表达式解析器，用于 ESLint 规则中的正则表达式处理 |
| node_modules/@eslint/eslintrc | 添加了 ESLint 配置加载器，用于加载和解析 ESLint 配置 |
| node_modules/@ungap/structured-clone | 添加了结构化克隆实现，用于对象深拷贝 |
| node_modules/@vscode/test-electron | 添加了 VS Code 测试工具，用于 VS Code 扩展测试 |
| node_modules/acorn | 添加了 JavaScript 解析器，用于解析 JavaScript 代码 |
| node_modules/acorn-jsx | 添加了 JSX 解析器，用于解析 JSX 语法 |
| node_modules/yargs | 添加了命令行参数解析工具，用于处理命令行选项 |
| node_modules/yocto-queue | 添加了高效队列实现，用于需要频繁 push 和 shift 操作的场景