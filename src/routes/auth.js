'use strict';

/**
 * 登录 / 登出 / 校验令牌路由。
 */

const express = require('express');
const config = require('../config');
const { ok } = require('../utils/response');
const { requireNonEmptyString } = require('../utils/validators');
const { requireAuth } = require('../middleware/auth');
const AppError = require('../utils/AppError');
const tokenService = require('../services/tokenService');

const router = express.Router();

// POST /api/auth/login  { password }
router.post('/login', (req, res, next) => {
  try {
    const password = requireNonEmptyString(req.body.password, '密码');
    if (password !== config.ADMIN_PASSWORD) {
      throw new AppError('密码错误', 401);
    }
    const token = tokenService.issue();
    return ok(res, { token, expiresIn: config.TOKEN_TTL }, '登录成功');
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/logout  （需登录）
router.post('/logout', requireAuth, (req, res) => {
  tokenService.revoke(req.token);
  return ok(res, null, '已登出');
});

// GET /api/auth/check  （校验当前令牌是否有效）
router.get('/check', requireAuth, (req, res) => {
  return ok(res, { valid: true }, '令牌有效');
});

module.exports = router;
