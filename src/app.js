'use strict';

/**
 * Express 应用装配。
 * 中间件顺序：CORS -> body解析 -> 静态资源 -> 去重 -> 业务路由 -> 404 -> 错误处理
 */

const express = require('express');
const path = require('path');
const config = require('./config');

const cors = require('./middleware/cors');
const dedup = require('./middleware/dedup');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/categories');
const caseRoutes = require('./routes/cases');
const uploadRoutes = require('./routes/upload');

const app = express();

// 跨域
app.use(cors);

// body 解析（JSON + urlencoded）
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// 静态资源：/static -> 项目 static 目录（含 LOGO 与上传封面图）
app.use('/static', express.static(config.STATIC_DIR, { maxAge: '1h' }));

// 前端页面与静态源码：原生 HTML + Tailwind CDN + 原生 JS
app.use(express.static(path.join(config.ROOT_DIR, 'public'), { extensions: ['html'], maxAge: '10m' }));

// 公开入口页，方便直接访问 http://localhost:3000/
app.get('/', (req, res) => {
  res.sendFile(path.join(config.ROOT_DIR, 'public', 'index.html'));
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ code: 0, message: 'ok', data: { status: 'up', time: new Date().toISOString() } });
});

// 重复提交容错（写操作）
app.use(dedup);

// 业务路由
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/upload', uploadRoutes);

// 404 与全局错误处理
app.use(notFound);
app.use(errorHandler);

module.exports = app;
