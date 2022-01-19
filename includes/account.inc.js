//Setzt die Klassenstufenauswahl
import * as Utils from "./utils.js";

class KLlassenstufenAuswahlbox {
  constructor(outerElement) {
    this.outerElement = outerElement;
    this.availableGrades = null;
    this.usersGrade = null;
  }

  getAvailableGrades() {
    return new Promise((resolve, reject) => {
      var xhr = new XMLHttpRequest();
      xhr.open("POST", "includes/changeGrade.inc.php", true);
      xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
      xhr.send("getKlassenstufenUsersCanTake");
      //Wenn Antwort
      xhr.onload = () => {
        if (xhr.status == 200) {
          //Check if valid response
          if (Utils.IsJsonString(xhr.response)) {
            var parsed = JSON.parse(xhr.response);
            if (parsed.length > 0) {
              this.availableGrades = Utils.sortItems(parsed, false);
            }
          }
          resolve();
        }
      };
    });
  }

  getUsersGrade() {
    return new Promise((resolve, reject) => {
      var xhr = new XMLHttpRequest();
      xhr.open("POST", "includes/changeGrade.inc.php", true);
      xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
      xhr.send("getSelectedKlassenstufeFromUser");
      //Wenn Antwort
      xhr.onload = () => {
        if (xhr.status == 200) {
          //Check if valid response
          console.log(xhr.response);
         this.usersGrade = xhr.response;
          resolve();
        }
      };
    });
  }

  sendGradeToServer(selectedGrade) {
    console.log("Send grade to server:", selectedGrade);
    return new Promise((resolve, reject) => {
      var xhr = new XMLHttpRequest();
      xhr.open("POST", "includes/changeGrade.inc.php", true);
      xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
      xhr.send("setKlassenstufeToUserInDatabase&grade=" + selectedGrade);
      //Wenn Antwort
      xhr.onload = () => {
        if (xhr.status == 200) {
          //Check if valid response
          console.log(xhr.response);
        }
        resolve();
      };
    });
  }

  setChoosebox() {
    return new Promise((resolve, reject) => {
      let selectElement = document.createElement("select");
      selectElement.classList.add("selectGrade");
      this.outerElement.appendChild(selectElement);

      selectElement.addEventListener("change", () => {
        this.sendGradeToServer(selectElement[selectElement.selectedIndex].getAttribute("data-value"));
      });

      //Create option for "keine Angabe"
      let notSpecified = document.createElement("option");
      notSpecified.innerHTML = "keine Angabe";
      notSpecified.setAttribute("data-value", "");

      selectElement.appendChild(notSpecified);
      //Create Option Element for users Selected
      if (this.usersGrade) {
        let optionElement = document.createElement("option");
        optionElement.setAttribute("selected", "selected");
        optionElement.setAttribute("data-value", this.usersGrade);

        selectElement.appendChild(optionElement);
        optionElement.innerText = this.usersGrade;
      }

      //Set Option Elements from Available
      if (this.availableGrades == null) return;
      this.availableGrades.forEach((element) => {
        if (element == this.usersGrade) {
          console.log(
            "Der Benutzer hat die Klassenstufe",
            this.usersGrade,
            "ausgewählt. Deshalb muss es nicht zwei Mal auftauchen."
          );
        } else {
          let optionElement2 = document.createElement("option");
          optionElement2.setAttribute("data-value", element);
          selectElement.appendChild(optionElement2);
          optionElement2.innerText = element;
        }
      });
    });
  }
}

const usersGradeBox = document.querySelector(".usersGrade");
console.log(usersGradeBox);

let klassenstufenAuswahlbox = new KLlassenstufenAuswahlbox(usersGradeBox);

klassenstufenAuswahlbox.getUsersGrade().then((res) => {
  klassenstufenAuswahlbox.getAvailableGrades().then((res) => {
    klassenstufenAuswahlbox.setChoosebox();
  });
});

//available = Object.values(available);
