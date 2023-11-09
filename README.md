<div align="center">

# 🗺️ Travel Map

**基于 Vue 3、TypeScript 和 OpenLayers 构建的交互式旅行地图应用**

一款优雅的响应式旅行足迹可视化工具，记录和展示您在中国的旅行轨迹

[![Vue 3](https://img.shields.io/badge/Vue-3.3-42b883?logo=vue.js&logoColor=white)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-4.4-646cff?logo=vite&logoColor=white)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[演示](#) · [快速开始](#-快速开始) · [文档](#-使用指南) · [贡献](#-贡献)

</div>

---

## ✨ 核心特性

<table>
<tr>
<td width="50%">

### 🗺️ 交互式地图
基于 OpenLayers 构建，支持流畅的平移、缩放和标记点交互

### 📍 分层位置标记
省份 → 城市 → 具体地点的层级化数据结构

### 🖼️ 预览悬浮层
鼠标悬停即可查看位置预览、图片和描述信息

### 📝 Markdown 内容
使用 Markdown + Frontmatter 编写旅行故事

</td>
<td width="50%">

### 🎨 双主题模式
自动语法高亮，支持亮色/暗色主题

### 📱 响应式设计
完美适配桌面端和移动端设备

### ⚡ 静态站点生成
预渲染 HTML，获得最优性能表现

### 🔄 文件路由
Markdown 文件自动生成路由

</td>
</tr>
</table>

## 🚀 快速开始

### 📋 环境要求

| 工具 | 版本要求 |
|------|----------|
| Node.js | 16.x 或更高版本 |
| 包管理器 | npm / pnpm / yarn |
| 浏览器 | 支持 ES6+ 的现代浏览器 |

### 📦 安装步骤

```bash
# Clone the repository
git clone https://github.com/yourusername/travel-Map.git
cd travel-Map

# Install dependencies
npm install
# or
pnpm install

# Start development server
npm run dev
```

应用将在 `http://localhost:4000` 启动

## 🛠️ 可用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器（支持热重载）|
| `npm run build` | 构建生产版本（包含类型检查）|
| `npm run preview` | 本地预览生产构建 |
| `vue-tsc --noEmit` | 仅执行类型检查（不构建）|

```bash
# 开发
npm run dev

# 构建
npm run build

# 预览
npm run preview
```

## 🏗️ 技术栈

### 核心框架

| 技术 | 说明 | 版本 |
|------|------|------|
| **Vue 3** | 渐进式 JavaScript 框架，使用 Composition API | `^3.3` |
| **TypeScript** | 类型安全的开发体验 | `^5.0` |
| **Vite** | 快速的构建工具和开发服务器 | `^4.4` |
| **OpenLayers** | 强大的 Web 地图库 | Latest |

### 路由与内容

- 🗂️ **vite-plugin-pages** - 基于文件的路由系统
- 🚀 **vite-ssg** - 静态站点生成
- 📄 **unplugin-vue-markdown** - Markdown 作为 Vue 组件
- 🛣️ **vue-router** - 官方路由器，支持自定义滚动

### Markdown 处理

- 📝 **gray-matter** - Frontmatter 解析
- 🔤 **markdown-it** - Markdown 解析器及插件
- 🎨 **shikiji** - 快速语法高亮

### UI 与样式

- 💅 **SCSS** - CSS 预处理器
- ⏳ **NProgress** - 路由过渡进度条

## 📖 使用指南

### 🎯 添加新的旅行地点

#### 步骤 1: 更新旅行数据

编辑 `src/data/datas.ts` 文件：

```typescript
export const MARKER_MAP = {
  北京: {
    children: {
      故宫: {
        coords: [116.397, 39.917],  // [longitude, latitude]
        route: "/2024/beijing",      // Optional: link to detail page
      },
    },
  },
};
```

#### 步骤 2: 创建详情页面（可选）

在 `pages/2024/` 目录下创建 `beijing.md`：

```markdown
---
title: Beijing Trip 2024
date: 2024-03-15
---

# My Amazing Beijing Trip

Content goes here...
```

#### 步骤 3: 添加图片

将图片放置在以下目录：
- `public/travel/beijing/`
- `public/images/`

### 📐 特殊 Markdown 布局

Use layout markers in your markdown files:

```markdown
<!-- @layout-map -->
<TravelMap />
```

| 布局标记 | 说明 |
|----------|------|
| `@layout-map` | 全屏地图容器 |
| `@layout-full-width` | 全宽布局 |
| 默认 | 居中排版，带动画效果 |

### 🌍 GeoJSON 数据

省份边界文件存储在 `public/geojson/china/` 目录：

- **格式**: `[省份名].json`
- **坐标系**: WGS84 (EPSG:4326)
- **验证工具**: https://geojsonlint.com/

## 🏛️ 项目架构

### 📁 项目结构

```
src/
├── components/         # Auto-imported Vue components
│   └── TravelMap.vue  # Main map component
├── data/              # Travel data and configurations
│   └── datas.ts       # MARKER_MAP location data
├── hooks/             # Composable functions
│   └── useMap/        # Map-related logic
│       ├── config.ts  # Map configuration
│       ├── layer/     # Layer management system
│       └── maker/     # Marker and interaction system
├── utils/             # Utility functions
├── App.vue            # Root component
└── main.ts            # Application entry point

pages/                 # Markdown content (auto-routed)
public/
├── geojson/          # Map boundary data
└── images/           # Static assets
```

### 🗺️ 地图系统

采用模块化架构设计：

| 模块 | 说明 |
|------|------|
| **图层系统** | 三层架构（底图、省份、标记点）|
| **标记点** | 带交互预览的点要素 |
| **事件处理** | 自定义点击和悬停交互处理器 |
| **缓存机制** | 图层缓存优化性能 |

## 🎨 自定义配置

### 🗺️ 地图配置

编辑 `src/hooks/useMap/config.ts` 文件：

```typescript
export const MAP_DEFAULT_OPTIONS = {
  center: [120.1552, 30.2741],  // Default center [lng, lat]
  zoom: 4,                       // Initial zoom level
  minZoom: 1,
  maxZoom: 10,
  extent: [70, -11, 150, 60],   // Map bounds
};
```

### 🎨 样式定制

| 类型 | 位置 |
|------|------|
| 全局样式 | `src/style.scss` |
| 组件样式 | `.vue` 文件中的 Scoped SCSS |
| 移动端断点 | `@media (max-width: 640px)` |

## 🔧 开发指南

### 💻 推荐的 IDE 设置

- [VS Code](https://code.visualstudio.com/)
- [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (disable Vetur)
- [TypeScript Vue Plugin](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin)

### 🔤 `.vue` 文件类型支持

TypeScript 默认无法处理 `.vue` 文件的类型信息。本项目使用 `vue-tsc` 进行类型检查，配合 Volar 提供编辑器支持。

**启用 Volar 接管模式**（可选，获得更好的性能）：

1. 在 VS Code 中运行 `扩展: 显示内置扩展`
2. 找到 `TypeScript and JavaScript Language Features`
3. 右键选择 `禁用（工作区）`
4. 重新加载 VS Code 窗口

### 🔗 路径别名

| 别名 | 对应目录 | 配置文件 |
|------|----------|----------|
| `~/` | `src/` | `vite.config.ts`, `tsconfig.json` |

## 🚢 部署

### 构建项目

```bash
npm run build
```

### 📦 构建产物

`dist/` 目录包含：

- ✅ 所有路由的预渲染 HTML
- ✅ 优化后的 JavaScript 包
- ✅ 静态资源文件

### 🌐 部署平台

<table>
<tr>
<td width="50%">

#### GitHub Pages
使用 GitHub Actions 工作流自动部署

#### Netlify
连接仓库，自动部署

</td>
<td width="50%">

#### Vercel
导入项目并部署

#### AWS S3 + CloudFront
上传 `dist/` 文件夹

</td>
</tr>
</table>

## 📝 许可证

本项目采用 [MIT License](LICENSE) 开源协议 - 欢迎使用本项目创建您自己的旅行地图！

## 🤝 贡献

欢迎贡献代码！请随时提交 Pull Request。

### 贡献指南

1. Fork 本仓库
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

## 📧 联系方式

如有任何问题或建议，请 [提交 Issue](../../issues)。

---

<div align="center">

**Made with ❤️ using Vue 3, TypeScript, and OpenLayers**

⭐ 如果这个项目对您有帮助，请给它一个星标！

[返回顶部](#️-travel-map)

</div>
