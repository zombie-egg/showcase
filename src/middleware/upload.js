'use strict';

/**
 * 图片上传中间件（基于 multer）。
 * - 存储到 /static/images/cases/
 * - 仅允许 jpg / jpeg / png
 * - 单文件，字段名固定为 file，大小上限 5MB
 * - 文件名去重：时间戳 + 随机串 + 原扩展名
 */

const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const config = require('../config');
const AppError = require('../utils/AppError');

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, config.CASES_UPLOAD_DIR);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = ext === '.jpeg' ? '.jpg' : ext;
    const name = `case_${Date.now()}_${crypto.randomBytes(4).toString('hex')}${safeExt}`;
    cb(null, name);
  },
});

function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  const extOk = config.ALLOWED_IMAGE_EXT.includes(ext);
  const mimeOk = config.ALLOWED_IMAGE_MIME.includes(file.mimetype);
  if (!extOk || !mimeOk) {
    return cb(new AppError('图片格式仅支持 jpg / png', 400));
  }
  cb(null, true);
}

const uploader = multer({
  storage,
  fileFilter,
  limits: { fileSize: config.MAX_UPLOAD_SIZE, files: 1 },
});

// 导出单文件上传处理器，字段名 file
module.exports = uploader.single('file');
