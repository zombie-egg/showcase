'use strict';

/**
 * 轻量 JSON 文件存储服务。
 * - 每个数据文件一把内存写锁（Promise 队列），串行化写入，避免并发写导致文件损坏。
 * - 写入采用「临时文件 + rename」原子替换策略，防止写一半崩溃留下坏文件。
 */

const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');

// 每个文件路径对应一个写队列尾部 Promise
const writeQueues = new Map();

/**
 * 确保目录存在，不存在则递归创建。
 * @param {string} dirPath
 */
function ensureDirSync(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * 确保 JSON 文件存在，不存在则以默认值初始化。
 * @param {string} filePath
 * @param {*} defaultValue
 */
function ensureFileSync(filePath, defaultValue) {
  ensureDirSync(path.dirname(filePath));
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2), 'utf8');
  }
}

/**
 * 读取 JSON 文件。
 * @param {string} filePath
 * @returns {Promise<*>}
 */
async function readJSON(filePath) {
  const raw = await fsp.readFile(filePath, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (err) {
    const e = new Error(`数据文件解析失败: ${filePath}`);
    e.statusCode = 500;
    throw e;
  }
}

/**
 * 原子写入 JSON 文件（串行化）。
 * @param {string} filePath
 * @param {*} data
 * @returns {Promise<void>}
 */
function writeJSON(filePath, data) {
  const prev = writeQueues.get(filePath) || Promise.resolve();
  const task = prev
    .catch(() => {}) // 前一个任务失败不阻塞后续
    .then(async () => {
      const tmp = `${filePath}.${process.pid}.${Date.now()}.tmp`;
      await fsp.writeFile(tmp, JSON.stringify(data, null, 2), 'utf8');
      await fsp.rename(tmp, filePath);
    });
  writeQueues.set(filePath, task);
  return task;
}

/**
 * 生成简单唯一 ID（时间戳 + 随机后缀）。
 * @param {string} prefix
 * @returns {string}
 */
function genId(prefix) {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now().toString(36)}${rand}`;
}

module.exports = {
  ensureDirSync,
  ensureFileSync,
  readJSON,
  writeJSON,
  genId,
};
