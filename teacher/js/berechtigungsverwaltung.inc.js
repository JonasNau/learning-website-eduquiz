import * as Utils from "../../includes/utils.js";

export async function changeType(id) {
  return new Promise(async function (resolve, reject) {
    let modalContainer = document.querySelector("#modalContainer");

    if (modalContainer == null) {
      modalContainer = document.createElement("div");
      modalContainer.setAttribute("id", "modalContainer");
      document.body.appendChild(modalContainer);
    }

    if (document.querySelector("#modalContainer") == null) {
      alert("no modal container found");
      reject();
    }
    let number = 1;
    let modals = modalContainer.querySelectorAll(".modal");
    console.log(modals);
    if (modals.length > 0) {
      number = modals.length + 1;
    }
    console.log("Number of Modals", number);

    let modalOuter = document.createElement("div");
    modalOuter.classList.add("modal-div");
    modalOuter.setAttribute("id", number);
    modalContainer.appendChild(modalOuter);

    let modalHTML = `
                <!-- Modal -->
                <div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="true" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div class="modal-dialog">
                  <div class="modal-content">
                    <div class="modal-header">
                      <h5 class="modal-title" id="staticBackdropLabel">Gruppen bearbeiten</h5>
                      <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" id="close"></button>
                    </div>
                    <div class="modal-body">

                    <div class="col d-block m-auto toggleTextInput">
                    <p class="content">
                      <button class="btn btn-warning" type="button" data-bs-toggle="collapse" data-bs-target="#collapseWidthExample" aria-expanded="false" aria-controls="collapseWidthExample">
                       Andere
                      </button>
                    </p>
                    <div style="min-height: 120px;" class="content">
                      <div class="collapse collapse-horizontal" id="collapseWidthExample">
                        <div class="card card-body">
                          <input type="search" class="form-control rounded" id="textInput" placeholder="Texteingabe" aria-label="Search" aria-describedby="search-addon" autocomplete="off">
                          <button type="button" class="btn btn-outline-success" id="submitBtn">Bestätigen</button>
                        </div>
                      </div>
                    </div>
              
              
                  </div>

                    <label for="selectInput" class="form-label">Typ ändern</label>
                    <select class="form-select" aria-label="Default select example" id="selectInput">
                        
                    </select>
                    </div>
                    <div class="modal-footer">
                      <button type="button" class="btn btn-danger" id="no">Nein</button>
                      <button type="button" class="btn btn-success" id="yes">Ja</button>
                    </div>
                  </div>
                </div>
                </div>
                 `;

    modalOuter.innerHTML = modalHTML;
    let modal = modalOuter.querySelector(".modal");
    let modalBody = modal.querySelector(".modal-body");

    let textInput = modal.querySelector(".toggleTextInput #textInput");
    let addBtn = modal.querySelector(".toggleTextInput #submitBtn");

    addBtn.addEventListener("click", () => {
      let input = textInput.value;
      if (!Utils.isEmptyInput(input, true)) {
        resolve(input);
      }
    });

    let selectList = modal.querySelector("#selectInput");

    let update = async () => {
      let availableTypes = await Utils.makeJSON(
        await Utils.sendXhrREQUEST(
          "POST",
          "berechtigungsverwaltung&operation=other&type=getAllAvailableTypes",
          "./includes/berechtigungsverwaltung.inc.php",
          "application/x-www-form-urlencoded",
          true,
          true,
          false,
          true
        )
      );
      let currentType = await Utils.sendXhrREQUEST(
        "POST",
        "berechtigungsverwaltung&operation=getValues&type=getType&id=" + id,
        "./includes/berechtigungsverwaltung.inc.php",
        "application/x-www-form-urlencoded",
        true,
        true,
        false,
        true
      );

      if (currentType) {
        let choosenOtption = document.createElement("option");
        choosenOtption.setAttribute("data-value", currentType);
        choosenOtption.setAttribute("selected", "selected");
        choosenOtption.innerHTML = `${currentType} (aktuell)`;
        selectList.appendChild(choosenOtption);
      }

      if (availableTypes) {
        for (const type of availableTypes) {
          if (currentType == type) {
            continue;
          }
          let option = document.createElement("option");
          option.setAttribute("data-value", type);
          option.innerHTML = type;
          selectList.appendChild(option);
        }
      }
    };

    update();

    let close = modal.querySelector("#close");
    let yes = modal.querySelector("#yes");
    let no = modal.querySelector("#no");

    var myModal = new bootstrap.Modal(modal);
    myModal.show();

    yes.addEventListener("click", (target) => {
      myModal.hide();
      modalOuter.remove();
      Utils.hideAllModals(false);
      let input =
        selectList[selectList.selectedIndex].getAttribute("data-value");
      if (!Utils.isEmptyInput(input, true)) {
        resolve(input);
      }
      resolve();
    });

    no.addEventListener("click", (target) => {
      myModal.hide();
      modalOuter.remove();
      Utils.hideAllModals(false);
      resolve(false);
    });

    close.addEventListener("click", (target) => {
      myModal.hide();
      modalOuter.remove();
      Utils.hideAllModals(false);
      resolve(false);
    });
  });
}

export async function changeTypeAll() {
  return new Promise(async function (resolve, reject) {
    let modalContainer = document.querySelector("#modalContainer");

    if (modalContainer == null) {
      modalContainer = document.createElement("div");
      modalContainer.setAttribute("id", "modalContainer");
      document.body.appendChild(modalContainer);
    }

    if (document.querySelector("#modalContainer") == null) {
      alert("no modal container found");
      reject();
    }
    let number = 1;
    let modals = modalContainer.querySelectorAll(".modal");
    console.log(modals);
    if (modals.length > 0) {
      number = modals.length + 1;
    }
    console.log("Number of Modals", number);

    let modalOuter = document.createElement("div");
    modalOuter.classList.add("modal-div");
    modalOuter.setAttribute("id", number);
    modalContainer.appendChild(modalOuter);

    let modalHTML = `
                <!-- Modal -->
                <div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="true" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div class="modal-dialog">
                  <div class="modal-content">
                    <div class="modal-header">
                      <h5 class="modal-title" id="staticBackdropLabel">Typ bearbeiten (Alle)</h5>
                      <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" id="close"></button>
                    </div>
                    <div class="modal-body">

                    <div class="col d-block m-auto toggleTextInput">
                    <p class="content">
                      <button class="btn btn-warning" type="button" data-bs-toggle="collapse" data-bs-target="#collapseWidthExample" aria-expanded="false" aria-controls="collapseWidthExample">
                       Andere
                      </button>
                    </p>
                    <div style="min-height: 120px;" class="content">
                      <div class="collapse collapse-horizontal" id="collapseWidthExample">
                        <div class="card card-body">
                          <input type="search" class="form-control rounded" id="textInput" placeholder="Texteingabe" aria-label="Search" aria-describedby="search-addon" autocomplete="off">
                          <button type="button" class="btn btn-outline-success" id="submitBtn">Bestätigen</button>
                        </div>
                      </div>
                    </div>
              
              
                  </div>

                    <label for="selectInput" class="form-label">Typ ändern</label>
                    <select class="form-select" aria-label="Default select example" id="selectInput">
                        
                    </select>
                    </div>
                    <div class="modal-footer">
                      <button type="button" class="btn btn-danger" id="no">Nein</button>
                      <button type="button" class="btn btn-success" id="yes">Ja</button>
                    </div>
                  </div>
                </div>
                </div>
                 `;

    modalOuter.innerHTML = modalHTML;
    let modal = modalOuter.querySelector(".modal");
    let modalBody = modal.querySelector(".modal-body");

    let textInput = modal.querySelector(".toggleTextInput #textInput");
    let addBtn = modal.querySelector(".toggleTextInput #submitBtn");

    addBtn.addEventListener("click", () => {
      let input = textInput.value;
      if (!Utils.isEmptyInput(input, true)) {
        resolve(input);
      }
    });

    let selectList = modal.querySelector("#selectInput");

    let update = async () => {
      let availableTypes = await Utils.makeJSON(
        await Utils.sendXhrREQUEST(
          "POST",
          "berechtigungsverwaltung&operation=other&type=getAllAvailableTypes",
          "./includes/berechtigungsverwaltung.inc.php",
          "application/x-www-form-urlencoded",
          true,
          true,
          false,
          true
        )
      );
      if (availableTypes) {
        for (const type of availableTypes) {
          let option = document.createElement("option");
          option.setAttribute("data-value", type);
          option.innerHTML = type;
          selectList.appendChild(option);
        }
      }
    };

    update();

    let close = modal.querySelector("#close");
    let yes = modal.querySelector("#yes");
    let no = modal.querySelector("#no");

    var myModal = new bootstrap.Modal(modal);
    myModal.show();

    yes.addEventListener("click", (target) => {
      myModal.hide();
      modalOuter.remove();
      Utils.hideAllModals(false);
      let input =
        selectList[selectList.selectedIndex].getAttribute("data-value");
      if (!Utils.isEmptyInput(input, true)) {
        resolve(input);
      }
      resolve();
    });

    no.addEventListener("click", (target) => {
      myModal.hide();
      modalOuter.remove();
      Utils.hideAllModals(false);
      resolve(false);
    });

    close.addEventListener("click", (target) => {
      myModal.hide();
      modalOuter.remove();
      Utils.hideAllModals(false);
      resolve(false);
    });
  });
}

export async function changeUsedAt(id) {
  return new Promise(async function (resolve, reject) {
    let modalContainer = document.querySelector("#modalContainer");

    if (modalContainer == null) {
      modalContainer = document.createElement("div");
      modalContainer.setAttribute("id", "modalContainer");
      document.body.appendChild(modalContainer);
    }

    if (document.querySelector("#modalContainer") == null) {
      alert("no modal container found");
      reject();
    }
    let number = 1;
    let modals = modalContainer.querySelectorAll(".modal");
    console.log(modals);
    if (modals.length > 0) {
      number = modals.length + 1;
    }
    console.log("Number of Modals", number);

    let modalOuter = document.createElement("div");
    modalOuter.classList.add("modal-div");
    modalOuter.setAttribute("id", number);
    modalContainer.appendChild(modalOuter);

    let modalHTML = `
                <!-- Modal -->
                <div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="true" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div class="modal-dialog">
                  <div class="modal-content">
                    <div class="modal-header">
                      <h5 class="modal-title" id="staticBackdropLabel">Gruppen bearbeiten</h5>
                      <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" id="close"></button>
                    </div>
                    <div class="modal-body">

                    <div class="col d-block m-auto toggleTextInput">
                    <p class="content">
                      <button class="btn btn-warning" type="button" data-bs-toggle="collapse" data-bs-target="#collapseWidthExample" aria-expanded="false" aria-controls="collapseWidthExample">
                       Andere
                      </button>
                    </p>
                    <div style="min-height: 120px;" class="content">
                      <div class="collapse collapse-horizontal" id="collapseWidthExample">
                        <div class="card card-body">
                          <input type="search" class="form-control rounded" id="textInput" placeholder="Texteingabe" aria-label="Search" aria-describedby="search-addon" autocomplete="off">
                          <button type="button" class="btn btn-outline-success" id="submitBtn">Bestätigen</button>
                        </div>
                      </div>
                    </div>

                    <button type="button" id="add">Hinzufügen</button>
                    <select id="addList">
                    
                    </select>
                      <ul id="currentList">
                      
                      </ul>
                    </div>
                    <div class="modal-footer">
                      <button type="button" class="btn btn-danger" id="no">Nein</button>
                      <button type="button" class="btn btn-success" id="yes">Ja</button>
                    </div>
                  </div>
                </div>
                </div>
                 `;

    modalOuter.innerHTML = modalHTML;
    let modal = modalOuter.querySelector(".modal");
    let modalBody = modal.querySelector(".modal-body");

    //Add new - Elements
    let textInput = modal.querySelector(".toggleTextInput #textInput");
    let textInputAddBtn = modal.querySelector(".toggleTextInput #submitBtn");

    //Add List
    let addList = modal.querySelector("#addList");

    //Add btn Add List
    let addListAddBtn = modal.querySelector("#add");

    //Current List
    let currentList = modal.querySelector("#currentList");

    textInputAddBtn.addEventListener("click", async () => {
      let input = textInput.value;
      if (!Utils.isEmptyInput(input, true)) {
        await add(input);
        update();
      }
    });

    addListAddBtn.addEventListener("click", async () => {
      let input = addList[addList.selectedIndex].getAttribute("data-value");
      if (!Utils.isEmptyInput(input, true)) {
        await add(input);
        update();
      }
    });

    let update = async () => {
      let availableUsedAtArray = await Utils.makeJSON(
        await Utils.sendXhrREQUEST(
          "POST",
          "berechtigungsverwaltung&operation=other&type=getAllAvailableUsedAt",
          "./includes/berechtigungsverwaltung.inc.php",
          "application/x-www-form-urlencoded",
          true,
          false,
          true,
          true
        )
      );
      let usedAtArray = await Utils.makeJSON(
        await Utils.sendXhrREQUEST(
          "POST",
          "berechtigungsverwaltung&operation=getValues&type=getCurrentUsed&id=" +
            id,
          "./includes/berechtigungsverwaltung.inc.php",
          "application/x-www-form-urlencoded",
          true,
          true,
          false,
          true
        )
      );

      //Fill current choosen
      currentList.innerHTML = "";
      if (usedAtArray && usedAtArray.length > 0) {
        for (const current of usedAtArray) {
          let listItem = document.createElement("li");
          listItem.setAttribute("data-value", current);
          listItem.innerHTML = `<span>${current}</span><button type="button" id="remove">X</button>`;
          currentList.appendChild(listItem);
          let removeBtn = listItem.querySelector("#remove");
          removeBtn.addEventListener("click", async (event) => {
            await remove(current);
            update();
          });
        }
      }

      //Fill add List without current choosen
      addList.innerHTML = "";
      if (availableUsedAtArray && availableUsedAtArray.length > 0) {
        //Fill select
        for (const current of availableUsedAtArray) {
          if (usedAtArray && usedAtArray.length > 0) {
            for (const usedAt of usedAtArray) {
              if (usedAt == current) {
                continue;
              }
            }
          }
          let option = document.createElement("option");
          option.setAttribute("data-value", current);
          option.innerHTML = current;
          addList.appendChild(option);
        }
      }
    };

    let add = async (input) => {
      return new Promise(async (resolve, reject) => {
        if (!Utils.isEmptyInput(input, true)) {
          let res = resolve(
            await Utils.sendXhrREQUEST(
              "POST",
              "berechtigungsverwaltung&operation=changeValue&type=changeUsedAt&secondOperation=add&toAdd=" +
                input +
                "&id=" +
                id,
              "./includes/berechtigungsverwaltung.inc.php",
              "application/x-www-form-urlencoded",
              true,
              false,
              true,
              true
            )
          );
        }
      });
    };

    let remove = async (input) => {
      return new Promise(async (resolve, reject) => {
        if (!Utils.isEmptyInput(input, true)) {
          let res = resolve(
            await Utils.sendXhrREQUEST(
              "POST",
              "berechtigungsverwaltung&operation=changeValue&type=changeUsedAt&secondOperation=remove&toRemove=" +
                input +
                "&id=" +
                id,
              "./includes/berechtigungsverwaltung.inc.php",
              "application/x-www-form-urlencoded",
              true,
              false,
              true,
              true
            )
          );
        }
      });
    };
    update();

    let close = modal.querySelector("#close");
    let yes = modal.querySelector("#yes");
    let no = modal.querySelector("#no");

    var myModal = new bootstrap.Modal(modal);
    myModal.show();

    yes.addEventListener("click", (target) => {
      myModal.hide();
      modalOuter.remove();
      Utils.hideAllModals(false);
      resolve("Erfolg!");
    });

    no.addEventListener("click", (target) => {
      myModal.hide();
      modalOuter.remove();
      Utils.hideAllModals(false);
      resolve(false);
    });

    close.addEventListener("click", (target) => {
      myModal.hide();
      modalOuter.remove();
      Utils.hideAllModals(false);
      resolve(false);
    });
  });
}

