'use strict';

/**
 * 内存 Token 服务（单管理员，无需数据库）。
 * 进程重启后令牌失效，管理员需重新登录（对本项目场景足够）。
 */

const crypto = require('crypto');
const config = require('../config');

// token -> 过期时间戳(ms)
const tokens = new Map();

/**
 * 颁发一个新令牌。
 * @returns {string}
 */
function issue() {
  const token = crypto.randomBytes(24).toString('hex');
  tokens.set(token, Date.now() + config.TOKEN_TTL);
  return token;
}

/**
 * 校验令牌是否有效（存在且未过期）。
 * @param {string} token
 * @returns {boolean}
 */
function verify(token) {
  const exp = tokens.get(token);
  if (!exp) return false;
  if (Date.now() > exp) {
    tokens.delete(token);
    return false;
  }
  return true;
}

/**
 * 注销令牌。
 * @param {string} token
 */
function revoke(token) {
  tokens.delete(token);
}

module.exports = { issue, verify, revoke };
