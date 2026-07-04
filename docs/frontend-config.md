# 前端配置与资源说明

## 页面入口

- 前台案例展示页：`/` 或 `/index.html`
- 后台管理页：`/admin.html`

## 源码结构

- `public/css/handdrawn.css`：极简黑白轻奢编辑风设计系统，集中维护黑白色板、衬线/等宽字体、直角边框、粗分割线、噪点/网格纹理和弹窗样式。
- `public/js/config.js`：前端配置，默认同域请求接口；跨端口联调时修改 `API_BASE_URL`。
- `public/js/api.js`：统一 AJAX 请求封装，自动注入 `Authorization: Bearer <token>` 与写操作 `X-Request-Id`。
- `public/js/common.js`：站点标识注入、提示弹窗、二次确认弹窗、HTML 转义、URL 与图片校验工具。
- `public/js/showcase.js`：前台分类筛选与案例卡片渲染。
- `public/js/login.js`：兼容旧入口，自动跳转后台。
- `public/js/admin.js`：分类管理、案例管理、上传预览、新增/编辑弹窗、删除确认。

## 静态资源路径规则

- 全站站点标识固定路径：`/static/images/logo.png`
- 标识文件请放在：`static/images/logo.png`
- 后台管理页顶部提供“修改站点标识”入口，上传 jpg / png 后会覆盖 `static/images/logo.png`
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

## 后台访问

当前后台为免登录模式，访问 `/admin.html` 即可管理分类、案例和站点标识。
