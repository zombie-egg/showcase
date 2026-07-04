'use strict';

/**
 * 启动自检：自动创建必需目录与数据文件，并写入初始化演示数据。
 * 保证前后端合并后可直接运行，避免上传报错 / 数据文件缺失。
 */

const config = require('../config');
const { ensureDirSync, ensureFileSync } = require('./store');

// ---- 初始化演示数据 ----

// 管理员配置表（密码优先取环境变量，此处仅存说明与占位）
const ADMIN_SEED = {
  username: 'admin',
  // 说明：真实校验以 config.ADMIN_PASSWORD 为准（默认 Ccj940904，可用环境变量覆盖）
  password: config.ADMIN_PASSWORD,
  updatedAt: new Date().toISOString(),
};

const CATEGORIES_SEED = [
  { id: 'cat_demo_web', name: '企业官网', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' },
  { id: 'cat_demo_shop', name: '电商平台', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' },
  { id: 'cat_demo_brand', name: '品牌活动页', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' },
];

const CASES_SEED = [
  {
    id: 'case_demo_1',
    name: '手绘风科技公司官网',
    categoryId: 'cat_demo_web',
    url: 'https://example.com/tech-official',
    cover: '/static/images/cases/demo-cover-1.png',
    intro: '为一家科技公司打造的手绘草稿风格官网，纸张质感与波浪圆角贯穿全站。',
    createdAt: '2026-01-02T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
  },
  {
    id: 'case_demo_2',
    name: '文创电商商城',
    categoryId: 'cat_demo_shop',
    url: 'https://example.com/culture-shop',
    cover: '/static/images/cases/demo-cover-2.png',
    intro: '文创产品电商平台，卡片搭配图钉与胶带手绘装饰，营造笔记本翻阅体验。',
    createdAt: '2026-01-03T00:00:00.000Z',
    updatedAt: '2026-01-03T00:00:00.000Z',
  },
  {
    id: 'case_demo_3',
    name: '春季品牌活动落地页',
    categoryId: 'cat_demo_brand',
    url: 'https://example.com/spring-campaign',
    cover: '/static/images/cases/demo-cover-3.png',
    intro: '限时品牌活动页，硬偏移无模糊阴影与轻微旋转，突出手写涂鸦氛围。',
    createdAt: '2026-01-04T00:00:00.000Z',
    updatedAt: '2026-01-04T00:00:00.000Z',
  },
];

/**
 * 执行启动初始化。
 */
function bootstrap() {
  // 1. 目录：static / images / cases / data
  ensureDirSync(config.STATIC_DIR);
  ensureDirSync(config.IMAGES_DIR);
  ensureDirSync(config.CASES_UPLOAD_DIR);
  ensureDirSync(config.DATA_DIR);

  // 2. 数据文件（仅在不存在时写入演示数据）
  ensureFileSync(config.ADMIN_FILE, ADMIN_SEED);
  ensureFileSync(config.CATEGORIES_FILE, CATEGORIES_SEED);
  ensureFileSync(config.CASES_FILE, CASES_SEED);
}

module.exports = { bootstrap, ADMIN_SEED, CATEGORIES_SEED, CASES_SEED };
