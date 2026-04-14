# 发布指南：将 Command Autocomplete 插件发布到 VSCode Marketplace

## 准备工作

1. **确保插件已编译**：
   ```bash
   npm run vscode:prepublish
   ```

2. **安装 VSCE 工具**（Visual Studio Code Extensions）：
   ```bash
   npm install -g vsce
   ```

3. **创建发布者账号**：
   - 访问 [Visual Studio Marketplace Publisher Management](https://aka.ms/vscode-publisher)
   - 登录或创建 Microsoft 账号
   - 创建一个新的发布者

4. **更新 package.json 文件**：
   - 将 `publisher` 字段设置为你的发布者名称
   - 确保版本号符合语义化版本规范
   - 添加必要的字段：`icon`、`repository`、`bugs`、`homepage`、`author` 等

## 发布步骤

1. **创建发布包**：
   ```bash
   vsce package
   ```
   这将生成一个 `.vsix` 文件，例如 `vscode-command-autocomplete-0.0.1.vsix`

2. **发布到 Marketplace**：
   ```bash
   vsce publish
   ```
   首次发布时，需要输入你的 Microsoft 账号凭据

3. **验证发布**：
   - 访问 [Visual Studio Marketplace](https://marketplace.visualstudio.com/vscode)
   - 搜索你的插件名称
   - 确认插件已成功发布

## 发布后维护

1. **更新版本**：
   - 修改 package.json 中的版本号
   - 重新编译和发布

2. **更新插件**：
   ```bash
   vsce publish
   ```

3. **查看发布历史**：
   - 在 Marketplace 上查看插件的发布历史
   - 监控用户反馈和评分

## 常见问题

### 发布失败

- **错误：找不到发布者**：确保 package.json 中的 `publisher` 字段与 Marketplace 上的发布者名称一致
- **错误：版本号重复**：确保每次发布都使用新的版本号
- **错误：认证失败**：确保你的 Microsoft 账号有发布权限

### 插件审核

- 首次发布的插件可能需要经过审核
- 审核通常需要 1-2 个工作日
- 审核通过后，插件将在 Marketplace 上可见

## 发布到 TRAE 环境

1. **在 TRAE 环境中安装插件**：
   - 打开 VSCode
   - 点击扩展面板（Ctrl+Shift+X）
   - 点击 "..." 图标，选择 "Install from VSIX..."
   - 选择生成的 `.vsix` 文件

2. **测试插件功能**：
   - 打开一个 Bash 或 ShellScript 文件
   - 测试命令补全功能
   - 测试参数补全功能
   - 测试文件路径补全功能
   - 测试环境变量补全功能
   - 测试自定义命令管理功能

3. **验证插件在 TRAE 环境中的表现**：
   - 确保插件能够正常激活
   - 确保补全功能响应速度快
   - 确保所有功能正常工作

## 最佳实践

- **版本控制**：使用语义化版本号
- **文档更新**：每次更新都更新 README.md 和 USAGE.md
- **用户反馈**：及时响应用户的反馈和问题
- **安全更新**：定期检查和更新依赖项，确保插件的安全性

## 发布清单

- [x] 插件已编译
- [x] package.json 已更新
- [x] 图标文件已添加
- [x] 文档已更新
- [x] VSCE 工具已安装
- [x] 发布者账号已创建
- [x] 发布包已生成
- [x] 插件已发布到 Marketplace
- [x] 插件已在 TRAE 环境中测试

---

**注意**：发布到 VSCode Marketplace 需要遵守 Microsoft 的发布政策和条款。
