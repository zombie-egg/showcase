(function () {
  "use strict";

  const config = window.APP_CONFIG;

  function buildUrl(path) {
    return `${config.API_BASE_URL}${path}`;
  }

  function getToken() {
    return localStorage.getItem(config.TOKEN_KEY) || "";
  }

  function setToken(token) {
    localStorage.setItem(config.TOKEN_KEY, token);
  }

  function clearToken() {
    localStorage.removeItem(config.TOKEN_KEY);
  }

  function requestId() {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  async function request(path, options = {}) {
    const headers = new Headers(options.headers || {});
    const token = getToken();
    const hasBody = options.body !== undefined && !(options.body instanceof FormData);

    if (hasBody && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    if (/^(POST|PUT|DELETE)$/i.test(options.method || "GET")) {
      headers.set("X-Request-Id", requestId());
    }

    const response = await fetch(buildUrl(path), {
      ...options,
      headers,
      body: hasBody ? JSON.stringify(options.body) : options.body,
    });

    let payload = null;
    try {
      payload = await response.json();
    } catch (error) {
      payload = { code: response.status || 500, message: "接口响应格式异常", data: null };
    }

    if (payload.code === 401) {
      clearToken();
      if (!location.pathname.endsWith("/login.html")) {
        location.href = "/login.html";
      }
    }

    if (payload.code !== 0) {
      throw new Error(payload.message || "请求失败");
    }

    return payload.data;
  }

  window.Api = {
    getToken,
    setToken,
    clearToken,
    request,
    auth: {
      login(password) {
        return request("/api/auth/login", { method: "POST", body: { password } });
      },
      logout() {
        return request("/api/auth/logout", { method: "POST" });
      },
      check() {
        return request("/api/auth/check");
      },
    },
    categories: {
      list() {
        return request("/api/categories");
      },
      create(name) {
        return request("/api/categories", { method: "POST", body: { name } });
      },
      update(id, name) {
        return request(`/api/categories/${encodeURIComponent(id)}`, { method: "PUT", body: { name } });
      },
      remove(id) {
        return request(`/api/categories/${encodeURIComponent(id)}`, { method: "DELETE" });
      },
    },
    cases: {
      list(categoryId) {
        const query = categoryId ? `?categoryId=${encodeURIComponent(categoryId)}` : "";
        return request(`/api/cases${query}`);
      },
      create(payload) {
        return request("/api/cases", { method: "POST", body: payload });
      },
      update(id, payload) {
        return request(`/api/cases/${encodeURIComponent(id)}`, { method: "PUT", body: payload });
      },
      remove(id) {
        return request(`/api/cases/${encodeURIComponent(id)}`, { method: "DELETE" });
      },
    },
    upload: {
      image(file) {
        const formData = new FormData();
        formData.append("file", file);
        return request("/api/upload", { method: "POST", body: formData });
      },
      logo(file) {
        const formData = new FormData();
        formData.append("file", file);
        return request("/api/upload/logo", { method: "POST", body: formData });
      },
    },
  };
})();
