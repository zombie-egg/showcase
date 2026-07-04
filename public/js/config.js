/*
 * 前端配置集中维护。
 * 同域部署使用空字符串；跨端口联调可改为 "http://localhost:3000"。
 */
window.APP_CONFIG = {
  API_BASE_URL: "",
  LOGO_PATH: "/static/images/logo.png",
  TOKEN_KEY: "handdrawn_showcase_token",
  MAX_IMAGE_SIZE: 5 * 1024 * 1024,
  IMAGE_TYPES: ["image/jpeg", "image/png"],
};
