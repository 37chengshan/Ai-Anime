# 前端迁移对照表

> 本文档记录从 `docs/前端参考/Document-based design implementation` 迁移到 Next.js App Router 的对照关系。

## 参考项目信息

| 项目 | 信息 |
|------|------|
| 来源 | Figma 设计稿导出 |
| 原始地址 | https://www.figma.com/design/tbNS0FILeTznvyC24TLf0x/Document-based-design-implementation |
| 技术栈 | React 18 + Vite + Tailwind CSS 4 + shadcn/ui + Radix UI |
| 路由 | react-router 7 |
| 动画 | motion (framer-motion) |

## 依赖迁移

### 需要添加到 `apps/web/package.json`

```json
{
  "dependencies": {
    "@radix-ui/react-accordion": "^1.2.3",
    "@radix-ui/react-alert-dialog": "^1.1.6",
    "@radix-ui/react-avatar": "^1.1.3",
    "@radix-ui/react-checkbox": "^1.1.4",
    "@radix-ui/react-dialog": "^1.1.6",
    "@radix-ui/react-dropdown-menu": "^2.1.6",
    "@radix-ui/react-label": "^2.1.2",
    "@radix-ui/react-popover": "^1.1.6",
    "@radix-ui/react-scroll-area": "^1.2.3",
    "@radix-ui/react-select": "^2.1.6",
    "@radix-ui/react-separator": "^1.1.2",
    "@radix-ui/react-slider": "^1.2.3",
    "@radix-ui/react-slot": "^1.1.2",
    "@radix-ui/react-switch": "^1.1.3",
    "@radix-ui/react-tabs": "^1.1.3",
    "@radix-ui/react-tooltip": "^1.1.8",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-react": "^0.487.0",
    "motion": "^12.23.24",
    "react-responsive-masonry": "^2.7.1",
    "sonner": "^2.0.3",
    "tailwind-merge": "^3.2.0"
  }
}
```

## 页面迁移对照

| 参考文件 | 原路由 | 目标路由 | Next.js 文件 | 状态 |
|---------|-------|---------|-------------|------|
| `src/app/pages/Home.tsx` | `/` | `/` | `apps/web/src/app/(feed)/page.tsx` | ⏳ 待迁移 |
| `src/app/pages/WorkDetail.tsx` | `/work/:id` | `/post/[postId]` | `apps/web/src/app/post/[postId]/page.tsx` | ⏳ 待迁移 |
| `src/app/pages/Profile.tsx` | `/profile/:id?` | `/creator/[handle]` | `apps/web/src/app/creator/[handle]/page.tsx` | ⏳ 待迁移 |
| `src/app/pages/Upload.tsx` | `/upload` | `/studio` | `apps/web/src/app/studio/page.tsx` | ⏳ 待迁移 |
| `src/app/pages/Pricing.tsx` | `/pricing` | `/member` | `apps/web/src/app/member/page.tsx` | ⏳ 待迁移 |
| `src/app/pages/Discover.tsx` | `/discover` | `/discover` | `apps/web/src/app/discover/page.tsx` | ⏳ 待迁移 |

### 状态说明
- ⏳ 待迁移：需要迁移到 Next.js App Router
- ✅ 已迁移：已完成迁移
- 🔧 改造中：已迁移但需要对接后端 API

## 组件迁移对照

### 通用组件 (common)

| 参考文件 | 目标文件 | 说明 |
|---------|---------|------|
| `src/app/components/Header.tsx` | `apps/web/src/components/common/Header.tsx` | 导航栏 |
| `src/app/components/Layout.tsx` | `apps/web/src/components/common/Layout.tsx` | 布局壳 |
| `src/app/components/figma/ImageWithFallback.tsx` | `apps/web/src/components/common/ImageWithFallback.tsx` | 图片容错 |

### 业务组件 (domain)

| 参考文件 | 目标文件 | 说明 |
|---------|---------|------|
| `src/app/components/WorkCard.tsx` | `apps/web/src/components/domain/WorkCard.tsx` | 作品卡片 |
| `src/app/components/CommentSection.tsx` | `apps/web/src/components/domain/CommentSection.tsx` | 评论组件 |
| `src/app/components/AIChatPanel.tsx` | `apps/web/src/components/domain/AIChatPanel.tsx` | AI 聊天面板 |

### UI 组件 (ui)

直接复制整个 `src/app/components/ui/` 目录到 `apps/web/src/components/ui/`

包含 48 个 shadcn/ui 组件：accordion, alert-dialog, alert, avatar, badge, breadcrumb, button, calendar, card, carousel, chart, checkbox, collapsible, command, context-menu, dialog, drawer, dropdown-menu, form, hover-card, input-otp, input, label, menubar, navigation-menu, pagination, popover, progress, radio-group, resizable, scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner, switch, table, tabs, textarea, toggle-group, toggle, tooltip 等。

