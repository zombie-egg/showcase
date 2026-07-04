# 极简黑白企业案例作品集展示系统

Node.js + Express + 本地 JSON 文件存储（**不使用数据库**）。前端为原生 HTML + Tailwind CSS v3 CDN + 原生 JS，实现极简黑白轻奢编辑风案例展示、管理员登录与后台管理。

---

## 一、快速开始

```bash
# 1. 安装依赖
npm install

# 2. 启动服务
npm start           # 或开发模式 npm run dev（文件变更自动重启）
```

启动后访问：

- 前台案例展示页：`http://localhost:3000/`
- 管理员登录页：`http://localhost:3000/login.html`
- 后台管理页：`http://localhost:3000/admin.html`
- 接口根：`http://localhost:3000/api`
- 健康检查：`http://localhost:3000/api/health`
- 静态资源：`http://localhost:3000/static/`

默认端口 `3000`，默认管理员密码 `Ccj940904`。可用环境变量覆盖：

```bash
PORT=8080 ADMIN_PASSWORD=your_secret npm start
```

程序启动时**自动创建**所需目录（`static/images/cases/`、`data/`）与数据文件；当前 `data/` 已预置客户案例分类与案例链接，前台会直接通过 `/api/categories` 与 `/api/cases` 渲染。

---

## 二、⭐ LOGO 放置目录（重点）

将网站 LOGO 图片**重命名为 `logo.png`**，放入以下文件夹即可生效：

```
static/images/logo.png
```

前端全站头部固定引用路径 **`/static/images/logo.png`**，放入图片后无需改任何代码。该目录已预留，部署时直接放图片即可。

也可以进入后台管理页顶部的 **修改站点 LOGO** 入口上传 jpg / png，系统会自动覆盖到 `static/images/logo.png`。

案例封面仍统一存放在：

```
static/images/cases/
```

后端返回的 `cover` 字段格式保持为 **`/static/images/cases/xxx`**，前端不改名、不拼接自定义路径。

---

## 三、项目目录结构

```
showcase/
├── server.js                     # 服务入口（启动自检 + 监听）
├── package.json
├── README.md                     # 本文件（部署文档）
├── API.md                        # 全套接口文档（入参/出参）
├── INTEGRATION.md                # 前后端联调规范 + 手绘设计规范
├── docs/
│   └── frontend-config.md        # 前端入口、配置与静态资源路径说明
├── public/                       # 前台、登录、后台页面与前端静态源码
│   ├── index.html
│   ├── login.html
│   ├── admin.html
│   ├── css/handdrawn.css         # 黑白轻奢编辑风全局样式配置
│   └── js/                       # API 封装、通用工具、三页交互逻辑
├── data/                         # JSON 数据表（程序自动创建并初始化）
│   ├── admin.json                # 管理员配置表
│   ├── categories.json           # 分类表
│   └── cases.json                # 案例表
├── static/                       # 静态资源根目录（映射到 /static）
│   └── images/
│       ├── logo.png              # ⭐ 站点 LOGO（放这里，命名 logo.png）
│       └── cases/                # ⭐ 案例封面图上传目录（程序自动创建）
└── src/
    ├── config.js                 # 全局配置（端口、密码、路径、上传约束）
    ├── app.js                    # Express 装配（中间件顺序 + 路由挂载）
    ├── middleware/
    │   ├── cors.js               # 跨域处理
    │   ├── auth.js               # Token 鉴权
    │   ├── dedup.js              # 重复提交容错
    │   ├── upload.js             # 图片上传（multer，jpg/png，5MB）
    │   └── errorHandler.js       # 404 + 全局错误处理
    ├── routes/
    │   ├── auth.js               # 登录 / 登出 / 校验
    │   ├── categories.js         # 分类 CRUD
    │   ├── cases.js              # 案例 CRUD
    │   └── upload.js             # 图片上传
    ├── services/
    │   ├── tokenService.js       # 内存 Token
    │   ├── categoryService.js    # 分类数据访问（含删除拦截）
    │   └── caseService.js        # 案例数据访问
    └── utils/
        ├── store.js              # JSON 读写（写锁串行化 + 原子替换）
        ├── bootstrap.js          # 启动自检 + 演示数据
        ├── validators.js         # 参数强校验
        ├── response.js           # 统一响应结构
        └── AppError.js           # 业务错误类
```

---

## 四、数据表结构（3 套 JSON）

### 1. 管理员配置表 `data/admin.json`
```json
{
  "username": "admin",
  "password": "Ccj940904",
  "updatedAt": "2026-01-01T00:00:00.000Z"
}
```
> 实际登录校验以 `config.ADMIN_PASSWORD`（默认 `Ccj940904`，可用环境变量覆盖）为准。

### 2. 分类表 `data/categories.json`
```json
[
  { "id": "cat_ai_generation", "name": "AI生成类", "createdAt": "...", "updatedAt": "..." }
]
```

### 3. 案例表 `data/cases.json`
```json
[
  {
    "id": "case_ai_001",
    "name": "YBST AI",
    "categoryId": "cat_ai_generation",
    "url": "https://www.ybstai.com/",
    "cover": "/static/images/cases/editor-cover-01.png",
    "intro": "AI生成类官网案例……",
    "createdAt": "...",
    "updatedAt": "..."
  }
]
```

> 预置案例封面图位于 `static/images/cases/`。后台新增/编辑案例时，上传接口返回的 `url` 会继续写入 `cover` 字段。

---

## 五、接口概览

| 功能 | 方法 | 地址 | 鉴权 |
|------|------|------|------|
| 登录 | POST | `/api/auth/login` | 否 |
| 登出 | POST | `/api/auth/logout` | 是 |
| 校验令牌 | GET | `/api/auth/check` | 是 |
| 分类列表 | GET | `/api/categories` | 否 |
| 新增分类 | POST | `/api/categories` | 是 |
| 编辑分类 | PUT | `/api/categories/:id` | 是 |
| 删除分类 | DELETE | `/api/categories/:id` | 是 |
| 案例列表 | GET | `/api/cases?categoryId=` | 否 |
| 案例详情 | GET | `/api/cases/:id` | 否 |
| 新增案例 | POST | `/api/cases` | 是 |
| 编辑案例 | PUT | `/api/cases/:id` | 是 |
| 删除案例 | DELETE | `/api/cases/:id` | 是 |
| 图片上传 | POST | `/api/upload` | 是 |

完整入参 / 出参见 [API.md](API.md)。前端入口、配置与 LOGO/封面路径说明见 [docs/frontend-config.md](docs/frontend-config.md)。

---

## 六、容错与安全说明

- **跨域**：已全局开启 CORS，允许携带 `Authorization` 头，预检请求自动放行。
- **参数强校验**：URL 必须 `http(s)://` 开头；分类 / 案例字段非空；图片仅 `jpg/png`。
- **删除拦截**：已绑定案例的分类禁止删除，返回 409 及提示。
- **重复提交容错**：写操作 1.5 秒窗口内的重复请求返回 429（可用 `X-Request-Id` 头精确去重）。
- **文件异常**：图片超 5MB / 格式非法 / 未选文件均返回明确错误。
- **数据写入**：写锁串行化 + 临时文件原子替换，避免并发写坏文件。

> 安全提示：本项目为单管理员简易鉴权，Token 存于内存，进程重启后需重新登录。生产环境请务必通过 `ADMIN_PASSWORD` 环境变量设置强密码，并置于 HTTPS 之后。
