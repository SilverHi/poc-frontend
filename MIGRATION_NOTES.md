# 项目改造说明

## 改造概述

本项目已成功从 **Next.js + React + Ant Design** 改造为 **Vite + React + Ant Design + Mock API** 的纯前端项目。

## 主要变更

### 1. 构建工具变更
- ❌ 移除：Next.js 框架
- ✅ 新增：Vite 作为构建工具和开发服务器

### 2. 项目结构调整
```
原 Next.js 结构:
src/
  app/
    page.tsx (主页面)
    layout.tsx (布局)
    api/ (API路由)
    globals.css

新 Vite 结构:
src/
  App.tsx (主应用组件)
  main.tsx (入口文件)
  index.css (全局样式)
  services/mockApi.ts (Mock API服务)
```

### 3. API 服务改造
- ❌ 移除：Next.js API 路由 (`/api/*`)
- ✅ 新增：Mock API 服务 (`src/services/mockApi.ts`)
- ✅ 模拟数据：替换真实后端调用为 mock 数据

### 4. 依赖变更

#### 移除的依赖：
- `next` - Next.js 框架
- `@ant-design/nextjs-registry` - Next.js 专用的 Ant Design 注册器
- `@types/multer` - 文件上传相关
- `@types/pdf-parse` - PDF 解析相关
- `multer` - 文件上传中间件
- `openai` - OpenAI API 客户端
- `pdf-parse` - PDF 解析库
- `sqlite3` - SQLite 数据库

#### 新增的依赖：
- `vite` - 构建工具
- `@vitejs/plugin-react` - React 插件
- `axios` - HTTP 客户端（为未来 API 调用准备）
- `@tailwindcss/postcss` - Tailwind CSS PostCSS 插件
- `autoprefixer` - CSS 自动前缀

### 5. 配置文件变更
- ✅ 新增：`vite.config.ts` - Vite 配置
- ✅ 新增：`index.html` - 入口 HTML 文件
- ✅ 更新：`postcss.config.mjs` - PostCSS 配置
- ✅ 更新：`.eslintrc.js` - ESLint 配置
- ❌ 移除：`next.config.ts` - Next.js 配置
- ❌ 移除：`next-env.d.ts` - Next.js 类型定义

## 功能保持

### 保留的功能：
- ✅ 用户故事生成器界面
- ✅ AI Agent 选择和执行
- ✅ 资源管理和选择
- ✅ 对话链功能
- ✅ Ant Design UI 组件
- ✅ Tailwind CSS 样式

### Mock 化的功能：
- 🔄 自定义 Agent 管理（使用 mock 数据）
- 🔄 资源文件管理（使用 mock 数据）
- 🔄 Agent 执行（使用 mock 响应）

## 启动方式

### 开发环境：
```bash
npm run dev
```
访问：http://localhost:3000

### 构建生产版本：
```bash
npm run build
```

### 预览生产版本：
```bash
npm run preview
```

## 后续集成 Python 后端

当 Python 后端准备就绪时，只需要：

1. 更新 `src/services/mockApi.ts` 中的 API 端点
2. 将 mock 响应替换为真实的 HTTP 请求
3. 配置 Vite 的代理设置（如果需要）

示例配置：
```typescript
// vite.config.ts
export default defineConfig({
  // ...
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000', // Python 后端地址
        changeOrigin: true,
      },
    },
  },
})
```

## 注意事项

1. **路由**：由于移除了 Next.js，目前是单页应用。如需路由功能，可考虑添加 React Router。

2. **SEO**：纯前端项目不利于 SEO。如有 SEO 需求，建议后续考虑 SSR 方案。

3. **文件上传**：目前文件上传功能已 mock 化，需要后端支持时再实现。

4. **数据持久化**：所有数据都是临时的，刷新页面会丢失。需要后端 API 来实现数据持久化。

## 改造完成状态

✅ 项目成功启动  
✅ UI 界面正常显示  
✅ Mock API 服务正常工作  
✅ 所有组件功能保持完整  
✅ 开发环境配置完成  

项目改造已完成，可以正常开发和使用！ 