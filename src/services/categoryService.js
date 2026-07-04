'use strict';

/**
 * 分类数据访问服务。
 */

const config = require('../config');
const { readJSON, writeJSON, genId } = require('../utils/store');
const AppError = require('../utils/AppError');

async function list() {
  return readJSON(config.CATEGORIES_FILE);
}

async function findById(id) {
  const all = await list();
  return all.find((c) => c.id === id) || null;
}

async function create(name) {
  const all = await list();
  if (all.some((c) => c.name === name)) {
    throw new AppError('分类名称已存在', 409);
  }
  const now = new Date().toISOString();
  const category = { id: genId('cat'), name, createdAt: now, updatedAt: now };
  all.push(category);
  await writeJSON(config.CATEGORIES_FILE, all);
  return category;
}

async function update(id, name) {
  const all = await list();
  const idx = all.findIndex((c) => c.id === id);
  if (idx === -1) {
    throw new AppError('分类不存在', 404);
  }
  if (all.some((c) => c.name === name && c.id !== id)) {
    throw new AppError('分类名称已存在', 409);
  }
  all[idx].name = name;
  all[idx].updatedAt = new Date().toISOString();
  await writeJSON(config.CATEGORIES_FILE, all);
  return all[idx];
}

async function remove(id) {
  const all = await list();
  const idx = all.findIndex((c) => c.id === id);
  if (idx === -1) {
    throw new AppError('分类不存在', 404);
  }
  // 拦截：已绑定案例的分类禁止删除
  const cases = await readJSON(config.CASES_FILE);
  const boundCount = cases.filter((k) => k.categoryId === id).length;
  if (boundCount > 0) {
    throw new AppError(`该分类下存在 ${boundCount} 个案例，无法删除，请先移除关联案例`, 409);
  }
  const removed = all.splice(idx, 1)[0];
  await writeJSON(config.CATEGORIES_FILE, all);
  return removed;
}

module.exports = { list, findById, create, update, remove };
