'use strict';

/**
 * 案例数据访问服务。
 */

const config = require('../config');
const { readJSON, writeJSON, genId } = require('../utils/store');
const AppError = require('../utils/AppError');
const categoryService = require('./categoryService');

async function list() {
  return readJSON(config.CASES_FILE);
}

/**
 * 列表 + 可选按分类过滤，并附带分类名称，方便前端渲染。
 * @param {string} [categoryId]
 */
async function listWithCategory(categoryId) {
  const [cases, categories] = await Promise.all([list(), categoryService.list()]);
  const catMap = new Map(categories.map((c) => [c.id, c.name]));
  let result = cases;
  if (categoryId) {
    result = result.filter((k) => k.categoryId === categoryId);
  }
  return result.map((k) => ({
    ...k,
    categoryName: catMap.get(k.categoryId) || null,
  }));
}

async function findById(id) {
  const all = await list();
  return all.find((k) => k.id === id) || null;
}

async function create({ name, categoryId, url, cover, intro }) {
  // 校验分类存在
  const category = await categoryService.findById(categoryId);
  if (!category) {
    throw new AppError('所属分类不存在', 400);
  }
  const all = await list();
  const now = new Date().toISOString();
  const item = {
    id: genId('case'),
    name,
    categoryId,
    url,
    cover,
    intro,
    createdAt: now,
    updatedAt: now,
  };
  all.push(item);
  await writeJSON(config.CASES_FILE, all);
  return item;
}

async function update(id, { name, categoryId, url, cover, intro }) {
  const all = await list();
  const idx = all.findIndex((k) => k.id === id);
  if (idx === -1) {
    throw new AppError('案例不存在', 404);
  }
  if (categoryId !== undefined) {
    const category = await categoryService.findById(categoryId);
    if (!category) {
      throw new AppError('所属分类不存在', 400);
    }
    all[idx].categoryId = categoryId;
  }
  if (name !== undefined) all[idx].name = name;
  if (url !== undefined) all[idx].url = url;
  if (cover !== undefined) all[idx].cover = cover;
  if (intro !== undefined) all[idx].intro = intro;
  all[idx].updatedAt = new Date().toISOString();
  await writeJSON(config.CASES_FILE, all);
  return all[idx];
}

async function remove(id) {
  const all = await list();
  const idx = all.findIndex((k) => k.id === id);
  if (idx === -1) {
    throw new AppError('案例不存在', 404);
  }
  const removed = all.splice(idx, 1)[0];
  await writeJSON(config.CASES_FILE, all);
  return removed;
}

module.exports = { list, listWithCategory, findById, create, update, remove };
