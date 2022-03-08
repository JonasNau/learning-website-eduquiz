"use strict";
import * as Utils from "./utils.js";

function moreThanZeroInArray(array) {
  let result = false;
  if (array.length > 0) {
    result = true;
  }
  return result;
}

class SelectQuizNav {
  constructor(navigationsleiste) {
    this.navigationsleiste = navigationsleiste;
    this.ausgewaehlteKlasse = null;
    this.ausgewaehltesFach = null;
    this.ausgewaehltesThema = null;
    this.ausgewaehltesQuiz = null;

    this.klassenDropdown = null;
    this.dropDownLinkContainerKlassen = null;

    this.faecherDropdown = null;
    this.dropDownLinkContainerFaecher = null;

    this.themenDropdown = null;
    this.dropDownLinkContainerThemen = null;

    this.quizzeDropdown = null;
    this.dropDownLinkContainerQuizze = null;
  }

  resetChoice(afterContent) {
    //dev console.log(this.ausgewaehlteKlasse, this.ausgewaehltesFach, this.ausgewaehltesThema, this.ausgewaehltesQuiz);
    let klassen = this.navigationsleiste.querySelectorAll(".klassenDropdown");
    let faecher = this.navigationsleiste.querySelectorAll(".faecherDropdown");
    let themen = this.navigationsleiste.querySelectorAll(".themenDropdown");
    let quizze = this.navigationsleiste.querySelectorAll(".quizzeDropdown");

    switch (afterContent) {
      case "Reload":
        klassen.forEach((element) => {
          element.remove();
        });
        faecher.forEach((element) => {
          element.remove();
        });
        themen.forEach((element) => {
          element.remove();
        });
        quizze.forEach((element) => {
          element.remove();
        });
        this.klassenDropdown = null;
        this.faecherDropdown = null;
        this.themenDropdown = null;
        this.quizDropdown = null;
        break;
      case "Klasse":
        faecher.forEach((element) => {
          element.remove();
        });
        themen.forEach((element) => {
          element.remove();
        });
        quizze.forEach((element) => {
          element.remove();
        });
        this.faecherDropdown = null;
        this.themenDropdown = null;
        this.quizDropdown = null;
        break;
      case "Fach":
        themen.forEach((element) => {
          element.remove();
        });
        quizze.forEach((element) => {
          element.remove();
        });
        this.themenDropdown = null;
        this.quizDropdown = null;
        break;
      case "Thema":
        quizze.forEach((element) => {
          element.remove();
        });
        this.quizDropdown = null;
        break;
    }
  }

