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

它使用同目录下的 `styles.css`、`app.js`、`favicon.svg` 和 `og.png`，不需要本地服务器。静态版保留研究摘要、数据档案、时间尺度、团队谱系、15 个数据集的搜索/类别/音频/跨天筛选、研究建议与主要来源。

可编辑的静态版源文件位于 `standalone/`。每次运行生产构建后，若 `dist/` 被重建，请将 `standalone/index.html`、`standalone/styles.css`、`standalone/app.js` 及 `public/` 中的图标与分享图复制到 `dist/` 根目录。

## 内容与数据文件

- `app/data.ts`：15 个数据集、筛选字段、能力覆盖矩阵和来源链接
- `app/page.tsx`：页面结构与交互
- `app/globals.css`：响应式视觉系统
- `public/og.png`：1200×630 社交分享图
- `reports/report-source.md`：上游调研报告（位于项目同级 `reports/` 目录）

## 数据边界

- EgoLife 不是 24×7 无缝连续记录。
- 约 300 小时 captured 与约 266 小时 retained 分别陈述。
- 论文构建的 3,000 道题与当前主要公开/评测的 Jake 500 分别陈述。
- 论文采集模态不等于所有原始数据已完整公开。
- 未能从一手资料确认的项目字段显示“未确认”或“部分公开”。
