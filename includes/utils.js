export function IsJsonString(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

export function isJSON(data) {
  try {
    JSON.stringify(data);
    JSON.parse(data);
  } catch (e) {
    return false;
  }
  return true;
}

export function validJSON(json) {
  if (IsJsonString) {
    return true;
  }
  if (isJSON) {
    return true;
  }
  return false;
}

export function sortItems(data = new Array(), parameter = false) {
  //dev console.log(data, parameter)
  if (!data) {
    return data;
  }
  let sortedData = data.sort((a, b) => {
    if (a === null || b === null) {
      return -1;
    }
    if (parameter != false) {
      let a1 = a[parameter];
      let b1 = b[parameter];

      if (a1 === null || b1 === null) {
        return -1;
      }

      return a1.localeCompare(b1, undefined, { numeric: true });
    } else {
      return a.localeCompare(b, undefined, { numeric: true });
    }
  });
  return sortedData;
}

export function moreThanZeroInArray(array) {
  let result = false;
  if (array.length > 0) {
    result = true;
  }
  return result;
}

export function copyArray(arrayInput) {
  let arrayOutput = Array();
  if (arrayInput.length > 0) {
    arrayInput.forEach((element) => {
      arrayOutput.push(element);
    });
  }
  return arrayOutput;
}

export function insertAfter(referenceNode, newNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

export function shuffle(array) {
  if (!array) return array;
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

export async function askUser(title, text, closeOthers) {
  return new Promise((resolve, reject) => {
    //Create Modal container if doesnt exist
    let modalContainer = document.querySelector("#modalContainer");

    if (modalContainer == null) {
      modalContainer = document.createElement("div");
      modalContainer.setAttribute("id", "modalContainer");
      document.body.appendChild(modalContainer);
    }

    if (document.querySelector("#modalContainer") == null) {
      alert("no modal cóntainer found");
      reject();
    }
    let number = 1;
    // let modalsDiv = modalContainer.querySelectorAll(".modal-div");
    // if (modalsDiv.length > 0) {

    // }
    // console.log(modalsDiv);
    // console.log("Number of Modal Divs", number);
    let modals = modalContainer.querySelectorAll(".modal");
    console.log(modals);
    if (modals.length > 0) {
      number = modals.length + 1;
      if (closeOthers) {
        hideAllModals(closeOthers);
      }
    }
    console.log("Number of Modals", number);

    let modalOuter = document.createElement("div");
    modalOuter.classList.add("modal-div");
    modalOuter.setAttribute("id", number);
    modalContainer.appendChild(modalOuter);

    let modalHTML = `
  <!-- Modal -->
  <div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="staticBackdropLabel">${title}</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" id="close"></button>
      </div>
      <div class="modal-body">
        <div class="description">
          ${text}
        </div>
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

    let close = modal.querySelector("#close");
    let yes = modal.querySelector("#yes");
    let no = modal.querySelector("#no");

    var myModal = new bootstrap.Modal(modal);
    myModal.show();

    yes.addEventListener("click", (target) => {
      myModal.hide();

      hideAllModals(closeOthers);
      modalOuter.remove();
      resolve(true);
    });

    no.addEventListener("click", (target) => {
      myModal.hide();

      hideAllModals(closeOthers);
      modalOuter.remove();
      resolve(false);
    });

    close.addEventListener("click", (target) => {
      myModal.hide();
      hideAllModals(closeOthers);
      modalOuter.remove();
      resolve(false);
    });
  });
}

export function getUserInput(
  title,
  text,
  closeOthers,
  type = "text",
  placeholder = false,
  textContent = false,
  canBeEmpty = false,
  optionsToChooseFrom = new Array(),
  auswahlItem = false
) {
  return new Promise((resolve, reject) => {
    //Create Modal container if doesnt exist
    let modalContainer = document.querySelector("#modalContainer");

    if (modalContainer == null) {
      modalContainer = document.createElement("div");
      modalContainer.setAttribute("id", "modalContainer");
      document.body.appendChild(modalContainer);
    }

    if (document.querySelector("#modalContainer") == null) {
      alert("no modal cóntainer found");
      reject();
    }
    let number = 1;
    // let modalsDiv = modalContainer.querySelectorAll(".modal-div");
    // if (modalsDiv.length > 0) {

    // }
    // console.log(modalsDiv);
    // console.log("Number of Modal Divs", number);
    let modals = modalContainer.querySelectorAll(".modal");
    console.log(modals);
    if (modals.length > 0) {
      number = modals.length + 1;
      if (closeOthers) {
        hideAllModals(closeOthers);
      }
    }
    console.log("Number of Modals", number);

    let modalOuter = document.createElement("div");
    modalOuter.classList.add("modal-div");
    modalOuter.setAttribute("id", number);
    modalContainer.appendChild(modalOuter);

    if (type === "text") {
      let modalHTML = `
  <!-- Modal -->
  <div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="staticBackdropLabel">${title}</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" id="close"></button>
      </div>
      <div class="modal-body">
        <div class="description">
          <p>${text}</p>
          <input type="text" class="form-control" id="textInput"">
        </div>
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

      let textInput = modal.querySelector("#textInput");

      if (textContent) {
        textInput.setAttribute("value", textContent);
      }
      if (placeholder) {
        textInput.setAttribute("placeholder", placeholder);
      }

      let close = modal.querySelector("#close");
      let yes = modal.querySelector("#yes");
      let no = modal.querySelector("#no");

      var myModal = new bootstrap.Modal(modal);
      myModal.show();

      yes.addEventListener("click", (target) => {
        let value = textInput.value;
        if (canBeEmpty) {
          myModal.hide();
          hideAllModals(closeOthers);
          modalOuter.remove();
          resolve(value);
        } else {
          if (!isEmptyInput(value, false)) {
            myModal.hide();

            hideAllModals(closeOthers);
            modalOuter.remove();
            resolve(value);
          }
        }
      });

      no.addEventListener("click", (target) => {
        myModal.hide();
        hideAllModals(closeOthers);
        modalOuter.remove();
        resolve(false);
      });

      close.addEventListener("click", (target) => {
        myModal.hide();
        hideAllModals(closeOthers);
        modalOuter.remove();
        resolve(false);
      });
    } else if (type === "yes/no") {
      let modalHTML = `
      <!-- Modal -->
      <div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="staticBackdropLabel">${title}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" id="close"></button>
          </div>
          <div class="modal-body">
            <div class="description">
              <p>${text}</p>
              <select class="form-select" aria-label="Default select example" id="selectInput">
                  <option data-value="" selected="selected">Auswahl</option>
                  <option data-value="1" value="1">Ja</option>
                  <option data-value="0">Nein</option>
              </select>
            </div>
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

      let selectInput = modal.querySelector("#selectInput");

      let close = modal.querySelector("#close");
      let yes = modal.querySelector("#yes");
      let no = modal.querySelector("#no");

      var myModal = new bootstrap.Modal(modal);
      myModal.show();

      yes.addEventListener("click", (target) => {
        let value =
          selectInput[selectInput.selectedIndex].getAttribute("data-value");
        if (canBeEmpty) {
          myModal.hide();
          hideAllModals(closeOthers);
          modalOuter.remove();
          resolve(value);
        } else {
          if (!isEmptyInput(value, true)) {
            myModal.hide();
            hideAllModals(closeOthers);
            modalOuter.remove();
            resolve(value);
          }
        }
      });

      no.addEventListener("click", (target) => {
        myModal.hide();
        modalOuter.remove();
        hideAllModals(closeOthers);
        resolve(false);
      });

      close.addEventListener("click", (target) => {
        myModal.hide();
        modalOuter.remove();
        hideAllModals(closeOthers);
        resolve(false);
      });
    } else if (type === "number") {
      let modalHTML = `
      <!-- Modal -->
      <div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="staticBackdropLabel">${title}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" id="close"></button>
          </div>
          <div class="modal-body">
            <div class="description">
              <p>${text}</p>
              <input type="number" id="numberInput" name="numberInput" min="0" autocomplete="off">
            </div>
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

      let numberInput = modal.querySelector("#numberInput");
      if (textContent) {
        numberInput.setAttribute("value", textContent);
      }
      if (placeholder) {
        numberInput.setAttribute("placeholder", placeholder);
      }

      let close = modal.querySelector("#close");
      let yes = modal.querySelector("#yes");
      let no = modal.querySelector("#no");

      var myModal = new bootstrap.Modal(modal);
      myModal.show();

      yes.addEventListener("click", (target) => {
        let value = numberInput.value;
        if (canBeEmpty) {
          myModal.hide();
          hideAllModals(closeOthers);
          modalOuter.remove();
          resolve(value);
        } else {
          if (!isEmptyInput(value, false)) {
            myModal.hide();
            hideAllModals(closeOthers);
            modalOuter.remove();
            resolve(value);
          }
        }
      });

      no.addEventListener("click", (target) => {
        myModal.hide();
        modalOuter.remove();
        hideAllModals(closeOthers);
        resolve(false);
      });

      close.addEventListener("click", (target) => {
        myModal.hide();
        modalOuter.remove();
        hideAllModals(closeOthers);
        resolve(false);
      });
    } else if (type === "select") {
      let modalHTML = `
      <!-- Modal -->
      <div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="staticBackdropLabel">${title}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" id="close"></button>
          </div>
          <div class="modal-body">
            <div class="description">
              <p>${text}</p>
              <select class="form-select" aria-label="Default select example" id="selectInput">
                 
              </select>
            </div>
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

      let selectInput = modal.querySelector("#selectInput");
      selectInput.innerHTML = "";
      if (
        optionsToChooseFrom == false ||
        !Object.keys(optionsToChooseFrom).length
      ) {
        selectInput.innerHTML = "<option>Keine Einträge</option>";
      }
      if (auswahlItem) {
        let optionElement = document.createElement("option");
        optionElement.setAttribute("data-value", "");
        optionElement.innerHTML = "Auswahl";
        selectInput.appendChild(optionElement);
      }
      for (const [key, value] of Object.entries(optionsToChooseFrom)) {
        let optionElement = document.createElement("option");
        optionElement.setAttribute("data-value", value);
        optionElement.innerHTML = key;
        selectInput.appendChild(optionElement);
      }

      let close = modal.querySelector("#close");
      let yes = modal.querySelector("#yes");
      let no = modal.querySelector("#no");

      var myModal = new bootstrap.Modal(modal);
      myModal.show();

      yes.addEventListener("click", (target) => {
        let value =
          selectInput[selectInput.selectedIndex].getAttribute("data-value");
        if (canBeEmpty) {
          myModal.hide();
          hideAllModals(closeOthers);
          modalOuter.remove();
          resolve(value);
        } else {
          if (!isEmptyInput(value, false)) {
            myModal.hide();
            hideAllModals(closeOthers);
            modalOuter.remove();
            resolve(value);
          }
        }
      });

      no.addEventListener("click", (target) => {
        myModal.hide();
        modalOuter.remove();
        hideAllModals(closeOthers);
        resolve(false);
      });

      close.addEventListener("click", (target) => {
        myModal.hide();
        modalOuter.remove();
        hideAllModals(closeOthers);
        resolve(false);
      });
    }
  });
}

export function alertUser(title, text, closeOthers) {
  return new Promise((resolve, reject) => {
    //Create Modal container if doesnt exist
    let modalContainer = document.querySelector("#modalContainer");

    if (modalContainer == null) {
      modalContainer = document.createElement("div");
      modalContainer.setAttribute("id", "modalContainer");
      document.body.appendChild(modalContainer);
    }

    if (document.querySelector("#modalContainer") == null) {
      alert("no modal cóntainer found");
      reject();
    }
    let number = 1;
    // let modalsDiv = modalContainer.querySelectorAll(".modal-div");
    // if (modalsDiv.length > 0) {

    // }
    // console.log(modalsDiv);
    // console.log("Number of Modal Divs", number);
    let modals = modalContainer.querySelectorAll(".modal");
    console.log(modals);
    if (modals.length > 0) {
      number = modals.length + 1;
      if (closeOthers) {
        hideAllModals(closeOthers);
      }
    }
    console.log("Number of Modals", number);

    let modalOuter = document.createElement("div");
    modalOuter.classList.add("modal-div");
    modalOuter.setAttribute("id", number);
    modalContainer.appendChild(modalOuter);

    let modalHTML = `
    <!-- Modal -->
    <div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="staticBackdropLabel">${title}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" id="close"></button>
        </div>
        <div class="modal-body">
          <div class="description">
            ${text}
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" id="ok">OK</button>
        </div>
      </div>
    </div>
    </div>
     `;

    modalOuter.innerHTML = modalHTML;
    let modal = modalOuter.querySelector(".modal");

    let ok = modal.querySelector("#ok");
    var myModal = new bootstrap.Modal(modal);
    myModal.show();

    ok.addEventListener("click", (target) => {
      myModal.hide();
      hideAllModals(closeOthers);
      modalOuter.remove();
      resolve(true);
    });

    let close = modal.querySelector("#close");
    close.addEventListener("click", (target) => {
      myModal.hide();
      hideAllModals(closeOthers);
      modalOuter.remove();
      resolve(false);
    });
  });
}

export function hideAllModals(check) {
  if (check) {
    let number = 0;
    let modals = modalContainer.querySelectorAll(".modal");
    console.log(modals);
    if (modals && modals.length > 0) {
      number = modals.length + 1;

      modals.forEach((element) => {
        var myModal = bootstrap.Modal.getOrCreateInstance(element); // Returns a Bootstrap modal instance
        myModal.dispose();
        element.parentElement.remove();
      });
      return true;
    }
  } else {
    return false;
  }
}
export async function popUpStatus(status = true) {
  if (status) {
    sessionStorage.setItem("popupOpen", true);
  } else {
    sessionStorage.setItem("popupOpen", false);
  }
}

export async function holdSererContact(fileGeneralFunctions) {
  async function sendData(request) {
    return await makeJSON(
      await sendXhrREQUEST(
        "POST",
        request,
        fileGeneralFunctions,
        "application/x-www-form-urlencoded",
        true,
        false,
        true,
        true,
        false
      )
    );
  }

  async function getMessage() {
    try {
      if (makeJSON(sessionStorage.getItem("popupOpen")) != true) {
        let data = await sendData("SESSION_MESSAGE&operation=get");
        if (data["message"]) {
          popUpStatus(true);
          async function openAlert() {
            let res = await alertUser("Nachricht", data["message"], true);
            await sendData("SESSION_MESSAGE&operation=delete");
            popUpStatus(false);
            getMessage();
          }
          openAlert();
        }
      }
      if (makeJSON(sessionStorage.getItem("popupOpen")) != true) {
        let data = await sendData("COMEBACK_MESSAGE&operation=get");
        if (data["message"]) {
          popUpStatus(true);
          async function openAlert() {
            await alertUser("Nachricht", data["message"], true);
            await sendData("COMEBACK_MESSAGE&operation=delete");
            popUpStatus(false);
            getMessage();
          }
          openAlert();
        }
      }

      if (makeJSON(sessionStorage.getItem("popupOpen")) != true) {
        let oldLogin = makeJSON(sessionStorage.getItem("loggedIn"));
        let logincheck = await sendData("CHECK_LOGIN");
        if (logincheck["data"]) {
          let newStatus = logincheck["data"]["loginStatus"];
          sessionStorage.setItem("loggedIn", newStatus);
          if (oldLogin != newStatus) {
            window.location.reload();
          }
        } else {
          sessionStorage.setItem("loggedIn", false);
        }
      }
    } catch (e) {
      alertUser("Nachricht", "Verbindung zum Server unterbrochen" + e, true);
    }
  }

  async function connectToServer() {
    try {
      console.log(await sendData("HOLDCONTACT"));
    } catch (e) {
      alertUser("Nachricht", "Verbindung zum Server unterbrochen " + e, true);
    }
  }

  sessionStorage.setItem("sessionMessageOPEN", false);
  sessionStorage.setItem("comebackMessageOPEN", false);
  getMessage();
  connectToServer();

  setInterval(() => {
    connectToServer();
    getMessage();
  }, 12000); //Every 12 Seconds
}

export function toggleLodingAnimation(container, status) {
  if (!container) return;

  let loadingAnimationContainer = document.createElement("div");
  loadingAnimationContainer.classList.add("loadingAnimationContainer");

  if (status == true) {
    container.appendChild(loadingAnimationContainer);
    loadingAnimationContainer.innerHTML =
      " <div class='loadingAnimation'><div></div><div></div><div></div><div></div></div>";
  } else {
    container.removeChild(loadingAnimationContainer);
  }
}

export function makeJSON(string) {
  try {
    if (!validJSON) {
      return false;
    } else {
      let json = string;

      while (typeof json == "string" && validJSON(json)) {
        json = JSON.parse(json);
      }
      return json;
    }
  } catch (e) {
    return false;
  }
}

export function arrayIncludesValue(array, value) {
  if (typeof array != typeof new Array()) return false;
  if (array.includes(value)) {
    return true;
  }
  return false;
}

export function removeFromArray(array, ...forDeletion) {
  return array.filter((item) => !forDeletion.includes(item));
}

Object.prototype.removeItem = function (key) {
  if (!this.hasOwnProperty(key)) return;
  if (isNaN(parseInt(key)) || !(this instanceof Array)) delete this[key];
  else this.splice(key, 1);
};

export function addToArray(
  array = new Array(),
  value,
  includeMultiple = false
) {
  if (!array || !value) return false;

  if (includeMultiple) {
    array.push(value);
  } else {
    if (!arrayIncludesValue(array, value)) {
      array.push(value);
      console.log(array);
    }
  }
  return array;
}

export function toggleValuesInArray(array, ...values) {
  if (!array) return array;
  if (!values) return array;
  for (const currentValue of values) {
    if (arrayIncludesValue(array, currentValue)) {
      array = removeFromArray(array, currentValue);
    } else {
      array = addToArray(array, currentValue, false);
    }
  }
  return array;
}

export async function userHasPermissions(
  checkPermissionsFromFrontendPATH,
  permissions = new Array()
) {
  return new Promise((resolve, reject) => {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", checkPermissionsFromFrontendPATH, true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send("checkPermissions&permissions=" + JSON.stringify(permissions));
    //Wenn Antwort
    xhr.onload = async () => {
      if (xhr.status == 200) {
        let data = makeJSON(xhr.response);
        let permissionStatus = data["permissionStatus"];
        if (permissionStatus === "permission denied") {
          await permissionDENIED();
        } else {
          resolve(true);
        }
      }
    };
    xhr.onerror = () => {
      reject();
    };
  });
}

export async function permissionDENIED(message = false) {
  return new Promise(async (resolve, reject) => {
    if (message) {
      await alertUser("Zugriff verweigert", message, false);
    } else {
      await alertUser(
        "Zugriff verweigert",
        "Es fehlt die Berechtigung zum Ausführen der Aktion",
        false
      );
      resolve();
    }
  });
}

export function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function listOfArrayToHTML(container, array, ifEmpty = "") {
  if (array) {
    if (array.length > 0) {
      container.innerHTML = "";
      let list = document.createElement("ul");
      list.classList.add("listInfo");
      container.appendChild(list);

      array.forEach((element) => {
        let li = document.createElement("li");
        list.appendChild(li);
        li.innerHTML = element;
      });
    } else {
      container.innerHTML = ifEmpty;
    }
  } else {
    container.innerHTML = ifEmpty;
  }
}

export function objectKEYVALUEToHTML(container, object, ifEmpty = "") {
  if (object != null) {
    if (Object.keys(object).length > 0) {
      container.innerHTML = "";
      let list = document.createElement("ul");
      list.classList.add("listInfo");
      container.appendChild(list);

      for (let i = 0; i < Object.keys(object).length; i++) {
        let key = Object.keys(object)[i];
        let value = Object.values(object)[i];
        let li = document.createElement("li");
        list.appendChild(li);
        li.innerHTML = `${key} => ${value}`;
      }
    } else {
      container.innerHTML = ifEmpty;
    }
  } else {
    container.innerHTML = ifEmpty;
  }
}

export async function sendXhrREQUEST(
  METHOD,
  request,
  FILEorURL,
  contentType,
  ascncrounously = true,
  showMessages = false,
  allowRedirect = false,
  showPermissionDenied = true,
  showErrors = true
) {
  //contentType = "application/x-www-form-urlencoded"
  return new Promise(async (resolve, reject) => {
    var xhr = new XMLHttpRequest();
    xhr.open(METHOD, FILEorURL, ascncrounously);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.send(request);
    //Wenn Antwort
    xhr.onload = async () => {
      if (xhr.status == 200) {
        console.log(xhr.response);
        let jsonResponse = makeJSON(xhr.response);
        if (showMessages) {
          try {
            if (jsonResponse) {
              let message = jsonResponse["message"];
              if (message) {
                await alertUser("Nachricht", message, false);
              }
            }
          } catch (e) {
            console.log("Fehler", e);
          }
        }
        if (showErrors && jsonResponse) {
          let status = jsonResponse["status"];
          if (status == "failed" || status === false || status == "error") {
            await alertUser("Fehler", jsonResponse["message"], false);
          }
        }
        if (allowRedirect) {
          let redirectTo = makeJSON(xhr.response);
          redirectTo = redirectTo["redirect"];
          if (redirectTo) {
            window.location.href = redirectTo;
          }
        }
        console.log(makeJSON(xhr.response));
        if (showPermissionDenied && jsonResponse) {
          let permissionDenied = jsonResponse["permissionDenied"];
          if (permissionDenied == true) {
            let message = jsonResponse["message"];
            await permissionDENIED(message);
            resolve(false);
          }
        }
        resolve(xhr.response);
      }
    };
    xhr.onerror = () => {
      reject();
    };
  });
}

export function isEmptyInput(input, strictmode = false) {
  if (strictmode) {
    if (input === "" || input === false || input.trim().length == 0) {
      return true;
    }
  } else {
    if (input === "" || input == false || input.trim().length == 0) {
      return true;
    }
  }

  return false;
}

export function clearHTML(container) {
  container.innerHTML = "";
}

export function listenToChanges(element, type, timeoutTime, func) {
  let handleEvent = () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      console.log("trigger callback");
      func();
    }, timeoutTime);
  };
  let timeout;
  element.addEventListener(type, handleEvent);
}

export function fillListWithValues(
  list,
  array,
  auswahlItem = true,
  clear = true
) {
  if (!list) return false;

  if (clear) {
    list.innerHTML = "";
  }
  if (!array || !array.length) {
    list.innerHTML = "<option>Keine Einträge</option>";
    return false;
  }

  if (auswahlItem) {
    let optionElement = document.createElement("option");
    optionElement.setAttribute("data-value", "");
    optionElement.innerHTML = "Auswahl";
    list.appendChild(optionElement);
  }

  for (const currentItem of array) {
    let optionElement = document.createElement("option");
    optionElement.setAttribute("data-value", currentItem);
    optionElement.innerHTML = currentItem;
    list.appendChild(optionElement);
  }
  return true;
}

export function secondsToArrayOrString(seconds, StringOrArray = "String") {
  let ret = "";

  /*** get the days ***/
  let days = Math.floor(parseInt(seconds) / (3600 * 24)); //Floor because just cut decimal part
  if (days > 0) {
    if (days > 1) {
      ret = `${ret} ${days} Tage`;
    } else {
      ret = `${ret} ${days} Tag`;
    }
  }

  /*** get the hours ***/
  let hours = Math.round(parseInt(seconds) / 3600) % 24;
  if (hours > 0) {
    if (hours > 1) {
      ret = `${ret} ${hours} Stunden`;
    } else {
      ret = `${ret} ${hours} Stunde`;
    }
  }

  /*** get the minutes ***/
  let minutes = Math.round(parseInt(seconds) / 60) % 60;
  if (minutes > 0) {
    if (minutes > 1) {
      ret = `${ret} ${minutes} Minuten`;
    } else {
      ret = `${ret} ${minutes} Minute`;
    }
  }

  /*** get the seconds ***/
  seconds = Math.round(parseInt(seconds) % 60);
  if (seconds > 0) {
    if (seconds > 1) {
      ret = `${ret} ${seconds} Sekunden`;
    } else {
      ret = `${ret} ${seconds} Sekunde`;
    }
  }
  if (StringOrArray == "String") {
    return ret;
  }
  if (StringOrArray == "Array") {
    let obj = (Object = {
      seconds: seconds,
      minutes: minutes,
      hours: hours,
      days: days,
    });
    return obj;
  }
}

export function removeAllEventlisteners(element) {
  if (!element) {
    return element;
  }
  // Make a copy
  var copy = element.cloneNode(true);
  //Replace
  element.replaceWith(copy);
  return copy;
}

export function delay(timeout) {
  return new Promise(async (resolve, reject) => {
    setTimeout(() => {
      resolve(true);
    }, timeout);
  });
}

export function getUrlParams(queryString = false) {
  if (!queryString) {
    queryString = window.location.search;
  }
  const urlParams = new URLSearchParams(queryString);
  return urlParams;
}

export function limitArray(arr, maxNumber) {
  if (!maxNumber > 0) {
    return arr;
  }
  var arrLength = arr.length;
  if (arrLength > maxNumber) {
    arr.splice(0, arrLength - maxNumber);
  }
  return arr;
}

export async function chooseFromArrayWithSearch(
  array,
  fullscreen = true,
  title = "Auswahl",
  hideElements = false,
  searchAtStart = true,
  liveServerContact = false,
  AJAXRequest = false,
  AJAXpath = false
) {
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

    if (fullscreen) {
      fullscreen = "modal-fullscreen";
    }

    let modalHTML = `
    <!-- Modal -->
    <div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="true" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
    <div class="modal-dialog ${fullscreen}">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="staticBackdropLabel">${title}</h5>
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
        <button class="btn btn-secondary" id="filterToggle">Filtern</button>
        <div class="filter">
            <div class="selectionFilters">
                <div id="other">
                    <div id="searchWhileTyping">
                        <label for="allowSearchWhileTyping">Während des Tippens suchen</label>
                        <input type="checkbox" id="allowSearchWhileTyping">
                    </div>
                </div>
                <div class="mt-2" id="name">
                                <label for="textInput" class="form-label">Filtern nach Name</label>
                                <input type="text" id="textInput" class="form-control" autocomplete="off">
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
        <table class="styled-table" style="margin: auto !important;" id="results">
            <thead>
                <tr>
                    <th id="select">
                        <div class="heading">Auswählen</div>
                        <hr>
                        <div><input type="checkbox" id="chooseall"> Alle auswählen</div>
                    </th>
                    <th id="name">Auswahl</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td class="select"><input type="checkbox" id="select"><button id="chooseOnly"><img
                                src="../../images/icons/zahnrad.svg" alt="Auswahl"></button></td>
                    <td id="name">accessLeherpanel</td>
                </tr>
            </tbody>
        </table>


    </div>

    `;

    var myModal = new bootstrap.Modal(modal);
    myModal.show();

    class SearchPopUp {
      constructor(container) {
        this.chooseFromArray = new Array();
        this.container = container;
        this.searchBtn = null;
        this.chooseFilterTypeSelect = null;
        this.filterContainer = null;
        this.selectionFiltersContainer = null;
        this.limiter = null;

        //Filters
        this.nameSelectContainer = null;
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
        if (!nameSelectContainer) return "Error in initializing Filters";
        this.nameSelectContainer = nameSelectContainer;

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
          return "no search while typing container";
        let searchWhileTypingCheckbox =
          searchWhileTypingContainer.querySelector("#allowSearchWhileTyping");
        if (!searchWhileTypingCheckbox) return "no search while typin checkbox";
        searchWhileTypingCheckbox.checked = true;
        this.searchWhileTyping = true;
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
        let resultTable = this.container.querySelector("#results");
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
            this.oldCheckedArray = copyArray(this.choosenArray);
            let allCheckBtns =
              this.resultTable.querySelectorAll(".result #select");

            allCheckBtns.forEach((element) => {
              let dataValue = element
                .closest(".result")
                .getAttribute("data-value");
              element.checked = true;
              this.choosenArray = addToArray(
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
                this.choosenArray = addToArray(
                  this.choosenArray,
                  dataValue,
                  false
                );
              } else {
                element.checked = false;
                this.choosenArray = removeFromArray(
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
        //First shown mode automatically
      }

      async listenToInput() {
        let input = this.nameSelectContainer.querySelector("#textInput");
        listenToChanges(input, "input", 300, () => {
          if (this.searchWhileTyping) {
            this.search();
          }
        });
      }

      async search() {
        console.log("Search...");
        //toggleLodingAnimation(this.container)
        this.searchBtn.classList.add("loading");

        let input = this.nameSelectContainer.querySelector("#textInput").value;

        if (!isEmptyInput(input, true)) {
          let resultArray = new Array();
          if (liveServerContact) {
            this.chooseFromArray = await makeJSON(
              await sendXhrREQUEST(
                "POST",
                AJAXRequest + input,
                AJAXpath,
                "application/x-www-form-urlencoded",
                true,
                false,
                false,
                true
              )
            );
          }
          for (const current of this.chooseFromArray) {
            if (current.toLowerCase().includes(input.toLowerCase())) {
              resultArray = addToArray(resultArray, current, false);
            }
          }
          this.showResults(limitArray(resultArray, this.limiter.value));
        } else {
          if (liveServerContact) {
            this.chooseFromArray = await makeJSON(
              await sendXhrREQUEST(
                "POST",
                AJAXRequest,
                AJAXpath,
                "application/x-www-form-urlencoded",
                true,
                false,
                false,
                true
              )
            );
          }
          this.showResults(
            limitArray(this.chooseFromArray, this.limiter.value)
          );
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
          this.resultTable.classList.add("hidden");
          return true;
        }
        results = makeJSON(results);

        if (!results.length > 0) {
          this.resultDescriptionContainer.innerHTML = "Keine Ergebnisse...";
          this.resultTable.classList.add("hidden");
          return false;
        }
        this.resultDescriptionContainer.innerHTML = `<b>${results.length}</b> Ergebnisse`;
        results.forEach((result) => {
          if (!this.dontShowArray.includes(result)) {
            //console.log(user);
            let tableRow = document.createElement("tr");
            tableRow.classList.add("result");
            tableRow.setAttribute("data-value", result);

            tableRow.innerHTML = `
            <td class="select"><input type="checkbox" id="select"><button id="chooseOnly"><img
                                src="../../images/icons/check.svg" alt="Auswahl"></button></td>
                    <td id="name">${result}</td>
            `;
            this.tableBody.append(tableRow);

            let checkBox = tableRow.querySelector(".select #select");
            if (!checkBox) return false;
            checkBox.addEventListener("change", (event) => {
              if (event.target.checked) {
                this.choosenArray = addToArray(
                  this.choosenArray,
                  result,
                  false
                );
              } else {
                this.choosenArray = removeFromArray(this.choosenArray, result);
              }
            });

            let chooseThis = tableRow.querySelector(".select #chooseOnly");
            if (!chooseThis) return false;

            chooseThis.addEventListener("click", (event) => {
              let name = event.target
                .closest(".result")
                .getAttribute("data-value");
              if (!name) return;
              this.choosenArray = addToArray(this.choosenArray, result, false);
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

    let searchPopUp = new SearchPopUp(outerContainer);
    searchPopUp.chooseFromArray = array || new Array();
    searchPopUp.dontShowArray = hideElements || new Array();

    console.log(searchPopUp.prepareSearch());
    searchPopUp.listenToInput();

    if (searchAtStart) {
      searchPopUp.search();
    }

    let close = modal.querySelector("#close");
    let yes = modal.querySelector("#yes");
    let no = modal.querySelector("#no");

    yes.addEventListener("click", (target) => {
      goBackWithValue();
    });

    function goBackWithValue() {
      let array = searchPopUp.returnResultArray();
      myModal.hide();
      hideAllModals(false);
      modalOuter.remove();
      resolve(array);
    }

    no.addEventListener("click", (target) => {
      myModal.hide();
      hideAllModals(false);
      modalOuter.remove();
      resolve(false);
    });

    close.addEventListener("click", (target) => {
      myModal.hide();
      hideAllModals(false);
      modalOuter.remove();
      resolve(false);
    });
  });
}

export async function getSettingVal(PATHtoGeneralFunctions, setting) {
  return await sendXhrREQUEST(
    "POST",
    "GETsettingVal&setting=" + setting,
    PATHtoGeneralFunctions,
    "application/x-www-form-urlencoded",
    true,
    true,
    false,
    true
  );
}

export function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  let expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

//Clipboard

export function fallbackCopyTextToClipboard(text) {
  var textArea = document.createElement("textarea");
  textArea.value = text;

  // Avoid scrolling to bottom
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    var successful = document.execCommand("copy");
    var msg = successful ? "successful" : "unsuccessful";
    console.log("Fallback: Copying text command was " + msg);
  } catch (err) {
    console.error("Fallback: Oops, unable to copy", err);
  }

  document.body.removeChild(textArea);
}

export function copyTextToClipboard(text) {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text);
    return;
  }
  navigator.clipboard.writeText(text).then(
    function () {
      console.log("Async: Copying to clipboard was successful!");
    },
    function (err) {
      console.error("Async: Could not copy text: ", err);
    }
  );
}

//Ask for Permissions to write Clipboard
export async function askClipboardWritePermission() {
  try {
    // The clipboard-write permission is granted automatically to pages
    // when they are the active tab. So it's not required, but it's more safe.
    const { state } = await navigator.permissions.query({
      name: "clipboard-write",
    });
    return state === "granted";
  } catch (error) {
    // Browser compatibility / Security error (ONLY HTTPS) ...
    return false;
  }
}

export async function copyImageToClipboard(path) {
  if (askClipboardWritePermission()) {
    try {
      const response = await fetch(path, { mode: "no-cors" });
      const blob = await response.blob();
      await setToClipboard(blob);
    } catch {
      alert("error, can't copy imgage");
    }
  } else {
    alert("error, can't copy to clipboard");
    return false;
  }
  return true;
}

export const setToClipboard = async (blob) => {
  const data = [new ClipboardItem({ [blob.type]: blob })];
  await navigator.clipboard.write(data);
  return true;
};

// if (canWriteToClipboard) {
//   const blob = new Blob(['Hello World'], { type: 'text/plain' })
//   await setToClipboard(blob)
// }

export async function getAttributesFromServer(
  pathToGetAttributes,
  type = false,
  secondOperation = false,
  otherRequest
) {
  return await sendXhrREQUEST(
    "POST",
    `getAttribute&type=${type}&secondOperation=${secondOperation}&${otherRequest}`,
    pathToGetAttributes,
    "application/x-www-form-urlencoded",
    true,
    true,
    false,
    true
  );
}

export function emptyVariable(input) {
  if (input === null || input === undefined) {
    return true;
  }
  return false;
}

export function array_contains_all_values(haystack, needle, olnlyValue = true) {
  if (!needle) {
    return false;
  }
  if (!haystack) {
    return false;
  }
  for (const [checkKey, checkValue] of needle) {
    if (olnlyValue) {
      if (!arrayIncludesValue(checkValue, haystack)) {
        return false;
      }
    } else {
      if (haystack[checkKey] == checkValue) {
      } else {
        return false;
      }
    }
  }
  return true;
}

export function hasAllContidions(needle, haystack, searchMode = false) {
  for (const [currentWhereKey, currentWhereValue] of needle) {
    if (!emptyVariable(haystack[currentWhereKey])) {
      if (searchMode) {
        if (
          haystack["currentWhereKey"]
            .toLowerCase()
            .includes(currentWhereValue.toLowerCase())
        ) {
          return false;
        }
      } else {
        if (
          arrayIncludesValue(haystack[currentWhereKey] == currentWhereValue)
        ) {
        } else {
          return false;
        }
      }
    } else {
      return false;
    }
  }
  return true;
}

export function string_contains_all_values(string, values, caseSensitive = true) {
  if (caseSensitive) {
    if (values.every((item) => string.includes(item))) {
      return true;
    }
  } else {
    if (
      values.every((item) =>
        string
          .toUpperCase()
          .includes(
            item.toUpperCase() ||
              string.toLowerCase().includes(item.toLowerCase())
          )
      )
    ) {
      return true;
    }
  }

  return false;
}


export function boolToJaOrNein(bool) {
  if (bool === true) {
    return "Ja";
  } else {
    return "Nein";
  }
}

export function boolToString(bool, data = {"true": "Ja", "false": "Nein"}) {
  if (bool != typeof "boolean") {
    bool = Boolean(bool)
  }
  if (bool === true) {
    return data.true;
  } else {
    return data.false;
  }
}
