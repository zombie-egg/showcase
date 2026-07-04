# 接口文档 (API.md)

> Base URL：`http://localhost:3000`
> 所有接口前缀：`/api`
> 数据格式：请求 / 响应均为 JSON（图片上传除外，用 `multipart/form-data`）。

## 统一响应结构

```jsonc
// 成功
{ "code": 0, "message": "ok", "data": { /* ... */ } }

// 失败
{ "code": 401, "message": "密码错误", "data": null }
```

- `code`：`0` 表示成功，非 `0`（通常等于 HTTP 状态码）表示失败。
- 前端判断成功统一以 `code === 0` 为准。

## 鉴权方式

登录成功后拿到 `token`，后续受保护接口在请求头携带：

```
Authorization: Bearer <token>
```

令牌无效 / 过期返回 `401`，前端应跳回登录页。

---

## 1. 登录 `POST /api/auth/login`

**鉴权**：否

**请求体**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| password | string | 是 | 管理员密码 |

```json
{ "password": "admin123" }
```

**成功响应**
```json
{
  "code": 0,
  "message": "登录成功",
  "data": { "token": "a1b2c3...", "expiresIn": 604800000 }
}
```

**失败**：`密码错误` (401) / `密码不能为空` (400)

---

## 2. 登出 `POST /api/auth/logout`

**鉴权**：是 · **请求体**：无

```json
{ "code": 0, "message": "已登出", "data": null }
```

---

## 3. 校验令牌 `GET /api/auth/check`

**鉴权**：是

```json
{ "code": 0, "message": "令牌有效", "data": { "valid": true } }
```

---

## 4. 分类列表 `GET /api/categories`

**鉴权**：否

```json
{
  "code": 0,
  "message": "ok",
  "data": [
    { "id": "cat_demo_web", "name": "企业官网", "createdAt": "...", "updatedAt": "..." }
  ]
}
```

---

## 5. 新增分类 `POST /api/categories`

**鉴权**：是

**请求体**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 是 | 分类名称，≤50 字，不可重复 |

```json
{ "name": "小程序" }
```

**成功响应**
```json
{
  "code": 0,
  "message": "分类创建成功",
  "data": { "id": "cat_xxx", "name": "小程序", "createdAt": "...", "updatedAt": "..." }
}
```

**失败**：`分类名称不能为空` (400) / `分类名称已存在` (409)

---

## 6. 编辑分类 `PUT /api/categories/:id`

**鉴权**：是

**请求体**：同新增（`{ "name": "新名称" }`）

**成功响应**
```json
{ "code": 0, "message": "分类更新成功", "data": { "id": "...", "name": "新名称", "createdAt": "...", "updatedAt": "..." } }
```

**失败**：`分类不存在` (404) / `分类名称已存在` (409)

---

## 7. 删除分类 `DELETE /api/categories/:id`

**鉴权**：是

**成功响应**
```json
{ "code": 0, "message": "分类删除成功", "data": null }
```

**失败**：
- `分类不存在` (404)
- `该分类下存在 N 个案例，无法删除，请先移除关联案例` (409) ← **删除拦截**

---

## 8. 案例列表 `GET /api/cases`

**鉴权**：否

**查询参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| categoryId | string | 否 | 按分类过滤 |

**成功响应**（附带 `categoryName` 便于前端渲染）
```json
{
  "code": 0,
  "message": "ok",
  "data": [
    {
      "id": "case_demo_1",
      "name": "手绘风科技公司官网",
      "categoryId": "cat_demo_web",
      "categoryName": "企业官网",
      "url": "https://example.com/tech-official",
      "cover": "/static/images/cases/demo-cover-1.png",
      "intro": "……",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

---

## 9. 案例详情 `GET /api/cases/:id`

**鉴权**：否

```json
{ "code": 0, "message": "ok", "data": { "id": "case_demo_1", "name": "...", "categoryId": "...", "url": "...", "cover": "...", "intro": "...", "createdAt": "...", "updatedAt": "..." } }
```

**失败**：`案例不存在` (404)

---

## 10. 新增案例 `POST /api/cases`

**鉴权**：是

**请求体**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 是 | 案例名称，≤100 字 |
| categoryId | string | 是 | 所属分类 ID（须已存在） |
| url | string | 是 | 跳转 URL，必须 `http(s)://` 开头 |
| cover | string | 是 | 封面图路径（一般为上传接口返回的 `url`） |
| intro | string | 是 | 案例简介，≤500 字 |

```json
{
  "name": "某某官网",
  "categoryId": "cat_demo_web",
  "url": "https://example.com",
  "cover": "/static/images/cases/case_123.png",
  "intro": "项目简介……"
}
```

**成功响应**
```json
{ "code": 0, "message": "案例创建成功", "data": { "id": "case_xxx", "...": "..." } }
```

**失败**：字段为空 (400) / `跳转URL必须以 http:// 或 https:// 开头` (400) / `所属分类不存在` (400)

---

## 11. 编辑案例 `PUT /api/cases/:id`

**鉴权**：是 · **请求体**：同新增（全字段更新）

```json
{ "code": 0, "message": "案例更新成功", "data": { "id": "...", "...": "..." } }
```

**失败**：`案例不存在` (404) / 校验类错误同上

---

## 12. 删除案例 `DELETE /api/cases/:id`

**鉴权**：是

```json
{ "code": 0, "message": "案例删除成功", "data": null }
```

**失败**：`案例不存在` (404)

---

## 13. 图片上传 `POST /api/upload`

**鉴权**：是
**Content-Type**：`multipart/form-data`

**表单字段**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| file | File | 是 | 图片文件，仅 `jpg/png`，≤5MB |

**成功响应**
```json
{
  "code": 0,
  "message": "上传成功",
  "data": { "url": "/static/images/cases/case_1720000000_ab12cd34.png", "filename": "case_1720000000_ab12cd34.png" }
}
```

**使用流程**：先调上传接口拿到 `data.url` → 作为 `cover` 提交给新增 / 编辑案例接口。

**失败**：
- `请上传图片文件（字段名 file）` (400)
- `图片格式仅支持 jpg / png` (400)
- `图片大小超出限制（最大 5MB）` (400)

---

## 14. 健康检查 `GET /api/health`

```json
{ "code": 0, "message": "ok", "data": { "status": "up", "time": "..." } }
```

---

## 错误码速查

| HTTP | 含义 |
|------|------|
| 400 | 参数校验失败 / 文件异常 |
| 401 | 未登录 / 密码错误 / 令牌失效 |
| 404 | 资源不存在 / 接口不存在 |
| 409 | 冲突（名称重复、分类删除拦截） |
| 429 | 重复提交过于频繁 |
| 500 | 服务器内部错误 |
