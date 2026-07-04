'use strict';

/**
 * 案例 CRUD 路由。
 * - 查询公开（前台展示）
 * - 增 / 改 / 删 公开可用（后台免登录）
 */

const express = require('express');
const { ok } = require('../utils/response');
const { requireNonEmptyString, requireHttpUrl } = require('../utils/validators');
const AppError = require('../utils/AppError');
const caseService = require('../services/caseService');

const router = express.Router();

// GET /api/cases?categoryId=xxx  案例列表（公开，附带 categoryName）
router.get('/', async (req, res, next) => {
  try {
    const categoryId = req.query.categoryId ? String(req.query.categoryId) : undefined;
    const data = await caseService.listWithCategory(categoryId);
    return ok(res, data);
  } catch (err) {
    next(err);
  }
});

// GET /api/cases/:id  案例详情（公开）
router.get('/:id', async (req, res, next) => {
  try {
    const item = await caseService.findById(req.params.id);
    if (!item) throw new AppError('案例不存在', 404);
    return ok(res, item);
  } catch (err) {
    next(err);
  }
});

// POST /api/cases  新增案例
router.post('/', async (req, res, next) => {
  try {
    const payload = {
      name: requireNonEmptyString(req.body.name, '案例名称', 100),
      categoryId: requireNonEmptyString(req.body.categoryId, '所属分类'),
      url: requireHttpUrl(req.body.url, '跳转URL'),
      cover: requireNonEmptyString(req.body.cover, '案例封面图'),
      intro: requireNonEmptyString(req.body.intro, '案例简介', 500),
    };
    const item = await caseService.create(payload);
    return ok(res, item, '案例创建成功');
  } catch (err) {
    next(err);
  }
});

// PUT /api/cases/:id  编辑案例（全字段更新）
router.put('/:id', async (req, res, next) => {
  try {
    const payload = {
      name: requireNonEmptyString(req.body.name, '案例名称', 100),
      categoryId: requireNonEmptyString(req.body.categoryId, '所属分类'),
      url: requireHttpUrl(req.body.url, '跳转URL'),
      cover: requireNonEmptyString(req.body.cover, '案例封面图'),
      intro: requireNonEmptyString(req.body.intro, '案例简介', 500),
    };
    const item = await caseService.update(req.params.id, payload);
    return ok(res, item, '案例更新成功');
  } catch (err) {
    next(err);
  }
});

// DELETE /api/cases/:id  删除案例
router.delete('/:id', async (req, res, next) => {
  try {
    await caseService.remove(req.params.id);
    return ok(res, null, '案例删除成功');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
