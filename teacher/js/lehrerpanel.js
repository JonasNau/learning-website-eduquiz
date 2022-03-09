import * as Utils from "/includes/utils.js";
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

//Hotkeys
document.addEventListener("keydown", (key) => {
  console.log(key);
  let keycode = key.key;
  console.log(keycode);
  //Open Canvas with Alt + o
  if (keycode === "u" || keycode === "U") {
    if (key.altKey == true) {
      if (!Utils.userHasPermissions(["accessBenutzerverwaltung"])) {
        Utils.permissionDENIED();
        return false;
      }
      Utils.pickUsers();
    }
  }
});

