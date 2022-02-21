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

export function sortItems(arrayOrObject = new Array(), parameter = false) {
  try {
    if (!arrayOrObject) {
      return arrayOrObject;
    }
    let sortedData = arrayOrObject.sort((a, b) => {
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
  } catch (e) {
    return arrayOrObject;
  }
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
  optionsToChooseFrom = new Object(),
  auswahlItem = false,
  fullscreen = false,
  options = false
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
  <div class="modal-dialog ${boolToString(fullscreen, {
    true: "modal-fullscreens",
    false: "",
  })}">
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
      <div class="modal-dialog ${boolToString(fullscreen, {
        true: "modal-fullscreens",
        false: "",
      })}">
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
      <div class="modal-dialog ${boolToString(fullscreen, {
        true: "modal-fullscreens",
        false: "",
      })}">
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
      <div class="modal-dialog ${boolToString(fullscreen, {
        true: "modal-fullscreens",
        false: "",
      })}">
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
    } else if (type === "textArea") {
      let modalHTML = `
      <!-- Modal -->
      <div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
      <div class="modal-dialog ${boolToString(fullscreen, {
        true: "modal-fullscreen",
        false: "",
      })}">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="staticBackdropLabel">${title}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" id="close"></button>
          </div>
          <div class="modal-body">
            <div class="description">
              <p>${text}</p>
              <textarea class="form-control" id="textInput" rows="3">${
                textContent ?? ""
              }</textarea>
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
    } else if (type === "file") {
      let modalHTML = `
      <!-- Modal -->
      <div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
      <div class="modal-dialog ${boolToString(fullscreen, {
        true: "modal-fullscreens",
        false: "",
      })}">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="staticBackdropLabel">${title}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" id="close"></button>
          </div>
          <div class="modal-body">
            <div class="description">
              <p>${text}</p>
            </div>
              <input type="file" id="fileInput" name="file" ${valueToString(
                options.multiple,
                { true: "multiple", false: "", undefined: "" }
              )}>
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
        let files = modal.querySelector("#fileInput").files;
        if (options.multiple) {
          if (canBeEmpty) {
            myModal.hide();
            hideAllModals(closeOthers);
            modalOuter.remove();
            resolve(files);
          } else {
            if (!files.length > 0) {
              myModal.hide();
              hideAllModals(closeOthers);
              modalOuter.remove();
              resolve(files);
            }
          }
        } else {
          //only one file
          if (canBeEmpty) {
            myModal.hide();
            hideAllModals(closeOthers);
            modalOuter.remove();
            alert("current selected files", files);
            if (files.length > 0) {
              resolve(files[0]);
            }
            resolve(false);
          } else {
            if (files.length > 0) {
              myModal.hide();
              hideAllModals(closeOthers);
              modalOuter.remove();
              resolve(files[0]);
            }
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
    }
  });
}

