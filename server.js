'use strict';

/**
 * 服务入口。
 * 启动前执行 bootstrap（创建目录 + 初始化数据文件），随后监听端口。
 */

const config = require('./src/config');
const { bootstrap } = require('./src/utils/bootstrap');
const app = require('./src/app');

// 启动自检：自动创建 static/images/cases、data 目录及数据文件
bootstrap();

const server = app.listen(config.PORT, () => {
  console.log('========================================');
  console.log('  手绘风案例作品集 - 后端服务已启动');
  console.log(`  地址: http://localhost:${config.PORT}`);
  console.log(`  静态资源: http://localhost:${config.PORT}/static/`);
  console.log(`  LOGO 路径: /static/images/logo.png`);
  console.log(`  管理员密码: ${config.ADMIN_PASSWORD}（可用环境变量 ADMIN_PASSWORD 覆盖）`);
  console.log('========================================');
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n正在关闭服务...');
  server.close(() => process.exit(0));
});

module.exports = server;
