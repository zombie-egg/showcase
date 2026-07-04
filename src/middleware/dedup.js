'use strict';

/**
 * 重复提交容错中间件。
 * 对写操作（POST/PUT/DELETE）基于 请求指纹 做短时间窗去重，
 * 拦截用户在极短时间内的重复点击 / 网络重发，返回 429。
 *
 * 指纹 = 方法 + 路径 + 排序后请求体 JSON（+ 可选 X-Request-Id 头，优先使用）。
 */

const AppError = require('../utils/AppError');

const WINDOW_MS = 1500; // 去重时间窗
const seen = new Map(); // fingerprint -> 时间戳

// 周期清理过期指纹，避免内存无限增长
setInterval(() => {
  const now = Date.now();
  for (const [key, ts] of seen) {
    if (now - ts > WINDOW_MS) seen.delete(key);
  }
}, WINDOW_MS * 4).unref();

function stableStringify(obj) {
  if (obj == null || typeof obj !== 'object') return String(obj);
  if (Array.isArray(obj)) return `[${obj.map(stableStringify).join(',')}]`;
  const keys = Object.keys(obj).sort();
  return `{${keys.map((k) => `${k}:${stableStringify(obj[k])}`).join(',')}}`;
}

module.exports = function dedup(req, res, next) {
  if (!['POST', 'PUT', 'DELETE'].includes(req.method)) {
    return next();
  }

  // 文件上传（multipart）此时 body 尚未解析，跳过内容指纹，仅靠 X-Request-Id
  const requestId = req.headers['x-request-id'];
  const bodyPart =
    req.is && req.is('multipart/form-data') ? '' : stableStringify(req.body || {});

  const fingerprint = requestId
    ? `${req.method}:${req.originalUrl}:rid:${requestId}`
    : `${req.method}:${req.originalUrl}:${bodyPart}`;

  const now = Date.now();
  const last = seen.get(fingerprint);
  if (last && now - last < WINDOW_MS) {
    return next(new AppError('操作过于频繁，请勿重复提交', 429));
  }
  seen.set(fingerprint, now);
  next();
};