export function createModal(
  options = {
    backdrop: "static",
    title: "Nachricht",
    fullscreen: true,
    scrollable: true,
    verticallyCentered: true,
    modalType: "ok | yes / no",
  }
) {
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
  <div class="modal fade" id="staticBackdrop" data-bs-backdrop="${valueToString()}" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
  <div class="modal-dialog ${valueToString(
    options?.scrollable,
    { true: "modal-dialog-scrollable" },
    true
  )} ${valueToString(
    Boolean(options?.fullscreen),
    { true: "modal-fullscreen" },
    true
  )}
  ${valueToString(
    options?.verticallyCentered,
    { true: "modal-dialog-centered" },
    true
  )}">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="staticBackdropLabel">${
          options?.title ?? ""
        }</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" id="close"></button>
      </div>
      <div class="modal-body">
       
      </div>
      <div class="modal-footer">
        ${valueToString(
          options?.modalType,
          {
            true: "modal-dialog-scrollable",
            "yes/no": `<button type="button" class="btn btn-danger" id="no">Nein</button> <button type="button" class="btn btn-success" id="yes">Ja</button>`,
            ok: `<button type="button" class="btn btn-secondary" id="ok">OK</button>`,
            false: `<button type="button" class="btn btn-secondary" id="ok">OK</button>`,
          },
          true
        )}
       
      </div>
    </div>
  </div>
  </div>
   `;
  modalOuter.innerHTML = modalHTML;
  let modal = modalOuter.querySelector(".modal");
  let myModal = new bootstrap.Modal(modal);
  return [modal, myModal, modal.querySelector(".modal-body"), modalOuter];
}

export function alertUser(title, text, closeOthers) {
  return new Promise((resolve, reject) => {
    const [modal, bootstrapModal, modalBody, modalOuter] = createModal({
      title: title,
      fullscreen: false,
      verticallyCentered: false,
      modalType: "ok",
    });
    modalBody.innerHTML = text;
    bootstrapModal.show();
    popUpStatus(true);
    let ok = modal.querySelector("#ok");
    ok.addEventListener("click", (target) => {
      bootstrapModal.hide();
      hideAllModals(closeOthers);
      modalOuter.remove();
      popUpStatus(true);
      resolve(true);
    });
    let close = modal.querySelector("#close");
    close.addEventListener("click", (target) => {
      bootstrapModal.hide();
      hideAllModals(closeOthers);
      modalOuter.remove();
      popUpStatus(true);
      resolve(false);
    });
  });
}

export function createToast() {
  let toastContainer = document.querySelector(".toast-container");

  if (toastContainer == null) {
    toastContainer = document.createElement("div");
    toastContainer.classList =
      "toast-container position-fixed bottom-0 end-0 p-3";
    document.body.appendChild(toastContainer);
    console.log(toastContainer);
  }

  if (!document.querySelector(".toast-container")) {
    alert("no toast container found");
    return false;
  }
  let number = 1;
  let toasts = toastContainer.querySelectorAll(".toast");
  console.log(toasts);
  if (toasts.length > 0) {
    number = toasts.length + 1;
  }
  console.log("Number of Toasts", number);

  let toast = document.createElement("div");
  toast.classList.add("toast");
  toast.setAttribute("id", number);
  toastContainer.appendChild(toast);
  return toast;
}

export function editObject(
  object,
  options = {
    backdrop: "static",
    title: "Nachricht",
    fullscreen: true,
    scrollable: true,
    verticallyCentered: true,
    modalType: "ok | yes / no",
  },
  includeValueMultiple = false,
  editKey = false
) {
  return new Promise((resolve, reject) => {
    const [modal, bootstrapModal, modalBody, modalOuter] = createModal(options);
    bootstrapModal.show();

    modalBody.innerHTML = `
    ${options?.text ?? ""}
    <div id="editObject">
      <div class="header">
        <input type="text" class="form-control textInput" autocomplete="off">
        <button type="button" class="btn btn-primary btn-sm submitBtn">Hinzufügen</button>
        <button type="button" class="btn btn-info btn-sm reloadBtn">Neuladen</button>
      </div>
      
      <div class="main"></div>
    </div>
    `;

    let editObjectList = modalBody.querySelector("#editObject .main");
    let submitBtn = modalBody.querySelector("#editObject .header .submitBtn");
    let textInput = modalBody.querySelector("#editObject .header .textInput");
    submitBtn.addEventListener("click", () => {
      object[Number(Object.keys(object).length) + 1] = textInput.value;
      update();
    });
    let reloadBtn = modalBody.querySelector("#editObject .header .reloadBtn");
    reloadBtn.addEventListener("click", () => {
      update();
    });
    let update = () => {
      editObjectList.innerHTML = "";
      if (!object) object = new Object();
      if (includeValueMultiple) {
        object = { ...Set(object) };
      }
      if (!Object.entries(object) > 0) {
        editObjectList.innerText = "Leer";
        return;
      }
      for (const [key, value] of Object.entries(object)) {
        console.log("key", key, "value", value);
        let item = document.createElement("div");
        item.classList.add("item", "row");
        editObjectList.appendChild(item);
        item.innerHTML = `
          <input type="text" class="textInput col-2" id="key" autocomplete="off" value="${key}">
          <input type="text" class="col-9" id="value" autocomplete="off" value="${value}">
          <button class="btn btn-danger remove col-1">X</button>
        `;

        let keyTextInput = item.querySelector("#key");
        if (editKey) {
          keyTextInput.addEventListener("input", () => {
            delete object[key];
            object[keyTextInput] = keyTextInput.value;
          });
        } else {
          keyTextInput.disabled = true;
        }

        let valueTextInput = item.querySelector("#value");
        valueTextInput.addEventListener("input", () => {
          object[key] = valueTextInput.value;
        });

        let remove = item.querySelector(".remove");
        remove.addEventListener("click", () => {
          delete object[key];
          update();
        });
      }
    };
    update();

    let ok = modal.querySelector("#ok");
    ok.addEventListener("click", (target) => {
      bootstrapModal.hide();
      modalOuter.remove();
      resolve(makeJSON(JSON.stringify(object)));
    });
    let close = modal.querySelector("#close");
    close.addEventListener("click", (target) => {
      bootstrapModal.hide();
      modalOuter.remove();
      resolve(makeJSON(JSON.stringify(object)));
    });
  });
}

export function hideAllModals(check) {
  if (check) {
    let number = 0;
    let modals = document.querySelector("#modalContainer .modal");
    console.log(modals);
    if (modals && modals.length > 0) {
      for (const element of modals) {
        var myModal = bootstrap.Modal.getOrCreateInstance(element); // Returns a Bootstrap modal instance
        myModal.dispose();
        element.parentElement.remove();
      }
      return true;
    }
  } else {
    return false;
  }
}

export async function hideAllToasts(check) {
  if (check) {
    let number = 0;
    let toasts = document.querySelector(".toast-container .toast");
    console.log(toasts);
    if (toasts && toasts.length > 0) {
      for (const element of toasts) {
        var myToast = bootstrap.Toast.getOrCreateInstance(element); // Returns a Bootstrap toast instance
        myToast.dispose();
        element.remove();
      }
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
        false,
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
      if (true) {
        let oldLogin = makeJSON(sessionStorage.getItem("loggedIn"));
        let logincheck = await sendData("CHECK_LOGIN");
        if (logincheck["data"]) {
          let newStatus = logincheck["data"]?.["loginStatus"];
          console.log("login status:", newStatus);
          sessionStorage.setItem("loggedIn", newStatus);
          if (oldLogin != newStatus && makeJSON(sessionStorage.getItem("popupOpen")) != true) {
            window.location.reload();
          }
        } else {
          sessionStorage.setItem("loggedIn", false);
        }
      }
    } catch (e) {
      console.log("Connection lost", e);
    }
  }

  async function connectToServer() {
    try {
      await sendData("HOLDCONTACT");
    } catch (e) {
      await alertUser(
        "Nachricht",
        "Verbindung zum Server unterbrochen " + e,
        true
      );
    }
  }

  sessionStorage.setItem("sessionMessageOPEN", false);
  sessionStorage.setItem("comebackMessageOPEN", false);
  getMessage();
  connectToServer();

  setInterval(() => {
    connectToServer();
    getMessage();
  }, parseInt(await getSettingVal("serverConnectTime")) * 1000);
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

export function removeFromArray(array, value) {
  return array.filter(function (ele) {
    return ele != value;
  });
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
  if (!array || emptyVariable(value)) return array;

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
  permissions = new Array(),
  checkPermissionsFromFrontendPATH = "/includes/userSystem/checkPermissionsFromFrontend.php"
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

export function calculateFileProgress(
  loadedBytes,
  totalBytes,
  lastTime,
  lastBytes,
  timeStarted
) {
  let now = new Date().getTime();
  let percent = Math.round((loadedBytes / totalBytes) * 100 * 10) / 10;

  let uploadedBytes = (loadedBytes - lastBytes);
  console.log(uploadedBytes / 1000000, "Uploaded MB in elapsed time")
  let elapsed = (now - lastTime) / 1000; //in seconds
  console.log("Elapsed:", elapsed);
  console.log(elapsed);
  let bps = Math.round(elapsed ? (uploadedBytes / elapsed) : 0);
  console.log({uploadedBytes, elapsed}, uploadedBytes / elapsed);
  let kbps = Math.round(bps / 1000);
  let mbps = Math.round(bps / 1000000);
  let mbits = Math.round((bps / 1000000) * 8);
  lastBytes = loadedBytes;
  lastTime = now;

  let timeRemaining = ((totalBytes - loadedBytes) / bps);
  console.log("time remaining:", timeRemaining, secondsToArrayOrString(timeRemaining, "String"));

  return { percent, bps, kbps, mbps, mbits, lastBytes, lastTime, elapsed, timeRemaining };
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
  showErrors = true,
  logData = true,
  responseType = "text",
  headers = false,
  showPercentageInToast = false,
  percentageOptions = { download: true, upload: false }, hideDelay = 1000
) {
  //contentType = "application/x-www-form-urlencoded"
  return new Promise(async (resolve, reject) => {
    var xhr = new XMLHttpRequest();
    xhr.open(METHOD, FILEorURL, ascncrounously);

    xhr.setRequestHeader("Content-Type", contentType);
    if (headers && Object.keys(headers).length > 0) {
      for (let [key, value] of Object.keys(headers)) {
        xhr.setRequestHeader(key, value);
      }
    }
    xhr.responseType = responseType;
    xhr.addEventListener("error", (e) => {
      console.log(e);
      resolve(false);
    });
    xhr.addEventListener("abort", (e) => {
      console.log(e);
      resolve(false);
    });

    let bootstrapToast;
    let toast;
    if (showPercentageInToast) {
      toast = createToast();

      toast.classList = `toast`;
      toast.setAttribute("role", "status");
      toast.setAttribute("data-bs-autohide", "false");
      toast.setAttribute("aria-live", "polite");

      toast.innerHTML = `
      <div class="toast-header">
        <strong class="me-auto">Status</strong>
        <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
      <div class="toast-body">
      </div>
      `;
      let toastBody = toast.querySelector(".toast-body");

      bootstrapToast = new bootstrap.Toast(toast);
      bootstrapToast.show();

      //Close Btn
      let closebtn = toast.querySelector(".btn-close");
      closebtn.addEventListener("click", () => {
        bootstrapToast.hide();
        toast.remove();
      });

      if (percentageOptions?.upload) {
        let uploadContainer = document.createElement("div");
        uploadContainer.classList.add("uploadStatus");
        toastBody.appendChild(uploadContainer);
        let lastTime = new Date().getTime();
        let lastBytes = 0;
        let timeStarted = new Date().getTime();
        xhr.upload.onprogress = async (evt) => {
          if (evt.lengthComputable) {
            let fileProgress = calculateFileProgress(
              evt.loaded,
              evt.total,
              lastTime,
              lastBytes,
              timeStarted
            );
            lastBytes = fileProgress.lastBytes; //Set last bytes
            lastTime = new Date().getTime();
            if (toast && uploadContainer) {
              uploadContainer.innerHTML = `<span>Hochladen:</span><progress value=${
                fileProgress.percent
              } max=100></progress> <span>${
                fileProgress.percent
              } %</span><div>Zeit verbleibend: ${secondsToArrayOrString(
                fileProgress.timeRemaining,
                "String"
              )}</div>`;
              if (fileProgress.percent === 100) {
                window.setTimeout(async () => {
                  await bootstrapToast.hide();
                  toast.remove();
                }, hideDelay);
              }
            }
          } else {
            console.log("event is not computable");
          }
        };
      }

      if (percentageOptions?.download) {
        let downloadContainer = document.createElement("div");
        downloadContainer.classList.add("downloadStatus");
        toastBody.appendChild(downloadContainer);
        let lastTime = new Date().getTime();
        let lastBytes = 0;
        let timeStarted = new Date().getTime();
        xhr.onprogress = async (evt) => {
          console.log(evt.loaded);
          if (evt.lengthComputable) {
            let fileProgress = calculateFileProgress(
              evt.loaded,
              evt.total,
              lastTime,
              lastBytes,
              timeStarted
            );
            lastBytes = fileProgress.lastBytes; //Set last bytes
            lastTime = new Date().getTime();
            if (toast && downloadContainer) {
              downloadContainer.innerHTML = `<span>Herunterladen:</span><progress value=${
                fileProgress.percent
              } max=100></progress> <span>${
                fileProgress.percent
              } %</span><div>Zeit verbleibend: ${secondsToArrayOrString(
                fileProgress.timeRemaining,
                "String"
              )}</div>`;
            } else {
              console.log("DOWNLOAD: Percent completed:", percentComplete);
            }
          } else {
            console.log("event is not computable");
          }
        };
      }

      if (!percentageOptions?.download && !percentageOptions?.upload) {
        bootstrapToast.hide();
        toast.remove();
      }

    }

    xhr.send(request);

    //Wenn Antwort
    xhr.onload = async () => {
      if (showPercentageInToast) {
        window.setTimeout(async () => {
          bootstrapToast?.hide();
          toast?.remove();
        }, hideDelay);
      }
      if (xhr.status == 200) {
        if (logData) {
          console.log(xhr.response);
        }
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
        if (logData) {
          console.log(makeJSON(xhr.response));
        }
        if (showPermissionDenied && jsonResponse) {
          let permissionDenied = jsonResponse["permissionDenied"];
          if (permissionDenied == true) {
            let message = jsonResponse["message"];
            await permissionDENIED(message);
            resolve(false);
          }
        }
        resolve(xhr.response);
      } else if (xhr.status == 404 || xhr.status == 0 || xhr.status == 500) {
        console.error("XHR Error", xhr.status, FILEorURL);
        resolve(false);
      }
    };
  });
}

export async function sendXhrREQUESTCustomFormData(
  formData,
  FILEorURL,
  showMessages = false,
  allowRedirect = false,
  showPermissionDenied = true,
  showErrors = true,
  logData = true,
  responseType = "text",
  headers = false,
  showPercentageInToast = true,
  percentageOptions = { download: false, upload: true }, hideDelay
) {
  return new Promise(async (resolve, reject) => {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", FILEorURL, true);
    if (headers && Object.keys(headers).length > 0) {
      for (let [key, value] of Object.keys(headers)) {
        xhr.setRequestHeader(key, value);
      }
    }
    xhr.responseType = responseType;

    let bootstrapToast;
    let toast;
    if (showPercentageInToast) {
      toast = createToast();

      toast.classList = `toast`;
      toast.setAttribute("role", "status");
      toast.setAttribute("data-bs-autohide", "false");
      toast.setAttribute("aria-live", "polite");

      toast.innerHTML = `
      <div class="toast-header">
        <strong class="me-auto">Status</strong>
        <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
      <div class="toast-body">
      </div>
      `;
      let toastBody = toast.querySelector(".toast-body");

      bootstrapToast = new bootstrap.Toast(toast);
      bootstrapToast.show();

      //Close Btn
      let closebtn = toast.querySelector(".btn-close");
      closebtn.addEventListener("click", () => {
        bootstrapToast.hide();
        toast.remove();
      });

      if (percentageOptions?.upload) {
        let uploadContainer = document.createElement("div");
        uploadContainer.classList.add("uploadStatus");
        toastBody.appendChild(uploadContainer);
        let lastTime = new Date().getTime();
        let lastBytes = 0;
        let timeStarted = new Date().getTime();
        xhr.upload.onprogress = async (evt) => {
          if (evt.lengthComputable) {
            let fileProgress = calculateFileProgress(
              evt.loaded,
              evt.total,
              lastTime,
              lastBytes,
              timeStarted
            );
            lastBytes = fileProgress.lastBytes; //Set last bytes
            lastTime = new Date().getTime();
            if (toast && uploadContainer) {
              uploadContainer.innerHTML = `<span>Hochladen:</span><progress value=${
                fileProgress.percent
              } max=100></progress> <span>${
                fileProgress.percent
              } %</span><div>Zeit verbleibend: ${secondsToArrayOrString(
                fileProgress.timeRemaining,
                "String"
              )}</div>`;
              if (fileProgress.percent === 100) {
                window.setTimeout(async () => {
                  await bootstrapToast.hide();
                  toast.remove();
                }, hideDelay);
              }
            }
          } else {
            console.log("event is not computable");
          }
        };
      }

      if (percentageOptions?.download) {
        let downloadContainer = document.createElement("div");
        downloadContainer.classList.add("downloadStatus");
        toastBody.appendChild(downloadContainer);
        let lastTime = new Date().getTime();
        let lastBytes = 0;
        let timeStarted = new Date().getTime();
        xhr.onprogress = async (evt) => {
          console.log(evt.loaded);
          if (evt.lengthComputable) {
            let fileProgress = calculateFileProgress(
              evt.loaded,
              evt.total,
              lastTime,
              lastBytes,
              timeStarted
            );
            lastBytes = fileProgress.lastBytes; //Set last bytes
            lastTime = new Date().getTime();
            if (toast && downloadContainer) {
              downloadContainer.innerHTML = `<span>Herunterladen:</span><progress value=${
                fileProgress.percent
              } max=100></progress> <span>${
                fileProgress.percent
              } %</span><div>Zeit verbleibend: ${secondsToArrayOrString(
                fileProgress.timeRemaining,
                "String"
              )}</div>`;
            } else {
              console.log("DOWNLOAD: Percent completed:", percentComplete);
            }
          } else {
            console.log("event is not computable");
          }
        };
      }

      if (!percentageOptions?.download && !percentageOptions?.upload) {
        bootstrapToast.hide();
        toast.remove();
      }
    }

    xhr.send(formData);

    //Wenn Antwort
    xhr.onload = async () => {
      if (showPercentageInToast) {
        window.setTimeout(async () => {
          bootstrapToast?.hide();
          toast?.remove();
        }, hideDelay);
      }
      if (xhr.status == 200) {
        if (logData) {
          console.log(xhr.response);
        }
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
        if (logData) {
          console.log(makeJSON(xhr.response));
        }
        if (showPermissionDenied && jsonResponse) {
          let permissionDenied = jsonResponse["permissionDenied"];
          if (permissionDenied == true) {
            let message = jsonResponse["message"];
            await permissionDENIED(message);
            resolve(false);
          }
        }
        resolve(xhr.response);
      } else if (xhr.status == 404 || xhr.status == 0 || xhr.status == 500) {
        console.error("XHR Error", xhr.status, FILEorURL);
        resolve(false);
      }
    };
    xhr.onerror = () => {
      resolve(false);
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

export function secondsToArrayOrString(
  seconds,
  StringOrArray = "String",
  options = {
    wordspelling: {
      seconds: { singular: "Sekunde", plural: "Sekunden" },
      minutes: { singular: "Minute", plural: "Minuten" },
      hours: { singular: "Stunde", plural: "Stunden" },
      days: { singular: "Tag", plural: "Tage" },
      years: { singular: "Jahr", plural: "Jahre" },
    },
    empty: "keine"
  },
  logConsole = false
) {
  seconds = Number(seconds);

  let yearsRemaining = Math.floor(seconds / (60 * 60 * 24 * 365));
  let daysRemaining = Math.floor((seconds / (60 * 60 * 24)) % 365);
  let hoursRemaining = Math.floor((seconds / (60 * 60)) % 24);
  let minutesRemaining = Math.floor((seconds / 60) % 60);
  let secondsRemaining = Math.floor(seconds % 60);

  if (logConsole)
    console.log({
      years: yearsRemaining,
      days: daysRemaining,
      hours: hoursRemaining,
      minutes: minutesRemaining,
      secondsRemaining,
    });

  if (StringOrArray === "Array") {
    return {
      years: yearsRemaining,
      days: daysRemaining,
      hours: hoursRemaining,
      minutes: minutesRemaining,
      seconds: secondsRemaining,
    };
  } else {
    let string = "";
    //Years
    if (yearsRemaining > 0 && yearsRemaining == 1)
      string = `${string} ${yearsRemaining} ${options?.wordspelling?.years.singular}`;
    if (yearsRemaining > 0 && yearsRemaining > 1)
      string = `${string} ${yearsRemaining} ${options?.wordspelling?.years.plural}`;
    //Days
    // console.log("1", string);
    if (daysRemaining > 0 && daysRemaining == 1)
      string = `${string} ${daysRemaining} ${options?.wordspelling?.days.singular}`;
    if (daysRemaining > 0 && daysRemaining > 1)
      string = `${string} ${daysRemaining} ${options?.wordspelling?.days.plural}`;
    //Hours
    // console.log("2", string);
    if (hoursRemaining > 0 && hoursRemaining == 1)
      string = `${string} ${hoursRemaining} ${options?.wordspelling?.hours.singular}`;
    if (hoursRemaining > 0 && hoursRemaining > 1)
      string = `${string} ${hoursRemaining} ${options?.wordspelling?.hours.plural}`;
    //Minutes
    // console.log("3", string);
    if (minutesRemaining > 0 && minutesRemaining == 1)
      string = `${string} ${minutesRemaining} ${options?.wordspelling?.minutes.singular}`;
    if (minutesRemaining > 0 && minutesRemaining > 1)
      string = `${string} ${minutesRemaining} ${options?.wordspelling?.minutes.plural}`;
    //Seconds
    // console.log("4", string);
    if (secondsRemaining > 0 && secondsRemaining == 1)
      string = `${string} ${secondsRemaining} ${options?.wordspelling?.seconds.singular}`;
    if (secondsRemaining > 0 && secondsRemaining > 1)
      string = `${string} ${secondsRemaining} ${options?.wordspelling?.seconds.plural}`;
    // console.log("5", string)

    if (isEmptyInput(string)) {
      return options?.empty ?? "";
    }
    return string;
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
            console.log("Choose From Array:", this.chooseFromArray);
          }
          if (this.chooseFromArray && this.chooseFromArray.length > 0) {
            for (const current of this.chooseFromArray) {
              if (current.toLowerCase().includes(input.toLowerCase())) {
                resultArray = addToArray(resultArray, current, false);
              }
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

export async function getSettingVal(setting) {
  return await sendXhrREQUEST(
    "POST",
    "GETsettingVal&setting=" + setting,
    "/includes/generalFunctions.php",
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
    return true;
  } catch (err) {
    document.body.removeChild(textArea);
    document.body.removeChild(textArea);
    console.error("Fallback: Oops, unable to copy", err);
  }
  return false;
}

export function copyTextToClipboard(text) {
  return new Promise((resolve, reject) => {
    if (!navigator.clipboard) {
      if (fallbackCopyTextToClipboard(text)) {
        resolve(true);
      } else {
        resolve(false);
      }
    }
    navigator.clipboard.writeText(text).then(
      function () {
        console.log("Async: Copying to clipboard was successful!");
        resolve(true);
      },
      function (err) {
        console.error("Async: Could not copy text: ", err);
        resolve(false);
      }
    );
  });
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

export function string_contains_all_values(
  string,
  values,
  caseSensitive = true
) {
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

export function boolToString(bool, data = { true: "Ja", false: "Nein" }) {
  if (bool != typeof "boolean") {
    bool = Boolean(bool);
  }
  if (bool === true) {
    return data.true;
  } else {
    return data.false;
  }
}

export function valueToString(
  value,
  data = { true: "Ja", false: "Nein" },
  emptyStringIfEmpty = false
) {
  if (emptyStringIfEmpty) {
    if (!data[value] || isEmptyInput(data[value])) {
      return "";
    }
    return data[value];
  } else {
    return data[value] ?? value;
  }
}

export function swapArrayElements(arr, indexA, indexB) {
  var temp = arr[indexA];
  arr[indexA] = arr[indexB];
  arr[indexB] = temp;
}

export function escapeURI(input) {
  if (!input) return input;
  if (typeof input === "string") {
    return escapeURI(input);
  } else if (typeof input == typeof new Array()) {
    for (const [key, value] of input) {
      input[key] = escapeURI(value);
    }
    return input;
  } else {
    return input;
  }
}

//Medienverwaltung
export function setMedia(
  data = {
    mediaID: "1",
    type: "image",
    isOnlineSource: false,
    volume: 100,
  },
  container,
  showAnyway = false
) {
  return new Promise(async (resolve, reject) => {
    if (!container) {
      container = document.createElement("div");
      container.classList.add("mediaContainer");
      document.body.appendChild(container);
    }
    if (data.mediaID) {
      //Source is saved in Table: mediaVerwaltung
      let mediaData = await makeJSON(
        await sendXhrREQUEST(
          "POST",
          "getAttribute&type=medienverwaltung&secondOperation=getMediaData&mediaID=" +
            data.mediaID,
          "/includes/getAttributes.php",
          "application/x-www-form-urlencoded",
          true,
          true,
          false,
          true
        )
      );
      console.log("MEDIA DATA RECIEVED =>", mediaData);
      if (!mediaData) resolve(false);

      //Set volume functionality
      mediaData = {
        ...mediaData,
        volume: parseFloat(data?.volume >= 0 ? data.volume / 100 : 1.0),
      };

      if (makeJSON(window.localStorage.getItem("SETTING_lightDataUsage"))) {
        let warnContainer = document.createElement("div");
        warnContainer.classList.add("SETTING_lightDataUsage-warning");
        warnContainer.setAttribute("style", "position: relative;");
        warnContainer.innerHTML = `
        <div class="header">Laden von Medien</div>
        <div class="content">Hier wird verhindert, dass Inhalt geladen wird, weil du den Datensparmodus aktiviert hast. Um diesen zu laden klicke auf diese Fläche.</div>
        <div class="footer">Typ: ${valueToString(mediaData.type, {
          image: "Bild",
          video: "Video",
          audio: "Audio",
        })}</div>
        `;

        //Listen to click
        warnContainer.addEventListener(
          "click",
          async () => {
            container.removeChild(warnContainer);
            if (mediaData.type === "image") {
              await setImage(
                mediaData.isOnlineSource,
                showAnyway,
                mediaData,
                container
              );
            } else if (mediaData.type === "video") {
              await setVideo(
                mediaData.isOnlineSource,
                showAnyway,
                mediaData,
                container
              );
            } else if (mediaData.type === "audio") {
              await setAudio(
                mediaData.isOnlineSource,
                showAnyway,
                mediaData,
                container
              );
            } else {
              await setOtherMedia(
                mediaData.isOnlineSource,
                showAnyway,
                mediaData,
                container
              );
            }
          },
          { once: true }
        );
        container.appendChild(warnContainer);
      } else {
        if (mediaData.type === "image") {
          await setImage(
            mediaData.isOnlineSource,
            showAnyway,
            mediaData,
            container
          );
        } else if (mediaData.type === "video") {
          await setVideo(
            mediaData.isOnlineSource,
            showAnyway,
            mediaData,
            container
          );
        } else if (mediaData.type === "audio") {
          await setAudio(
            mediaData.isOnlineSource,
            showAnyway,
            mediaData,
            container
          );
        } else {
          await setOtherMedia(
            mediaData.isOnlineSource,
            showAnyway,
            mediaData,
            container
          );
        }
      }
    } else {
      if (!data?.url && !data?.path) resolve(false);
      data = {
        ...data,
        olume: parseFloat(data?.volume >= 0 ? data.volume / 100 : 1.0),
      };
      //Source is not saved in Table - Normal Source
      if (makeJSON(window.localStorage.getItem("SETTING_lightDataUsage"))) {
        let warnContainer = document.createElement("div");
        warnContainer.classList.add("SETTING_lightDataUsage-warning");
        warnContainer.setAttribute("style", "position: relative;");
        warnContainer.innerHTML = `
        <div class="header">Laden von Medien</div>
        <div class="content">Hier wird verhindert, dass Inhalt geladen wird, weil du den Datensparmodus aktiviert hast. Um diesen zu laden klicke auf diese Fläche.</div>
        <div class="footer">Typ: ${valueToString(data.type, {
          image: "Bild",
          video: "Video",
          audio: "Audio",
        })}</div>
        `;

        //Listen to click
        warnContainer.addEventListener(
          "click",
          async () => {
            container.removeChild(warnContainer);
            if (data.type === "image") {
              await setImage(data.isOnlineSource, showAnyway, data, container);
            } else if (data.type === "video") {
              await setVideo(data.isOnlineSource, showAnyway, data, container);
            } else if (data.type === "audio") {
              await setAudio(data.isOnlineSource, showAnyway, data, container);
            } else {
              await setOtherMedia(
                data.isOnlineSource,
                showAnyway,
                data,
                container
              );
            }
          },
          { once: true }
        );
        container.appendChild(warnContainer);
      } else {
        if (data.type === "image") {
          await setImage(data.isOnlineSource, showAnyway, data, container);
        } else if (data.type === "video") {
          await setVideo(data.isOnlineSource, showAnyway, data, container);
        } else if (data.type === "audio") {
          await setAudio(data.isOnlineSource, showAnyway, data, container);
        } else {
          await setOtherMedia(data.isOnlineSource, showAnyway, data, container);
        }
      }
    }

    resolve(true);
  });
}

function setImage(isOnlineSource, showAnyway, mediaData, container) {
  return new Promise(async (resolve, reject) => {
    if (!mediaData) resolve(false);

    let getData = async (mediaData) => {
      if (mediaData.urlIsBLOB) return mediaData.blobData;
      //Download -> GET BLOB URL
      mediaData.path = mediaData.path ?? mediaData.url;
      let downloadURL = mediaData.path;

      if (!mediaData.isOnlineSource) {
        //SELF HOSTED IMAGES
        if (mediaData.isBlob) {
          return await getBLOBData({
            serverRequest: {
              request:
                "getAttribute&type=medienverwaltung&secondOperation=getBlob&thirdOperation=primary&mediaID=" +
                mediaData.mediaID,
              path: "/includes/getAttributes.php",
            },
          });
        }
        if (mediaData.inMediaFolder) {
          downloadURL = `${mediaData.mediaFolderPath}${mediaData.path}/${mediaData.filename}`;
        } else {
          downloadURL = `${mediaData.path}/${mediaData.filename}`;
        }
        console.log("THE PATH FOR THE IMAGE IS:", downloadURL);
        return await getBLOBData({ url: downloadURL });
      }
      console.log("THE PATH FOR THE IMAGE IS:", downloadURL);
      return await getBLOBData({ url: downloadURL });
    };

    let getPath = async (mediaData) => {
      mediaData.path = mediaData.path ?? mediaData.url;
      let downloadURL = mediaData.path;

      if (!mediaData.isOnlineSource) {
        //SELF HOSTED IMAGES
        if (mediaData.isBlob) {
          return await getSettingVal("servername");
        }
        if (mediaData.inMediaFolder) {
          downloadURL = `${mediaData.mediaFolderPath}${mediaData.path}/${mediaData.filename}`;
        } else {
          downloadURL = `${mediaData.path}/${mediaData.filename}`;
        }
        console.log("THE PATH FOR THE IMAGE IS:", downloadURL);
      }
      return downloadURL;
    };

    let imageContainer = document.createElement("div");
    // imageContainer.classList.add("mediaContainer", "image", "fullscreenToggle");
    // imageContainer.setAttribute("id", "fullscreenContainer");

    container.appendChild(imageContainer);
    if (isOnlineSource && !showAnyway) {
      let warnContainer = document.createElement("div");
      warnContainer.classList.add("preventExternalMedia-warning");
      warnContainer.setAttribute("style", "position: relative;");
      warnContainer.innerHTML = `
      <div class="header">Externener Inhalt</div>
      <div class="content">Hier wird verhindert, dass externener Inhalt  von ${await getPath(
        mediaData
      )} geladen wird. Um diesen zu laden klicke auf diese Fläche.</div>
      <div class="footer">Typ: Bild</div>
      `;

      //Listen to click
      warnContainer.addEventListener(
        "click",
        async () => {
          imageContainer.classList.add("loading");
          warnContainer.classList.add("loading");
          let data = await getData(mediaData);
          console.log("IMAGE DATA=>", data);
          imageContainer.innerHTML = `<img src="${data.url}" alt="${data.originURL}">`;
          imageContainer.classList.remove("loading");
        },
        { once: true }
      );
      imageContainer.appendChild(warnContainer);
    } else {
      imageContainer.classList.add("loading");
      let data = await getData(mediaData);
      imageContainer.innerHTML = `<img src="${data.url}" alt="${data.originURL}">`;
      imageContainer.classList.remove("loading");
    }
    resolve(true);
  });
}

export async function getThumbnailURL(mediaData) {
  //GET thumbnail data if enabled
  if (mediaData.urlIsBLOB) return mediaData.url ?? mediaData.path;
  if (mediaData.thumbnail) {
    if (mediaData.thumbnailIsOnlineSource) {
      return await getBLOBData({
        url: mediaData.thumbnailPath,
      });
    } else {
      if (mediaData.thumbnailInMediaFolder) {
        return await getBLOBData({
          url: `${
            mediaData?.mediaFolderPath ?? (await getSettingVal("mediaPATH"))
          }${mediaData?.thumbnailPath}/${mediaData?.thumbnailFileName}`,
        });
      } else {
        if (mediaData.thumbnailIsBlob) {
          return await getBLOBData({
            serverRequest: {
              request:
                "getAttribute&type=medienverwaltung&secondOperation=getBlob&thirdOperation=thumbnail&mediaID=" +
                data.mediaID,
              path: "/includes/getAttributes.php",
            },
          });
        } else {
          return await getBLOBData({
            url: `${mediaData.thumbnailPath}/${mediaData.thumbnailFileName}`,
          });
        }
      }
    }
  }
  return false;
}
function setVideo(isOnlineSource, showAnyway, mediaData, container) {
  return new Promise(async (resolve, reject) => {
    if (!mediaData) resolve(false);
    let videoContainer = document.createElement("div");
    videoContainer.classList.add("mediaContainer", "video");
    container.appendChild(videoContainer);

    let getData = async (mediaData) => {
      if (mediaData.urlIsBLOB) return mediaData.blobData;
      //Download -> GET BLOB URL
      mediaData.path = mediaData.path ?? mediaData.url;
      let downloadURL = mediaData.path;
      if (!mediaData.isOnlineSource) {
        //SELF HOSTED IMAGES
        if (mediaData.isBlob) {
          return await getBLOBData({
            serverRequest: {
              request:
                "getAttribute&type=medienverwaltung&secondOperation=getBlob&thirdOperation=primary&mediaID=" +
                mediaData.mediaID,
              path: "/includes/getAttributes.php",
            },
          });
        }
        if (mediaData.inMediaFolder) {
          downloadURL = `${mediaData.mediaFolderPath}${mediaData.path}/${mediaData.filename}`;
        } else {
          downloadURL = `${mediaData.path}/${mediaData.filename}`;
        }
        console.log("THE PATH FOR THE VIDEO IS:", downloadURL);
        return await getBLOBData({ url: downloadURL });
      }
      return await getBLOBData({ url: downloadURL });
    };

    let getPath = async (mediaData) => {
      mediaData.path = mediaData.path ?? mediaData.url;
      let downloadURL = mediaData.path;

      if (!mediaData.isOnlineSource) {
        //SELF HOSTED IMAGES
        if (mediaData.isBlob) {
          return await getSettingVal("servername");
        }
        if (mediaData.inMediaFolder) {
          downloadURL = `${mediaData.mediaFolderPath}${mediaData.path}/${mediaData.filename}`;
        } else {
          downloadURL = `${mediaData.path}/${mediaData.filename}`;
        }
        console.log("THE PATH FOR THE VIDEO IS:", downloadURL);
      }
      return downloadURL;
    };

    if (
      (isOnlineSource && !showAnyway) ||
      (mediaData.thumbnailIsOnlineSource && !showAnyway)
    ) {
      let warnContainer = document.createElement("div");
      warnContainer.classList.add("preventExternalMedia-warning");
      warnContainer.setAttribute("style", "position: relative;");
      warnContainer.innerHTML = `
      <div class="header">Externener Inhalt</div>
      <div class="content">Hier wird verhindert, dass externener Inhalt von ${await getPath(
        mediaData
      )} geladen wird. Um diesen zu laden klicke auf diese Fläche.</div>
      <div class="footer">Typ: Video</div>
      `;

      //Listen to click
      warnContainer.addEventListener(
        "click",
        async () => {
          videoContainer.classList.add("loading");
          warnContainer.classList.add("loading");
          let data = await getData(mediaData);
          //GET thumbnail data if enabled
          let thumbnailURL = (await getThumbnailURL(mediaData)) ?? false;

          videoContainer.innerHTML = `
          <video controls ${
            thumbnailURL.url ? `poster="${thumbnailURL.url}"` : ""
          } preload="metadata">
            <source src="${data.url}" type="${
            data?.blob?.type ?? mediaData?.mimeType ?? ""
          }"/>
            Das Video wird von deinem Browser nicht unterstützt, klicke es stattdessen an: <a href="${
              data.url
            }" target="_blank">Zum Video</a>
          </video>
          `;
          try {
            videoContainer.querySelector("video").volume =
              mediaData.volume ?? 1.0;
          } catch (e) {
            console.log(
              "Error in setting volume: ",
              mediaData.volume,
              e,
              videoContainer
            );
          }

          videoContainer.classList.remove("loading");
        },
        { once: true }
      );
      videoContainer.appendChild(warnContainer);
    } else {
      videoContainer.classList.add("loading");
      let data = await getData(mediaData);
      //GET thumbnail data if enabled
      let thumbnailURL = (await getThumbnailURL(mediaData)) ?? false;

      videoContainer.innerHTML = `
      <video controls ${
        thumbnailURL.url ? `poster="${thumbnailURL.url}"` : ""
      } preload="metadata">
        <source src="${data.url}" type="${
        data?.blob?.type ?? mediaData?.mimeType ?? ""
      }"/>
        Das Video wird von deinem Browser nicht unterstützt, klicke es stattdessen an: <a href="${
          data.url
        }" target="_blank">Zum Video</a>
      </video>
      `;
      try {
        videoContainer.querySelector("video").volume = mediaData.volume ?? 1.0;
      } catch (e) {
        console.log(
          "Error in setting volume: ",
          mediaData.volume,
          e,
          videoContainer
        );
      }
      videoContainer.classList.remove("loading");
    }

    resolve(true);
  });
}

function setAudio(isOnlineSource, showAnyway, mediaData, container) {
  return new Promise(async (resolve, reject) => {
    if (!mediaData) resolve(false);
    let audioContainer = document.createElement("div");
    audioContainer.setAttribute("style", "position: relative;");
    audioContainer.classList.add("mediaContainer", "audio");
    container.appendChild(audioContainer);

    let getData = async (mediaData) => {
      if (mediaData.urlIsBLOB) return mediaData.blobData;
      //Download -> GET BLOB URL
      mediaData.path = mediaData.path ?? mediaData.url;
      let downloadURL = mediaData.path;
      if (!mediaData.isOnlineSource) {
        //SELF HOSTED IMAGES
        if (mediaData.isBlob) {
          return await getBLOBData({
            serverRequest: {
              request:
                "getAttribute&type=medienverwaltung&secondOperation=getBlob&thirdOperation=primary&mediaID=" +
                mediaData.mediaID,
              path: "/includes/getAttributes.php",
            },
          });
        }
        if (mediaData.inMediaFolder) {
          downloadURL = `${mediaData.mediaFolderPath}${mediaData.path}/${mediaData.filename}`;
        } else {
          downloadURL = `${mediaData.path}/${mediaData.filename}`;
        }
        console.log("THE PATH FOR THE AUDIO IS:", downloadURL);
        return await getBLOBData({ url: downloadURL });
      }
      return await getBLOBData({ url: downloadURL });
    };

    let getPath = async (mediaData) => {
      mediaData.path = mediaData.path ?? mediaData.url;
      let downloadURL = mediaData.path;

      if (!mediaData.isOnlineSource) {
        //SELF HOSTED IMAGES
        if (mediaData.isBlob) {
          return await getSettingVal("servername");
        }
        if (mediaData.inMediaFolder) {
          downloadURL = `${mediaData.mediaFolderPath}${mediaData.path}/${mediaData.filename}`;
        } else {
          downloadURL = `${mediaData.path}/${mediaData.filename}`;
        }
        console.log("THE PATH FOR THE AUDIO IS:", downloadURL);
      }
      return downloadURL;
    };

    if (isOnlineSource && !showAnyway) {
      let warnContainer = document.createElement("div");
      warnContainer.classList.add("preventExternalMedia-warning");
      warnContainer.setAttribute("style", "position: relative;");
      warnContainer.innerHTML = `
      <div class="header">Externener Inhalt</div>
      <div class="content">Hier wird verhindert, dass externener Inhalt von ${await getPath(
        mediaData
      )} geladen wird. Um diesen zu laden klicke auf diese Fläche.</div>
      <div class="footer">Typ: Audio</div>
      `;

      //Listen to click
      warnContainer.addEventListener(
        "click",
        async () => {
          audioContainer.classList.add("loading");
          warnContainer.classList.add("loading");
          let data = await getData(mediaData);
          audioContainer.innerHTML = `
          <audio controls>
            <source src="${data.url}" type="${
            data?.blob?.type ?? mediaData?.mimeType ?? ""
          }">
          Die Auio wird von deinem Browser nicht unterstützt, klicke sie stattdessen an: <a href="${
            data.url
          }" target="_blank">Zur Audio</a>
            </audio>
          `;
          try {
            audioContainer.querySelector("audio").volume =
              mediaData.volume ?? 1.0;
          } catch (e) {
            console.log(
              "Error in setting volume: ",
              mediaData.volume,
              e,
              audioContainer
            );
          }
          audioContainer.classList.remove("loading");
        },
        { once: true }
      );
      audioContainer.appendChild(warnContainer);
    } else {
      audioContainer.classList.add("loading");
      let data = await getData(mediaData);
      audioContainer.innerHTML = `
          <audio controls>
            <source src="${data.url}" type="${
        data?.blob?.type ?? mediaData?.mimeType ?? ""
      }">
          Die Auio wird von deinem Browser nicht unterstützt, klicke sie stattdessen an: <a href="${
            data.url
          }" target="_blank">Zur Audio</a>
            </audio>
          `;
      try {
        audioContainer.querySelector("audio").volume = mediaData.volume ?? 1.0;
      } catch (e) {
        console.log(
          "Error in setting volume: ",
          mediaData.volume,
          e,
          audioContainer
        );
      }
      audioContainer.classList.remove("loading");
    }
    resolve(true);
  });
}

function setOtherMedia(isOnlineSource, showAnyway, mediaData, container) {
  return new Promise(async (resolve, reject) => {
    if (!mediaData) resolve(false);

    let getData = async (mediaData) => {
      if (mediaData.urlIsBLOB) return mediaData.blobData;
      //Download -> GET BLOB URL
      mediaData.path = mediaData.path ?? mediaData.url;
      let downloadURL = mediaData.path;
      if (!mediaData.isOnlineSource) {
        //SELF HOSTED IMAGES
        if (mediaData.isBlob) {
          return await getBLOBData({
            serverRequest: {
              request:
                "getAttribute&type=medienverwaltung&secondOperation=getBlob&thirdOperation=primary&mediaID=" +
                mediaData.mediaID,
              path: "/includes/getAttributes.php",
            },
          });
        }
        if (mediaData.inMediaFolder) {
          downloadURL = `${mediaData.mediaFolderPath}${mediaData.path}/${mediaData.filename}`;
        } else {
          downloadURL = `${mediaData.path}/${mediaData.filename}`;
        }
        console.log("THE PATH FOR THE MEDIA IS:", downloadURL);
        return await getBLOBData({ url: downloadURL });
      }
      return await getBLOBData({ url: downloadURL });
    };

    let getPath = async (mediaData) => {
      mediaData.path = mediaData.path ?? mediaData.url;
      let downloadURL = mediaData.path;

      if (!mediaData.isOnlineSource) {
        //SELF HOSTED IMAGES
        if (mediaData.isBlob) {
          return await getSettingVal("servername");
        }
        if (mediaData.inMediaFolder) {
          downloadURL = `${mediaData.mediaFolderPath}${mediaData.path}/${mediaData.filename}`;
        } else {
          downloadURL = `${mediaData.path}/${mediaData.filename}`;
        }
        console.log("THE PATH FOR THE MEDIA IS:", downloadURL);
      }
      return downloadURL;
    };

    let mediaContainer = document.createElement("div");
    mediaContainer.classList.add("mediaContainer", "other");
    container.appendChild(mediaContainer);
    if (isOnlineSource && !showAnyway) {
      let warnContainer = document.createElement("div");
      warnContainer.classList.add("preventExternalMedia-warning");
      warnContainer.setAttribute("style", "position: relative;");
      warnContainer.innerHTML = `
      <div class="header">Externener Inhalt</div>
      <div class="content">Hier wird verhindert, dass externener Inhalt  von ${await getPath(
        mediaData
      )} geladen wird. Um diesen zu laden klicke auf diese Fläche.</div>
      <div class="footer">Typ: Anderer</div>
      `;

      //Listen to click
      warnContainer.addEventListener(
        "click",
        async () => {
          mediaContainer.classList.add("loading");
          warnContainer.classList.add("loading");
          let data = await getData(mediaData);
          console.log("DATA=>", data);
          mediaContainer.innerHTML = `<object data="${data.url}" type="${
            data?.blob?.type ?? mediaData?.mimeType ?? ""
          }">
          </object>`;
          try {
            mediaContainer.querySelector("object").volume =
              mediaData.volume ?? 1.0;
          } catch (e) {
            console.log(
              "Error in setting volume: ",
              mediaData.volume,
              e,
              mediaContainer
            );
          }

          mediaContainer.classList.remove("loading");
        },
        { once: true }
      );
      mediaContainer.appendChild(warnContainer);
    } else {
      mediaContainer.classList.add("loading");
      let data = await getData(mediaData);
      console.log("DATA=>", data);
      mediaContainer.innerHTML = `<object data="${data.url}" type="${
        data?.blob?.type ?? mediaData?.mimeType ?? ""
      }">
      </object>`;
      try {
        mediaContainer.querySelector("object").volume = mediaData.volume ?? 1.0;
      } catch (e) {
        console.log(
          "Error in setting volume: ",
          mediaData.volume,
          e,
          mediaContainer
        );
      }
      mediaContainer.classList.remove("loading");
    }
    resolve(true);
  });
}
export function getNewestVersion(
  cacheControl = window.localStorage.getItem("cacheControl")
) {
  let time = new Date();

  if (cacheControl == "no-cache") {
    return time.getTime();
  } else if (cacheControl == "daily") {
    let day = time.getDate();
    let month = time.getMonth() + 1;
    let year = time.getFullYear();
    return `${day}-${month}-${year}`;
  } else if (cacheControl == "auto" || !cacheControl) {
    window.localStorage.setItem("cacheControl", "auto");
    return "";
  }
}

export async function getBLOBData(
  data = {
    serverRequest: {
      request: "medienverwaltung&operation=other",
      path: "/includes/data.php",
    },
    url: "",
    cache: "no - auto - daily"
  }
) {
  return new Promise(async (resolve, reject) => {
    try {
      let blob;
      if (data.url) {
        blob = await sendXhrREQUEST(
          "GET",
          false,
          data.url + `?v=${getNewestVersion()}`,
          "application/x-www-form-urlencoded",
          true,
          false,
          false,
          false,
          false,
          false,
          "blob",
          false, false
        );
      } else if (data.serverRequest) {
        blob = await sendXhrREQUEST(
          "POST",
          data.serverRequest.request,
          data.serverRequest.path,
          "application/x-www-form-urlencoded",
          true,
          false,
          false,
          false,
          false,
          false,
          "blob",
         false, false
        );
      }
      let newURL = window.URL.createObjectURL(blob);
      resolve({
        url: newURL,
        blob: blob,
        originURL: data.url ?? data.serverRequest.path,
      });
    } catch {
      resolve({ url: data.url, originURL: data.url });
    }
  });
}

//Pick users
export async function pickUsers(hideUsersIDS = false, typeToHide = false) {
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
    <div class="container" id="benutzerverwaltung">
    <div class="filter">

        <div id="chooseFilterTypeContainer">
            <label for="chooseFilter" class="form-label">Filtern nach</label>
            <select id="chooseFilter" class="form-select">
                <option data-value="username">Benutzername</option>
                <option data-value="groups">Gruppen</option>
                <option data-value="email">Email</option>
                <option data-value="isOnline">Onlinestatus</option>
                <option data-value="userID">Benutzer ID</option>
                <option data-value="authenticated">Bestätigt / Nicht bestätigt</option>
                <option data-value="klassenstufe">Klassenstufe</option>
                <option data-value="permissionsAllowed">Berechtigung (erlaubt)</option>
                <option data-value="permissionsForbidden">Berechtigung (verboten)</option>
                <option data-value="ranking">Rang</option>
                <option data-value="multiple">Mehreres</option>
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
            <div class="mt-2" id="username">
                <label for="textInput" class="form-label">Filtern nach Benutzername</label>
                <input type="text" id="textInput" class="form-control" placeholder="Benutzername" autocomplete="off">
            </div>
            <div class="mt-2" id="email">
                <label for="textInput" class="form-label">Filtern nach Email</label>
                <input type="text" id="textInput" class="form-control" placeholder="Email" autocomplete="off">
            </div>
            <div class="mt-2" id="userID">
                <label for="numberInput" class="form-label">Filtern nach UserID</label>
                <input type="number" id="numberInput" name="numberInput" min="0" autocomplete="off">
            </div>
            <div class="mt-2" id="ranking">
                <label for="numberInput" class="form-label">Filtern nach Rang</label>
                <input type="number" id="numberInput" name="numberInput" min="0" autocomplete="off">
            </div>
            <div class="mt-2" id="klassenstufe">
                <label for="select" class="form-label">Filtern nach Klassenstufe (Oder):</label>
                <button class="btn btn-sm btn-primary" id="addBtn">Hinzufügen</button>
                <div id="choosen"></div>
            </div>
            <div class="mt-2" id="groups">
                <label for="select" class="form-label">Filtern nach Gruppen (Und):</label>
                <button class="btn btn-sm btn-primary" id="addBtn">Hinzufügen</button>
                <ul id="choosen">

                </ul>
            </div>
            <div class="mt-2" id="permissionsAllowed">
                <label for="select" class="form-label">Filtern nach Berechtigungen (erlaubt):</label>
                <button class="btn btn-sm btn-primary" id="addBtn">Hinzufügen</button>
                <ul id="choosen">

                </ul>
            </div>
            <div class="mt-2" id="permissionsForbidden">
                <label for="select" class="form-label">Filtern nach Berechtigungen (verboten):</label>
                <button class="btn btn-sm btn-primary" id="addBtn">Hinzufügen</button>
                <ul id="choosen">

                </ul>
            </div>
            <div class="mt-2" id="authenticated">
                <label for="selectInput" class="form-label">Filtern nach "Bestätigtungsstatus"</label>
                <select class="form-select" aria-label="Bestätigt Filter" id="selectInput">
                    <option data-value="" selected="selected">Auswahl</option>
                    <option data-value="1" value="1">Ja</option>
                    <option data-value="0">Nein</option>
                </select>
            </div>
            <div class="mt-2" id="isOnline">
                <label for="selectInput" class="form-label">Filtern nach "Onlinestatus"</label>
                <select class="form-select" aria-label="Bestätigt Filter" id="selectInput">
                    <option data-value="" selected="selected">Auswahl</option>
                    <option data-value="1" value="1">Online</option>
                    <option data-value="0">Offline</option>
                </select>
            </div>
            <div class="mt-2" id="limitResults">
                <label for="numberInput" class="form-label">Ergebnisse Limitieren</label>
                <input type="number" id="numberInput" name="numberInput" min="0" autocomplete="off">
            </div>
        </div>


        <button type="button" class="btn btn-primary" id="search" style="position: relative"><span>Suchen</span></button>
        <button class="btn btn-info" id="reload">Neuladen</button>
    </div>
    <div class="resultDesciption">

    </div>
    <div class="overflow-auto">
        <table class="styled-table" id="resultTable">
            <thead>
                <tr>
                    <th>
                        <div class="heading">Ausgewählt</div>
                        <hr>
                        <div><input type="checkbox" id="chooseall"> Alle auswählen</div>
                    </th>
                    <th id="username" style="min-width: 150px;">Username</th>
                    <th id="email" style="min-width: 190px;">E-Mail</th>
                    <th id="klassenstufe">Klassenstufe</th>
                    <th id="authenticated">Verifiziert</th>
                    <th id="isOnline">Onlinestatus</th>
                    <th id="lastActivity" style="min-width: 150px;">Letzte Aktivität</th>
                    <th id="lastQuiz" style="min-width: 200px;">Letztes Quiz</th>
                    <th id="lastLogin" style="min-width: 150px;">Letzter Login</th>
                    <th id="groups" style="min-width: 150px;">Gruppen</th>
                    <th id="permissionsAllowed" style="min-width: 150px;">Berechtigungen (erlaubt)</th>
                    <th id="permissionsForbidden" style="min-width: 150px;">Berechtigungen (verboten)</th>
                    <th id="created" style="min-width: 150px;">Erstellt</th>
                    <th id="lastPwdChange" style="min-width: 150px;">Passwort geändert</th>
                    <th id="userID">UserID</th>
                    <th id="nextMessages" style="min-width: 350px;">Ausstehende Nachrichten</th>
                    <th id="ranking">Rang</th>
                    <th id="showPublic">öffentlich anzeigen</th>
                </tr>
            </thead>
            <tbody>
                <!-- Results -->
            </tbody>
        </table>
    </div>
</div>
    `;

    //Class
    class Benutzerverwaltung {
      constructor(container) {
        this.container = container;
        this.searchBtn = null;
        this.chooseFilterTypeSelect = null;
        this.filterContainer = null;
        this.selectionFiltersContainer = null;
        this.limiter = null;

        //Filters
        this.usernameSelectContainer = null;
        this.emailSelectContainer = null;
        this.userIDSelectContainer = null;
        this.klassenstufeSelectContainer = null;
        this.groupsSelectContainer = null;
        this.authenticatedSelectContainer = null;
        this.isOnlineSelectContainer = null;
        this.rankingSelectContainer = null;

        this.hideUsersIDS = null;

        this.permissionsAllowedSelectContainer = null;
        this.permissionsAllowedObject = new Object();
        this.permissionsForbiddenSelectContainer = null;
        this.permissionsForbiddenArray = new Array();

        this.groupsSearchArray = new Array();
        this.klassenstufenSearchArray = new Array();

        //Selection
        this.choosenArray = new Array();
        this.oldCheckedArray = new Array();

        //others
        this.searchWhileTyping = false;
        this.resultDescriptionContainer = null;
        this.resultBox = null;

        this.searchReloadBtn = null;
        this.editReloadBtn = null;
      }

      async prepareSearch() {
        if (!this.container) return "No container";

        //StartBtn
        let searchBtn = this.container.querySelector(".filter #search");
        console.log(searchBtn);
        if (!searchBtn) return "No searchBtn";
        this.searchBtn = searchBtn;

        //Filter Container (init)
        let filterContainer = this.container.querySelector(".filter");
        if (!filterContainer) return "No filter container";
        this.filterContainer = filterContainer;

        //Filter Type Select (init)
        let chooseFilterTypeSelect = filterContainer.querySelector(
          "#chooseFilterTypeContainer #chooseFilter"
        );
        if (!chooseFilterTypeSelect) return "no chooseFilterTypeSelect";
        this.chooseFilterTypeSelect = chooseFilterTypeSelect;

        //Selection Filters (init) - Enable or disable filter
        console.log(this.filterContainer);
        let selectionFiltersContainer =
          this.filterContainer.querySelector(".selectionFilters");
        if (!selectionFiltersContainer) return "no selection filters container";
        this.selectionFiltersContainer = selectionFiltersContainer;

        //Initialize filters
        let usernameSelectContainer =
          selectionFiltersContainer.querySelector("#username");
        let emailSelectContainer =
          selectionFiltersContainer.querySelector("#email");
        let userIDSelectContainer =
          selectionFiltersContainer.querySelector("#userID");
        let isOnlineSelectContainer =
          selectionFiltersContainer.querySelector("#isOnline");
        let klassenstufeSelectContainer =
          selectionFiltersContainer.querySelector("#klassenstufe");
        let groupsSelectContainer =
          selectionFiltersContainer.querySelector("#groups");
        let authenticatedSelectContainer =
          selectionFiltersContainer.querySelector("#authenticated");
        let permissionsAllowedSelectContainer =
          selectionFiltersContainer.querySelector("#permissionsAllowed");
        let permissionsForbiddenSelectContainer =
          selectionFiltersContainer.querySelector("#permissionsForbidden");
        let rankingSelectContainer =
          selectionFiltersContainer.querySelector("#ranking");
        if (
          !usernameSelectContainer ||
          !emailSelectContainer ||
          !userIDSelectContainer ||
          !klassenstufeSelectContainer ||
          !groupsSelectContainer ||
          !authenticatedSelectContainer ||
          !isOnlineSelectContainer ||
          !permissionsAllowedSelectContainer ||
          !permissionsForbiddenSelectContainer ||
          !rankingSelectContainer
        )
          return "Error in initializing Filters";
        this.usernameSelectContainer = usernameSelectContainer;
        this.emailSelectContainer = emailSelectContainer;
        this.userIDSelectContainer = userIDSelectContainer;
        this.isOnlineSelectContainer = isOnlineSelectContainer;
        this.klassenstufeSelectContainer = klassenstufeSelectContainer;
        this.groupsSelectContainer = groupsSelectContainer;
        this.permissionsAllowedSelectContainer =
          permissionsAllowedSelectContainer;
        this.permissionsForbiddenSelectContainer =
          permissionsForbiddenSelectContainer;
        this.authenticatedSelectContainer = authenticatedSelectContainer;
        this.rankingSelectContainer = rankingSelectContainer;

        //hide all
        this.usernameSelectContainer.classList.add("hidden");
        this.userIDSelectContainer.classList.add("hidden");
        this.emailSelectContainer.classList.add("hidden");
        this.isOnlineSelectContainer.classList.add("hidden");
        this.klassenstufeSelectContainer.classList.add("hidden");
        this.groupsSelectContainer.classList.add("hidden");
        this.permissionsAllowedSelectContainer.classList.add("hidden");
        this.authenticatedSelectContainer.classList.add("hidden");
        this.rankingSelectContainer.classList.add("hidden");

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

        let reloadBtn = this.container.querySelector("#reload");
        if (!reloadBtn) return "no reload button";
        reloadBtn.addEventListener("click", () => {
          this.search();
        });
        this.searchReloadBtn = reloadBtn;
        this.searchReloadBtn.disabled = true;

        //Result Table
        let resultTable = this.container.querySelector("#resultTable");
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

        ///ChooseAllBtn
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
        this.setFilterMode("username");
      }

      async setFilterMode(value) {
        if (!value) return false;
        this.filterType = value;
        //Hide All and clear
        this.usernameSelectContainer.classList.add("hidden");
        this.emailSelectContainer.classList.add("hidden");
        this.userIDSelectContainer.classList.add("hidden");
        this.groupsSelectContainer.classList.add("hidden");
        this.klassenstufeSelectContainer.classList.add("hidden");
        this.permissionsAllowedSelectContainer.classList.add("hidden");
        this.permissionsForbiddenSelectContainer.classList.add("hidden");
        this.authenticatedSelectContainer.classList.add("hidden");
        this.isOnlineSelectContainer.classList.add("hidden");
        this.rankingSelectContainer.classList.add("hidden");

        if (value === "username") {
          this.enableFilter(this.usernameSelectContainer);
        } else if (value === "email") {
          this.enableFilter(this.emailSelectContainer);
        } else if (value === "userID") {
          this.enableFilter(this.userIDSelectContainer);
        } else if (value === "groups") {
          this.enableFilter(this.groupsSelectContainer);
        } else if (value === "klassenstufe") {
          this.enableFilter(this.klassenstufeSelectContainer);
        } else if (value === "permissionsAllowed") {
          this.enableFilter(this.permissionsAllowedSelectContainer);
        } else if (value === "permissionsForbidden") {
          this.enableFilter(this.permissionsForbiddenSelectContainer);
        } else if (value === "ranking") {
          this.enableFilter(this.rankingSelectContainer);
        } else if (value === "authenticated") {
          this.enableFilter(this.authenticatedSelectContainer);
        } else if (value === "isOnline") {
          this.enableFilter(this.isOnlineSelectContainer);
        } else if (value == "multiple") {
          this.enableFilter(this.usernameSelectContainer);
          this.enableFilter(this.emailSelectContainer);
          this.enableFilter(this.userIDSelectContainer);
          this.enableFilter(this.groupsSelectContainer);
          this.enableFilter(this.klassenstufeSelectContainer);
          this.enableFilter(this.permissionsSelectContainer);
          this.enableFilter(this.authenticatedSelectContainer);
          this.enableFilter(this.isOnlineSelectContainer);
          this.enableFilter(this.permissionsAllowedSelectContainer);
          this.enableFilter(this.permissionsForbiddenSelectContainer);
          this.enableFilter(this.rankingSelectContainer);
        } else if (value == "all") {
          //Nothing to show
        }
      }

      async enableFilter(filter) {
        if (!filter) return false;

        if (filter === this.usernameSelectContainer) {
          let input = this.usernameSelectContainer.querySelector("#textInput");
          listenToChanges(input, "input", 450, () => {
            if (this.searchWhileTyping) {
              this.search();
            }
          });
          this.usernameSelectContainer.classList.remove("hidden");
        } else if (filter === this.emailSelectContainer) {
          //Email
          let input = this.emailSelectContainer.querySelector("#textInput");
          listenToChanges(input, "input", 450, () => {
            if (this.searchWhileTyping) {
              this.search();
            }
          });
          this.emailSelectContainer.classList.remove("hidden");
        } else if (filter === this.userIDSelectContainer) {
          //UserID
          let input = this.userIDSelectContainer.querySelector("#numberInput");
          listenToChanges(input, "input", 450, () => {
            if (this.searchWhileTyping) {
              this.search();
            }
          });
          this.userIDSelectContainer.classList.remove("hidden");
        } else if (filter === this.rankingSelectContainer) {
          //UserID
          let input = this.rankingSelectContainer.querySelector("#numberInput");
          listenToChanges(input, "input", 450, () => {
            if (this.searchWhileTyping) {
              this.search();
            }
          });
          this.rankingSelectContainer.classList.remove("hidden");
        } else if (filter === this.groupsSelectContainer) {
          //Groups
          this.groupsSearchArray = new Array(); //Reset old value

          let choosenContainer =
            this.groupsSelectContainer.querySelector("#choosen");

          let update = () => {
            //Update Choosen
            choosenContainer.innerHTML = "";
            if (this.groupsSearchArray.length > 0) {
              this.groupsSearchArray.forEach((element) => {
                let listItem = document.createElement("li");
                listItem.setAttribute("data-value", element);
                listItem.innerHTML = `<span>${element}</span><button type="button" id="remove">X</button><span></span`;
                choosenContainer.appendChild(listItem);

                let removeBtn = listItem.querySelector("#remove");
                removeBtn.addEventListener("click", (event) => {
                  this.groupsSearchArray = removeFromArray(
                    this.groupsSearchArray,
                    element
                  );
                  update();
                });
              });
            }
          };

          let addBtn = this.groupsSelectContainer.querySelector("#addBtn");
          addBtn = removeAllEventlisteners(addBtn);
          addBtn.addEventListener("click", async () => {
            let availableGroups = await makeJSON(
              await sendXhrREQUEST(
                "POST",
                "benutzerverwaltung&operation=other&type=getAvailableGroups",
                "/teacher/includes/benutzerverwaltung.inc.php",
                "application/x-www-form-urlencoded",
                true,
                true,
                false,
                true
              )
            );
            let choosen = await chooseFromArrayWithSearch(
              availableGroups,
              false,
              "Gruppen auswählen",
              this.groupsSearchArray,
              true
            );
            if (choosen && choosen.length > 0) {
              for (const current of choosen) {
                this.groupsSearchArray = addToArray(
                  this.groupsSearchArray,
                  current,
                  false
                );
              }
            }
            update();
          });

          this.groupsSelectContainer.classList.remove("hidden");
        } else if (filter === this.permissionsAllowedSelectContainer) {
          this.permissionsAllowedObject = new Object();
          console.log(this.permissionsAllowedObject);
          let choosenContainer =
            this.permissionsAllowedSelectContainer.querySelector("#choosen");
          choosenContainer.innerHTML = "";
          let addBtn =
            this.permissionsAllowedSelectContainer.querySelector("#addBtn");
          addBtn = removeAllEventlisteners(addBtn);

          let add = async () => {
            let toAdd = await addPermission([]);
            if (toAdd && toAdd.length > 0) {
              for (const current of toAdd) {
                let input = await getUserInput(
                  "Eingabe",
                  `Welchen Wert soll die Berechtigung ${current} haben?`,
                  false,
                  "text",
                  1,
                  1,
                  false
                );
                if (!isEmptyInput(input, true)) {
                  this.permissionsAllowedObject[current] = input;
                  if (this.searchWhileTyping) {
                    this.search();
                  }
                }
              }
            }
            update();
          };
          addBtn.addEventListener("click", add);
          let update = () => {
            //Update Choosen
            choosenContainer.innerHTML = "";
            if (Object.keys(this.permissionsAllowedObject).length > 0) {
              for (const [key, value] of Object.entries(
                this.permissionsAllowedObject
              )) {
                let listItem = document.createElement("li");

                listItem.setAttribute("data-value", key);
                listItem.innerHTML = `<span>${key} = ${value}</span><button type="button" id="remove">X</button><span></span>`;
                choosenContainer.appendChild(listItem);

                let removeBtn = listItem.querySelector("#remove");
                removeBtn.addEventListener("click", (event) => {
                  delete this.permissionsAllowedObject[key];
                  update();
                  console.log("After", this.permissionsAllowedObject);
                });
              }
            }
          };
          this.permissionsAllowedSelectContainer.classList.remove("hidden");
        } else if (filter === this.permissionsForbiddenSelectContainer) {
          this.permissionsForbiddenArray = new Array();
          console.log(this.permissionsAllowedObject);
          let choosenContainer =
            this.permissionsForbiddenSelectContainer.querySelector("#choosen");
          choosenContainer.innerHTML = "";
          let addBtn =
            this.permissionsForbiddenSelectContainer.querySelector("#addBtn");
          addBtn = removeAllEventlisteners(addBtn);

          let add = async () => {
            let toAdd = await addPermission([]);
            if (toAdd && toAdd.length > 0) {
              for (const current of toAdd) {
                this.permissionsForbiddenArray = addToArray(
                  this.permissionsForbiddenArray,
                  current,
                  false
                );
              }
            }
            update();
          };
          addBtn.addEventListener("click", add);
          let update = () => {
            //Update Choosen
            choosenContainer.innerHTML = "";
            if (this.permissionsForbiddenArray.length > 0) {
              for (const current of this.permissionsForbiddenArray) {
                let listItem = document.createElement("li");

                listItem.setAttribute("data-value", current);
                listItem.innerHTML = `<span>${current}</span><button type="button" id="remove">X</button><span></span>`;
                choosenContainer.appendChild(listItem);

                let removeBtn = listItem.querySelector("#remove");
                removeBtn.addEventListener("click", (event) => {
                  this.permissionsForbiddenArray = removeFromArray(
                    this.permissionsForbiddenArray,
                    current
                  );
                  update();
                  console.log("After", this.permissionsForbiddenArray);
                });
              }
            }
            if (this.searchWhileTyping) {
              this.search();
            }
          };

          this.permissionsForbiddenSelectContainer.classList.remove("hidden");
        } else if (filter === this.klassenstufeSelectContainer) {
          //Klassenstufen

          this.klassenstufenSearchArray = new Array(); //Reset old value

          let choosenContainer =
            this.klassenstufeSelectContainer.querySelector("#choosen");

          let update = () => {
            //Update Choosen
            choosenContainer.innerHTML = "";
            if (this.klassenstufenSearchArray.length > 0) {
              this.klassenstufenSearchArray.forEach((element) => {
                let listItem = document.createElement("li");
                listItem.setAttribute("data-value", element);
                listItem.innerHTML = `<span>${element}</span><button type="button" id="remove">X</button><span></span`;
                choosenContainer.appendChild(listItem);

                let removeBtn = listItem.querySelector("#remove");
                removeBtn.addEventListener("click", (event) => {
                  this.klassenstufenSearchArray = removeFromArray(
                    this.klassenstufenSearchArray,
                    element
                  );
                  update();
                });
              });
            }
          };

          let addBtn =
            this.klassenstufeSelectContainer.querySelector("#addBtn");
          addBtn = removeAllEventlisteners(addBtn);
          addBtn.addEventListener("click", async () => {
            let availableKlassenstufen = await makeJSON(
              await sendXhrREQUEST(
                "POST",
                "benutzerverwaltung&operation=other&type=getAllKlassenstufen",
                "/teacher/includes/benutzerverwaltung.inc.php",
                "application/x-www-form-urlencoded",
                true,
                true,
                false,
                true
              )
            );
            let choosen = await chooseFromArrayWithSearch(
              availableKlassenstufen,
              false,
              "Klassenstufe auswählen",
              this.klassenstufenSearchArray,
              true
            );
            if (choosen && choosen.length > 0) {
              for (const current of choosen) {
                this.klassenstufenSearchArray = addToArray(
                  this.klassenstufenSearchArray,
                  current,
                  false
                );
              }
            }
            update();
          });

          this.klassenstufeSelectContainer.classList.remove("hidden");
        } else if (filter === this.authenticatedSelectContainer) {
          let select =
            this.authenticatedSelectContainer.querySelector("#selectInput");
          listenToChanges(select, "change", 200, () => {
            if (this.searchWhileTyping) {
              this.search();
            }
          });
          this.authenticatedSelectContainer.classList.remove("hidden");
        } else if (filter === this.isOnlineSelectContainer) {
          let select =
            this.isOnlineSelectContainer.querySelector("#selectInput");
          listenToChanges(select, "change", 200, () => {
            if (this.searchWhileTyping) {
              this.search();
            }
          });
          this.isOnlineSelectContainer.classList.remove("hidden");
        } else {
          return false;
        }
      }

      async search() {
        this.searchReloadBtn.disabled = true;
        //toggleLodingAnimation(this.container)
        this.searchBtn.classList.add("loading");
        this.choosenArray = new Array();

        if (this.filterType === "username") {
          let input =
            this.usernameSelectContainer.querySelector("#textInput").value;
          this.showResults(
            makeJSON(
              await makeJSON(
                await sendXhrREQUEST(
                  "POST",
                  "benutzerverwaltung&operation=search&type=username&input=" +
                    input +
                    "&limitResults=" +
                    this.limiter.value,
                  "/teacher/includes/benutzerverwaltung.inc.php",
                  "application/x-www-form-urlencoded",
                  true,
                  true,
                  false,
                  true
                )
              )
            )
          );
        } else if (this.filterType === "email") {
          let input =
            this.emailSelectContainer.querySelector("#textInput").value;
          this.showResults(
            makeJSON(
              await makeJSON(
                await sendXhrREQUEST(
                  "POST",
                  "benutzerverwaltung&operation=search&type=email&input=" +
                    input +
                    "&limitResults=" +
                    this.limiter.value,
                  "/teacher/includes/benutzerverwaltung.inc.php",
                  "application/x-www-form-urlencoded",
                  true,
                  true,
                  false,
                  true
                )
              )
            )
          );
        } else if (this.filterType === "userID") {
          let input =
            this.userIDSelectContainer.querySelector("#numberInput").value;
          this.showResults(
            makeJSON(
              await makeJSON(
                await sendXhrREQUEST(
                  "POST",
                  "benutzerverwaltung&operation=search&type=userID&input=" +
                    input +
                    "&limitResults=" +
                    this.limiter.value,
                  "/teacher/includes/benutzerverwaltung.inc.php",
                  "application/x-www-form-urlencoded",
                  true,
                  true,
                  false,
                  true
                )
              )
            )
          );
        } else if (this.filterType === "groups") {
          this.showResults(
            makeJSON(
              await makeJSON(
                await sendXhrREQUEST(
                  "POST",
                  "benutzerverwaltung&operation=search&type=groups&input=" +
                    JSON.stringify(this.groupsSearchArray) +
                    "&limitResults=" +
                    this.limiter.value,
                  "/teacher/includes/benutzerverwaltung.inc.php",
                  "application/x-www-form-urlencoded",
                  true,
                  true,
                  false,
                  true
                )
              )
            )
          );
        } else if (this.filterType === "klassenstufe") {
          this.showResults(
            makeJSON(
              await makeJSON(
                await sendXhrREQUEST(
                  "POST",
                  "benutzerverwaltung&operation=search&type=klassenstufe&input=" +
                    JSON.stringify(this.klassenstufenSearchArray) +
                    "&limitResults=" +
                    this.limiter.value,
                  "/teacher/includes/benutzerverwaltung.inc.php",
                  "application/x-www-form-urlencoded",
                  true,
                  true,
                  false,
                  true
                )
              )
            )
          );
        } else if (this.filterType === "permissionsAllowed") {
          this.showResults(
            makeJSON(
              await makeJSON(
                await sendXhrREQUEST(
                  "POST",
                  "benutzerverwaltung&operation=search&type=permissionsAllowed&input=" +
                    JSON.stringify(this.permissionsAllowedObject) +
                    "&limitResults=" +
                    this.limiter.value,
                  "/teacher/includes/benutzerverwaltung.inc.php",
                  "application/x-www-form-urlencoded",
                  true,
                  true,
                  false,
                  true
                )
              )
            )
          );
        } else if (this.filterType === "permissionsForbidden") {
          this.showResults(
            makeJSON(
              await makeJSON(
                await sendXhrREQUEST(
                  "POST",
                  "benutzerverwaltung&operation=search&type=permissionsForbidden&input=" +
                    JSON.stringify(this.permissionsForbiddenArray) +
                    "&limitResults=" +
                    this.limiter.value,
                  "/teacher/includes/benutzerverwaltung.inc.php",
                  "application/x-www-form-urlencoded",
                  true,
                  true,
                  false,
                  true
                )
              )
            )
          );
        } else if (this.filterType === "ranking") {
          let input =
            this.rankingSelectContainer.querySelector("#numberInput").value;
          this.showResults(
            makeJSON(
              await makeJSON(
                await sendXhrREQUEST(
                  "POST",
                  "benutzerverwaltung&operation=search&type=ranking&input=" +
                    input +
                    "&limitResults=" +
                    this.limiter.value,
                  "/teacher/includes/benutzerverwaltung.inc.php",
                  "application/x-www-form-urlencoded",
                  true,
                  true,
                  false,
                  true
                )
              )
            )
          );
        } else if (this.filterType == "authenticated") {
          let select =
            this.authenticatedSelectContainer.querySelector("#selectInput");
          let input = select[select.selectedIndex].getAttribute("data-value");
          this.showResults(
            makeJSON(
              await makeJSON(
                await sendXhrREQUEST(
                  "POST",
                  "benutzerverwaltung&operation=search&type=authenticated&input=" +
                    input +
                    "&limitResults=" +
                    this.limiter.value,
                  "/teacher/includes/benutzerverwaltung.inc.php",
                  "application/x-www-form-urlencoded",
                  true,
                  true,
                  false,
                  true
                )
              )
            )
          );
        } else if (this.filterType === "isOnline") {
          let select =
            this.isOnlineSelectContainer.querySelector("#selectInput");
          let input = select[select.selectedIndex].getAttribute("data-value");
          this.showResults(
            makeJSON(
              await makeJSON(
                await sendXhrREQUEST(
                  "POST",
                  "benutzerverwaltung&operation=search&type=isOnline&input=" +
                    input +
                    "&limitResults=" +
                    this.limiter.value,
                  "/teacher/includes/benutzerverwaltung.inc.php",
                  "application/x-www-form-urlencoded",
                  true,
                  true,
                  false,
                  true
                )
              )
            )
          );
        } else if (this.filterType === "all") {
          this.showResults(
            makeJSON(
              await makeJSON(
                await sendXhrREQUEST(
                  "POST",
                  "benutzerverwaltung&operation=search&type=all&limitResults=" +
                    this.limiter.value,
                  "/teacher/includes/benutzerverwaltung.inc.php",
                  "application/x-www-form-urlencoded",
                  true,
                  true,
                  false,
                  true
                )
              )
            )
          );
        } else if (this.filterType == "multiple") {
          //Username
          let username =
            this.usernameSelectContainer.querySelector("#textInput").value;
          if (isEmptyInput(username)) {
            username = false;
          }

          //Email
          let email =
            this.emailSelectContainer.querySelector("#textInput").value;
          if (isEmptyInput(email)) {
            email = false;
          }

          //userID
          let userID =
            this.userIDSelectContainer.querySelector("#numberInput").value;
          if (isEmptyInput(userID)) {
            userID = false;
          }

          //ranking
          let ranking =
            this.rankingSelectContainer.querySelector("#numberInput").value;
          if (isEmptyInput(ranking)) {
            ranking = false;
          }

          //Groups
          let groups = this.groupsSearchArray;
          if (!groups.length > 0) {
            groups = false;
          }

          //Klassenstufe
          let klassenstufen = this.klassenstufenSearchArray;
          if (!klassenstufen.length > 0) {
            klassenstufen = false;
          }

          //isOnline
          let isOnlineSelect =
            this.isOnlineSelectContainer.querySelector("#selectInput");
          let isOnline =
            isOnlineSelect[isOnlineSelect.selectedIndex].getAttribute(
              "data-value"
            );
          if (isEmptyInput(isOnline)) {
            isOnline = false;
          }

          //authenticated
          let authenticatedSelect =
            this.authenticatedSelectContainer.querySelector("#selectInput");
          let authenticated =
            authenticatedSelect[authenticatedSelect.selectedIndex].getAttribute(
              "data-value"
            );
          if (isEmptyInput(authenticated)) {
            authenticated = false;
          }

          //permissionsAllowed
          let permissionsAllowed = this.permissionsAllowedObject;
          if (!Object.keys(permissionsAllowed).length) {
            permissionsAllowed = false;
          }

          //permissionsForbidden
          let permissionsForbidden = this.permissionsForbiddenArray;
          if (!permissionsForbidden.length > 0) {
            permissionsForbidden = false;
          }

          console.log(
            username,
            email,
            userID,
            ranking,
            groups,
            klassenstufen,
            isOnline,
            authenticated,
            permissionsAllowed,
            permissionsForbidden
          );

          this.showResults(
            makeJSON(
              await makeJSON(
                await sendXhrREQUEST(
                  "POST",
                  "benutzerverwaltung&operation=search&type=multiple&username=" +
                    username +
                    "&email=" +
                    email +
                    "&userID=" +
                    userID +
                    "&ranking=" +
                    ranking +
                    "&groups=" +
                    JSON.stringify(groups) +
                    "&klassenstufen=" +
                    klassenstufen +
                    "&isOnline=" +
                    isOnline +
                    "&authenticated=" +
                    authenticated +
                    "&permissionsAllowed=" +
                    JSON.stringify(permissionsAllowed) +
                    "&permissionsForbidden=" +
                    JSON.stringify(permissionsForbidden) +
                    "&limitResults=" +
                    this.limiter.value,
                  "/teacher/includes/benutzerverwaltung.inc.php",
                  "application/x-www-form-urlencoded",
                  true,
                  true,
                  false,
                  true
                )
              )
            )
          );
        } else {
          console.log("no input method");
          return false;
        }
      }

      showResults(results) {
        this.searchBtn.classList.remove("loading");
        this.clear(this.tableBody);
        this.resultDescriptionContainer.classList.remove("hidden");
        if (!results) {
          this.resultTable.classList.add("hidden");
          this.resultDescriptionContainer.innerHTML = "Keine Ergebnisse...";
          return true;
        }
        results = makeJSON(results);

        if (!results.length > 0) {
          this.resultTable.classList.add("hidden");
          this.resultDescriptionContainer.innerHTML = "Keine Ergebnisse...";
          return false;
        }
        this.resultDescriptionContainer.innerHTML = `${results.length} Ergebnisse`;

        let tableBody = this.resultTable.querySelector("tbody");
        if (!tableBody) return false;
        this.tableBody = tableBody;

        results = sortItems(results, "username"); //Just sort it to better overview

        for (const result of results) {
          if (this.hideUsersIDS && this.hideUsersIDS.length) {
            if (result[typeToHide] == result) {
              continue;
            }
          }
          //console.log(user);
          let tableRow = document.createElement("tr");
          tableRow.classList.add("result");
          tableRow.setAttribute("data-value", result["userID"]);

          let showPublicText = "Nein";
          if (Boolean(makeJSON(result["showPublic"]))) {
            showPublicText = "Ja";
          }

          tableRow.innerHTML = `
          <td class="select"><input type="checkbox" id="select"><button id="chooseOnly"><img src="../../images/icons/stift.svg" alt="Auswahl"></button></td>
          <td id="username">${result["username"]}</td>
          <td id="email">${result["email"]}</td>
          <td id="klassenstufe">${result["klassenstufe"]}</td>
          <td id="authenticated">${result["authenticated"]}</td>
          <td id="isOnline">${result["isOnline"]}</td>
          <td id="lastActivity"><span class="first">Vor ${result["lastActivityString"]} </span><span class="second">(${result["lastActivity"]})</span></td>
          <td id="lastQuiz">${result["lastQuiz"]}</td>
          <td id="lastLogin"><span class="first">Vor ${result["lastLoginString"]} </span><span class="second">(${result["lastLogin"]})</span></td>
          <td id="groups">${result["groups"]}</td>
          <td id="permissionsAllowed">${result["permissionsAllowed"]}</td>
          <td id="permissionsForbidden">${result["permissionsForbidden"]}</td>
          <td id="created"><span class="first">Vor ${result["createdString"]} </span><span class="second">(${result["created"]})</span></td>
          <td id="lastPwdChange"><span class="first">Vor ${result["lastPwdChangeString"]} </span><span class="second">(${result["lastPwdChange"]})</span></td>
          <td id="userID">${result["userID"]}</td>
          <td id="nextMessages">${result["nextMessages"]}</td>
          <td id="ranking">${result["ranking"]}</td>
          <td id="showPublic">${showPublicText}</td>
          `;
          this.tableBody.append(tableRow);

          let groupsInner = tableRow.querySelector("#groups");
          let usersGroups = makeJSON(result["groups"]);
          listOfArrayToHTML(groupsInner, usersGroups, "Keine Gruppen");

          //Allowed Permissions
          let permissionsInner = tableRow.querySelector("#permissionsAllowed");
          objectKEYVALUEToHTML(
            permissionsInner,
            result["permissionsAllowed"],
            "Keine zusätzlichen"
          );

          //Forbidden Permissions
          let forbiddenPermissionsInner = tableRow.querySelector(
            "#permissionsForbidden"
          );
          listOfArrayToHTML(
            forbiddenPermissionsInner,
            result["permissionsForbidden"],
            "Keine zusätzlichen"
          );

          //Next Messages
          let nextMessagesInner = tableRow.querySelector("#nextMessages");
          listOfArrayToHTML(nextMessagesInner, result["nextMessages"]);

          let checkBox = tableRow.querySelector(".select #select");
          checkBox.addEventListener("change", (event) => {
            if (event.target.checked) {
              this.choosenArray = addToArray(
                this.choosenArray,
                result["userID"],
                false
              );
            } else {
              this.choosenArray = removeFromArray(
                this.choosenArray,
                result["userID"]
              );
            }
          });

          let chooseThis = tableRow.querySelector(".select #chooseOnly");
          if (!chooseThis) continue;

          chooseThis.addEventListener("click", (event) => {
            this.choosenArray = addToArray(
              this.choosenArray,
              result["userID"],
              false
            );
            goBackWithValue();
          });
        }
        this.searchReloadBtn.disabled = false;
        this.resultTable.classList.remove("hidden");
      }

      clear(element) {
        element.innerHTML = "";
      }
    }

    var myModal = new bootstrap.Modal(modal);
    myModal.show();

    let close = modal.querySelector("#close");
    let yes = modal.querySelector("#yes");
    let no = modal.querySelector("#no");

    yes.addEventListener("click", (target) => {
      goBackWithValue();
    });

    function goBackWithValue() {
      let array = benutzerverwaltung.choosenArray;
      myModal.hide();
      modalOuter.remove();
      hideAllModals(false);
      resolve(array);
    }

    no.addEventListener("click", (target) => {
      myModal.hide();
      modalOuter.remove();
      hideAllModals(false);
      resolve(false);
    });

    close.addEventListener("click", (target) => {
      myModal.hide();
      modalOuter.remove();
      hideAllModals(false);
      resolve(false);
    });

    //Create UserSearch
    let benutzerververwaltungContainer = modal.querySelector(
      "#benutzerverwaltung"
    );
    let benutzerverwaltung = new Benutzerverwaltung(
      benutzerververwaltungContainer
    );
    console.log(benutzerverwaltung.prepareSearch());
    benutzerverwaltung.hideUsersIDS = hideUsersIDS;
  });
}

export function selectListSelectItemBySelector(selectList, attribute, value) {
  if (!selectList) return;
  let options = selectList.querySelectorAll("option");
  for (let i = 0; i < options.length; i++) {
    if (options[i].getAttribute(attribute) == value) {
      selectList.selectedIndex = i;
      return;
    }
  }
}