## 样式迁移

| 参考文件 | 目标文件 | 说明 |
|---------|---------|------|
| `src/styles/fonts.css` | `apps/web/src/styles/fonts.css` | 字体定义 |
| `src/styles/theme.css` | `apps/web/src/styles/theme.css` | 主题变量 |
| `src/styles/tailwind.css` | `apps/web/src/styles/globals.css` | Tailwind 入口 |

### 需要的 Tailwind 自定义样式类

从参考项目提取的自定义 CSS 类：

```css
/* 编辑风格标题 */
.editorial-title { /* 大标题样式 */ }
.editorial-caption { /* 小标题/标签样式 */ }
.editorial-body { /* 正文样式 */ }

/* 背景纹理 */
.bg-texture-light { /* 浅色纹理背景 */ }
.bg-paper { /* 纸张质感背景 */ }

/* 首字下沉 */
.drop-cap { /* 首字下沉效果 */ }

/* 滚动条隐藏 */
.scrollbar-hide { /* 隐藏滚动条 */ }
```

## Mock 数据

| 参考文件 | 目标文件 | 说明 |
|---------|---------|------|
| `src/app/data/mock.ts` | `apps/web/src/data/mock.ts` | 开发用 mock 数据 |

包含：
- `MOCK_WORKS` - 作品列表
- `MOCK_COMMENTS` - 评论数据
- `CURRENT_USER` - 当前用户

## 新增页面（参考项目无）

| 页面 | 路由 | Next.js 文件 | Phase |
|------|------|-------------|-------|
| 登录页 | `/auth/sign-in` | `apps/web/src/app/auth/sign-in/page.tsx` | Phase 1 |
| 注册页 | `/auth/sign-up` | `apps/web/src/app/auth/sign-up/page.tsx` | Phase 1 |
| 设置页 | `/settings` | `apps/web/src/app/settings/page.tsx` | Phase 1 |
| 编辑个人资料 | `/settings/profile` | `apps/web/src/app/settings/profile/page.tsx` | Phase 1 |
| 订阅管理 | `/settings/subscription` | `apps/web/src/app/settings/subscription/page.tsx` | Phase 3 |
| 标签页 | `/tags/[slug]` | `apps/web/src/app/(feed)/tags/[slug]/page.tsx` | Phase 1 |
| 搜索页 | `/search` | `apps/web/src/app/search/page.tsx` | Phase 1 |
| 教程列表 | `/tutorial` | `apps/web/src/app/tutorial/page.tsx` | Phase 3 |
| 教程详情 | `/tutorial/[slug]` | `apps/web/src/app/tutorial/[slug]/page.tsx` | Phase 3 |
| 编辑作品 | `/studio/edit/[postId]` | `apps/web/src/app/studio/edit/[postId]/page.tsx` | Phase 1 |
| 后台首页 | `/admin` | `apps/web/src/app/admin/page.tsx` | Phase 4 |
| 后台举报 | `/admin/reports` | `apps/web/src/app/admin/reports/page.tsx` | Phase 4 |
| 后台审核 | `/admin/moderation` | `apps/web/src/app/admin/moderation/page.tsx` | Phase 4 |
| 后台用户 | `/admin/users` | `apps/web/src/app/admin/users/page.tsx` | Phase 4 |
| 后台 AI | `/admin/ai-usage` | `apps/web/src/app/admin/ai-usage/page.tsx` | Phase 4 |

## 迁移注意事项

### 1. 路由系统变化

```diff
- react-router
+ Next.js App Router

- useNavigate()
+ useRouter().push()

- useParams()
+ useParams() // 相同

- useSearchParams()
+ useSearchParams() // 相同

- NavLink
+ Link + usePathname()
```

### 2. 表单处理

```diff
- <form onSubmit={handleSubmit}>
+ <form action={action} // 或保持 onSubmit

- React.FormEvent
+ React.FormEvent // 相同
```

### 3. 图片处理

```diff
- <img src={url} />
+ <Image src={url} /> // Next.js Image 组件，需配置域名
```

### 4. 数据获取

```diff
- useEffect + fetch
+ Server Components (默认) // 服务端获取
+ Client Components + TanStack Query // 客户端获取
```

### 5. 客户端组件声明

在需要状态或浏览器 API 的组件顶部添加：

```tsx
'use client'
```

## 迁移步骤建议

1. **Phase 0.1.1**：复制 UI 组件和样式文件
2. **Phase 1.0**：迁移通用组件和业务组件
3. **Phase 1.1-1.5**：逐个迁移页面，对接后端 API
4. **Phase 2-4**：开发新增页面

---

*文档版本：v1.0*
*更新时间：2026-04-16*
