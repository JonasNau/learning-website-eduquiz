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

    this.quizzeContainer = null;
    this.dropDownLinkContainerQuizze = null;
  }

  resetChoice(afterContent) {
    //dev console.log(this.ausgewaehlteKlasse, this.ausgewaehltesFach, this.ausgewaehltesThema, this.ausgewaehltesQuiz);
    let klassen = this.navigationsleiste.querySelectorAll(".klassenDropdown");
    let faecher = this.navigationsleiste.querySelectorAll(".faecherDropdown");
    let themen = this.navigationsleiste.querySelectorAll(".themenDropdown");
    let quizze = this.navigationsleiste.querySelectorAll(".quizzeContainer");

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
          this.setKlassenstufen(false, response);
          resolve(true);
          return true;
        } else {
          this.selectKlassenstufen(true, false);
          return false;
        }
      } catch (e) {
        this.setKlassenstufen(true, false);
        resolve(true);
      }
    });
  }

  setKlassenstufen(error, data) {
    return new Promise((resolve, reject) => {
      this.resetChoice("Reload");

      let DropdownCreate = document.createElement("div");
      DropdownCreate.className = "dropdown klassenDropdown";
      this.navigationsleiste.appendChild(DropdownCreate);
      //dev console.log(this.navigationsleiste)

      //Nimmt .klassenDropdown aus dem DOM
      this.klassenDropdown =
        this.navigationsleiste.querySelector(".klassenDropdown");
      // console.log(this.klassenDropdown);

      if (error) {
        //Sollte nicht passieren

        this.klassenDropdown.innerHTML = `
                <div class="dropdown">
                    <button class="btn btn-danger dropdown-toggle btn-lg" type="button" id="klassenDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                        <span class='dropdown-description-klassenDropdown'>Keine Klasse gefunden</span>
                    </button>
                    <ul class="dropdown-menu" aria-labelledby="klassenDropdown2">
                        <h6 class="dropdown-header">Klassenstufe auswählen</h6>
                        <p>Keine Daten</p>
                    </ul>
                </div>

                `;
        resolve("Keine Klassen gefunden.");
      } else {
        //Normal execution --- normal

        let sorted = Utils.sortItems(data, false);
        // console.log("Diese Klassenstufen sind sortiert verfügbar: ", sorted);

        this.klassenDropdown.innerHTML = `
                <div class="dropdown">
                    <button class="btn btn-info dropdown-toggle btn-lg" type="button" id="klassenDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                        <span class='dropdown-description-klassenDropdown'>Klasse auswählen</span>
                    </button>
                    <ul class="dropdown-menu" aria-labelledby="klassenDropdown">
                        <h6 class="dropdown-header">Klassenstufe auswählen</h6>
                        <div class="dropdown-divider"></div>
                    </ul>
                </div>
               `;

        let dropDownLinkContainerKlassen = this.navigationsleiste.querySelector(
          ".klassenDropdown .dropdown-menu"
        );
        this.dropDownLinkContainerKlassen = dropDownLinkContainerKlassen;
        // console.log(dropDownLinkContainerKlassen);

        sorted.forEach((element) => {
          let link = document.createElement("li");
          link.innerHTML = `<a class="dropdown-item selectKlasseItem" value="${element}">${element}</a>`;
          this.dropDownLinkContainerKlassen.appendChild(link);
        });

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
          this.setFaecher(false, response);
          resolve(true);
          return true;
        } else {
          this.setFaecher(true, false);
          return false;
        }
      } catch (e) {
        this.setFaecher(true, false);
        resolve(true);
      }
    });
  }

  setFaecher(error, data) {
    return new Promise((resolve, reject) => {
      this.resetChoice("Klasse");

      let DropdownCreate = document.createElement("div");
      DropdownCreate.className = "faecherDropdown";
      this.navigationsleiste.appendChild(DropdownCreate);

      //Nimmt .klassenDropdown aus dem DOM
      this.faecherDropdown =
        this.navigationsleiste.querySelector(".faecherDropdown");
      // console.log(this.klassenDropdown);

      if (error) {
        //Sollte nicht passieren
        this.faecherDropdown.innerHTML = `
                <div class="dropdown">
                    <button class="btn btn-danger dropdown-toggle btn-lg" type="button" id="faecherDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                        <span class='dropdown-description-faecherDropdown'>Keine Fächer gefunden</span>
                    </button>
                    <ul class="dropdown-menu" aria-labelledby="faecherDropdown">
                        <h6 class="dropdown-header">Fach auswählen</h6>
                        <p>Keine Daten</p>
                    </ul>
                </div>
                `;
        resolve("Keine Fächer gefunden.");
      } else {
        //Normal execution --- normal

        let sorted = Utils.sortItems(data, false);
        // console.log("Diese Klassenstufen sind sortiert verfügbar: ", sorted);

        this.faecherDropdown.innerHTML = `
                <div class="dropdown">
                    <button class="btn btn-info dropdown-toggle btn-lg" type="button" id="faecherDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                        <span class='dropdown-description-faecherDropdown'>Fach auswählen</span>
                    </button>
                    <ul class="dropdown-menu" aria-labelledby="faecherDropdown">
                        <h6 class="dropdown-header">Fach auswählen</h6>
                    </ul>
                </div>
               `;

        let dropDownLinkContainerFaecher = this.navigationsleiste.querySelector(
          ".faecherDropdown .dropdown-menu"
        );
        this.dropDownLinkContainerFaecher = dropDownLinkContainerFaecher;
        // console.log(dropDownLinkContainerFaecher);

        sorted.forEach((element) => {
          let link = document.createElement("li");
          link.innerHTML = `<a class="dropdown-item selectFachItem" value="${element}">${element}</a>`;
          this.dropDownLinkContainerFaecher.appendChild(link);
        });

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
          this.setThemen(false, response);
          resolve(true);
          return true;
        } else {
          this.setThemen(true, false);
          return false;
        }
      } catch (e) {
        this.setThemen(true, false);
        resolve(true);
      }
    });
  }

  setThemen(error, data) {
    return new Promise((resolve, reject) => {
      this.resetChoice("Fach");

      let DropdownCreate = document.createElement("div");
      DropdownCreate.className = "themenDropdown";
      this.navigationsleiste.appendChild(DropdownCreate);

      //Nimmt .klassenDropdown aus dem DOM
      this.themenDropdown =
        this.navigationsleiste.querySelector(".themenDropdown");
      // console.log(this.klassenDropdown);

      if (error) {
        //Sollte nicht passieren
        this.themenDropdown.innerHTML = `
                <div class="dropdown">
                    <button class="btn btn-danger dropdown-toggle btn-lg" type="button" id="themenDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                        <span class='dropdown-description-themenDropdown'>Keine Themen gefunden</span>
                    </button>
                    <ul class="dropdown-menu" aria-labelledby="themenDropdown">
                        <h6 class="dropdown-header">Thema auswählen</h6>
                        <p>Keine Daten</p>
                    </ul>
                </div>
                 `;
        resolve("Keine Themen gefunden.");
      } else {
        //Normal execution --- normal

        let sorted = Utils.sortItems(data, false);
        // console.log("Diese Themen sind sortiert verfügbar: ", sorted);

        this.themenDropdown.innerHTML = `
                <div class="dropdown">
                    <button class="btn btn-info dropdown-toggle btn-lg" type="button" id="themenDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                        <span class='dropdown-description-themenDropdown'>Thema auswählen <span class="badge bg-secondary">${sorted.length}</span></span>
                    </button>
                    <ul class="dropdown-menu" aria-labelledby="themenDropdown">
                        <h6 class="dropdown-header">Thema auswählen</h6>
                    </ul>
                </div>
                `;

        let dropDownLinkContainerThemen = this.navigationsleiste.querySelector(
          ".themenDropdown .dropdown-menu"
        );
        this.dropDownLinkContainerThemen = dropDownLinkContainerThemen;
        // console.log(dropDownLinkContainerThemen);

        sorted.forEach((element) => {
          let link = document.createElement("li");
          link.innerHTML = `<a class="dropdown-item selectThemaItem" value="${element}">${element}</a>`;
          this.dropDownLinkContainerThemen.appendChild(link);
        });

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

      let elementCreate = document.createElement("div");
      elementCreate.className = "quizzeContainer";
      this.navigationsleiste.appendChild(elementCreate);

      //Nimmt .klassenDropdown aus dem DOM
      this.quizzeContainer =
        this.navigationsleiste.querySelector(".quizzeContainer");
      // console.log(this.quizzeDropdown);

      if (error) {
        //Sollte nicht passieren
        this.quizzeContainer.innerHTML = `
                <div class="quizAuswahlDescription">Keine Quize dazu gefunden.</div>
                <ul class="results">
                    
                <ul>
                `;
        resolve("Keine Quizze gefunden.");
      } else {
        //Normal execution --- normal

        let sorted = Utils.sortItems(data, "quizname");
        // console.log("Diese Quizze sind sortiert verfügbar: ", sorted);

        this.quizzeContainer.innerHTML = `
                    <p class="quizAuswahlDescription"><b>Quize dazu gefunden</b> (${sorted.length})</p>
                    <ul class="results">
                        
                    </ul>
               `;

        let dropDownLinkContainerQuizze = this.navigationsleiste.querySelector(
          ".quizzeContainer .results"
        );
        console.log(dropDownLinkContainerQuizze);
        this.dropDownLinkContainerQuizze = dropDownLinkContainerQuizze;
        // console.log(dropDownLinkContainerThemen);

        sorted.forEach((element) => {
          let link = document.createElement("li");
          link.classList.add("quizLink");
          link.setAttribute("value", element["quizId"]);
          link.innerHTML = `<a>${element["quizname"]}</a>`;
          this.dropDownLinkContainerQuizze.appendChild(link);
        });

        //Add Eventlistener
        let selectQuizItem =
          this.navigationsleiste.querySelectorAll(".quizLink");
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

  selectQuiz(quiz) {
    this.ausgewaehltesQuiz = quiz;
  }
}

let searchQuiz = new SelectQuizNav(
  document.querySelector(".dropdownContainer")
);
searchQuiz.getKlassenstufen();

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

function checkAndSetQuiz() {
  //Setzt Navigationsleiste auf quizId Parameter, wenn auf quiz.php (andernfalls redirect)
  const queryString = window.location.search;
  //dev - console.log("Query String: ", queryString);
  const urlParams = new URLSearchParams(queryString);

  //Check QuizId
  if (urlParams.has("quizId")) {
    //Wird eig. schon von selectquiz.inc.js übernommen, aber zur Sicherheit - Stichwort redundanz xD
    if (window.location.pathname != "/quiz.php") {
      window.location.href = `/quiz.php?quizId=${urlParams.get("quizId")}`;
    }
    console.log(
      "You should be redirected! You actually can't see this you hacker!"
    );
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

        searchQuiz.getKlassenstufen().then((res) => {
          console.log(res);
          searchQuiz.selectKlassenstufe(klassenstufe);
          searchQuiz.getFaecher().then((res) => {
            searchQuiz.selectFach(fach);
            searchQuiz.getThemen().then((res) => {
              searchQuiz.selectThema(thema);
              searchQuiz.getQuizze().then((res) => {
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

          searchQuiz.getKlassenstufen().then((res) => {
            console.log(res);
            searchQuiz.selectKlassenstufe(klassenstufe);
            searchQuiz.getFaecher().then((res) => {
              searchQuiz.selectFach(fach);
              searchQuiz.getThemen().then((res) => {
                console.log("Done!");
              });
            });
          });
        } else {
          if (urlParams.has("klassenstufe")) {
            let klassenstufe = urlParams.get("klassenstufe");
            console.log("Klasse enthalten");

            searchQuiz.getKlassenstufen().then((res) => {
              console.log(res);
              searchQuiz.selectKlassenstufe(klassenstufe);
              searchQuiz.getFaecher().then((res) => {
                console.log("Done!");
              });
            });
          }
        }
      }
    } else {
      searchQuiz.getKlassenstufen();
    }
  }
}

checkAndSetQuiz();

//Reload Button
let reloadButton = document.querySelector(".reloadButton");
reloadButton.addEventListener("click", function () {
  searchQuiz.getKlassenstufen();
});

//Searchbar
function searchBar() {
  let searchbar = document.querySelector("#searchbox");

  Utils.listenToChanges(searchbar, "input", 240,() => {
    let input = searchbar.value;
    console.log("Input:", input);
    searchAnything(input);
  });

  let searchAnything = async (input) => {
    console.log(input);
    if (!input || !input.trim().length) {
      disappear();
      return;
    } else {
      console.log("Search: ", input);

      if (searchResultContainer.classList.contains("hidden")) {
        searchResultContainer.classList.remove("hidden");
        console.log("remove hidden");
        searchResultContainer.ani;
        searchResultContainer.classList.add("fade-in");
        searchResultContainer.addEventListener(
          "animationend",
          () => {
            searchResultContainer.classList.remove("fade-in");
          },
          false
        );
      }
      //Suche Themen dazu
      let foundThemen = await Utils.makeJSON(
        await Utils.sendXhrREQUEST(
          "POST",
          "searchThemen&input=" + input,
          "./includes/choosequiz.inc.php",
          "application/x-www-form-urlencoded",
          true,
          true,
          false,
          true
        )
      );
      showresultThemen(foundThemen);

      let foundQuizze = await Utils.makeJSON(
        await Utils.sendXhrREQUEST(
          "POST",
          "searchQuizze&input=" + input,
          "./includes/choosequiz.inc.php",
          "application/x-www-form-urlencoded",
          true,
          true,
          false,
          true
        )
      );
      showresultQuize(foundQuizze);
    }
  };

  let showresultThemen = (resutls) => {
    let themenResultContainer = document.querySelector(
      ".search-results > .themen"
    );
    themenResultContainer.innerHTML = "";

    if (!resutls) {
      themenResultContainer.innerHTML = `
                    <h5>Themen <span>(0)</span></h5>
                    <p>Keine Themen dazu gefunden...<p>
                    `;
      return;
    } else {
      let sorted = Utils.sortItems(resutls, "quizname");
      let links = "";
      sorted.forEach((element) => {
        links += `<li><a href="choosequiz.php?klassenstufe=${element["klassenstufe"]}&fach=${element["fach"]}&thema=${element["thema"]}">${element["thema"]}</a><span class="description"> <br>(${element["klassenstufe"]}, ${element["fach"]})</span></li>`;
      });

      let themenResultContainerInner = `
                    <h5>Themen <span>(${sorted.length})</span></h5>
                                    <ul class="themen-ul">
                                    ${links}
                                    </ul>
                    `;
      themenResultContainer.innerHTML = themenResultContainerInner;
    }
  };

  let showresultQuize = (resutls) => {
    let quizResultContainer = document.querySelector(
      ".search-results > .quize"
    );
    quizResultContainer.innerHTML = "";

    if (!resutls) {
      quizResultContainer.innerHTML = `
            <h5>Quize <span>(0)</span></h5>
            <p>Keine Quize dazu gefunden...<p>
            `;
      return;
    }

    let sorted = Utils.sortItems(resutls, "quizname");
    let links = "";
    sorted.forEach((element) => {
      links += `<li><a href="quiz.php?quizId=${element["quizId"]}">${element["quizname"]}</a><span class="description"> <br>(${element["klassenstufe"]}, ${element["fach"]}, ${element["thema"]})</span></li>`;
    });

    let quizResultContainerInner = `
        <h5>Quize <span>(${sorted.length})</span></h5>
                        <ul class="quize-ul">
                        ${links}
                        </ul>
        `;
    quizResultContainer.innerHTML = quizResultContainerInner;
  };

  /* Search Result Container appear or disappear*/

  //Check if clicked outside the search-container
  document.addEventListener("click", (e) => {
    console.log("document clicked");
    let isHdden = searchResultContainer.classList.contains("hidden");
    console.log("Is hidden: " + isHdden);
    if (e.target.closest(".search-container") != null && isHdden === false) {
      console.log("shuld not dissappear");
    } else {
      console.log("dissappear");
      if (
        isHdden === false &&
        searchResultContainer.classList.contains("fade-out") === false
      ) {
        searchResultContainer.classList.remove("fade-out");
        setTimeout(() => {
          searchResultContainer.classList.add("fade-out");
          setTimeout(() => {
            searchResultContainer.classList.add("hidden");
            searchResultContainer.classList.remove("fade-out");
          }, 400);
        }, 1); /* Some bug fix because it doesn't work without it */
      }
    }
  });

  /* Check which animation*/
  let searchResultContainer = document.querySelector(".search-results");

  function disappear() {
    searchResultContainer.classList.remove("fade-out");
    setTimeout(() => {
      searchResultContainer.classList.add("fade-out");
      setTimeout(() => {
        searchResultContainer.classList.add("hidden");
        searchResultContainer.classList.remove("fade-out");
      }, 400);
    }, 1); /* Some bug fix because it doesn't work without it */
  }
}

searchBar();

//QuizID Input

let quizIDInputTextbox = document.querySelector(
  ".quizIDInputContainer #quizIDInput"
);
let quizIDInputBtn = document.querySelector(
  ".quizIDInputContainer #quizIDInputBtn"
);
if (quizIDInputTextbox && quizIDInputBtn) {
  const inputHandler = function (e) {
    let input = quizIDInputTextbox.value;
    if (!input.trim().length) {
      return;
    } else {
      window.location.href = `quiz.php?quizId=${input}`;
    }
  };

  quizIDInputTextbox.addEventListener("keydown", (key) => {
    console.log(key);
    key = key.key;
    if (key === "Enter") {
      inputHandler();
    }
  });

  quizIDInputBtn.addEventListener("click", () => {
    inputHandler();
  });
}
