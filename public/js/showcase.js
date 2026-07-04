(function () {
  "use strict";

  const state = {
    categories: [],
    cases: [],
    activeCategoryId: "",
  };

  function categoryName(id) {
    const item = state.categories.find((category) => category.id === id);
    return item ? item.name : "未分类";
  }

  function renderFilters() {
    const box = UI.qs("#categoryFilters");
    const filters = [{ id: "", name: "全部" }, ...state.categories];

    box.innerHTML = filters
      .map((category) => {
        const active = category.id === state.activeCategoryId;
        const activeClass = active ? "button-primary" : "";
        return `
          <button
            type="button"
            data-category-id="${UI.escapeHtml(category.id)}"
            class="paper-button tag-button shrink-0 px-5 py-3 text-xs ${activeClass}"
          >${UI.escapeHtml(category.name)}</button>
        `;
      })
      .join("");

    UI.qsa("[data-category-id]", box).forEach((button) => {
      button.addEventListener("click", () => {
        state.activeCategoryId = button.dataset.categoryId;
        renderFilters();
        loadCases();
      });
    });
  }

  function renderCases() {
    const grid = UI.qs("#caseGrid");
    const empty = UI.qs("#emptyState");

    if (!state.cases.length) {
      grid.innerHTML = "";
      empty.classList.remove("hidden");
      return;
    }

    empty.classList.add("hidden");
    grid.innerHTML = state.cases
      .map((item, index) => {
        const serial = String(index + 1).padStart(2, "0");
        return `
          <article class="paper-card bg-[#FFFFFF]">
            <a href="${UI.escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer" class="block">
              <div class="overflow-hidden border-b border-[#000000] bg-[#F5F5F5]">
                <img
                  src="${UI.escapeHtml(UI.absolutizeAsset(item.cover))}"
                  alt="${UI.escapeHtml(item.name)}"
                  class="h-64 w-full border-0 object-cover"
                  loading="lazy"
                />
              </div>
              <div class="p-5">
                <div class="mb-8 flex items-center justify-between gap-4">
                  <span class="case-meta font-mono text-xs uppercase tracking-[0.22em] text-[#525252]">${serial}</span>
                  <span class="case-meta border border-[#000000] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[#000000]">${UI.escapeHtml(item.categoryName || categoryName(item.categoryId))}</span>
                </div>
                <h3 class="font-title text-3xl leading-9">${UI.escapeHtml(item.name)}</h3>
                <p class="case-meta mt-5 font-mono text-[10px] uppercase tracking-[0.18em] text-[#525252]">项目描述</p>
                <p class="mt-2 text-lg leading-8 text-inherit">${UI.escapeHtml(item.intro)}</p>
                <p class="case-link mt-8 border-t border-[#000000] pt-4 font-mono text-xs tracking-[0.18em] text-[#525252]">打开项目网站</p>
              </div>
            </a>
          </article>
        `;
      })
      .join("");
  }

  async function loadCases() {
    try {
      state.cases = await Api.cases.list(state.activeCategoryId);
      renderCases();
    } catch (error) {
      UI.showToast(error.message, "error");
    }
  }

  async function init() {
    try {
      const [categories, cases] = await Promise.all([Api.categories.list(), Api.cases.list()]);
      state.categories = categories;
      state.cases = cases;
      renderFilters();
      renderCases();
    } catch (error) {
      UI.showToast(error.message, "error");
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