export async function changeUsedAtAll() {
  return new Promise(async function (resolve, reject) {
    let modalContainer = document.querySelector("#modalContainer");

    if (modalContainer == null) {
      modalContainer = document.createElement("div");
      modalContainer.setAttribute("id", "modalContainer");
      document.body.appendChild(modalContainer);
    }

    if (document.querySelector("#modalContainer") == null) {
      alert("no modal container found");
      reject();
    }
    let number = 1;
    let modals = modalContainer.querySelectorAll(".modal");
    console.log(modals);
    if (modals.length > 0) {
      number = modals.length + 1;
    }
    console.log("Number of Modals", number);

    let modalOuter = document.createElement("div");
    modalOuter.classList.add("modal-div");
    modalOuter.setAttribute("id", number);
    modalContainer.appendChild(modalOuter);
    let choosenArray = new Array();

    let modalHTML = `
                <!-- Modal -->
                <div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="true" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div class="modal-dialog">
                  <div class="modal-content">
                    <div class="modal-header">
                      <h5 class="modal-title" id="staticBackdropLabel">Gruppen bearbeiten</h5>
                      <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" id="close"></button>
                    </div>
                    <div class="modal-body">
                    <select id="methodSelection">
                      <option data-value="" selected="selected">Methode auswählen</option>
                      <option data-value="add">Hinzufügen</option>
                      <option data-value="remove">Entfernen</option>
                      <option data-value="overwrite">Überschreiben (nur ausgewähltes setzen)</option>
                      <option data-value="deleteAll">Alle entfernen</option>
                    </select>
                    <div class="col d-block m-auto toggleTextInput">
                    <p class="content">
                      <button class="btn btn-warning" type="button" data-bs-toggle="collapse" data-bs-target="#collapseWidthExample" aria-expanded="false" aria-controls="collapseWidthExample">
                       Andere
                      </button>
                    </p>
                    <div style="min-height: 120px;" class="content">
                      <div class="collapse collapse-horizontal" id="collapseWidthExample">
                        <div class="card card-body">
                          <input type="search" class="form-control rounded" id="textInput" placeholder="Texteingabe" aria-label="Search" aria-describedby="search-addon" autocomplete="off">
                          <button type="button" class="btn btn-outline-success" id="submitBtn">Bestätigen</button>
                        </div>
                      </div>
                    </div>

                    <button type="button" id="add">Hinzufügen</button>
                    <select id="selectList">
                    
                    </select>
                      <ul id="selected">
                      
                      </ul>
                    </div>
                    <div class="modal-footer">
                      <button type="button" class="btn btn-danger" id="no">Nein</button>
                      <button type="button" class="btn btn-success" id="yes">Ja</button>
                    </div>
                  </div>
                </div>
                </div>
                 `;

    modalOuter.innerHTML = modalHTML;
    let modal = modalOuter.querySelector(".modal");
    let modalBody = modal.querySelector(".modal-body");

    let addBtn = modal.querySelector("#add");

    let selectList = modal.querySelector("#selectList");

    let textInput = modal.querySelector(".toggleTextInput #textInput");
    let textInputAddBtn = modal.querySelector(".toggleTextInput #submitBtn");

    textInputAddBtn.addEventListener("click", async () => {
      let input = textInput.value;
      if (!Utils.isEmptyInput(input, true)) {
        Utils.addToArray(choosenArray, input, true);
        update();
      }
    });

    addBtn.addEventListener("click", async () => {
      let value =
        selectList.options[selectList.selectedIndex].getAttribute("data-value");
      if (!Utils.isEmptyInput(value, true)) {
        Utils.addToArray(choosenArray, value, false);
        update();
      }
    });

    let update = async () => {
      console.log(choosenArray);

      let ul = modal.querySelector("#selected");
      ul.innerHTML = "";

      if (choosenArray.length > 0) {
        choosenArray.forEach((current) => {
          let li = document.createElement("li");
          li.setAttribute("data-value", current);

          ul.appendChild(li);
          li.innerHTML = `<span>${current}</span><button type="button" id="remove">X</button>`;

          let removeBtn = li.querySelector("#remove");
          removeBtn.addEventListener("click", async () => {
            Utils.removeFromArray(choosenArray, current);
            update();
          });
        });
      }

      let availableUsedAtArray = await Utils.makeJSON(
        await Utils.sendXhrREQUEST(
          "POST",
          "berechtigungsverwaltung&operation=other&type=getAllAvailableUsedAt",
          "./includes/berechtigungsverwaltung.inc.php",
          "application/x-www-form-urlencoded",
          true,
          false,
          true,
          true
        )
      );

      selectList.innerHTML =
        "<option selected='selected' data-value=''>Auswahl</option>";
      availableUsedAtArray.forEach((current) => {
        let optionElement = document.createElement("option");
        optionElement.setAttribute("data-value", current);
        selectList.appendChild(optionElement);
        optionElement.innerHTML = current;
      });
    };
    update();

    let close = modal.querySelector("#close");
    let yes = modal.querySelector("#yes");
    let no = modal.querySelector("#no");

    var myModal = new bootstrap.Modal(modal);
    myModal.show();

    let getMethod = () => {
      let methodSelection = modal.querySelector("#methodSelection");
      if (!methodSelection) return false;
      let value =
        methodSelection[methodSelection.selectedIndex].getAttribute(
          "data-value"
        );
      return value;
    };

    yes.addEventListener("click", (target) => {
      myModal.hide();
      modalOuter.remove();
      Utils.hideAllModals(false);
      resolve({ toChange: choosenArray, method: getMethod() });
    });

    no.addEventListener("click", (target) => {
      myModal.hide();
      modalOuter.remove();
      Utils.hideAllModals(false);
      resolve(false);
    });

    close.addEventListener("click", (target) => {
      myModal.hide();
      modalOuter.remove();
      Utils.hideAllModals(false);
      resolve(false);
    });
  });
}

