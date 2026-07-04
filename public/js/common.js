(function () {
  "use strict";

  function qs(selector, root = document) {
    return root.querySelector(selector);
  }

  function qsa(selector, root = document) {
    return Array.from(root.querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function absolutizeAsset(path) {
    if (!path) return "";
    if (/^https?:\/\//i.test(path)) return path;
    return `${window.APP_CONFIG.API_BASE_URL}${path}`;
  }

  function applyLogo(cacheKey = "") {
    qsa("[data-logo]").forEach((img) => {
      img.src = cacheKey ? `${window.APP_CONFIG.LOGO_PATH}?v=${cacheKey}` : window.APP_CONFIG.LOGO_PATH;
      img.alt = "企业LOGO";
    });
  }

  function showToast(message, tone = "neutral") {
    const oldToast = qs(".toast");
    if (oldToast) oldToast.remove();

    const toneClass = tone === "error" ? "bg-[#000000] text-[#FFFFFF]" : "bg-[#FFFFFF] text-[#000000]";
    const toast = document.createElement("div");
    toast.className = `toast px-5 py-3 text-lg ${toneClass}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    window.setTimeout(() => toast.remove(), 2600);
  }

  function confirmSketch(message) {
    return new Promise((resolve) => {
      const backdrop = document.createElement("div");
      backdrop.className = "modal-backdrop is-open";
      backdrop.innerHTML = `
        <div class="paper-panel max-w-md w-full bg-[#FFFFFF] p-6">
          <h2 class="font-title text-4xl mb-3">Confirm</h2>
          <p class="text-xl leading-8">${escapeHtml(message)}</p>
          <div class="section-rule my-5"></div>
          <div class="flex justify-end gap-3">
            <button type="button" data-cancel class="paper-button px-5 py-3 text-xs">Cancel</button>
            <button type="button" data-ok class="paper-button button-primary px-5 py-3 text-xs">Delete</button>
          </div>
        </div>
      `;
      document.body.appendChild(backdrop);

      function close(value) {
        backdrop.remove();
        resolve(value);
      }

      qs("[data-cancel]", backdrop).addEventListener("click", () => close(false));
      qs("[data-ok]", backdrop).addEventListener("click", () => close(true));
      backdrop.addEventListener("click", (event) => {
        if (event.target === backdrop) close(false);
      });
    });
  }

  function validateHttpUrl(url) {
    return /^https?:\/\/.+/i.test(String(url || "").trim());
  }

  function validateImage(file) {
    if (!file) return "请选择封面图片";
    if (!window.APP_CONFIG.IMAGE_TYPES.includes(file.type)) return "图片格式仅支持 jpg / png";
    if (file.size > window.APP_CONFIG.MAX_IMAGE_SIZE) return "图片大小不能超过 5MB";
    return "";
  }

  window.UI = {
    qs,
    qsa,
    escapeHtml,
    absolutizeAsset,
    applyLogo,
    showToast,
    confirmSketch,
    validateHttpUrl,
    validateImage,
  };

  document.addEventListener("DOMContentLoaded", applyLogo);
})();
