'use strict';

/**
 * 图片上传路由。需登录鉴权。
 * 请求：multipart/form-data，字段名 file
 * 返回：{ url, filename } —— url 为前端可直接访问的相对路径
 */

const express = require('express');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const multer = require('multer');
const config = require('../config');
const { ok } = require('../utils/response');
const { requireAuth } = require('../middleware/auth');
const uploadSingle = require('../middleware/upload');
const AppError = require('../utils/AppError');

const router = express.Router();

const logoUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.MAX_UPLOAD_SIZE, files: 1 },
  fileFilter(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const extOk = config.ALLOWED_IMAGE_EXT.includes(ext);
    const mimeOk = config.ALLOWED_IMAGE_MIME.includes(file.mimetype);
    if (!extOk || !mimeOk) {
      return cb(new AppError('LOGO格式仅支持 jpg / png', 400));
    }
    cb(null, true);
  },
}).single('file');

// POST /api/upload
router.post('/', requireAuth, (req, res, next) => {
  uploadSingle(req, res, (err) => {
    if (err) return next(err); // 交给全局错误处理（含 multer 错误）
    if (!req.file) {
      return next(new AppError('请上传图片文件（字段名 file）', 400));
    }
    const url = config.CASES_URL_PREFIX + req.file.filename;
    return ok(res, { url, filename: req.file.filename }, '上传成功');
  });
});

// POST /api/upload/logo
// 覆盖全站固定 LOGO：/static/images/logo.png
router.post('/logo', requireAuth, (req, res, next) => {
  logoUpload(req, res, (err) => {
    if (err) return next(err);
    if (!req.file) {
      return next(new AppError('请上传LOGO图片（字段名 file）', 400));
    }

    const logoPath = path.join(config.IMAGES_DIR, 'logo.png');
    const ext = path.extname(req.file.originalname).toLowerCase();

    try {
      fs.mkdirSync(config.IMAGES_DIR, { recursive: true });

      if (ext === '.png' && req.file.mimetype === 'image/png') {
        fs.writeFileSync(logoPath, req.file.buffer);
      } else {
        const tmpPath = path.join(os.tmpdir(), `logo_upload_${Date.now()}${ext === '.jpeg' ? '.jpg' : ext}`);
        fs.writeFileSync(tmpPath, req.file.buffer);
        try {
          execFileSync('sips', ['-s', 'format', 'png', tmpPath, '--out', logoPath], { stdio: 'ignore' });
        } finally {
          fs.rmSync(tmpPath, { force: true });
        }
      }

      return ok(res, { url: '/static/images/logo.png', filename: 'logo.png' }, 'LOGO更新成功');
    } catch (error) {
      return next(new AppError('LOGO保存失败，请上传 png 图片或确认服务器支持图片转换', 500));
    }
  });
});

module.exports = router;