export async function addPermission(hidePermissions) {
  return new Promise(async function (resolve, reject) {
    let modalContainer = document.querySelector("#modalContainer");

    if (modalContainer == null) {
      modalContainer = document.createElement("div");
      modalContainer.setAttribute("id", "modalContainer");
      document.body.appendChild(modalContainer);
    }

    if (document.querySelector("#modalContainer") == null) {
      alert("no modal container found");
      reject();
    }
    let number = 1;
    let modals = modalContainer.querySelectorAll(".modal");
    console.log(modals);
    if (modals.length > 0) {
      number = modals.length + 1;
    }
    console.log("Number of Modals", number);

    let modalOuter = document.createElement("div");
    modalOuter.classList.add("modal-div");
    modalOuter.setAttribute("id", number);
    modalContainer.appendChild(modalOuter);

    let modalHTML = `
    <!-- Modal -->
    <div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="true" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
    <div class="modal-dialog modal-fullscreen">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="staticBackdropLabel">Berechtigungen hinzufügen</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" id="close"></button>
        </div>
        <div class="modal-body">
         
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-danger" id="no">Nein</button>
          <button type="button" class="btn btn-success" id="yes">Ja</button>
        </div>
      </div>
    </div>
    </div>
                 `;

    modalOuter.innerHTML = modalHTML;
    let modal = modalOuter.querySelector(".modal");
    let modalBody = modal.querySelector(".modal-body");

    modalBody.innerHTML = `
    <div id="programContainer">
    <div id="availablePermissionsContainer">
        <h3>Akutelle Berechtigungen</h3>
        <button class="btn btn-secondary" id="filterToggle">Filtern</button>
        <div class="filter hidden">
            <div id="chooseFilterTypeContainer">
                <label for="chooseFilter" class="form-label">Filtern nach</label>
                <select id="chooseFilter" class="form-select">
                    <option data-value="" selected="selected">Auswahl</option>
                    <option data-value="name">Name</option>
                    <option data-value="description">Beschreibung</option>
                    <option data-value="ranking">Rang</option>
                    <option data-value="value">Wert</option>
                    <option data-value="all">Alle anzeigen</option>
                </select>
            </div>
            <div class="selectionFilters">
                <div id="other">
                    <div id="searchWhileTyping">
                        <label for="allowSearchWhileTyping">Während des Tippens suchen</label>
                        <input type="checkbox" id="allowSearchWhileTyping">
                    </div>
                </div>
                <div class="mt-2" id="name">
                    <label for="textInput" class="form-label">Filtern nach Name</label>
                    <input type="text" id="textInput" class="form-control" placeholder="z.B. accessLeherpanel"
                        autocomplete="off">
                </div>
                <div class="mt-2" id="description">
                    <label for="textInput" class="form-label">Filtern nach Beschreibung</label>
                    <input type="text" id="textInput" class="form-control"
                        placeholder="z.B. 'Lehrerpanel zu betreten'" autocomplete="off">
                </div>
                <div class="mt-2" id="ranking">
                    <label for="numberInput" class="form-label">Filtern nach Rang</label>
                    <input type="number" id="numberInput" name="numberInput" min="0" max="100" autocomplete="off">
                </div>
                <div class="mt-2" id="value">
                    <label for="textInput" class="form-label">Filtern nach Wert</label>
                    <input type="text" id="textInput" class="form-control" placeholder="z.B. 1" autocomplete="off">
                </div>
                <div class="mt-2" id="limitResults">
                    <label for="numberInput" class="form-label">Ergebnisse Limitieren</label>
                    <input type="number" id="numberInput" name="numberInput" min="0" autocomplete="off">
                </div>

            </div>
            <button type="button" class="btn btn-primary" id="search"
                style="position: relative"><span>Suchen</span></button>
        </div>
        <div class="resultDesciption">

        </div>
        <table class="styled-table" id="availablePermissionsTable">
            <thead>
                <tr>
                    <th id="select">
                        <div class="heading">Auswählen</div>
                        <hr>
                        <div><input type="checkbox" id="chooseall"> Alle auswählen</div>
                    </th>
                    <th id="name">Name</th>
                    <th id="description">Beschreibung</th>
                    <th id="normalValue">Normaler Wert</td>
                    <th id="ranking">Rang</th>
                    <th id="hinweis">Hinweis</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td class="select"><input type="checkbox" id="select"><button id="chooseOnly"><img
                                src="../../images/icons/zahnrad.svg" alt="Auswahl"></button></td>
                    <td id="name">accessLeherpanel</td>
                    <td id="description">Wird benötigt, um das Lehrerpanel zu betreten</td>
                    <td id="value">1</td>
                    <td id="ranking">3</td>
                    <td id="hinweis">1 = an | 0 = aus</td>
                </tr>
            </tbody>
        </table>


    </div>


</div>
    `;

    var myModal = new bootstrap.Modal(modal);
    myModal.show();

    class AddPermissionsVerwaltung {
      constructor(container) {
        this.container = container;
        this.searchBtn = null;
        this.chooseFilterTypeSelect = null;
        this.filterContainer = null;
        this.selectionFiltersContainer = null;
        this.limiter = null;

        //Filters
        this.filterType = null;
        this.nameSelectContainer = null;
        this.descriptionSelectContainer = null;
        this.rankingSelectContainer = null;
        this.valueSelectContainer = null;
        this.limiter = null;

        //others
        this.searchWhileTyping = false;
        this.editBtn = null;

        // this.groupsSearchArray = new Array();
        // this.permissionsSearchArray = new Object();
        // this.klassenstufenSearchArray = new Array();
        this.choosenArray = new Array();
        this.oldCheckedArray = new Array();

        this.resultTable = null;
        // this.chooseAllBtn = null;
        this.tableBody = null;
        this.resultDescriptionContainer = null;
        // this.resultsDescription = null;
        // this.resultsFound = null;

        this.dontShowArray = null;
      }

      prepareEdit() {
        if (!this.editContainer) return false;
        this.editContainer.classList.add("hidden");
        this.clear(this.editTableBody);

        //Change All
        let thead = this.editTable.querySelector("thead");
      }

      async prepareSearch() {
        if (!this.container) return false;

        //StartBtn
        let searchBtn = this.container.querySelector(".filter #search");
        //if (!searchBtn) return false;
        this.searchBtn = searchBtn;

        //Filter Container (init)
        let filterContainer = this.container.querySelector(".filter");
        if (!filterContainer) return "No filter container";
        this.filterContainer = filterContainer;
        filterContainer.classList.add("hidden"); //Hide it if it loads

        //Filter Type Select (init)
        let chooseFilterTypeSelect = filterContainer.querySelector(
          "#chooseFilterTypeContainer #chooseFilter"
        );
        if (!chooseFilterTypeSelect) return false;
        this.chooseFilterTypeSelect = chooseFilterTypeSelect;

        //Toggle Search (init)
        let toggleSearchBtn = this.container.querySelector("#filterToggle");
        //if (!toggleSearchBtn) return false;
        toggleSearchBtn.addEventListener("click", () => {
          filterContainer.classList.toggle("hidden");
        });

        //Selection Filters (init) - Enable or disable filter
        console.log(this.filterContainer);
        let selectionFiltersContainer =
          this.filterContainer.querySelector(".selectionFilters");
        if (!selectionFiltersContainer) return "no selection filters container";
        this.selectionFiltersContainer = selectionFiltersContainer;

        //Initialize filters
        let nameSelectContainer =
          selectionFiltersContainer.querySelector("#name");
        let descriptionSelectContainer =
          selectionFiltersContainer.querySelector("#description");
        let rankingSelectContainer =
          selectionFiltersContainer.querySelector("#ranking");
        let valueSelectContainer =
          selectionFiltersContainer.querySelector("#value");
        if (
          !nameSelectContainer ||
          !descriptionSelectContainer ||
          !rankingSelectContainer ||
          !valueSelectContainer
        )
          return "Error in initializing Filters";
        this.nameSelectContainer = nameSelectContainer;
        this.descriptionSelectContainer = descriptionSelectContainer;
        this.rankingSelectContainer = rankingSelectContainer;
        this.valueSelectContainer = valueSelectContainer;

        //Init limiter
        let limiter = selectionFiltersContainer.querySelector(
          "#limitResults #numberInput"
        );
        if (!limiter) return "no limiter";
        this.limiter = limiter;

        //Search While Typing
        let searchWhileTypingContainer =
          selectionFiltersContainer.querySelector("#other #searchWhileTyping");
        if (!searchWhileTypingContainer)
          return "no search while typin container";
        let searchWhileTypingCheckbox =
          searchWhileTypingContainer.querySelector("#allowSearchWhileTyping");
        if (!searchWhileTypingCheckbox) return "no search while typin checkbox";
        searchWhileTypingCheckbox.checked = false;
        this.searchWhileTyping = false;
        searchWhileTypingCheckbox.addEventListener("change", (event) => {
          if (event.target.checked) {
            console.log("searchWhileTyping on");
            this.searchWhileTyping = true;
          } else {
            console.log("searchWhileTyping off");
            this.searchWhileTyping = false;
          }
        });

        //Result Table
        let resultTable = container.querySelector("#availablePermissionsTable");
        if (!resultTable) {
          return "No result Table found.";
        }
        this.resultTable = resultTable;
        this.resultTable.classList.add("hidden");

        let tableBody = resultTable.querySelector("tbody");
        if (!tableBody) {
          return "no table body";
        }
        this.tableBody = tableBody;
        this.clear(this.tableBody);

        //ChooseAllBtn
        this.chooseAllBtn = this.resultTable.querySelector("thead #chooseall");
        if (!this.chooseAllBtn) return "No choose all btn";
        //Make Choose All -------

        this.chooseAllBtn.addEventListener("change", (event) => {
          if (event.target.checked) {
            console.log("checked");
            this.oldCheckedArray = Utils.copyArray(this.choosenArray);
            let allCheckBtns =
              this.resultTable.querySelectorAll(".result #select");

            allCheckBtns.forEach((element) => {
              let dataValue = element
                .closest(".result")
                .getAttribute("data-value");
              element.checked = true;
              this.choosenArray = Utils.addToArray(
                this.choosenArray,
                dataValue,
                false
              );
            });
          } else {
            console.log("unchecked");
            let allCheckBtns =
              this.resultTable.querySelectorAll(".result #select");

            allCheckBtns.forEach((element) => {
              let dataValue = element
                .closest(".result")
                .getAttribute("data-value");

              if (this.oldCheckedArray.includes(dataValue)) {
                element.checked = true;
                this.choosenArray = Utils.addToArray(
                  this.choosenArray,
                  dataValue,
                  false
                );
              } else {
                element.checked = false;
                this.choosenArray = Utils.removeFromArray(
                  this.choosenArray,
                  dataValue
                );
              }
            });
          }
        });

        //Result Desription
        let resultDescriptionContainer =
          this.container.querySelector(".resultDesciption");
        if (!resultDescriptionContainer) {
          return "no discription container";
        }
        this.resultDescriptionContainer = resultDescriptionContainer;

        searchBtn.addEventListener("click", () => {
          this.search(this.arraySearch);
        });

        //Add that user can select type of filter and set normally to username
        this.chooseFilterTypeSelect.addEventListener("change", () => {
          let value =
            this.chooseFilterTypeSelect[
              chooseFilterTypeSelect.selectedIndex
            ].getAttribute("data-value");
          console.log(value);
          this.setFilterMode(value);
        });
        //First shown mode automatically
        this.setFilterMode("all");
        this.search();
      }

      setFilterMode(value) {
        if (!value) return false;
        this.filterType = value;
        //Hide All and clear
        this.nameSelectContainer.classList.add("hidden");
        this.descriptionSelectContainer.classList.add("hidden");
        this.rankingSelectContainer.classList.add("hidden");
        this.valueSelectContainer.classList.add("hidden");

        if (value === "name") {
          this.enableFilter(this.nameSelectContainer);
        } else if (value === "description") {
          this.enableFilter(this.descriptionSelectContainer);
        } else if (value === "ranking") {
          this.enableFilter(this.rankingSelectContainer);
        } else if (value === "value") {
          this.enableFilter(this.valueSelectContainer);
        } else if (value == "all") {
          //Nothing to show
        }
      }

      listenToChanges(element, type) {
        if (!element || typeof element != "object") return false;

        let handleEvent = () => {
          let value = element.value;
          if (value.replace(/\s+/g, "") == "") {
            return false;
          }

          if (this.searchWhileTyping) {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
              this.search();
            }, 650);
          }
        };
        let timeout;
        element.removeEventListener(type, handleEvent);
        element.addEventListener(type, handleEvent);
      }

      async enableFilter(filter) {
        if (!filter) return false;

        if (filter === this.nameSelectContainer) {
          //name
          let textInput = this.nameSelectContainer.querySelector("#textInput");
          this.listenToChanges(textInput, "input");
          this.nameSelectContainer.classList.remove("hidden");
        } else if (filter === this.descriptionSelectContainer) {
          //description
          let textInput =
            this.descriptionSelectContainer.querySelector("#textInput");
          this.listenToChanges(textInput, "input");
          this.descriptionSelectContainer.classList.remove("hidden");
        } else if (filter === this.rankingSelectContainer) {
          //ranking
          let textInput =
            this.rankingSelectContainer.querySelector("#textInput");
          this.listenToChanges(textInput, "input");
          this.rankingSelectContainer.classList.remove("hidden");
        } else if (filter === this.valueSelectContainer) {
          //value
          let textInput = this.valueSelectContainer.querySelector("#textInput");
          this.listenToChanges(textInput, "input");
          this.valueSelectContainer.classList.remove("hidden");
        } else {
          return false;
        }
      }

      async search() {
        console.log("Search...");
        //Utils.toggleLodingAnimation(this.container)
        this.searchBtn.classList.add("loading");

        if (this.filterType === "name") {
          let input =
            this.nameSelectContainer.querySelector("#textInput").value;

          let res = await Utils.makeJSON(
            Utils.sendXhrREQUEST(
              "POST",
              "GETaddPermission&filter=name&name=" +
                input +
                "&limitResults=" +
                this.limiter.value,
              "./includes/benutzerverwaltung.inc.php",
              "application/x-www-form-urlencoded",
              true,
              true,
              false,
              true
            )
          );
          this.showResults(res);
        } else if (this.filterType === "description") {
          let input =
            this.descriptionSelectContainer.querySelector("#textInput").value;
          let res = await Utils.makeJSON(
            await Utils.sendXhrREQUEST(
              "POST",
              "GETaddPermission&filter=description&input=" +
                input +
                "&limitResults=" +
                this.limiter.value,
              "./includes/benutzerverwaltung.inc.php",
              "application/x-www-form-urlencoded",
              true,
              true,
              false,
              true
            )
          );
          this.showResults(res);
        } else if (this.filterType === "ranking") {
          let input =
            this.rankingSelectContainer.querySelector("#numberInput").value;

          let res = Utils.makeJSON(
            await Utils.sendXhrREQUEST(
              "POST",
              "GETaddPermission&filter=ranking&input=" +
                input +
                "&limitResults=" +
                this.limiter.value,
              "./includes/benutzerverwaltung.inc.php",
              "application/x-www-form-urlencoded",
              true,
              true,
              false,
              true
            )
          );
          this.showResults(res);
        } else if (this.filterType === "value") {
          let input =
            this.valueSelectContainer.querySelector("#textInput").value;

          let res = await Utils.makeJSON(
            await Utils.sendXhrREQUEST(
              "POST",
              "GETaddPermission&filter=value&input=" +
                input +
                "&limitResults=" +
                this.limiter.value,
              "./includes/benutzerverwaltung.inc.php",
              "application/x-www-form-urlencoded",
              true,
              true,
              false,
              true
            )
          );
          this.showResults(res);
          console.log(res);
        } else if (this.filterType === "all") {
          let res = await Utils.makeJSON(
            Utils.sendXhrREQUEST(
              "POST",
              "GETaddPermission&filter=noFilter&limitResults=" +
                this.limiter.value +
                "&sendUserID=" +
                this.userID,
              "./includes/benutzerverwaltung.inc.php",
              "application/x-www-form-urlencoded",
              true,
              true,
              false,
              true
            )
          );
          this.showResults(res);
        } else {
          console.log("no input method");
          return false;
        }
      }

      clear(element) {
        element.innerHTML = "";
      }

      async showResults(results) {
        this.searchBtn.classList.remove("loading");
        this.clear(this.tableBody);
        this.resultDescriptionContainer.classList.remove("hidden");
        if (!results) {
          this.resultDescriptionContainer.innerHTML = "Keine Ergebnisse...";
          return true;
        }
        results = Utils.makeJSON(results);

        if (!results.length > 0) {
          this.resultDescriptionContainer.innerHTML = "Keine Ergebnisse...";
          return false;
        }
        results.forEach((result) => {
          if (!this.dontShowArray.includes(result["name"])) {
            //console.log(user);
            let tableRow = document.createElement("tr");
            tableRow.classList.add("result");
            tableRow.setAttribute("data-value", result["name"]);

            tableRow.innerHTML = `
            <td class="select"><input type="checkbox" id="select"><button id="chooseOnly"><img
            src="../../images/icons/zahnrad.svg" alt="Auswahl"></button></td>
            <td id="name">${result["name"]}</td>
            <td id="description">${result["description"]}</td>
            <td id="normalValue">${result["normalValue"]}</td>
            <td id="ranking">${result["ranking"]}</td>
            <td id="hinweis">${result["hinweis"]}</td>
            `;
            this.tableBody.append(tableRow);

            let checkBox = tableRow.querySelector(".select #select");
            if (!checkBox) return false;
            checkBox.addEventListener("change", (event) => {
              if (event.target.checked) {
                this.choosenArray = Utils.addToArray(
                  this.choosenArray,
                  result["name"],
                  false
                );
              } else {
                this.choosenArray = Utils.removeFromArray(
                  this.choosenArray,
                  result["name"]
                );
              }
            });

            let chooseThis = tableRow.querySelector(".select #chooseOnly");
            if (!chooseThis) return false;

            chooseThis.addEventListener("click", (event) => {
              let name = event.target
                .closest(".result")
                .getAttribute("data-value");
              if (!name) return;
              this.choosenArray = Utils.addToArray(
                this.choosenArray,
                result["name"],
                false
              );
              goBackWithValue();
            });
          }
        });

        this.resultTable.classList.remove("hidden");
      }

      returnResultArray() {
        return this.choosenArray;
      }
    }

    let outerContainer = modal.querySelector("#programContainer");
    let container = outerContainer.querySelector(
      "#availablePermissionsContainer"
    );
    console.log(container);

    let addPermissionsVerwaltung = new AddPermissionsVerwaltung(container);

    if (hidePermissions.length > 0) {
      addPermissionsVerwaltung.dontShowArray = hidePermissions;
      console.log("To hide", hidePermissions);
    } else {
      addPermissionsVerwaltung.dontShowArray = new Array();
    }
    let res = await addPermissionsVerwaltung.prepareSearch();

    let close = modal.querySelector("#close");
    let yes = modal.querySelector("#yes");
    let no = modal.querySelector("#no");

    yes.addEventListener("click", (target) => {
      goBackWithValue();
    });

    function goBackWithValue() {
      let array = addPermissionsVerwaltung.returnResultArray();
      myModal.hide();
      modalOuter.remove();
      Utils.hideAllModals(false);
      resolve(array);
    }

    no.addEventListener("click", (target) => {
      myModal.hide();
      modalOuter.remove();
      Utils.hideAllModals(false);
      resolve(false);
    });

    close.addEventListener("click", (target) => {
      myModal.hide();
      modalOuter.remove();
      Utils.hideAllModals(false);
      resolve(false);
    });
  });
}

