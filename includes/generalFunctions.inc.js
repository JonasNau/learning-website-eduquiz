

export function askUser(text) {
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

    let modals = modalContainer.querySelectorAll(".modal-div");

    let number = 1;

    if (modals.length > 0) {
      number = modals.length + 1;
    }
    console.log(modals);

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
      <h5 class="modal-title" id="staticBackdropLabel">Modal title</h5>
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
      modalOuter.remove();
      resolve(true);
    });

    no.addEventListener("click", (target) => {
      myModal.hide();
      modalOuter.remove();
      resolve(false);
    });

    close.addEventListener("click", (target) => {
      myModal.hide();
      modalOuter.remove();
      resolve(false);
    });
  });
}

export function alertUser(text) {
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
  
      let modals = modalContainer.querySelectorAll(".modal-div");
  
      let number = 1;
  
      if (modals.length > 0) {
        number = modals.length + 1;
      }
      console.log(modals);
  
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
        <h5 class="modal-title" id="staticBackdropLabel">Modal title</h5>
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
        modalOuter.remove();
        resolve(false);
      });
    });
  }
  