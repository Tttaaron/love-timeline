# 🏰 Our Love Story - 爱情时间线

一个专属的、带有 3D 互动城堡动画的爱情时间线全栈 Web 应用。用来记录恋爱过程中的点点滴滴。

## ✨ 核心功能

- 🔒 **生日专属密钥**：进入网站需要输入双方的生日（♂ 9.23 / ♀ 1.27）才能解锁开启。
- ⏱️ **实时恋爱计时器**：精确到秒，记录在一起度过的每一刻（从 2026.2.10 算起）。
- 🎇 **炫酷的入口动画**：星空背景下，点击城堡大门，伴随光影特效进入主时间轴。
- 👫 **双视角主题**：
  - **♂ 男生视角**：静谧蓝灰色调。
  - **♀ 女生视角**：温柔粉金色调。
- 📸 **回忆时间轴**：
  - 点击添加回忆，支持一次上传最多 5 张照片（自动瀑布流排版）。
  - 内置图片查看器（Lightbox）点击放大。
- ✏️ **安全编辑模式**：平时记录不可修改；点击开启「✏️ 编辑模式」后，才能修改文字记录或删除回忆卡片，防误触。
- 💌 **留言板功能**：页面底部设有毛玻璃质感留言板，来访者或彼此可以随时留下想说的话。

## 🛠️ 技术栈

- **前端**：HTML5, 原生 CSS (CSS 变量 + Flex/Grid 布局 + 毛玻璃特效), 原生 JavaScript (Canvas 绘图动画, Fetch API)。
- **后端**：Node.js, Express.js (使用 `multer` 处理内存表单/图片上传)。
- **数据库 & 存储**：Supabase (PostgreSQL 数据库存文字、Supabase Storage 存图片)。
- **托管方案**：Render.com (自动跨 GitHub 仓库拉取部署)。

## 🚀 本地运行指南

1. **安装依赖**
   ```bash
   npm install
   ```

2. **环境变量配置**
   在根目录创建 `.env` 文件，填入你的 Supabase 凭证：
   ```env
   SUPABASE_URL=你的Supabase项目URL
   SUPABASE_ANON_KEY=你的Supabase匿名密钥
   PORT=3000
   ```

3. **初始化数据库 (Supabase SQL Editor)**
   在 Supabase 控制台执行根目录下的 `supabase-schema.sql` 和 `supabase-v2.sql` 以建立所需的数据表 (`memories`, `memory_images`, `messages`) 并配置对应的 RLS 策略。

4. **启动服务**
   ```bash
   node server.js
   ```
   然后浏览器访问: `http://localhost:3000` 即可测试。

## 🎨 设计与开发
采用了响应式现代 UI 设计与玻璃态拟物化 (Glassmorphism)，旨在提供最美观的情侣纪念体验。
