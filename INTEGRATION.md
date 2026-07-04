# 前后端联调规范 (INTEGRATION.md)

面向前端（Codex，手绘纸张风格 UI）。本文件锁定接口地址、请求方式、字段命名、静态资源路径，以及必须落地的手绘设计规范，确保前后端合并后**零字段不匹配、零路径错误、零跨域、零 404**。

---

## 一、通信约定

| 项 | 约定 |
|----|------|
| Base URL | `http://localhost:3000`（端口可由后端环境变量 `PORT` 调整） |
| 接口前缀 | 所有业务接口以 `/api` 开头 |
| 请求体格式 | JSON（`Content-Type: application/json`），上传接口用 `multipart/form-data` |
| 响应结构 | `{ code, message, data }`，`code === 0` 为成功 |
| 鉴权头 | 当前后台免登录，写接口无需携带 token；登录接口仅保留兼容 |
| 去重头（可选） | 写操作可带 `X-Request-Id`，后端据此精确拦截重复提交 |
| 跨域 | 后端已开启 CORS，前端可直接跨端口调用，无需代理 |

**前端建议**：封装统一请求函数，并统一处理 `code !== 0` 弹错。

---

## 二、静态资源路径（前端必须严格引用）

| 用途 | 固定路径 | 说明 |
|------|----------|------|
| 静态资源根 | `/static` | 映射后端 `static/` 目录 |
| 站点标识 | `/static/images/logo.png` | 前端全站头部直接写死此路径 |
| 案例封面图 | `/static/images/cases/xxx.png` | 由上传接口返回的 `data.url` 提供，直接用于 `<img src>` |

> 封面图 `cover` 字段存的就是可访问相对路径，前端拼接 Base URL 后即可显示：`http://localhost:3000` + `cover`。同域部署时可直接用相对路径。

---

## 三、字段命名对照（前后端统一，禁止改名）

### 分类 category
| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 分类唯一 ID（后端生成） |
| name | string | 分类名称 |
| createdAt / updatedAt | string(ISO) | 时间戳 |

### 案例 case
| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 案例唯一 ID |
| name | string | 案例名称 |
| categoryId | string | 所属分类 ID |
| categoryName | string | 分类名称（仅列表接口附带，方便渲染，提交时不需要） |
| url | string | 跳转 URL（http/https 开头） |
| cover | string | 封面图路径 |
| intro | string | 案例简介 |
| createdAt / updatedAt | string(ISO) | 时间戳 |

### 提交案例时前端需传字段
`name` `categoryId` `url` `cover` `intro`（不传 `id`/`categoryName`/时间戳，由后端处理）。

---

## 四、核心业务流程

### 1. 后台访问
后台当前为免登录模式，直接访问 `/admin.html` 即可管理分类、案例和站点标识。

### 2. 新增 / 编辑案例（含封面）
1. 选图后先调 `POST /api/upload`（`multipart/form-data`，字段名 **`file`**）→ 得到 `data.url`。
2. 将该 `url` 作为 `cover`，连同其他字段提交 `POST /api/cases` 或 `PUT /api/cases/:id`。

### 3. 删除分类
直接 `DELETE /api/categories/:id`；若该分类下有案例，后端返回 `409` + 提示文案，前端直接弹出 `message` 即可。

---

## 五、手绘纸张风格设计规范（前端 UI 落地依据）

> UI 由 Codex 按此规范实现，后端在此同步以保证团队视觉统一。

### 1. 整体风格
手绘草稿 + 笔记本纸张质感：无规整直线、不规则波浪圆角、硬偏移无模糊阴影、元素轻微旋转、手写字体、纸纹背景。

### 2. 基础色值
| 用途 | 色值 | 说明 |
|------|------|------|
| 背景 | `#fdfbf7` | 暖纸张色 |
| 正文 | `#2d2d2d` | 铅笔灰 |
| 中性色 | `#e5e0d8` | 旧纸张 |
| 红色强调 | `#ff4d4d` | 修正笔 |
| 蓝色强调 | `#2d5da1` | 圆珠笔 |

### 3. 卡片 / 按钮
- 统一采用**不规则波浪圆角**。
- 边框粗细 **≥ 2px**。
- 阴影固定 **`4px 4px 0 #2d2d2d`**（硬偏移、无模糊）。
- **hover 切换阴影偏移**（如位移到 `2px 2px 0` 并轻微平移，营造按下 / 抬起感）。

CSS 参考：
```css
:root {
  --paper-bg: #fdfbf7;
  --ink: #2d2d2d;
  --paper-neutral: #e5e0d8;
  --accent-red: #ff4d4d;
  --accent-blue: #2d5da1;
  --hard-shadow: 4px 4px 0 #2d2d2d;
}
.card, .btn {
  border: 2px solid var(--ink);
  border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px; /* 波浪圆角 */
  box-shadow: var(--hard-shadow);
  transition: box-shadow .12s, transform .12s;
}
.card:hover, .btn:hover {
  box-shadow: 2px 2px 0 var(--ink);
  transform: translate(2px, 2px);
}
```

### 4. 页面与卡片装饰
- 页面背景铺**点阵纸张纹理**（点阵 / 网格）。
- 卡片可搭配**图钉、胶带**手绘装饰元素。
- 案例卡片默认**轻微正 / 负角度旋转**（如 `-2deg` / `1.5deg` 交错）。
- **hover 时小幅晃动旋转**，增强手绘动感。

字体建议：手写风格字体（如 “Kalam”“Gochi Hand” 等），正文保证可读性。

---

## 六、联调自检清单

- [ ] 前端请求 Base URL 与后端端口一致（默认 `3000`）。
- [ ] 写操作无需登录即可调用。
- [ ] 上传字段名为 `file`，格式 jpg/png，≤5MB。
- [ ] 案例 `cover` 使用上传接口返回的 `url`，未手写错误路径。
- [ ] 分类删除处理了 `409` 拦截提示。
- [ ] 站点标识图片已按 `logo.png` 放入 `static/images/`。
- [ ] `code !== 0` 时统一展示后端 `message`。