export async function changePermissions(group) {
  return new Promise(async function (resolve, reject) {
    let modalContainer = document.querySelector("#modalContainer");

    if (modalContainer == null) {
      modalContainer = document.createElement("div");
      modalContainer.setAttribute("id", "modalContainer");
      document.body.appendChild(modalContainer);
    }

    if (document.querySelector("#modalContainer") == null) {
      alert("no modal container found");
      reject();
    }
    let number = 1;
    let modals = modalContainer.querySelectorAll(".modal");
    console.log(modals);
    if (modals.length > 0) {
      number = modals.length + 1;
    }
    console.log("Number of Modals", number);

    let modalOuter = document.createElement("div");
    modalOuter.classList.add("modal-div");
    modalOuter.setAttribute("id", number);
    modalContainer.appendChild(modalOuter);

    let modalHTML = `
    <!-- Modal -->
    <div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="true" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
    <div class="modal-dialog modal-fullscreen">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="staticBackdropLabel">Berechtigungen ändern</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" id="close"></button>
        </div>
        <div class="modal-body">
         
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-danger" id="no">Nein</button>
          <button type="button" class="btn btn-success" id="yes">Ja</button>
        </div>
      </div>
    </div>
    </div>
                 `;

    modalOuter.innerHTML = modalHTML;
    let modal = modalOuter.querySelector(".modal");
    let modalBody = modal.querySelector(".modal-body");

    modalBody.innerHTML = `
    <div id="programContainer">
        <div id="currentUsersPermissions">
            <div class="set">
            <h3>Akutelle Berechtigungen</h3>
            <button class="btn btn-secondary" id="addPermissionsBtn">Hinzufügen</button>
            <button class="btn btn-secondary" id="filterToggle">Filtern</button>
            <button class="btn btn-secondary" id="edit">Bearbeiten</button>
            <div class="filter hidden">
                <div id="chooseFilterTypeContainer">
                    <label for="chooseFilter" class="form-label">Filtern nach</label>
                    <select id="chooseFilter" class="form-select">
                        <option data-value="" selected="selected">Auswahl</option>
                        <option data-value="name">Name</option>
                        <option data-value="description">Beschreibung</option>
                        <option data-value="ranking">Rang</option>
                        <option data-value="value">Wert</option>
                        <option data-value="all">Alle anzeigen</option>
                    </select>
                </div>
                <div class="selectionFilters">
                    <div id="other">
                        <div id="searchWhileTyping">
                            <label for="allowSearchWhileTyping">Während des Tippens suchen</label>
                            <input type="checkbox" id="allowSearchWhileTyping">
                        </div>
                    </div>
                    <div class="mt-2" id="name">
                        <label for="textInput" class="form-label">Filtern nach Name</label>
                        <input type="text" id="textInput" class="form-control" placeholder="z.B. accessLeherpanel"
                            autocomplete="off">
                    </div>
                    <div class="mt-2" id="description">
                        <label for="textInput" class="form-label">Filtern nach Beschreibung</label>
                        <input type="text" id="textInput" class="form-control"
                            placeholder="z.B. 'Lehrerpanel zu betreten'" autocomplete="off">
                    </div>
                    <div class="mt-2" id="ranking">
                        <label for="numberInput" class="form-label">Filtern nach Rang</label>
                        <input type="number" id="numberInput" name="numberInput" min="0" max="100"
                            autocomplete="off">
                    </div>
                    <div class="mt-2" id="value">
                        <label for="textInput" class="form-label">Filtern nach Wert</label>
                        <input type="text" id="textInput" class="form-control" placeholder="z.B. 1"
                            autocomplete="off">
                    </div>
                    <div class="mt-2" id="limitResults">
                        <label for="numberInput" class="form-label">Ergebnisse Limitieren</label>
                        <input type="number" id="numberInput" name="numberInput" min="0" autocomplete="off">
                    </div>

                </div>
                <button type="button" class="btn btn-primary" id="search"
                    style="position: relative"><span>Suchen</span></button>
            </div>
            <div class="resultDesciption">

            </div>
            <table class="styled-table" id="currentUserPermissionsTable">
                <thead>
                    <tr>
                        <th id="select">
                            <div class="heading">Ausgewählt</div>
                            <hr>
                            <div><input type="checkbox" id="chooseall"> Alle auswählen</div>
                        </th>
                        <th id="name">Berechtigung</th>
                        <th id="description">Beschreibung</th>
                        <th id="value">Wert</th>
                        <td id="normalValue">Normaler Wert</td>
                        <th id="ranking">Rang</th>
                        <th id="hinweis">Hinweis</th>
                        <th id="remove">Entfernen</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="select"><input type="checkbox" id="select"><button id="chooseOnly"><img
                                    src="../../images/icons/stift.svg" alt="Auswahl"></button></td>
                        <td id="name">accessLeherpanel</td>
                        <td id="description">Wird benötigt, um das Lehrerpanel zu betreten</td>
                        <td id="value">1</td>
                        <td id="normalValue"></td>
                        <td id="ranking">3</td>
                        <td id="hinweis">1 = an | 0 = aus</td>
                        <td id="remove"><button class="delete-btn"><img src="../../images/icons/delete.svg"
                                    alt="Löschen"></button></td>
                    </tr>
                </tbody>
            </table>
            <div class="row" id="editContainer">
                <h4>Bearbeiten</h4>
                <div class="overflow-auto" id="edit">
                    <table class="table styled-table" id="editTable">
                        <thead>
                            <tr>
                                <th id="name">Name</th>
                                <th id="description">Beschreibung</th>
                                <th id="value"><span>Wert</span><button type="button" id="changeAll">alle
                                        Ändern</button></th>
                                        <th id="normalValue">Normaler Wert</th>
                                <th id="ranking">Rang</th>
                                <th id="hinweis">Hinweis</th>
                                <th id="remove"><span>Entfernen</span><button type="button" id="changeAll">alle
                                        Entfernen</button></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td id="name"></td>
                                <td id="description"></td>
                                <td id="value"><span></span><button class="changeBtn" id="change"><img
                                            src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></td>
                                <td id="normalValue"></td>
                                <td id="ranking"></td>
                                <td id="hinweis"></td>
                                <td id="remove"><button class="delete-btn"><img src="../../images/icons/delete.svg"
                                            alt="Löschen"></button></td>
                            </tr>

                        </tbody>
                    </table>
                </div>

                </div>

            </div>
            <div class="forbidden">
                <h3>Verboten</h3>
                <button class="btn btn-secondary" id="addPermissionsBtn">Hinzufügen</button>
                <button class="btn btn-secondary" id="filterToggle">Filtern</button>
                <button class="btn btn-secondary" id="edit">Bearbeiten</button>
                <div class="filter hidden">
                    <div id="chooseFilterTypeContainer">
                        <label for="chooseFilter" class="form-label">Filtern nach</label>
                        <select id="chooseFilter" class="form-select">
                            <option data-value="" selected="selected">Auswahl</option>
                            <option data-value="name">Name</option>
                            <option data-value="description">Beschreibung</option>
                            <option data-value="ranking">Rang</option>
                            <option data-value="all">Alle anzeigen</option>
                        </select>
                    </div>
                    <div class="selectionFilters">
                        <div id="other">
                            <div id="searchWhileTyping">
                                <label for="allowSearchWhileTyping">Während des Tippens suchen</label>
                                <input type="checkbox" id="allowSearchWhileTyping">
                            </div>
                        </div>
                        <div class="mt-2" id="name">
                            <label for="textInput" class="form-label">Filtern nach Name</label>
                            <input type="text" id="textInput" class="form-control" placeholder="z.B. accessLeherpanel"
                                autocomplete="off">
                        </div>
                        <div class="mt-2" id="description">
                            <label for="textInput" class="form-label">Filtern nach Beschreibung</label>
                            <input type="text" id="textInput" class="form-control"
                                placeholder="z.B. 'Lehrerpanel zu betreten'" autocomplete="off">
                        </div>
                        <div class="mt-2" id="ranking">
                            <label for="numberInput" class="form-label">Filtern nach Rang</label>
                            <input type="number" id="numberInput" name="numberInput" min="0" max="100"
                                autocomplete="off">
                        </div>
                        <div class="mt-2" id="limitResults">
                            <label for="numberInput" class="form-label">Ergebnisse Limitieren</label>
                            <input type="number" id="numberInput" name="numberInput" min="0" autocomplete="off">
                        </div>

                    </div>
                    <button type="button" class="btn btn-primary" id="search"
                        style="position: relative"><span>Suchen</span></button>
                </div>
                <div class="resultDesciption">

                </div>
                <table class="styled-table" id="currentUserForbiddenPermissionsTable">
                    <thead>
                        <tr>
                            <th id="select">
                                <div class="heading">Ausgewählt</div>
                                <hr>
                                <div><input type="checkbox" id="chooseall"> Alle auswählen</div>
                            </th>
                            <th id="name">Berechtigung</th>
                            <th id="description">Beschreibung</th>
                            <th id="ranking">Rang</th>
                            <th id="hinweis">Hinweis</th>
                            <th id="remove">Entfernen</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="select"><input type="checkbox" id="select"><button id="chooseOnly"><img
                                        src="../../images/icons/stift.svg" alt="Auswahl"></button></td>
                            <td id="name">accessLeherpanel</td>
                            <td id="description">Wird benötigt, um das Lehrerpanel zu betreten</td>
                            <td id="ranking">3</td>
                            <td id="hinweis">1 = an | 0 = aus</td>
                            <td id="remove"><button class="delete-btn"><img src="../../images/icons/delete.svg"
                                        alt="Löschen"></button></td>
                        </tr>
                    </tbody>
                </table>
                <div class="row" id="editContainer">
                    <h4>Bearbeiten</h4>
                    <div class="overflow-auto" id="edit">
                        <table class="table styled-table" id="editTable">
                            <thead>
                                <tr>
                                    <th id="name">Name</th>
                                    <th id="description">Beschreibung</th>
                                            <td id="normalValue">Normaler Wert</td>
                                    <th id="ranking">Rang</th>
                                    <th id="hinweis">Hinweis</th>
                                    <th id="remove"><span>Entfernen</span><button type="button" id="changeAll">alle
                                            Entfernen</button></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td id="name"></td>
                                    <td id="description"></td>
                                    <td id="normalValue"></td>
                                    <td id="ranking"></td>
                                    <td id="hinweis"></td>
                                    <td id="remove"><button class="delete-btn"><img src="../../images/icons/delete.svg"
                                                alt="Löschen"></button></td>
                                </tr>

                            </tbody>
                        </table>
                    </div>

                </div>
            </div>
        </div>

    </div>
    `;

    var myModal = new bootstrap.Modal(modal);
    myModal.show();

    class CurrentPermissionsVerwaltung {
      constructor(container) {
        this.group = null;
        this.container = container;
        this.searchBtn = null;
        this.chooseFilterTypeSelect = null;
        this.filterContainer = null;
        this.selectionFiltersContainer = null;
        this.limiter = null;

        //Filters
        this.filterType = null;
        this.nameSelectContainer = null;
        this.descriptionSelectContainer = null;
        this.rankingSelectContainer = null;
        this.valueSelectContainer = null;
        this.limiter = null;

        //others
        this.searchWhileTyping = false;
        this.editBtn = null;

        // this.groupsSearchArray = new Array();
        // this.permissionsSearchArray = new Object();
        // this.klassenstufenSearchArray = new Array();
        this.choosenArray = new Array();
        this.oldCheckedArray = new Array();

        this.resultTable = null;
        // this.chooseAllBtn = null;
        this.tableBody = null;
        this.resultDescriptionContainer = null;
        // this.resultsDescription = null;
        // this.resultsFound = null;

        // //Edit

        this.editContainer = null;
        this.editTable = null;
        this.editTableBody = null;
      }

      prepareEdit() {
        if (!this.editContainer) return false;
        this.editContainer.classList.add("hidden");
        this.clear(this.editTableBody);

        //Change All
        let thead = this.editTable.querySelector("thead");
        let changeAllValues = thead.querySelector("#value #changeAll");
        let removeAllBtn = thead.querySelector("#remove #changeAll");

        changeAllValues.addEventListener("click", async () => {
          //Change All Values
          let value = await Utils.getUserInput(
            "Eingabe",
            `Welchen Wert für alle ausgewählten Berechtigungen (${this.choosenArray.length})?`,
            false
          );
          if (!Utils.isEmptyInput(value, true)) {
            for (const current of this.choosenArray) {
              await Utils.makeJSON(
                await Utils.sendXhrREQUEST(
                  "POST",
                  "gruppenverwaltung&operation=changePermissions&type=allowedPermissions&secondOperation=changeValueFromPermission&id=" +
                    this.group +
                    "&permissionName=" +
                    current +
                    "&value=" +
                    value,
                  "./includes/berechtigungsverwaltung.inc.php",
                  "application/x-www-form-urlencoded",
                  true,
                  false,
                  false,
                  false,
                  false
                )
              );
            }
          }

          this.edit(this.choosenArray);
        });

        removeAllBtn.addEventListener("click", async () => {
          //Change All authenticated
          let value = await Utils.askUser(
            "Nachricht",
            `Willst du wirklich alle ausgewählten Berechtigungen (${this.choosenArray.length}) von der Gruppe ${this.group} entfernen?`,
            false
          );
          if (value) {
            for (const currentPermission of this.choosenArray) {
              await Utils.makeJSON(
                await Utils.sendXhrREQUEST(
                  "POST",
                  "gruppenverwaltung&operation=changePermissions&type=allowedPermissions&secondOperation=removePermission&id=" +
                    this.group +
                    "&permissionName=" +
                    currentPermission,
                  "./includes/berechtigungsverwaltung.inc.php",
                  "application/x-www-form-urlencoded",
                  true,
                  false,
                  false,
                  true,
                  false
                )
              );
            }
          }
          this.choosenArray = new Array();
          console.log(this.choosenArray);
          this.edit(this.choosenArray);
        });
      }

      async prepareSearch(group) {
        if (!group) return "No group";
        this.group = group;
        //StartBtn
        let searchBtn = this.container.querySelector(".filter #search");
        //if (!searchBtn) return false;
        this.searchBtn = searchBtn;

        //Edit Table
        let editContainer = this.container.querySelector("#editContainer");
        if (!editContainer) return "No edit container";
        this.editContainer = editContainer;
        let editTable = editContainer.querySelector("#editTable");
        if (!editTable) return "No edit table";
        this.editTable = editTable;
        let editTableBody = editTable.querySelector("tbody");
        if (!editTableBody) return "No edit table body";
        this.editTableBody = editTableBody;

        //Filter Container (init)
        let filterContainer = this.container.querySelector(".filter");
        if (!filterContainer) return "No filter container";
        this.filterContainer = filterContainer;
        filterContainer.classList.add("hidden"); //Hide it if it loads

        //Filter Type Select (init)
        let chooseFilterTypeSelect = filterContainer.querySelector(
          "#chooseFilterTypeContainer #chooseFilter"
        );
        if (!chooseFilterTypeSelect) return false;
        this.chooseFilterTypeSelect = chooseFilterTypeSelect;

        //Toggle Search (init)
        let toggleSearchBtn = this.container.querySelector("#filterToggle");
        //if (!toggleSearchBtn) return false;
        toggleSearchBtn.addEventListener("click", () => {
          filterContainer.classList.toggle("hidden");
        });

        //Selection Filters (init) - Enable or disable filter
        console.log(this.filterContainer);
        let selectionFiltersContainer =
          this.filterContainer.querySelector(".selectionFilters");
        if (!selectionFiltersContainer) return "no selection filters container";
        this.selectionFiltersContainer = selectionFiltersContainer;

        //Initialize filters
        let nameSelectContainer =
          selectionFiltersContainer.querySelector("#name");
        let descriptionSelectContainer =
          selectionFiltersContainer.querySelector("#description");
        let rankingSelectContainer =
          selectionFiltersContainer.querySelector("#ranking");
        let valueSelectContainer =
          selectionFiltersContainer.querySelector("#value");
        if (
          !nameSelectContainer ||
          !descriptionSelectContainer ||
          !rankingSelectContainer ||
          !valueSelectContainer
        )
          return "Error in initializing Filters";
        this.nameSelectContainer = nameSelectContainer;
        this.descriptionSelectContainer = descriptionSelectContainer;
        this.rankingSelectContainer = rankingSelectContainer;
        this.valueSelectContainer = valueSelectContainer;

        //Init limiter
        let limiter = selectionFiltersContainer.querySelector(
          "#limitResults #numberInput"
        );
        if (!limiter) return "no limiter";
        this.limiter = limiter;

        //Search While Typing
        let searchWhileTypingContainer =
          selectionFiltersContainer.querySelector("#other #searchWhileTyping");
        if (!searchWhileTypingContainer)
          return "no search while typin container";
        let searchWhileTypingCheckbox =
          searchWhileTypingContainer.querySelector("#allowSearchWhileTyping");
        if (!searchWhileTypingCheckbox) return "no search while typin checkbox";
        searchWhileTypingCheckbox.checked = false;
        this.searchWhileTyping = false;
        searchWhileTypingCheckbox.addEventListener("change", (event) => {
          if (event.target.checked) {
            console.log("searchWhileTyping on");
            this.searchWhileTyping = true;
          } else {
            console.log("searchWhileTyping off");
            this.searchWhileTyping = false;
          }
        });

        //Result Table
        let resultTable = container.querySelector(
          "#currentUserPermissionsTable"
        );
        if (!resultTable) {
          return "No result Table found.";
        }
        this.resultTable = resultTable;
        this.resultTable.classList.add("hidden");

        let tableBody = resultTable.querySelector("tbody");
        if (!tableBody) {
          return "no table body";
        }
        this.tableBody = tableBody;
        this.clear(this.tableBody);

        //ChooseAllBtn
        this.chooseAllBtn = this.resultTable.querySelector("thead #chooseall");
        if (!this.chooseAllBtn) return false;
        //Make Choose All -------

        let editBtn = this.container.querySelector("#edit");
        if (!editBtn) return false;
        this.editBtn = editBtn;
        editBtn.addEventListener("click", () => {
          this.edit(this.choosenArray);
        });

        let chooseAllBtn = this.resultTable.querySelector("thead #chooseall");
        if (!chooseAllBtn) return false;
        chooseAllBtn.addEventListener("change", (event) => {
          if (event.target.checked) {
            console.log("checked");
            this.oldCheckedArray = Utils.copyArray(this.choosenArray);
            let allCheckBtns =
              this.resultTable.querySelectorAll(".result #select");

            allCheckBtns.forEach((element) => {
              let dataValue = element
                .closest(".result")
                .getAttribute("data-value");
              element.checked = true;
              this.choosenArray = Utils.addToArray(
                this.choosenArray,
                dataValue,
                false
              );
            });
          } else {
            console.log("unchecked");
            let allCheckBtns =
              this.resultTable.querySelectorAll(".result #select");

            allCheckBtns.forEach((element) => {
              let dataValue = element
                .closest(".result")
                .getAttribute("data-value");

              if (this.oldCheckedArray.includes(dataValue)) {
                element.checked = true;
                this.choosenArray = Utils.addToArray(
                  this.choosenArray,
                  dataValue,
                  false
                );
              } else {
                element.checked = false;
                this.choosenArray = Utils.removeFromArray(
                  this.choosenArray,
                  dataValue
                );
              }
            });
          }
          this.updateEditBtn();
        });

        //Result Desription
        let resultDescriptionContainer =
          this.container.querySelector(".resultDesciption");
        if (!resultDescriptionContainer) {
          return "no discription container";
        }
        this.resultDescriptionContainer = resultDescriptionContainer;

        searchBtn.addEventListener("click", () => {
          this.search(this.arraySearch);
        });

        //Add that user can select type of filter and set normally to username
        this.chooseFilterTypeSelect.addEventListener("change", () => {
          let value =
            this.chooseFilterTypeSelect[
              chooseFilterTypeSelect.selectedIndex
            ].getAttribute("data-value");
          console.log(value);
          this.setFilterMode(value);
        });
        //First shown mode automatically
        this.setFilterMode("all");
        this.search();

        //AddPermissions
        let addPermissionsBtn =
          this.container.querySelector("#addPermissionsBtn");
        if (!addPermissionsBtn) {
          return "no addPermissionsBtn";
        }
        addPermissionsBtn.addEventListener("click", async () => {
          let allowedPermissionGroupHas = await Utils.makeJSON(
            await Utils.sendXhrREQUEST(
              "POST",
              "gruppenverwaltung&operation=changePermissions&type=allowedPermissions&secondOperation=getAllAllowedPermissionNamesGroupHas&id=" +
                this.group,
              "./includes/berechtigungsverwaltung.inc.php",
              "application/x-www-form-urlencoded",
              true,
              true,
              false,
              true
            )
          );
          let addPermissionsArray = await addPermission(
            allowedPermissionGroupHas
          );
          console.log(allowedPermissionGroupHas);

          if (addPermissionsArray && addPermissionsArray.length > 0) {
            let type = await Utils.askUser(
              "Nachricht",
              "Wert für alle setzen?",
              false
            );
            if (type) {
              let value = await Utils.getUserInput(
                "Nachricht",
                `Welchen Wert sollen alle Berechtigungen haben?`,
                false
              );
              for (const element of addPermissionsArray) {
                let res = await Utils.makeJSON(
                  await Utils.sendXhrREQUEST(
                    "POST",
                    "gruppenverwaltung&operation=changePermissions&type=allowedPermissions&secondOperation=addPermission&id=" +
                      this.group +
                      "&permissionName=" +
                      element +
                      "&value=" +
                      value,
                    "./includes/berechtigungsverwaltung.inc.php",
                    "application/x-www-form-urlencoded",
                    true,
                    false,
                    false,
                    true
                  )
                );
                if (res["status"] == "success") {
                  this.choosenArray = Utils.addToArray(
                    this.choosenArray,
                    element,
                    false
                  );
                  this.choosenArray = Utils.addToArray(
                    this.choosenArray,
                    element,
                    false
                  );
                }
              }
            } else {
              for (const element of addPermissionsArray) {
                let value = await Utils.getUserInput(
                  "Nachricht",
                  `Welchen Wert soll die Berechtigung ${element} haben?`,
                  false
                );
                let res = await Utils.makeJSON(
                  await Utils.sendXhrREQUEST(
                    "POST",
                    "gruppenverwaltung&operation=changePermissions&type=allowedPermissions&secondOperation=addPermission&id=" +
                      this.group +
                      "&permissionName=" +
                      element +
                      "&value=" +
                      value,
                    "./includes/berechtigungsverwaltung.inc.php",
                    "application/x-www-form-urlencoded",
                    true,
                    true,
                    false,
                    true
                  )
                );
                if (res["status"] == "success") {
                  this.choosenArray = Utils.addToArray(
                    this.choosenArray,
                    element,
                    false
                  );
                  this.choosenArray = Utils.addToArray(
                    this.choosenArray,
                    element,
                    false
                  );
                }
              }
            }
          }
          this.edit(this.choosenArray);
        });
      }

      setFilterMode(value) {
        if (!value) return false;
        this.filterType = value;
        //Hide All and clear
        this.nameSelectContainer.classList.add("hidden");
        this.descriptionSelectContainer.classList.add("hidden");
        this.rankingSelectContainer.classList.add("hidden");
        this.valueSelectContainer.classList.add("hidden");

        if (value === "name") {
          this.enableFilter(this.nameSelectContainer);
        } else if (value === "description") {
          this.enableFilter(this.descriptionSelectContainer);
        } else if (value === "ranking") {
          this.enableFilter(this.rankingSelectContainer);
        } else if (value === "value") {
          this.enableFilter(this.valueSelectContainer);
        } else if (value == "all") {
          //Nothing to show
        }
      }

      listenToChanges(element, type) {
        if (!element || typeof element != "object") return false;

        let handleEvent = () => {
          let value = element.value;
          if (value.replace(/\s+/g, "") == "") {
            return false;
          }

          if (this.searchWhileTyping) {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
              this.search();
            }, 650);
          }
        };
        let timeout;
        element.removeEventListener(type, handleEvent);
        element.addEventListener(type, handleEvent);
      }

      async enableFilter(filter) {
        if (!filter) return false;

        if (filter === this.nameSelectContainer) {
          //name
          let textInput = this.nameSelectContainer.querySelector("#textInput");
          this.listenToChanges(textInput, "input");
          this.nameSelectContainer.classList.remove("hidden");
        } else if (filter === this.descriptionSelectContainer) {
          //description
          let textInput =
            this.descriptionSelectContainer.querySelector("#textInput");
          this.listenToChanges(textInput, "input");
          this.descriptionSelectContainer.classList.remove("hidden");
        } else if (filter === this.rankingSelectContainer) {
          //ranking
          let textInput =
            this.rankingSelectContainer.querySelector("#textInput");
          this.listenToChanges(textInput, "input");
          this.rankingSelectContainer.classList.remove("hidden");
        } else if (filter === this.valueSelectContainer) {
          //value
          let textInput = this.valueSelectContainer.querySelector("#textInput");
          this.listenToChanges(textInput, "input");
          this.valueSelectContainer.classList.remove("hidden");
        } else {
          return false;
        }
      }

      async search() {
        console.log("Search...");
        //Utils.toggleLodingAnimation(this.container)
        this.searchBtn.classList.add("loading");
        this.choosenArray = new Array();

        if (this.filterType === "name") {
          let input =
            this.nameSelectContainer.querySelector("#textInput").value;
          this.showResults(
            await Utils.makeJSON(
              await Utils.sendXhrREQUEST(
                "POST",
                "gruppenverwaltung&operation=changePermissions&type=allowedPermissions&secondOperation=search&searchBy=name&id=" +
                  this.group +
                  "&input=" +
                  input,
                "./includes/berechtigungsverwaltung.inc.php",
                "application/x-www-form-urlencoded",
                true,
                true,
                false,
                true
              )
            )
          );
        } else if (this.filterType === "description") {
          let input =
            this.descriptionSelectContainer.querySelector("#textInput").value;
          this.showResults(
            await Utils.makeJSON(
              await Utils.sendXhrREQUEST(
                "POST",
                "gruppenverwaltung&operation=changePermissions&type=allowedPermissions&secondOperation=search&searchBy=description&id=" +
                  this.group +
                  "&input=" +
                  input,
                "./includes/berechtigungsverwaltung.inc.php",
                "application/x-www-form-urlencoded",
                true,
                true,
                false,
                true
              )
            )
          );
        } else if (this.filterType === "ranking") {
          let input =
            this.rankingSelectContainer.querySelector("#numberInput").value;
          this.showResults(
            await Utils.makeJSON(
              await Utils.sendXhrREQUEST(
                "POST",
                "gruppenverwaltung&operation=changePermissions&type=allowedPermissions&secondOperation=search&searchBy=name&id=" +
                  this.group +
                  "&input=" +
                  input,
                "./includes/berechtigungsverwaltung.inc.php",
                "application/x-www-form-urlencoded",
                true,
                true,
                false,
                true
              )
            )
          );
        } else if (this.filterType === "value") {
          let input =
            this.valueSelectContainer.querySelector("#textInput").value;
          this.showResults(
            await Utils.makeJSON(
              await Utils.sendXhrREQUEST(
                "POST",
                "gruppenverwaltung&operation=changePermissions&type=allowedPermissions&secondOperation=search&searchBy=value&id=" +
                  this.group +
                  "&input=" +
                  input,
                "./includes/berechtigungsverwaltung.inc.php",
                "application/x-www-form-urlencoded",
                true,
                true,
                false,
                true
              )
            )
          );
        } else if (this.filterType === "all") {
          this.showResults(
            await Utils.makeJSON(
              await Utils.sendXhrREQUEST(
                "POST",
                "gruppenverwaltung&operation=changePermissions&type=allowedPermissions&secondOperation=search&searchBy=all&id=" +
                  this.group,
                "./includes/berechtigungsverwaltung.inc.php",
                "application/x-www-form-urlencoded",
                true,
                true,
                false,
                true
              )
            )
          );
        } else {
          console.log("no input method");
          return false;
        }
      }

      clear(element) {
        element.innerHTML = "";
      }

      updateEditBtn() {
        if (this.choosenArray.length > 0) {
          this.editBtn.disabled = false;
        } else {
          this.editBtn.disabled = true;
        }
      }

      async showResults(results) {
        this.searchBtn.classList.remove("loading");
        this.clear(this.tableBody);
        this.updateEditBtn();
        this.resultDescriptionContainer.classList.remove("hidden");
        if (!results) {
          this.resultTable.classList.add("hidden");
          this.resultDescriptionContainer.innerHTML = "Keine Ergebnisse...";
          return true;
        }
        results = Utils.makeJSON(results);

        if (!results.length > 0) {
          this.resultTable.classList.add("hidden");
          this.resultDescriptionContainer.innerHTML = "Keine Ergebnisse...";
          return false;
        }

        results.forEach((result) => {
          //console.log(user);
          let tableRow = document.createElement("tr");
          tableRow.classList.add("result");
          tableRow.setAttribute("data-value", result["name"]);

          tableRow.innerHTML = `
          <td class="select"><input type="checkbox" id="select"><button id="chooseOnly"><img
          src="../../images/icons/stift.svg" alt="Auswahl"></button></td>
          <td id="name">${result["name"]}</td>
          <td id="description">${result["description"]}</td>
          <td id="value">${result["value"]}</td>
          <td id="normalValue">${result["normalValue"]}</td>
          <td id="ranking">${result["ranking"]}</td>
          <td id="hinweis">${result["hinweis"]}</td>
          <td id="remove"><button class="delete-btn"><img src="../../images/icons/delete.svg"
          alt="Löschen"></button></td>
          `;
          this.tableBody.append(tableRow);

          let checkBox = tableRow.querySelector(".select #select");
          if (!checkBox) return false;
          checkBox.addEventListener("change", (event) => {
            if (event.target.checked) {
              this.choosenArray = Utils.addToArray(
                this.choosenArray,
                result["name"],
                false
              );
            } else {
              this.choosenArray = Utils.removeFromArray(
                this.choosenArray,
                result["name"]
              );
            }
            this.updateEditBtn();
          });

          let chooseThis = tableRow.querySelector(".select #chooseOnly");
          if (!chooseThis) return false;

          chooseThis.addEventListener("click", (event) => {
            let name = event.target
              .closest(".result")
              .getAttribute("data-value");
            if (!name) return;
            this.choosenArray = Utils.addToArray(
              this.choosenArray,
              result["name"],
              false
            );
            this.edit(this.choosenArray);
          });

          let removeBtn = tableRow.querySelector("#remove .delete-btn");
          removeBtn.addEventListener("click", async () => {
            let value = await Utils.askUser(
              "Nachricht",
              `Willst du wirklich die Berechtigung <b>${result["name"]}</b> von der Gruppe entfernen?`,
              false
            );
            if (value) {
              await Utils.makeJSON(
                await Utils.sendXhrREQUEST(
                  "POST",
                  "gruppenverwaltung&operation=changePermissions&type=allowedPermissions&secondOperation=removePermission&id=" +
                    this.group +
                    "&permissionName=" +
                    result["name"],
                  "./includes/berechtigungsverwaltung.inc.php",
                  "application/x-www-form-urlencoded",
                  true,
                  true,
                  false,
                  true
                )
              );
            }
            this.search();
          });
        });

        this.resultTable.classList.remove("hidden");
      }

      async edit(choosen) {
        if (!choosen || !choosen.length > 0) {
          this.editContainer.classList.add("hidden");
          this.clear(this.editTableBody);
          return false;
        }
        console.log("Edit:", choosen);

        this.resultTable.classList.add("hidden");
        this.clear(this.tableBody);

        this.clear(this.editTableBody);

        for (let current of choosen) {
          //Get Data
          current = await Utils.makeJSON(
            await Utils.sendXhrREQUEST(
              "POST",
              "gruppenverwaltung&operation=changePermissions&type=allowedPermissions&secondOperation=getFullInformationForEdit&id=" +
                this.group +
                "&permissionName=" +
                current,
              "./includes/berechtigungsverwaltung.inc.php",
              "application/x-www-form-urlencoded",
              true,
              true,
              false,
              true
            )
          );
          if (!current) {
            continue;
          }

          console.log(current);

          if (current["name"]) {
            let tableRow = document.createElement("tr");
            tableRow.classList.add("result");
            tableRow.setAttribute("data-value", current["name"]);

            tableRow.innerHTML = `
            <td id="name">${current["name"]}</td>
            <td id="description">${current["description"]}</td>
            <td id="value"><span>${current["value"]}</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></td>
            <td id="normalValue">${current["normalValue"]}</td>
            <td id="ranking">${current["ranking"]}</td>
            <td id="hinweis">${current["hinweis"]}</td>
            <td id="remove"><button class="delete-btn"><img src="../../images/icons/delete.svg" alt="Löschen"></button></td>
            `;
            this.editTableBody.appendChild(tableRow);

            let changeValueBtn = tableRow.querySelector("#value #change");

            changeValueBtn.addEventListener("click", async () => {
              let value = await Utils.getUserInput(
                "Eingabe",
                "Welchen Wert?",
                false
              );
              if (!Utils.isEmptyInput(value, true)) {
                await Utils.makeJSON(
                  await Utils.sendXhrREQUEST(
                    "POST",
                    "gruppenverwaltung&operation=changePermissions&type=allowedPermissions&secondOperation=changeValueFromPermission&id=" +
                      this.group +
                      "&permissionName=" +
                      current["name"] +
                      "&value=" +
                      value,
                    "./includes/berechtigungsverwaltung.inc.php",
                    "application/x-www-form-urlencoded",
                    true,
                    true,
                    false,
                    true
                  )
                );
              }

              this.edit(this.choosenArray);
            });
            let removeBtn = tableRow.querySelector("#remove .delete-btn");
            removeBtn.addEventListener("click", async () => {
              let value = await Utils.askUser(
                "Nachricht",
                `Willst du wirklich die Berechtigung <b>${current["name"]}</b> von der Gruppe entfernen?`,
                false
              );
              if (value) {
                let res = await Utils.makeJSON(
                  await Utils.sendXhrREQUEST(
                    "POST",
                    "gruppenverwaltung&operation=changePermissions&type=allowedPermissions&secondOperation=removePermission&id=" +
                      this.group +
                      "&permissionName=" +
                      current["name"],
                    "./includes/berechtigungsverwaltung.inc.php",
                    "application/x-www-form-urlencoded",
                    true,
                    true,
                    false,
                    true
                  )
                );
                if (res["status"] == "success") {
                  this.choosenArray = Utils.removeFromArray(
                    this.choosenArray,
                    current["name"]
                  );
                }
              }
              this.edit(this.choosenArray);
            });
            this.editContainer.classList.remove("hidden");
            this.editTable.classList.remove("hidden");
          }
        }
        this.editContainer.classList.remove("hidden");
        this.editTable.classList.remove("hidden");
      }
    }

    class ForbiddenPermissionsVerwaltung {
      constructor(container) {
        this.group = null;
        this.container = container;
        this.searchBtn = null;
        this.chooseFilterTypeSelect = null;
        this.filterContainer = null;
        this.selectionFiltersContainer = null;
        this.limiter = null;

        //Filters
        this.filterType = null;
        this.nameSelectContainer = null;
        this.descriptionSelectContainer = null;
        this.rankingSelectContainer = null;
        this.limiter = null;

        //others
        this.searchWhileTyping = false;
        this.editBtn = null;

        // this.groupsSearchArray = new Array();
        // this.permissionsSearchArray = new Object();
        // this.klassenstufenSearchArray = new Array();
        this.choosenArray = new Array();
        this.oldCheckedArray = new Array();

        this.resultTable = null;
        // this.chooseAllBtn = null;
        this.tableBody = null;
        this.resultDescriptionContainer = null;
        // this.resultsDescription = null;
        // this.resultsFound = null;

        // //Edit

        this.editContainer = null;
        this.editTable = null;
        this.editTableBody = null;
      }

      prepareEdit() {
        if (!this.editContainer) return "No edit container";
        this.editContainer.classList.add("hidden");
        this.clear(this.editTableBody);

        //Change All
        let thead = this.editTable.querySelector("thead");
        let removeAllBtn = thead.querySelector("#remove #changeAll");

        removeAllBtn.addEventListener("click", async () => {
          //Change All authenticated
          let value = await Utils.askUser(
            "Nachricht",
            `Willst du wirklich alle ausgewählten Berechtigungen (${this.choosenArray.length}) von der Gruppe ${this.group} entfernen?`,
            false
          );
          if (value) {
            for (const currentPermission of this.choosenArray) {
              await Utils.makeJSON(
                await Utils.sendXhrREQUEST(
                  "POST",
                  "gruppenverwaltung&operation=changePermissions&type=forbiddenPermissions&secondOperation=removePermission&id=" +
                    this.group +
                    "&permissionName=" +
                    currentPermission,
                  "./includes/berechtigungsverwaltung.inc.php",
                  "application/x-www-form-urlencoded",
                  true,
                  false,
                  false,
                  true,
                  false
                )
              );
            }
          }
          this.choosenArray = new Array();
          console.log(this.choosenArray);
          this.edit(this.choosenArray);
        });
      }

      async prepareSearch(group) {
        if (!this.container) return false;

        if (!group) return "No group";
        this.group = group;
        //StartBtn
        let searchBtn = this.container.querySelector(".filter #search");
        //if (!searchBtn) return false;
        this.searchBtn = searchBtn;

        //Edit Table
        let editContainer = this.container.querySelector("#editContainer");
        if (!editContainer) return "No edit container";
        this.editContainer = editContainer;
        let editTable = editContainer.querySelector("#editTable");
        if (!editTable) return "No edit table";
        this.editTable = editTable;
        let editTableBody = editTable.querySelector("tbody");
        if (!editTableBody) return "No edit table body";
        this.editTableBody = editTableBody;

        //Filter Container (init)
        let filterContainer = this.container.querySelector(".filter");
        if (!filterContainer) return "No filter container";
        this.filterContainer = filterContainer;
        filterContainer.classList.add("hidden"); //Hide it if it loads

        //Filter Type Select (init)
        let chooseFilterTypeSelect = filterContainer.querySelector(
          "#chooseFilterTypeContainer #chooseFilter"
        );
        if (!chooseFilterTypeSelect) return false;
        this.chooseFilterTypeSelect = chooseFilterTypeSelect;

        //Toggle Search (init)
        let toggleSearchBtn = this.container.querySelector("#filterToggle");
        //if (!toggleSearchBtn) return false;
        toggleSearchBtn.addEventListener("click", () => {
          filterContainer.classList.toggle("hidden");
        });

        //Selection Filters (init) - Enable or disable filter
        console.log(this.filterContainer);
        let selectionFiltersContainer =
          this.filterContainer.querySelector(".selectionFilters");
        if (!selectionFiltersContainer) return "no selection filters container";
        this.selectionFiltersContainer = selectionFiltersContainer;

        //Initialize filters
        let nameSelectContainer =
          selectionFiltersContainer.querySelector("#name");
        let descriptionSelectContainer =
          selectionFiltersContainer.querySelector("#description");
        let rankingSelectContainer =
          selectionFiltersContainer.querySelector("#ranking");
        if (
          !nameSelectContainer ||
          !descriptionSelectContainer ||
          !rankingSelectContainer
        )
          return "Error in initializing Filters";
        this.nameSelectContainer = nameSelectContainer;
        this.descriptionSelectContainer = descriptionSelectContainer;
        this.rankingSelectContainer = rankingSelectContainer;

        //Init limiter
        let limiter = selectionFiltersContainer.querySelector(
          "#limitResults #numberInput"
        );
        if (!limiter) return "no limiter";
        this.limiter = limiter;

        //Search While Typing
        let searchWhileTypingContainer =
          selectionFiltersContainer.querySelector("#other #searchWhileTyping");
        if (!searchWhileTypingContainer)
          return "no search while typin container";
        let searchWhileTypingCheckbox =
          searchWhileTypingContainer.querySelector("#allowSearchWhileTyping");
        if (!searchWhileTypingCheckbox) return "no search while typin checkbox";
        searchWhileTypingCheckbox.checked = false;
        this.searchWhileTyping = false;
        searchWhileTypingCheckbox.addEventListener("change", (event) => {
          if (event.target.checked) {
            console.log("searchWhileTyping on");
            this.searchWhileTyping = true;
          } else {
            console.log("searchWhileTyping off");
            this.searchWhileTyping = false;
          }
        });

        //Result Table
        let resultTable = container.querySelector(
          "#currentUserForbiddenPermissionsTable"
        );
        if (!resultTable) {
          return "No result Table found.";
        }
        this.resultTable = resultTable;
        this.resultTable.classList.add("hidden");

        let tableBody = resultTable.querySelector("tbody");
        if (!tableBody) {
          return "no table body";
        }
        this.tableBody = tableBody;
        this.clear(this.tableBody);

        //ChooseAllBtn
        this.chooseAllBtn = this.resultTable.querySelector("thead #chooseall");
        if (!this.chooseAllBtn) return false;
        //Make Choose All -------

        let editBtn = this.container.querySelector("#edit");
        if (!editBtn) return false;
        this.editBtn = editBtn;
        editBtn.addEventListener("click", () => {
          this.edit(this.choosenArray);
        });

        let chooseAllBtn = this.resultTable.querySelector("thead #chooseall");
        if (!chooseAllBtn) return false;
        chooseAllBtn.addEventListener("change", (event) => {
          if (event.target.checked) {
            console.log("checked");
            this.oldCheckedArray = Utils.copyArray(this.choosenArray);
            let allCheckBtns =
              this.resultTable.querySelectorAll(".result #select");

            allCheckBtns.forEach((element) => {
              let dataValue = element
                .closest(".result")
                .getAttribute("data-value");
              element.checked = true;
              this.choosenArray = Utils.addToArray(
                this.choosenArray,
                dataValue,
                false
              );
            });
          } else {
            console.log("unchecked");
            let allCheckBtns =
              this.resultTable.querySelectorAll(".result #select");

            allCheckBtns.forEach((element) => {
              let dataValue = element
                .closest(".result")
                .getAttribute("data-value");

              if (this.oldCheckedArray.includes(dataValue)) {
                element.checked = true;
                this.choosenArray = Utils.addToArray(
                  this.choosenArray,
                  dataValue,
                  false
                );
              } else {
                element.checked = false;
                this.choosenArray = Utils.removeFromArray(
                  this.choosenArray,
                  dataValue
                );
              }
            });
          }
          this.updateEditBtn();
        });

        //Result Desription
        let resultDescriptionContainer =
          this.container.querySelector(".resultDesciption");
        if (!resultDescriptionContainer) {
          return "no discription container";
        }
        this.resultDescriptionContainer = resultDescriptionContainer;

        searchBtn.addEventListener("click", () => {
          this.search(this.arraySearch);
        });

        //Add that user can select type of filter and set normally to username
        this.chooseFilterTypeSelect.addEventListener("change", () => {
          let value =
            this.chooseFilterTypeSelect[
              chooseFilterTypeSelect.selectedIndex
            ].getAttribute("data-value");
          console.log(value);
          this.setFilterMode(value);
        });
        //First shown mode automatically
        this.setFilterMode("all");
        this.search();

        //AddForbiddenPermissions
        let addPermissionsBtn =
          this.container.querySelector("#addPermissionsBtn");
        if (!addPermissionsBtn) {
          return "no addPermissionsBtn";
        }
        addPermissionsBtn.addEventListener("click", async () => {
          let forbiddenPermissionGroupHas = await Utils.makeJSON(
            await Utils.sendXhrREQUEST(
              "POST",
              "gruppenverwaltung&operation=changePermissions&type=forbiddenPermissions&secondOperation=getAllForbiddenPermissionNamesGroupHas&id=" +
                this.group,
              "./includes/berechtigungsverwaltung.inc.php",
              "application/x-www-form-urlencoded",
              true,
              true,
              false,
              true
            )
          );
          let addPermissionsArray = await addPermission(
            forbiddenPermissionGroupHas
          );
          console.log(forbiddenPermissionGroupHas);

          if (addPermissionsArray && addPermissionsArray.length > 0) {
            for (const element of addPermissionsArray) {
              let res = await Utils.makeJSON(
                await Utils.sendXhrREQUEST(
                  "POST",
                  "gruppenverwaltung&operation=changePermissions&type=forbiddenPermissions&secondOperation=addPermission&id=" +
                    this.group +
                    "&permissionName=" +
                    element,
                  "./includes/berechtigungsverwaltung.inc.php",
                  "application/x-www-form-urlencoded",
                  true,
                  false,
                  false,
                  true
                )
              );
              console.log(this.choosenArray)
              if (res["status"] == "success") {
                this.choosenArray = Utils.addToArray(
                  this.choosenArray,
                  element,
                  false
                );
              }
            }
          }
          this.edit(this.choosenArray);
        });
      }

      setFilterMode(value) {
        if (!value) return false;
        this.filterType = value;
        //Hide All and clear
        this.nameSelectContainer.classList.add("hidden");
        this.descriptionSelectContainer.classList.add("hidden");
        this.rankingSelectContainer.classList.add("hidden");

        if (value === "name") {
          this.enableFilter(this.nameSelectContainer);
        } else if (value === "description") {
          this.enableFilter(this.descriptionSelectContainer);
        } else if (value === "ranking") {
          this.enableFilter(this.rankingSelectContainer);
        } else if (value == "all") {
          //Nothing to show
        }
      }

      listenToChanges(element, type) {
        if (!element || typeof element != "object") return false;

        let handleEvent = () => {
          let value = element.value;
          if (value.replace(/\s+/g, "") == "") {
            return false;
          }

          if (this.searchWhileTyping) {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
              this.search();
            }, 650);
          }
        };
        let timeout;
        element.removeEventListener(type, handleEvent);
        element.addEventListener(type, handleEvent);
      }

      async enableFilter(filter) {
        if (!filter) return false;

        if (filter === this.nameSelectContainer) {
          //name
          let textInput = this.nameSelectContainer.querySelector("#textInput");
          this.listenToChanges(textInput, "input");
          this.nameSelectContainer.classList.remove("hidden");
        } else if (filter === this.descriptionSelectContainer) {
          //description
          let textInput =
            this.descriptionSelectContainer.querySelector("#textInput");
          this.listenToChanges(textInput, "input");
          this.descriptionSelectContainer.classList.remove("hidden");
        } else if (filter === this.rankingSelectContainer) {
          //ranking
          let textInput =
            this.rankingSelectContainer.querySelector("#textInput");
          this.listenToChanges(textInput, "input");
          this.rankingSelectContainer.classList.remove("hidden");
        } else {
          return false;
        }
      }

      async search() {
        console.log("Search...");
        //Utils.toggleLodingAnimation(this.container)
        this.searchBtn.classList.add("loading");

        if (this.filterType === "name") {
          let input =
            this.nameSelectContainer.querySelector("#textInput").value;
          this.showResults(
            await Utils.makeJSON(
              await Utils.sendXhrREQUEST(
                "POST",
                "gruppenverwaltung&operation=changePermissions&type=forbiddenPermissions&secondOperation=search&searchBy=name&id=" +
                  this.group +
                  "&input=" +
                  input,
                "./includes/berechtigungsverwaltung.inc.php",
                "application/x-www-form-urlencoded",
                true,
                true,
                false,
                true
              )
            )
          );
        } else if (this.filterType === "description") {
          let input =
            this.descriptionSelectContainer.querySelector("#textInput").value;
          this.showResults(
            await Utils.makeJSON(
              await Utils.sendXhrREQUEST(
                "POST",
                "gruppenverwaltung&operation=changePermissions&type=forbiddenPermissions&secondOperation=search&searchBy=description&id=" +
                  this.group +
                  "&input=" +
                  input,
                "./includes/berechtigungsverwaltung.inc.php",
                "application/x-www-form-urlencoded",
                true,
                true,
                false,
                true
              )
            )
          );
        } else if (this.filterType === "ranking") {
          let input =
            this.rankingSelectContainer.querySelector("#numberInput").value;
          this.showResults(
            await Utils.makeJSON(
              await Utils.sendXhrREQUEST(
                "POST",
                "gruppenverwaltung&operation=changePermissions&type=forbiddenPermissions&secondOperation=search&searchBy=name&id=" +
                  this.group +
                  "&input=" +
                  input,
                "./includes/berechtigungsverwaltung.inc.php",
                "application/x-www-form-urlencoded",
                true,
                true,
                false,
                true
              )
            )
          );
        } else if (this.filterType === "all") {
          this.showResults(
            await Utils.makeJSON(
              await Utils.sendXhrREQUEST(
                "POST",
                "gruppenverwaltung&operation=changePermissions&type=forbiddenPermissions&secondOperation=search&searchBy=all&id=" +
                  this.group,
                "./includes/berechtigungsverwaltung.inc.php",
                "application/x-www-form-urlencoded",
                true,
                true,
                false,
                true
              )
            )
          );
        } else {
          console.log("no input method");
          return false;
        }
      }

      clear(element) {
        element.innerHTML = "";
      }

      updateEditBtn() {
        if (this.choosenArray.length > 0) {
          this.editBtn.disabled = false;
        } else {
          this.editBtn.disabled = true;
        }
      }

      async showResults(results) {
        this.searchBtn.classList.remove("loading");
        this.clear(this.tableBody);
        this.updateEditBtn();
        this.resultDescriptionContainer.classList.remove("hidden");
        if (!results) {
          this.resultTable.classList.add("hidden");
          this.resultDescriptionContainer.innerHTML = "Keine Ergebnisse...";
          return true;
        }
        results = Utils.makeJSON(results);

        if (!results.length > 0) {
          this.resultDescriptionContainer.innerHTML = "Keine Ergebnisse...";
          this.resultTable.classList.add("hidden");
          return false;
        }

        results.forEach((result) => {
          //console.log(user);
          let tableRow = document.createElement("tr");
          tableRow.classList.add("result");
          tableRow.setAttribute("data-value", result["name"]);

          tableRow.innerHTML = `
          <td class="select"><input type="checkbox" id="select"><button id="chooseOnly"><img
          src="../../images/icons/stift.svg" alt="Auswahl"></button></td>
          <td id="name">${result["name"]}</td>
          <td id="description">${result["description"]}</td>
          <td id="ranking">${result["ranking"]}</td>
          <td id="hinweis">${result["hinweis"]}</td>
          <td id="remove"><button class="delete-btn"><img src="../../images/icons/delete.svg"
          alt="Löschen"></button></td>
          `;
          this.tableBody.append(tableRow);

          let checkBox = tableRow.querySelector(".select #select");
          if (!checkBox) return false;
          checkBox.addEventListener("change", (event) => {
            if (event.target.checked) {
              this.choosenArray = Utils.addToArray(
                this.choosenArray,
                result["name"],
                false
              );
            } else {
              this.choosenArray = Utils.removeFromArray(
                this.choosenArray,
                result["name"]
              );
            }
            this.updateEditBtn();
          });

          let chooseThis = tableRow.querySelector(".select #chooseOnly");
          if (!chooseThis) return false;

          chooseThis.addEventListener("click", (event) => {
            let name = event.target
              .closest(".result")
              .getAttribute("data-value");
            if (!name) return;
            this.choosenArray = Utils.addToArray(
              this.choosenArray,
              result["name"],
              false
            );
            this.edit(this.choosenArray);
          });

          let removeBtn = tableRow.querySelector("#remove .delete-btn");
          removeBtn.addEventListener("click", async () => {
            let value = await Utils.askUser(
              "Nachricht",
              `Willst du wirklich die verbotene Berechtigung <b>${result["name"]}</b> von der Gruppe entfernen?`,
              false
            );
            if (value) {
              await Utils.makeJSON(
                await Utils.sendXhrREQUEST(
                  "POST",
                  "gruppenverwaltung&operation=changePermissions&type=forbiddenPermissions&secondOperation=removePermission&id=" +
                    this.group +
                    "&permissionName=" +
                    result["name"],
                  "./includes/berechtigungsverwaltung.inc.php",
                  "application/x-www-form-urlencoded",
                  true,
                  true,
                  false,
                  true
                )
              );
            }
            this.search();
          });
        });

        this.resultTable.classList.remove("hidden");
      }

      async edit(choosen) {
        if (!choosen || !choosen.length > 0) {
          this.editContainer.classList.add("hidden");
          this.clear(this.editTableBody);
          return false;
        }
        console.log("Edit:", choosen);

        this.resultTable.classList.add("hidden");
        this.clear(this.tableBody);

        this.editTable.classList.remove("hidden");

        this.clear(this.editTableBody);

        for (let current of choosen) {
          //Get Data
          current = await Utils.makeJSON(
            await Utils.sendXhrREQUEST(
              "POST",
              "gruppenverwaltung&operation=changePermissions&type=forbiddenPermissions&secondOperation=getFullInformationForEdit&id=" +
                this.group +
                "&permissionName=" +
                current,
              "./includes/berechtigungsverwaltung.inc.php",
              "application/x-www-form-urlencoded",
              true,
              true,
              false,
              true
            )
          );

          if (!current) {
            continue;
          }

          if (current["name"]) {
            let tableRow = document.createElement("tr");
            tableRow.classList.add("result");
            tableRow.setAttribute("data-value", current["name"]);

            tableRow.innerHTML = `
            <td id="name">${current["name"]}</td>
            <td id="description">${current["description"]}</td>
            <td id="normalValue">${current["normalValue"]}</td>
            <td id="ranking">${current["ranking"]}</td>
            <td id="hinweis">${current["hinweis"]}</td>
            <td id="remove"><button class="delete-btn"><img src="../../images/icons/delete.svg" alt="Löschen"></button></td>
            `;
            this.editTableBody.appendChild(tableRow);

            let removeBtn = tableRow.querySelector("#remove .delete-btn");
            removeBtn.addEventListener("click", async () => {
              let value = await Utils.askUser(
                "Nachricht",
                `Willst du wirklich die verbotene Berechtigung <b>${current["name"]}</b> von der Gruppe ${this.group} entfernen?`,
                false
              );
              if (value) {
                await Utils.makeJSON(
                  await Utils.sendXhrREQUEST(
                    "POST",
                    "gruppenverwaltung&operation=changePermissions&type=forbiddenPermissions&secondOperation=removePermission&id=" +
                      this.group +
                      "&permissionName=" +
                      current["name"],
                    "./includes/berechtigungsverwaltung.inc.php",
                    "application/x-www-form-urlencoded",
                    true,
                    true,
                    false,
                    true
                  )
                );
              }
            });
            this.editContainer.classList.remove("hidden");
            this.editTable.classList.remove("hidden");
          }
        }
        this.editContainer.classList.remove("hidden");
        this.editTable.classList.remove("hidden");
      }
    }

    let outerContainer = modal.querySelector("#programContainer");

    let currentUsersPermissions = outerContainer.querySelector(
      "#currentUsersPermissions"
    );

    let setPermissions = currentUsersPermissions.querySelector(".set");

    let forbiddenPermissions =
      currentUsersPermissions.querySelector(".forbidden");

    let container = modal.querySelector("#programContainer");
    console.log(container);

    let currentPermissionsVerwaltung = new CurrentPermissionsVerwaltung(
      setPermissions
    );
    console.log(await currentPermissionsVerwaltung.prepareSearch(group));
    console.log(currentPermissionsVerwaltung.prepareEdit());

    let forbiddenPermissionsVerwaltung = new ForbiddenPermissionsVerwaltung(
      forbiddenPermissions
    );
    console.log(await forbiddenPermissionsVerwaltung.prepareSearch(group));
    console.log(forbiddenPermissionsVerwaltung.prepareEdit());

    //Current Permissions

    //Forbidden Permissions

    //Add / Change

    let close = modal.querySelector("#close");
    let yes = modal.querySelector("#yes");
    let no = modal.querySelector("#no");

    yes.addEventListener("click", (target) => {
      myModal.hide();
      modalOuter.remove();
      Utils.hideAllModals(false);
      resolve("Erfolg!");
    });

    no.addEventListener("click", (target) => {
      myModal.hide();
      modalOuter.remove();
      Utils.hideAllModals(false);
      resolve(false);
    });

    close.addEventListener("click", (target) => {
      myModal.hide();
      modalOuter.remove();
      Utils.hideAllModals(false);
      resolve(false);
    });
  });
}


