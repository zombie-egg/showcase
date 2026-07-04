'use strict';

/**
 * 参数强校验工具。所有校验失败抛出 AppError(400)。
 */

const AppError = require('./AppError');

/**
 * 校验非空字符串，返回 trim 后的值。
 * @param {*} value
 * @param {string} field 字段中文名，用于错误提示
 * @param {number} [maxLen] 最大长度限制
 * @returns {string}
 */
function requireNonEmptyString(value, field, maxLen) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new AppError(`${field}不能为空`, 400);
  }
  const v = value.trim();
  if (maxLen && v.length > maxLen) {
    throw new AppError(`${field}长度不能超过${maxLen}个字符`, 400);
  }
  return v;
}

/**
 * 校验 URL 必须以 http:// 或 https:// 开头。
 * @param {*} value
 * @param {string} field
 * @returns {string}
 */
function requireHttpUrl(value, field = '跳转URL') {
  const v = requireNonEmptyString(value, field);
  if (!/^https?:\/\/.+/i.test(v)) {
    throw new AppError(`${field}必须以 http:// 或 https:// 开头`, 400);
  }
  return v;
}

module.exports = {
  requireNonEmptyString,
  requireHttpUrl,
};
