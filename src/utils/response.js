'use strict';

/**
 * 统一响应结构，前后端约定格式：
 *   成功: { code: 0, message: 'ok', data: {...} }
 *   失败: { code: <非0>, message: '错误描述', data: null }
 */

function ok(res, data = null, message = 'ok') {
  return res.json({ code: 0, message, data });
}

function fail(res, statusCode = 400, message = '请求错误', code = null) {
  return res.status(statusCode).json({
    code: code == null ? statusCode : code,
    message,
    data: null,
  });
}

module.exports = { ok, fail };
