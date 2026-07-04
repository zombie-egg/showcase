'use strict';

const path = require('path');

// 项目根目录（src 的上一级）
const ROOT_DIR = path.resolve(__dirname, '..');

module.exports = {
  // 服务端口，可用环境变量覆盖
  PORT: process.env.PORT || 3000,

  // 管理员固定密码（生产部署可用环境变量 ADMIN_PASSWORD 覆盖）
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'Ccj940904',

  // 登录令牌有效期（毫秒），默认 7 天
  TOKEN_TTL: 7 * 24 * 60 * 60 * 1000,

  // 目录约定
  ROOT_DIR,
  DATA_DIR: path.join(ROOT_DIR, 'data'),
  STATIC_DIR: path.join(ROOT_DIR, 'static'),
  IMAGES_DIR: path.join(ROOT_DIR, 'static', 'images'),
  CASES_UPLOAD_DIR: path.join(ROOT_DIR, 'static', 'images', 'cases'),

  // 数据文件
  ADMIN_FILE: path.join(ROOT_DIR, 'data', 'admin.json'),
  CATEGORIES_FILE: path.join(ROOT_DIR, 'data', 'categories.json'),
  CASES_FILE: path.join(ROOT_DIR, 'data', 'cases.json'),

  // 前端可访问的封面图 URL 前缀
  CASES_URL_PREFIX: '/static/images/cases/',

  // 上传约束
  MAX_UPLOAD_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_EXT: ['.jpg', '.jpeg', '.png'],
  ALLOWED_IMAGE_MIME: ['image/jpeg', 'image/png'],
};
