# EgoLife Research Atlas

面向计算机视觉、多模态学习、第一视角视频与长期记忆研究者的单页 Research Portal。内容基于 `/Users/rik/workspace/codex/reports/report-source.md` 与对应 DOCX 报告整理，关键不确定性和开放状态边界均保留。

## 技术栈

- Next.js 16 + React 19 + TypeScript
- Vinext / Vite
- OpenAI Sites 托管适配
- 原生 CSS；核心内容不依赖外部 API

## 本地开发

需要 Node.js 22.13+ 与 pnpm。

```bash
pnpm install
pnpm dev
```

浏览器打开 `http://localhost:3000/`。

## 验证与构建

```bash
pnpm lint
pnpm build
```

生产构建生成在 `dist/`。Sites 运行产物位于 `dist/client` 与 `dist/server`。

## 无服务器静态版本

直接双击打开：

- `dist/index.html`

它使用同目录下的 `styles.css`、`app.js`、`favicon.svg`、`og.png` 和 `research/` 图片，不需要本地服务器。静态版保留采集场景与 SOP、Topic 设计、数据格式、QA 构造与测试协议、EgoButler/EgoGPT/EgoRAG 框图，以及 15 个数据集的搜索与筛选。

可编辑的静态版源文件位于 `standalone/`。每次运行生产构建后，若 `dist/` 被重建，请将 `standalone/index.html`、`standalone/styles.css`、`standalone/app.js` 及 `public/` 中的图标、分享图和 `research/` 图片复制到 `dist/` 根目录。

## 内容与数据文件

- `app/data.ts`：15 个数据集、筛选字段、能力覆盖矩阵和来源链接
- `app/page.tsx`：页面结构与交互
- `app/globals.css`：响应式视觉系统
- `public/og.png`：1200×630 社交分享图
- `public/research/*.webp`：来自 EgoLife 官方论文／博客的场景、时间线与模型图（网页优化版）
- `reports/report-source.md`：上游调研报告（位于项目同级 `reports/` 目录）

## 数据边界

- EgoLife 不是 24×7 无缝连续记录。
- 约 300 小时 captured 与约 266 小时 retained 分别陈述。
- 论文构建的 3,000 道题与当前主要公开/评测的 Jake 500 分别陈述。
- 论文采集模态不等于所有原始数据已完整公开。
- 未能从一手资料确认的项目字段显示“未确认”或“部分公开”。
