import * as Utils from "../../includes/utils.js";
Utils.holdSererContact("../../includes/generalFunctions.php");

function sidebar() {
  let dropdowns = document.querySelectorAll(".iocn-link");
  for (var i = 0; i < dropdowns.length; i++) {
    dropdowns[i].addEventListener("click", (e) => {
      let dropdownParent = e.target.closest("li"); //selecting main parent of arrow
      dropdownParent.classList.toggle("showMenu");
    });
  }

  let sidebar = document.querySelector(".sidebar");
  let sidebarBtnInside = document.querySelector(".navbar-toggle-btn-inside");
  console.log(sidebarBtnInside);
  sidebarBtnInside.addEventListener("click", () => {
    sidebar.classList.toggle("close");
  });

  let sidebarBtnNavbar = document.querySelector(".navbar-toggle-btn-navbar");
  console.log(sidebarBtnNavbar);
  sidebarBtnNavbar.addEventListener("click", () => {
    sidebar.classList.toggle("close");
  });
}

sidebar();

var tooltipTriggerList = [].slice.call(
  document.querySelectorAll('[data-bs-toggle="tooltip"]')
);
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
  return new bootstrap.Tooltip(tooltipTriggerEl);
});

// document.addEventListener("click", () => {
//   soundManager.play("wiiMusic");
// }, {once: true});