//Change Permissions
export async function changePermissionsAllChooseMethod() {
  return new Promise(async function (resolve, reject) {
    let modalContainer = document.querySelector("#modalContainer");

    if (modalContainer == null) {
      modalContainer = document.createElement("div");
      modalContainer.setAttribute("id", "modalContainer");
      document.body.appendChild(modalContainer);
    }

    if (document.querySelector("#modalContainer") == null) {
      alert("no modal container found");
      reject();
    }
    let number = 1;
    let modals = modalContainer.querySelectorAll(".modal");
    console.log(modals);
    if (modals.length > 0) {
      number = modals.length + 1;
    }
    console.log("Number of Modals", number);

    let modalOuter = document.createElement("div");
    modalOuter.classList.add("modal-div");
    modalOuter.setAttribute("id", number);
    modalContainer.appendChild(modalOuter);
    let choosenArray = new Array();

    let modalHTML = `
                <!-- Modal -->
                <div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="true" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div class="modal-dialog">
                  <div class="modal-content">
                    <div class="modal-header">
                      <h5 class="modal-title" id="staticBackdropLabel">Gruppen bearbeiten</h5>
                      <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" id="close"></button>
                    </div>
                    <div class="modal-body">
                    <select id="methodSelection">
                      <option data-value="" selected="selected">Methode auswählen</option>
                      <option data-value="add">Hinzufügen</option>
                      <option data-value="remove">Entfernen</option>
                      <option data-value="overwrite">Überschreiben (nur ausgewähltes als Permission setzen)</option>
                      <option data-value="removeAll">Alle entfernen</option>
                    </select>
                    <select id="artSelection">
                    <option data-value="" selected="selected">Art auswählen</option>
                    <option data-value="ableto">Darf</option>
                    <option data-value="forbidden">Darf nicht</option>
                  </select>
                    </div>
                    <div class="modal-footer">
                      <button type="button" class="btn btn-danger" id="no">Nein</button>
                      <button type="button" class="btn btn-success" id="yes">Ja</button>
                    </div>
                  </div>
                </div>
                </div>
                 `;

    modalOuter.innerHTML = modalHTML;
    let modal = modalOuter.querySelector(".modal");
    let modalBody = modal.querySelector(".modal-body");

    let close = modal.querySelector("#close");
    let yes = modal.querySelector("#yes");
    let no = modal.querySelector("#no");

    var myModal = new bootstrap.Modal(modal);
    myModal.show();

    let getVaules = () => {
      let methodSelection = modal.querySelector("#methodSelection");
      if (!methodSelection) return false;
      let method =
        methodSelection[methodSelection.selectedIndex].getAttribute(
          "data-value"
        );

      let artSelection = modal.querySelector("#artSelection");
      if (!artSelection) return false;
      let art =
        artSelection[artSelection.selectedIndex].getAttribute("data-value");

      //alert("0art:" + art + "method:" + method)

      return { method: method, art: art };
    };

    yes.addEventListener("click", (target) => {
      myModal.hide();
      modalOuter.remove();
      Utils.hideAllModals(false);
      const { method, art } = getVaules();
      //alert("1art:" + art + "method:" + method)
      if (method == "" || art == "") return false;
      resolve({ method: method, art: art });
    });

    no.addEventListener("click", (target) => {
      myModal.hide();
      modalOuter.remove();
      Utils.hideAllModals(false);
      resolve(false);
    });

    close.addEventListener("click", (target) => {
      myModal.hide();
      modalOuter.remove();
      Utils.hideAllModals(false);
      resolve(false);
    });
  });
}
