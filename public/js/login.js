(function () {
  "use strict";

  async function init() {
    if (Api.getToken()) {
      try {
        await Api.auth.check();
        location.href = "/admin.html";
        return;
      } catch (error) {
        Api.clearToken();
      }
    }

    UI.qs("#loginForm").addEventListener("submit", async (event) => {
      event.preventDefault();
      const password = UI.qs("#password").value.trim();
      if (!password) {
        UI.showToast("密码不能为空", "error");
        return;
      }

      try {
        const data = await Api.auth.login(password);
        Api.setToken(data.token);
        UI.showToast("登录成功");
        window.setTimeout(() => {
          location.href = "/admin.html";
        }, 350);
      } catch (error) {
        UI.showToast(error.message, "error");
      }
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
