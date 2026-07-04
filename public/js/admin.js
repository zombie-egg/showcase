(function () {
  "use strict";

  const state = {
    categories: [],
    cases: [],
    editingCase: null,
  };

  function countCasesByCategory(categoryId) {
    return state.cases.filter((item) => item.categoryId === categoryId).length;
  }

  function renderCategories() {
    const list = UI.qs("#categoryList");
    if (!state.categories.length) {
      list.innerHTML = '<p class="text-lg text-[#525252]">暂无分类。</p>';
      renderCaseCategoryOptions();
      return;
    }

    list.innerHTML = state.categories
      .map((category) => {
        const count = countCasesByCategory(category.id);
        const disabled = count > 0;
        return `
          <div class="border border-[#000000] bg-[#FFFFFF] p-4">
            <div class="mb-3 flex items-center justify-between gap-3">
              <strong class="font-title text-2xl">${UI.escapeHtml(category.name)}</strong>
              <span class="font-mono text-xs uppercase tracking-[0.16em] text-[#525252]">${count} cases</span>
            </div>
            <div class="flex gap-2">
              <button data-edit-category="${UI.escapeHtml(category.id)}" class="paper-button flex-1 px-3 py-2 text-xs">Edit</button>
              <button
                data-delete-category="${UI.escapeHtml(category.id)}"
                class="paper-button flex-1 px-3 py-2 text-xs ${disabled ? "cursor-not-allowed bg-[#F5F5F5] text-[#525252]" : "button-primary"}"
                ${disabled ? "disabled" : ""}
              >${disabled ? "Locked" : "Delete"}</button>
            </div>
            ${disabled ? '<p class="mt-3 text-sm leading-6 text-[#525252]">该分类已绑定案例，需先移除关联案例后才能删除。</p>' : ""}
          </div>
        `;
      })
      .join("");

    UI.qsa("[data-edit-category]", list).forEach((button) => {
      button.addEventListener("click", () => editCategory(button.dataset.editCategory));
    });
    UI.qsa("[data-delete-category]", list).forEach((button) => {
      button.addEventListener("click", () => deleteCategory(button.dataset.deleteCategory));
    });
    renderCaseCategoryOptions();
  }

  function renderCaseCategoryOptions() {
    const select = UI.qs("#caseCategory");
    if (!select) return;
    select.innerHTML = state.categories
      .map((category) => `<option value="${UI.escapeHtml(category.id)}">${UI.escapeHtml(category.name)}</option>`)
      .join("");
  }

  function renderCases() {
    const list = UI.qs("#adminCaseList");
    if (!state.cases.length) {
      list.innerHTML = '<div class="paper-card bg-[#FFFFFF] p-6 text-xl text-[#525252]">暂无案例。</div>';
      return;
    }

    list.innerHTML = state.cases
      .map((item) => {
        return `
          <article class="paper-card bg-[#FFFFFF] p-4">
            <div class="mb-4 flex gap-4">
              <img src="${UI.escapeHtml(UI.absolutizeAsset(item.cover))}" alt="${UI.escapeHtml(item.name)}" class="h-28 w-36 shrink-0 border border-[#000000] object-cover" />
              <div class="min-w-0">
                <h3 class="font-title break-words text-3xl leading-8">${UI.escapeHtml(item.name)}</h3>
                <p class="case-meta mt-2 inline-block border border-[#000000] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em]">${UI.escapeHtml(item.categoryName || categoryName(item.categoryId))}</p>
              </div>
            </div>
            <p class="mb-4 text-lg leading-7">${UI.escapeHtml(item.intro)}</p>
            <div class="dashed-line mb-3"></div>
            <div class="flex flex-wrap gap-2">
              <button data-edit-case="${UI.escapeHtml(item.id)}" class="paper-button px-4 py-2 text-xs">Edit</button>
              <button data-delete-case="${UI.escapeHtml(item.id)}" class="paper-button button-primary px-4 py-2 text-xs">Delete</button>
              <a href="${UI.escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer" class="paper-button px-4 py-2 text-xs">Open</a>
            </div>
          </article>
        `;
      })
      .join("");

    UI.qsa("[data-edit-case]", list).forEach((button) => {
      button.addEventListener("click", () => openCaseModal(button.dataset.editCase));
    });
    UI.qsa("[data-delete-case]", list).forEach((button) => {
      button.addEventListener("click", () => deleteCase(button.dataset.deleteCase));
    });
  }

  function categoryName(id) {
    const category = state.categories.find((item) => item.id === id);
    return category ? category.name : "未分类";
  }

  function defaultCoverPath() {
    const index = (state.cases.length % 23) + 1;
    return `/static/images/cases/editor-cover-${String(index).padStart(2, "0")}.png`;
  }

  async function reload() {
    const [categories, cases] = await Promise.all([Api.categories.list(), Api.cases.list()]);
    state.categories = categories;
    state.cases = cases;
    renderCategories();
    renderCases();
  }

  async function editCategory(id) {
    const category = state.categories.find((item) => item.id === id);
    if (!category) return;
    const name = window.prompt("修改分类名称：", category.name);
    if (name === null) return;
    const nextName = name.trim();
    if (!nextName) {
      UI.showToast("分类名称不能为空", "error");
      return;
    }
    try {
      await Api.categories.update(id, nextName);
      UI.showToast("分类更新成功");
      await reload();
    } catch (error) {
      UI.showToast(error.message, "error");
    }
  }

  async function deleteCategory(id) {
    const ok = await UI.confirmSketch("确定删除这个分类吗？已绑定案例的分类会被后端拦截。");
    if (!ok) return;
    try {
      await Api.categories.remove(id);
      UI.showToast("分类删除成功");
      await reload();
    } catch (error) {
      UI.showToast(error.message, "error");
    }
  }

  function openCaseModal(id = "") {
    const item = id ? state.cases.find((caseItem) => caseItem.id === id) : null;
    state.editingCase = item || null;
    UI.qs("#caseModalTitle").textContent = item ? "编辑网站案例" : "新增网站案例";
    UI.qs("#caseId").value = item ? item.id : "";
    UI.qs("#caseName").value = item ? item.name : "";
    UI.qs("#caseCategory").value = item ? item.categoryId : state.categories[0]?.id || "";
    UI.qs("#caseUrl").value = item ? item.url : "";
    UI.qs("#caseCover").value = item ? item.cover : "";
    UI.qs("#caseCoverPath").value = item ? item.cover : "";
    UI.qs("#caseIntro").value = item ? item.intro : "";
    UI.qs("#caseCoverFile").value = "";

    const preview = UI.qs("#coverPreview");
    if (item && item.cover) {
      preview.src = UI.absolutizeAsset(item.cover);
      preview.classList.remove("hidden");
    } else {
      preview.removeAttribute("src");
      preview.classList.add("hidden");
    }

    UI.qs("#caseModal").classList.add("is-open");
  }

  function closeCaseModal() {
    UI.qs("#caseModal").classList.remove("is-open");
  }

  function readCasePayload() {
    const coverPath = UI.qs("#caseCoverPath").value.trim();
    return {
      name: UI.qs("#caseName").value.trim(),
      categoryId: UI.qs("#caseCategory").value,
      url: UI.qs("#caseUrl").value.trim(),
      cover: coverPath || UI.qs("#caseCover").value.trim() || defaultCoverPath(),
      intro: UI.qs("#caseIntro").value.trim(),
    };
  }

  function validateCasePayload(payload) {
    if (!payload.name) return "案例名称不能为空";
    if (!payload.categoryId) return "请选择分类";
    if (!UI.validateHttpUrl(payload.url)) return "跳转URL必须以 http:// 或 https:// 开头";
    if (!payload.cover) return "请上传封面图片或填写封面路径";
    if (!payload.intro) return "案例简介不能为空";
    return "";
  }

  async function uploadSelectedCover() {
    const file = UI.qs("#caseCoverFile").files[0];
    if (!file) return;
    const error = UI.validateImage(file);
    if (error) throw new Error(error);
    const data = await Api.upload.image(file);
    UI.qs("#caseCover").value = data.url;
    UI.qs("#caseCoverPath").value = data.url;
    UI.qs("#coverPreview").src = UI.absolutizeAsset(data.url);
    UI.qs("#coverPreview").classList.remove("hidden");
    UI.qs("#caseCoverFile").value = "";
  }

  async function saveCase(event) {
    event.preventDefault();
    try {
      await uploadSelectedCover();
      const payload = readCasePayload();
      const error = validateCasePayload(payload);
      if (error) {
        UI.showToast(error, "error");
        return;
      }
      if (state.editingCase) {
        await Api.cases.update(state.editingCase.id, payload);
        UI.showToast("案例更新成功");
      } else {
        await Api.cases.create(payload);
        UI.showToast("案例创建成功");
      }
      closeCaseModal();
      await reload();
    } catch (error) {
      UI.showToast(error.message, "error");
    }
  }

  async function deleteCase(id) {
    const ok = await UI.confirmSketch("确定删除这个案例吗？");
    if (!ok) return;
    try {
      await Api.cases.remove(id);
      UI.showToast("案例删除成功");
      await reload();
    } catch (error) {
      UI.showToast(error.message, "error");
    }
  }

  async function saveLogo(event) {
    event.preventDefault();
    const input = UI.qs("#logoFile");
    const file = input.files[0];
    const error = UI.validateImage(file);
    if (error) {
      UI.showToast(error, "error");
      return;
    }

    try {
      await Api.upload.logo(file);
      input.value = "";
      UI.applyLogo(Date.now());
      UI.showToast("LOGO更新成功");
    } catch (err) {
      UI.showToast(err.message, "error");
    }
  }

  async function logout() {
    try {
      await Api.auth.logout();
    } catch (error) {
      Api.clearToken();
    }
    Api.clearToken();
    location.href = "/login.html";
  }

  async function init() {
    if (!Api.getToken()) {
      location.href = "/login.html";
      return;
    }

    try {
      await Api.auth.check();
      await reload();
    } catch (error) {
      UI.showToast(error.message, "error");
      return;
    }

    UI.qs("#categoryForm").addEventListener("submit", async (event) => {
      event.preventDefault();
      const input = UI.qs("#categoryName");
      const name = input.value.trim();
      if (!name) {
        UI.showToast("分类名称不能为空", "error");
        return;
      }
      try {
        await Api.categories.create(name);
        input.value = "";
        UI.showToast("分类创建成功");
        await reload();
      } catch (error) {
        UI.showToast(error.message, "error");
      }
    });

    UI.qs("#openCaseModal").addEventListener("click", () => openCaseModal());
    UI.qs("#closeCaseModal").addEventListener("click", closeCaseModal);
    UI.qs("#cancelCaseForm").addEventListener("click", closeCaseModal);
    UI.qs("#caseForm").addEventListener("submit", saveCase);
    UI.qs("#logoForm").addEventListener("submit", saveLogo);
    UI.qs("#logoutBtn").addEventListener("click", logout);
    UI.qs("#caseCoverFile").addEventListener("change", async () => {
      try {
        await uploadSelectedCover();
      } catch (error) {
        UI.qs("#caseCoverFile").value = "";
        UI.showToast(error.message, "error");
      }
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