  //Klassenstufen
  getKlassenstufen() {
    return new Promise(async (resolve, reject) => {
      try {
        let response = Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "getKlassen",
            "./includes/choosequiz.inc.php",
            "application/x-www-form-urlencoded",
            true,
            false,
            false
          )
        );
        if (response) {
          await this.setKlassenstufen(false, response);
          resolve(true);
          return true;
        } else {
          this.selectKlassenstufen(true, false);
          return false;
        }
      } catch (e) {
        await this.setKlassenstufen(true, false);
        resolve(true);
      }
    });
  }

  async setKlassenstufen(error, data) {
    return new Promise(async (resolve, reject) => {
      this.resetChoice("Reload");

      let DropdownCreate = document.createElement("li");
      DropdownCreate.className = "nav-item dropdown klassenDropdown";
      this.navigationsleiste.appendChild(DropdownCreate);

      //Nimmt .klassenDropdown aus dem DOM
      this.klassenDropdown =
        this.navigationsleiste.querySelector(".klassenDropdown");
      // console.log(this.klassenDropdown);

      if (error) {
        //Sollte nicht passieren
        this.klassenDropdown.innerHTML = `
                <li class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle" href="#" id="klassenDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <span class='dropdown-description-klassenDropdown'>Keine Klassen gefunden</span>
                    </a>
                        <ul class="dropdown-menu" aria-labelledby="klasseDropdown">
                            <h6 class="dropdown-header">Keine Klassenstufen gefunden, sorry!</h6>
                            <p>Keine Daten</p>
                            
                        </ul>
                </li>
                `;
        resolve("Keine Klassen gefunden.");
      } else {
        //Normal execution --- normal

        let sorted = Utils.sortItems(data, false) || data;
       

        let allAvailable = await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "getAmountOfQuizzes&operation=general",
            "./includes/choosequiz.inc.php",
            "application/x-www-form-urlencoded",
            true,
            false,
            false
          )
        );

        this.klassenDropdown.innerHTML = `
               <li class="nav-item dropdown">
                   <a class="nav-link dropdown-toggle" href="#" id="klassenDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                   <span class='dropdown-description-klassenDropdown'>Klasse auswählen <span class="badge bg-secondary">${allAvailable}</span></span>
                   </a>
                       <ul class="dropdown-menu" aria-labelledby="klasseDropdown">
                            <h6 class="dropdown-header">Klassenstufe auswählen</h6>
                            <div class="dropdown-divider"></div>
                       </ul>
               </li>
               `;

        let dropDownLinkContainerKlassen = this.navigationsleiste.querySelector(
          ".klassenDropdown .dropdown-menu"
        );
        this.dropDownLinkContainerKlassen = dropDownLinkContainerKlassen;
        // console.log(dropDownLinkContainerKlassen);

      for (const element of sorted) {
          let link = document.createElement("li");

          let availableQuizzes = await Utils.makeJSON(
            await Utils.sendXhrREQUEST(
              "POST",
              "getAmountOfQuizzes&operation=byKlassenstufe&klassenstufe=" + element,
              "./includes/choosequiz.inc.php",
              "application/x-www-form-urlencoded",
              true,
              false,
              false
            )
          );

          link.innerHTML = `<a class="dropdown-item selectKlasseItem" value="${element}">${element} <span class="badge bg-secondary">${availableQuizzes}</span></a>`;
          this.dropDownLinkContainerKlassen.appendChild(link);
        }

        //Add Eventlistener
        let selectKlasseItem =
          this.navigationsleiste.querySelectorAll(".selectKlasseItem");
        selectKlasseItem.forEach((element) => {
          element.addEventListener("click", () => {
            this.selectKlassenstufe(element.getAttribute("value"));
            this.getFaecher();
          });
        });
        resolve("Klassen gesetzt");
      }
    });
  }

  setKlassenstufenCustomName(customName) {
    if (this.klassenDropdown != null) {
      let dropdownDescription = this.navigationsleiste.querySelector(
        ".dropdown-description-klassenDropdown"
      );
      if (dropdownDescription != null) {
        dropdownDescription.classList.add("limitWidthOfText");
        dropdownDescription.innerText = customName;
      } else {
        console.log("Couldn't set the name of this dropdown");
      }
    }
  }

  selectKlassenstufe(klassenstufe) {
    this.ausgewaehlteKlasse = klassenstufe;
  }

  // Fächer
  getFaecher() {
    this.setKlassenstufenCustomName(this.ausgewaehlteKlasse);

    return new Promise(async (resolve, reject) => {
      try {
        let response = Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "getFaecher&klassenstufe=" + this.ausgewaehlteKlasse,
            "./includes/choosequiz.inc.php",
            "application/x-www-form-urlencoded",
            true,
            false,
            false
          )
        );
        if (response) {
          await this.setFaecher(false, response);
          resolve(true);
          return true;
        } else {
          await this.setFaecher(true, false);
          return false;
        }
      } catch (e) {
        await this.setFaecher(true, false);
        resolve(true);
      }
    });
  }

  async setFaecher(error, data) {
    return new Promise(async(resolve, reject) => {
      this.resetChoice("Klasse");

      let DropdownCreate = document.createElement("li");
      DropdownCreate.className = "nav-item dropdown faecherDropdown";
      this.navigationsleiste.appendChild(DropdownCreate);

      //Nimmt .klassenDropdown aus dem DOM
      this.faecherDropdown =
        this.navigationsleiste.querySelector(".faecherDropdown");
      // console.log(this.klassenDropdown);

      if (error) {
        //Sollte nicht passieren
        this.faecherDropdown.innerHTML = `
                <li class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle" href="#" id="faecherDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <span class='dropdown-description-faecherDropdown'>Keine Fächer gefunden</span>
                    </a>
                        <ul class="dropdown-menu" aria-labelledby="faecherDropdown">
                            <h6 class="dropdown-header">Keine Fächer gefunden, sorry!</h6>
                            <p>Keine Daten</p>
                            
                        </ul>
                </li>
                `;
        resolve("Keine Fächer gefunden.");
      } else {
        //Normal execution --- normal

        let sorted = Utils.sortItems(data, false) || data;
        // console.log("Diese Klassenstufen sind sortiert verfügbar: ", sorted);


        let allAvailable = await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "getAmountOfQuizzes&operation=byKlassenstufe&klassenstufe=" + this.ausgewaehlteKlasse,
            "./includes/choosequiz.inc.php",
            "application/x-www-form-urlencoded",
            true,
            false,
            false
          )
        );

        this.faecherDropdown.innerHTML = `
               <li class="nav-item dropdown">
                   <a class="nav-link dropdown-toggle" href="#" id="faecherDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                   <span class='dropdown-description-faecherDropdown'>Fach auswählen <span class="badge bg-secondary">${allAvailable}</span></span>
                   </a>
                       <ul class="dropdown-menu" aria-labelledby="faecherDropdown">
                            <h6 class="dropdown-header">Fach auswählen</h6>
                            <div class="dropdown-divider"></div>
                       </ul>
               </li>
               `;

        let dropDownLinkContainerFaecher = this.navigationsleiste.querySelector(
          ".faecherDropdown .dropdown-menu"
        );
        this.dropDownLinkContainerFaecher = dropDownLinkContainerFaecher;
        // console.log(dropDownLinkContainerFaecher);

        for (const element of sorted){
          let link = document.createElement("li");

          let availableQuizzes = await Utils.makeJSON(
            await Utils.sendXhrREQUEST(
              "POST",
              "getAmountOfQuizzes&operation=byKlassenstufeandFach&klassenstufe=" + this.ausgewaehlteKlasse + "&fach=" + element,
              "./includes/choosequiz.inc.php",
              "application/x-www-form-urlencoded",
              true,
              false,
              false
            )
          );

          link.innerHTML = `<a class="dropdown-item selectFachItem" value="${element}">${element} <span class="badge bg-secondary">${availableQuizzes}</span></a>`;
          this.dropDownLinkContainerFaecher.appendChild(link);
        }

        //Add Eventlistener
        let selectFachItem =
          this.navigationsleiste.querySelectorAll(".selectFachItem");
        selectFachItem.forEach((element) => {
          element.addEventListener("click", () => {
            this.selectFach(element.getAttribute("value"));
            this.getThemen();
          });
        });
        resolve("Fächer gesetzt");
      }
    });
  }

  setFaecherCustomName(customName) {
    if (this.faecherDropdown != null) {
      let dropdownDescription = this.navigationsleiste.querySelector(
        ".dropdown-description-faecherDropdown"
      );
      if (dropdownDescription != null) {
        dropdownDescription.classList.add("limitWidthOfText");
        dropdownDescription.innerText = customName;
      } else {
        console.log("Couldn't set the name of this dropdown");
      }
    }
  }

  selectFach(fach) {
    this.ausgewaehltesFach = fach;
  }

  // Themen
  getThemen() {
    this.setFaecherCustomName(this.ausgewaehltesFach);

    return new Promise(async (resolve, reject) => {
      try {
        let response = Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "getThemen&klassenstufe=" +
              this.ausgewaehlteKlasse +
              "&fach=" +
              this.ausgewaehltesFach,
            "./includes/choosequiz.inc.php",
            "application/x-www-form-urlencoded",
            true,
            false,
            false
          )
        );
        if (response) {
          await this.setThemen(false, response);
          resolve(true);
          return true;
        } else {
          await this.setThemen(true, false);
          return false;
        }
      } catch (e) {
        await this.setThemen(true, false);
        resolve(true);
      }
    });
  }

  async setThemen(error, data) {
    return new Promise(async(resolve, reject) => {
      this.resetChoice("Fach");

      let DropdownCreate = document.createElement("li");
      DropdownCreate.className = "nav-item dropdown themenDropdown";
      this.navigationsleiste.appendChild(DropdownCreate);

      //Nimmt .klassenDropdown aus dem DOM
      this.themenDropdown =
        this.navigationsleiste.querySelector(".themenDropdown");
      // console.log(this.klassenDropdown);

      if (error) {
        //Sollte nicht passieren
        this.themenDropdown.innerHTML = `
                 <li class="nav-item dropdown">
                     <a class="nav-link dropdown-toggle" href="#" id="themenDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                     <span class='dropdown-description-themenDropdown'>Keine Themen gefunden</span>
                     </a>
                         <ul class="dropdown-menu" aria-labelledby="themenDropdown">
                             <h6 class="dropdown-header">Keine Themen gefunden, sorry!</h6>
                             <p>Keine Daten</p>
                             
                         </ul>
                 </li>
                 `;
        resolve("Keine Themen gefunden.");
      } else {
        //Normal execution --- normal

        let sorted = Utils.sortItems(data, false) || data;
        // console.log("Diese Themen sind sortiert verfügbar: ", sorted);


        let allAvailable = await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "getAmountOfQuizzes&operation=byKlassenstufeandFach&klassenstufe=" + this.ausgewaehlteKlasse + "&fach=" + this.ausgewaehltesFach,
            "./includes/choosequiz.inc.php",
            "application/x-www-form-urlencoded",
            true,
            false,
            false
          )
        );

        this.themenDropdown.innerHTML = `
                <li class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle" href="#" id="themenDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <span class='dropdown-description-themenDropdown'>Thema auswählen <span class="badge bg-secondary">${allAvailable}</span></span>
                    </a>
                        <ul class="dropdown-menu" aria-labelledby="themenDropdown">
                             <h6 class="dropdown-header">Thema auswählen</h6>
                             <div class="dropdown-divider"></div>
                        </ul>
                </li>
                `;

        let dropDownLinkContainerThemen = this.navigationsleiste.querySelector(
          ".themenDropdown .dropdown-menu"
        );
        this.dropDownLinkContainerThemen = dropDownLinkContainerThemen;
        // console.log(dropDownLinkContainerThemen);

        for (const element of sorted) {
          let link = document.createElement("li");

          let availableQuizzes = await Utils.makeJSON(
            await Utils.sendXhrREQUEST(
              "POST",
              "getAmountOfQuizzes&operation=byKlassenstufeandFachandThema&klassenstufe=" + this.ausgewaehlteKlasse + "&fach=" + this.ausgewaehltesFach + "&thema=" + element,
              "./includes/choosequiz.inc.php",
              "application/x-www-form-urlencoded",
              true,
              false,
              false
            )
          );
          link.innerHTML = `<a class="dropdown-item selectThemaItem" value="${element}">${element} <span class="badge bg-secondary">${availableQuizzes}</span></a>`;
          this.dropDownLinkContainerThemen.appendChild(link);
        }

        //Add Eventlistener
        let selectFachItem =
          this.navigationsleiste.querySelectorAll(".selectThemaItem");
        selectFachItem.forEach((element) => {
          element.addEventListener("click", () => {
            this.selectThema(element.getAttribute("value"));
            this.getQuizze();
          });
        });
        resolve("Themen gesetzt");
      }
    });
  }

  setThemenCustomName(customName) {
    if (this.themenDropdown != null) {
      let dropdownDescription = this.navigationsleiste.querySelector(
        ".dropdown-description-themenDropdown"
      );
      if (dropdownDescription != null) {
        dropdownDescription.classList.add("limitWidthOfText");
        dropdownDescription.innerText = customName;
      } else {
        console.log("Couldn't set the name of this dropdown");
      }
    }
  }

  selectThema(thema) {
    this.ausgewaehltesThema = thema;
  }

  // Quizze
  getQuizze() {
    this.setThemenCustomName(this.ausgewaehltesThema);

    return new Promise(async (resolve, reject) => {
      try {
        let response = Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "getQuizze&klassenstufe=" +
              this.ausgewaehlteKlasse +
              "&fach=" +
              this.ausgewaehltesFach +
              "&thema=" +
              this.ausgewaehltesThema,
            "./includes/choosequiz.inc.php",
            "application/x-www-form-urlencoded",
            true,
            false,
            false
          )
        );
        if (response) {
          this.setQuizze(false, response);
          resolve(true);
          return true;
        } else {
          this.setQuizze(true, false);
          return false;
        }
      } catch (e) {
        this.setQuizze(true, false);
        resolve(true);
      }
    });
  }

  //Set Quizze
  setQuizze(error, data) {
    return new Promise((resolve, reject) => {
      this.resetChoice("Thema");

      let DropdownCreate = document.createElement("li");
      DropdownCreate.className = "nav-item dropdown quizzeDropdown";
      this.navigationsleiste.appendChild(DropdownCreate);

      //Nimmt .klassenDropdown aus dem DOM
      this.quizzeDropdown =
        this.navigationsleiste.querySelector(".quizzeDropdown");
      // console.log(this.quizzeDropdown);

      if (error) {
        //Sollte nicht passieren
        this.quizzeDropdown.innerHTML = `
                <li class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle" href="#" id="quizzeDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <span class='dropdown-description-quizzeDropdown'>Keine Quizze gefunden</span>
                    </a>
                        <ul class="dropdown-menu" aria-labelledby="quizzeDropdown">
                            <h6 class="dropdown-header">Keine Quizze gefunden, sorry!</h6>
                            <p>Keine Daten</p>
                            
                        </ul>
                </li>
                `;
        resolve("Keine Quizze gefunden.");
      } else {
        //Normal execution --- normal

        let sorted = Utils.sortItems(data, "quizname") || data;

        this.quizzeDropdown.innerHTML = `
               <li class="nav-item dropdown">
                   <a class="nav-link dropdown-toggle" href="#" id="quizzeDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                   <span class='dropdown-description-quizzeDropdown'>Quiz auswählen <span class="badge bg-secondary">${sorted.length}</span></span>
                   </a>
                       <ul class="dropdown-menu" aria-labelledby="quizzeDropdown">
                            <h6 class="dropdown-header">Quiz auswählen</h6>
                            <div class="dropdown-divider"></div>
                       </ul>
               </li>
               `;

        let dropDownLinkContainerQuizze = this.navigationsleiste.querySelector(
          ".quizzeDropdown .dropdown-menu"
        );
        this.dropDownLinkContainerQuizze = dropDownLinkContainerQuizze;
        // console.log(dropDownLinkContainerThemen);

        sorted.forEach((element) => {
          let link = document.createElement("li");
          link.innerHTML = `<a class="dropdown-item selectQuizItem" value="${element["quizId"]}">${element["quizname"]}</a>`;
          link.setAttribute("style", "min-width: 35vw");
          this.dropDownLinkContainerQuizze.appendChild(link);
        });

        //Add Eventlistener
        let selectQuizItem =
          this.navigationsleiste.querySelectorAll(".selectQuizItem");
        selectQuizItem.forEach((element) => {
          element.addEventListener("click", () => {
            this.selectQuiz(element.getAttribute("value"));
            window.location.href = `quiz.php?quizId=${element.getAttribute(
              "value"
            )}`;
          });
        });
        resolve("Quizze gesetzt");
      }
    });
  }

  setQuizzeCustomName(customName) {
    if (this.quizzeDropdown != null) {
      let dropdownDescription = this.navigationsleiste.querySelector(
        ".dropdown-description-quizzeDropdown"
      );
      if (dropdownDescription != null) {
        dropdownDescription.classList.add("limitWidthOfText");
        dropdownDescription.innerText = customName;
      } else {
        console.log("Couldn't set the name of this dropdown");
      }
    }
  }

  selectQuiz(quiz) {
    this.ausgewaehltesQuiz = quiz;
  }
}

