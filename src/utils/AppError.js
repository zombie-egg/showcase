'use strict';

/**
 * 业务错误类，携带 HTTP 状态码，供全局错误处理器识别并返回统一结构。
 */
class AppError extends Error {
  /**
   * @param {string} message 错误描述（返回给前端）
   * @param {number} statusCode HTTP 状态码，默认 400
   */
  constructor(message, statusCode = 400) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.isAppError = true;
  }
}

module.exports = AppError;
