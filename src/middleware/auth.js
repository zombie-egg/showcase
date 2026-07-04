'use strict';

/**
 * 简易 Token 鉴权中间件（单管理员）。
 * - 登录成功后由 tokenService 颁发内存 Token。
 * - 受保护接口需在请求头携带 Authorization: Bearer <token>，或 query.token。
 */

const AppError = require('../utils/AppError');
const tokenService = require('../services/tokenService');

function requireAuth(req, res, next) {
  let token = null;

  const authHeader = req.headers.authorization || '';
  if (authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7).trim();
  } else if (req.query && req.query.token) {
    token = String(req.query.token).trim();
  }

  if (!token) {
    return next(new AppError('未登录或缺少鉴权令牌', 401));
  }
  if (!tokenService.verify(token)) {
    return next(new AppError('登录已过期或令牌无效，请重新登录', 401));
  }
  req.token = token;
  next();
}

module.exports = { requireAuth };