function getQuizParameter(quizID) {
  return new Promise(async (resolve, reject) => {
    try {
      let response = Utils.makeJSON(
        await Utils.sendXhrREQUEST(
          "POST",
          "getAllQuizParms&quizID=" +
            quizID +
            "&fach=" +
            this.ausgewaehltesFach +
            "&thema=" +
            this.ausgewaehltesThema,
          "./includes/choosequiz.inc.php",
          "application/x-www-form-urlencoded",
          true,
          false,
          false
        )
      );
      if (response) {
        resolve(true);
        return true;
      } else {
        reject("Error");
        return false;
      }
    } catch (e) {
      resolve(true);
    }
  });
}

let selectQuiznav = new SelectQuizNav(
  document.querySelector(".navigationsleiste")
);

//GET URL DATA

//Check QuizId

async function checkQuizID() {
  //Setzt Navigationsleiste auf quizId Parameter, wenn auf quiz.php (andernfalls redirect)
  const queryString = window.location.search;
  //dev - console.log("Query String: ", queryString);
  const urlParams = new URLSearchParams(queryString);

  if (urlParams.has("quizId")) {
    if (window.location.pathname != "/quiz.php") {
      window.location.href = `/quiz.php?quizId=${urlParams.get("quizId")}`;
    } else {
      if (urlParams.has("quizId") && window.location.pathname == "/quiz.php") {
        //Setzt Quizleiste nach QuizID Daten
        let quizId = urlParams.get("quizId");
        let quizParameter = await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "getAttribute&type=quizverwaltung&secondOperation=getQuizinformationForNav&quizId=" +
              quizId,
            "./includes/getAttributes.php",
            "application/x-www-form-urlencoded",
            true,
            true,
            false,
            true
          )
        );

        if (
          quizParameter["klassenstufe"] &&
          quizParameter["fach"] &&
          quizParameter["thema"] &&
          quizParameter["quizname"]
        ) {
          let klassenstufe = quizParameter["klassenstufe"];
          let fach = quizParameter["fach"];
          let thema = quizParameter["thema"];
          let quizname = quizParameter["quizname"];

          //Set Parameter to selectQuiznav
          selectQuiznav.getKlassenstufen().then((res) => {
            //dev - console.log(res);
            selectQuiznav.selectKlassenstufe(klassenstufe);
            selectQuiznav.getFaecher().then((res) => {
              //dev - console.log(res);
              selectQuiznav.selectFach(fach);
              selectQuiznav.getThemen().then((res) => {
                //dev - console.log(res);
                selectQuiznav.selectThema(thema);
                selectQuiznav.getQuizze().then((res) => {
                  //dev - console.log(res);
                  selectQuiznav.selectQuiz(quizname);
                  selectQuiznav.setQuizzeCustomName(quizname);
                });
              });
            });
          });
        } else {
          //Wenn ein Fehler bei den bekommenen Daten besteht
          selectQuiznav.getKlassenstufen();
        }
      }
    }
  } else {
    if (urlParams.has("klassenstufe")) {
      //Klassenstufe, Fach, Thema (QuizID nicht, wegen redirect)
      if (
        urlParams.has("klassenstufe") &&
        urlParams.has("fach") &&
        urlParams.has("thema")
      ) {
        // alert("Klasse, Fach, Thema enthalten");
        let klassenstufe = urlParams.get("klassenstufe");
        let fach = urlParams.get("fach");
        let thema = urlParams.get("thema");
        console.log(
          "Klasse: " + klassenstufe,
          "Fach: " + fach,
          "Thema: " + thema
        );

        selectQuiznav.getKlassenstufen().then((res) => {
          console.log(res);
          selectQuiznav.selectKlassenstufe(klassenstufe);
          selectQuiznav.getFaecher().then((res) => {
            selectQuiznav.selectFach(fach);
            selectQuiznav.getThemen().then((res) => {
              selectQuiznav.selectThema(thema);
              selectQuiznav.getQuizze().then((res) => {
                console.log("Done!");
              });
            });
          });
        });
      } else {
        if (urlParams.has("klassenstufe") && urlParams.has("fach")) {
          // alert("Klasse, Fach enthalten");
          let klassenstufe = urlParams.get("klassenstufe");
          let fach = urlParams.get("fach");
          console.log("Klasse: " + klassenstufe, "Fach: " + fach);

          selectQuiznav.getKlassenstufen().then((res) => {
            console.log(res);
            selectQuiznav.selectKlassenstufe(klassenstufe);
            selectQuiznav.getFaecher().then((res) => {
              selectQuiznav.selectFach(fach);
              selectQuiznav.getThemen().then((res) => {
                console.log("Done!");
              });
            });
          });
        } else {
          if (urlParams.has("klassenstufe")) {
            let klassenstufe = urlParams.get("klassenstufe");
            console.log("Klasse enthalten");

            selectQuiznav.getKlassenstufen().then((res) => {
              console.log(res);
              selectQuiznav.selectKlassenstufe(klassenstufe);
              selectQuiznav.getFaecher().then((res) => {
                console.log("Done!");
              });
            });
          }
        }
      }
    } else {
      selectQuiznav.getKlassenstufen();
    }
  }
}

checkQuizID();

//Scrolls to the start of the site
setTimeout(() => {
  window.scrollTo(0, 0);
}, 50);
