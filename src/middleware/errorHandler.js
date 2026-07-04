'use strict';

/**
 * 全局错误处理器 + 404 处理器。
 * 统一输出 { code, message, data:null } 结构，兼容：
 * - AppError（业务错误，带 statusCode）
 * - multer 上传错误（文件过大 / 字段异常）
 * - JSON 解析错误
 * - 其他未知错误（500）
 */

const multer = require('multer');
const { fail } = require('../utils/response');

// 404
function notFound(req, res) {
  return fail(res, 404, `接口不存在: ${req.method} ${req.originalUrl}`);
}

// 错误处理（必须保留 4 个参数）
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // 业务错误
  if (err && err.isAppError) {
    return fail(res, err.statusCode || 400, err.message);
  }

  // multer 上传错误
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return fail(res, 400, '图片大小超出限制（最大 5MB）');
    }
    return fail(res, 400, `文件上传失败: ${err.message}`);
  }

  // body-parser JSON 解析失败
  if (err && err.type === 'entity.parse.failed') {
    return fail(res, 400, '请求体不是合法的 JSON');
  }

  // 未知错误
  console.error('[UnhandledError]', err);
  return fail(res, 500, '服务器内部错误');
}

module.exports = { notFound, errorHandler };
