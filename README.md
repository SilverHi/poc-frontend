# User Story 生成工具

基于 AI Agent 的智能需求分析与 User Story 生成平台，采用 OpenAI 风格的现代化界面设计。

## 功能特性

### 🎯 核心功能
- **智能 Agent 编排**: 提供多种预制 AI Agent，支持语法检查、语义分析、需求验证、Story 生成等功能
- **可视化工作流**: 支持拖拽式 Agent 组合，实时查看执行过程和结果
- **多源输入支持**: 支持文本输入、文档引用、模板应用等多种输入方式
- **人工干预机制**: 在 AI 生成过程中支持实时调整和优化

### 🎨 界面设计
- **左中右布局**: 清晰的三栏式布局，操作流程直观
- **OpenAI 风格**: 采用现代化的设计语言，简洁美观
- **响应式设计**: 支持不同屏幕尺寸的自适应显示

### 🔧 技术栈
- **前端框架**: Next.js 14 + React 18
- **样式系统**: Tailwind CSS
- **类型支持**: TypeScript
- **开发工具**: ESLint + Prettier

## 快速开始

### 环境要求
- Node.js 18.0 或更高版本
- npm 或 yarn 包管理器

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 使用指南

### 1. 选择输入资源
在左侧边栏中选择相关的文档和模板作为参考：
- 📄 **文档类型**: 产品需求文档、用户调研报告等
- 🔗 **引用类型**: 竞品分析、技术约束等
- 📋 **模板类型**: User Story 模板、验收条件模板等
- 📝 **文本类型**: 自由文本输入

### 2. 输入内容
在中间区域的文本框中输入您的需求描述、问题或想要处理的内容。

### 3. 选择 AI Agent
在右侧边栏中选择合适的 Agent 来处理您的内容：

#### 🔍 分析类 Agent
- **语义分析**: 分析文本的语义结构和逻辑关系
- **优先级分析**: 分析和建议 User Story 的优先级
- **依赖分析**: 分析 User Story 之间的依赖关系

#### ✅ 验证类 Agent
- **语法检查**: 检查文本的语法错误和表达规范性
- **需求验证**: 验证需求的完整性和可行性

#### 📖 生成类 Agent
- **Story 生成**: 基于输入生成标准的 User Story
- **验收条件生成**: 为 User Story 生成详细的验收条件

#### ⚡ 优化类 Agent
- **Story 优化**: 优化 User Story 的表达和结构

### 4. 执行工作流
1. 选择输入资源和 Agent 后，点击"执行"按钮
2. 观察实时执行日志和进度
3. 查看生成的结果
4. 可以将结果作为下一个 Agent 的输入，形成工作流链

### 5. 工作流管理
- **链式执行**: 上一个 Agent 的输出自动成为下一个的输入
- **结果查看**: 支持滚动查看历史执行结果
- **工作流清空**: 一键清空当前工作流，重新开始

## 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # 主页面组件
│   ├── layout.tsx         # 根布局组件
│   └── globals.css        # 全局样式
├── components/            # React 组件
│   ├── InputResourceCard.tsx  # 输入资源卡片
│   ├── AgentCard.tsx          # Agent 卡片
│   └── WorkflowStep.tsx       # 工作流步骤
├── types/                 # TypeScript 类型定义
│   └── index.ts
└── data/                  # 模拟数据
    └── mockData.ts
```

## 开发说明

### 添加新的 Agent
1. 在 `src/data/mockData.ts` 中的 `mockAgents` 数组添加新的 Agent 定义
2. 在 `executeAgent` 函数中添加对应的处理逻辑
3. 根据需要调整 Agent 的分类和样式

### 添加新的输入资源类型
1. 在 `src/types/index.ts` 中扩展 `InputResource` 类型
2. 在 `src/data/mockData.ts` 中添加新的资源示例
3. 在 `InputResourceCard` 组件中添加对应的图标和样式

### 自定义样式
项目使用 Tailwind CSS，可以通过修改 `tailwind.config.js` 来自定义主题和样式。

## 部署

### 构建生产版本
```bash
npm run build
```

### 启动生产服务器
```bash
npm start
```

## 贡献指南

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 联系方式

如有问题或建议，请通过以下方式联系：
- 提交 Issue
- 发送邮件
- 参与讨论

---

**注意**: 当前版本使用模拟数据，实际的 AI Agent 调用需要集成真实的 AI 服务。
