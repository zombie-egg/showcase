'use strict';

/**
 * 跨域处理中间件（手写，零依赖）。
 * 允许任意来源、常用方法与自定义鉴权头，预检请求直接放行。
 */
module.exports = function cors(req, res, next) {
  const origin = req.headers.origin || '*';
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Request-Id'
  );
  res.header('Access-Control-Max-Age', '86400');

  // 预检请求快速返回
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
};
