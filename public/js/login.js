(function () {
  "use strict";

  async function init() {
    window.setTimeout(() => {
      location.href = "/admin.html";
    }, 500);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
