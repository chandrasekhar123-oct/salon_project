document.addEventListener("DOMContentLoaded", () => {
  const navItems = document.querySelectorAll(".nav-item");
  const screens = document.querySelectorAll(".screen");

  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      const targetId = item.getAttribute("data-target");

      // switch active nav
      navItems.forEach((btn) => btn.classList.remove("nav-item--active"));
      item.classList.add("nav-item--active");

      // switch visible screen
      screens.forEach((screen) => {
        if (screen.id === targetId) {
          screen.classList.add("is-active");
        } else {
          screen.classList.remove("is-active");
        }
      });
    });
  });

  // Handle hash navigation on load
  const hash = window.location.hash.substring(1);
  if (hash) {
    const targetNav = document.querySelector(`.nav-item[data-target="screen-${hash}"]`);
    if (targetNav) {
      targetNav.click();
    }
  }
});

