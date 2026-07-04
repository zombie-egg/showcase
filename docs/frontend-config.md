# 前端配置与资源说明

## 页面入口

- 前台案例展示页：`/` 或 `/index.html`
- 管理员登录页：`/login.html`
- 后台管理页：`/admin.html`

## 源码结构

- `public/css/handdrawn.css`：极简黑白轻奢编辑风设计系统，集中维护黑白色板、衬线/等宽字体、直角边框、粗分割线、噪点/网格纹理和弹窗样式。
- `public/js/config.js`：前端配置，默认同域请求接口；跨端口联调时修改 `API_BASE_URL`。
- `public/js/api.js`：统一 AJAX 请求封装，自动注入 `Authorization: Bearer <token>` 与写操作 `X-Request-Id`。
- `public/js/common.js`：LOGO 注入、提示弹窗、二次确认弹窗、HTML 转义、URL 与图片校验工具。
- `public/js/showcase.js`：前台分类筛选与案例卡片渲染。
- `public/js/login.js`：管理员登录。
- `public/js/admin.js`：分类管理、案例管理、上传预览、新增/编辑弹窗、删除确认。

## 静态资源路径规则

- 全站 LOGO 固定路径：`/static/images/logo.png`
- LOGO 文件请放在：`static/images/logo.png`
- 后台管理页顶部提供“修改站点 LOGO”入口，上传 jpg / png 后会覆盖 `static/images/logo.png`
- 案例封面上传目录：`static/images/cases/`
- 上传接口返回的 `cover` 格式为：`/static/images/cases/xxx.png` 或 `/static/images/cases/xxx.jpg`
- 前端会直接使用后端返回的 `cover` 字段渲染，不会改名或拼自定义路径。

## 接口配置

默认部署在同一个 Express 服务下，`public/js/config.js` 中：

```js
window.APP_CONFIG = {
  API_BASE_URL: "",
  LOGO_PATH: "/static/images/logo.png",
  TOKEN_KEY: "handdrawn_showcase_token",
  MAX_IMAGE_SIZE: 5 * 1024 * 1024,
  IMAGE_TYPES: ["image/jpeg", "image/png"],
};
```

如果前端单独起服务、后端仍在 `http://localhost:3000`，只需要把 `API_BASE_URL` 改成该地址。

## 管理员登录

默认后端密码为 `Ccj940904`，可通过环境变量 `ADMIN_PASSWORD` 覆盖。登录成功后 token 保存在浏览器 `localStorage`，后台写操作会自动携带鉴权头。
