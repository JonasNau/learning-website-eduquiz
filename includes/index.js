import * as Utils from "/includes/utils.js";

function delay(timeout) {
  return new Promise(async (resolve, reject) => {
    setTimeout(() => {
      resolve(true);
    }, timeout);
  });
}

class KlassenstufenBoxesStartseite {
  constructor(container) {
    this.container = container;
  }

  async insertBoxes() {
    return new Promise(async (resolve, reject) => {
      this.container.classList.add("lds-hourglass");
      let klassenstufen = await Utils.makeJSON(
        await Utils.sendXhrREQUEST(
          "POST",
          "klassenstufenBoxesStartseite&operation=getKlassenstufenAvailableForQuizzes",
          "./includes/generalFunctions.php",
          "application/x-www-form-urlencoded",
          true,
          false,
          false
        )
      );

      this.container.classList.remove("lds-hourglass");
      if (klassenstufen && klassenstufen.length > 0) {
        klassenstufen = Utils.sortItems(klassenstufen, false);
        //For is needed to wait in itteration - foreach doesn't work
        for (const klassenstufe of klassenstufen) {
          let box = document.createElement("div");
          box.classList.add("hidden");
          box.classList.add("klassenstufenSelectBox");
          box.setAttribute("data-value", klassenstufe);

          let faecher = Utils.makeJSON(
            await Utils.sendXhrREQUEST(
              "POST",
              "getFaecher&klassenstufe=" + klassenstufe,
              "./includes/choosequiz.inc.php",
              "application/x-www-form-urlencoded",
              true,
              false,
              false
            )
          );
          console.log(klassenstufe, faecher);

          this.container.appendChild(box);

          box.innerHTML = `
                  <div class="header"><span>${klassenstufe}</span></div>
                  <div class="body"></div>
                  
                  `;

          box.classList.add("fadein");
          box.classList.remove("hidden");
          box.addEventListener("animationend", () => {
            box.classList.remove("fadein");
          });
          await delay(100);
          let boxBody = box.querySelector(".body");
          let ul = document.createElement("ul");
          ul.classList.add("selectKlassenstufeUL");
          boxBody.appendChild(ul);
          if (faecher) {
            for (const fach of faecher) {
              console.log(fach);
              let li = document.createElement("li");
              li.innerHTML = `<a href="${
                "choosequiz.php?&klassenstufe=" + klassenstufe + "&fach=" + fach
              }">${fach}</a>`;
              ul.appendChild(li);
            }
          } else {
            let li = document.createElement("li");
            li.innerHTML = `<a href="
              "choosequiz.php>Keine Fächer verfügbar</a>`;
            ul.appendChild(li);
          }
        }
      } else {
        this.container.innerHTML = "Keine Klassenstufen gefunden.";
      }
    });
  }
}

let klassenstufencontainer = document.querySelector(
  ".chooseKlassenstufe .grid"
);
let klassenstufenBoxesStartseite = new KlassenstufenBoxesStartseite(
  klassenstufencontainer
);
klassenstufenBoxesStartseite.insertBoxes();

let mediaContainer = document.querySelector("#mediaContainer");
console.log("IMAGE RESPONSE =>", await Utils.setMedia({mediaID: "1"}, mediaContainer));
console.log("IMAGE RESPONSE =>", await Utils.setMedia({mediaID: "3"}, mediaContainer));
console.log("IMAGE RESPONSE =>", await Utils.setMedia({mediaID: "5"}, mediaContainer));
console.log("IMAGE RESPONSE =>", await Utils.setMedia({url: "https://eduquiz.ddns.net/media/videos/wiesand.mp4", type: "video", showAnyway: false}, mediaContainer, false));