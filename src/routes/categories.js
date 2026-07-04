'use strict';

/**
 * 分类 CRUD 路由。
 * - 查询公开（前台需要展示分类）
 * - 增 / 改 / 删 需登录鉴权
 */

const express = require('express');
const { ok } = require('../utils/response');
const { requireNonEmptyString } = require('../utils/validators');
const { requireAuth } = require('../middleware/auth');
const categoryService = require('../services/categoryService');

const router = express.Router();

// GET /api/categories  分类列表（公开）
router.get('/', async (req, res, next) => {
  try {
    const data = await categoryService.list();
    return ok(res, data);
  } catch (err) {
    next(err);
  }
});

// POST /api/categories  新增分类  { name }
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const name = requireNonEmptyString(req.body.name, '分类名称', 50);
    const category = await categoryService.create(name);
    return ok(res, category, '分类创建成功');
  } catch (err) {
    next(err);
  }
});

// PUT /api/categories/:id  编辑分类名称  { name }
router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const name = requireNonEmptyString(req.body.name, '分类名称', 50);
    const category = await categoryService.update(req.params.id, name);
    return ok(res, category, '分类更新成功');
  } catch (err) {
    next(err);
  }
});

// DELETE /api/categories/:id  删除分类（绑定案例时拦截）
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    await categoryService.remove(req.params.id);
    return ok(res, null, '分类删除成功');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
