
import * as Utils from './utils.js';

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
        console.log(this.ausgewaehlteKlasse, this.ausgewaehltesFach, this.ausgewaehltesThema, this.ausgewaehltesQuiz);
        let klassen = this.navigationsleiste.querySelectorAll(".klassenDropdown");
        let faecher = this.navigationsleiste.querySelectorAll(".faecherDropdown");
        let themen = this.navigationsleiste.querySelectorAll(".themenDropdown");
        let quizze = this.navigationsleiste.querySelectorAll(".quizzeContainer");

        switch (afterContent) {
            case "Reload":
                klassen.forEach(element => {
                    element.remove();
                });
                faecher.forEach(element => {
                    element.remove();
                });
                themen.forEach(element => {
                    element.remove();
                });
                quizze.forEach(element => {
                    element.remove();
                });
                this.klassenDropdown = null;
                this.faecherDropdown = null;
                this.themenDropdown = null;
                this.quizDropdown = null;
                break;
            case "Klasse":
                faecher.forEach(element => {
                    element.remove();
                });
                themen.forEach(element => {
                    element.remove();
                });
                quizze.forEach(element => {
                    element.remove();
                });
                this.faecherDropdown = null;
                this.themenDropdown = null;
                this.quizDropdown = null;
                break;
            case "Fach":
                themen.forEach(element => {
                    element.remove();
                });
                quizze.forEach(element => {
                    element.remove();
                });
                this.themenDropdown = null;
                this.quizDropdown = null;
                break;
            case "Thema":
                quizze.forEach(element => {
                    element.remove();
                });
                this.quizDropdown = null;
                break;
        }



    }

    //Klassenstufen
    getKlassenstufen() {
        return new Promise((resolve, reject) => {
            //Datenbankabfrage aller verfügbaren Klassenstufen
            var xhr = new XMLHttpRequest();
            xhr.open('POST', 'includes/selectQuiz.php', true);
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            xhr.send("getKlassen");
            //Wenn Antwort
            xhr.onload = (() => {
                if (xhr.status == 200) {
                    let response = xhr.response;
                    if (Utils.IsJsonString(xhr.response) === true && moreThanZeroInArray(response) === true) {
                        var parsed = JSON.parse(response);
                        console.log(parsed)
                        this.setKlassenstufen(false, parsed).then(resolve("Erfolg")).catch(error => console.log(error));
                    } else {
                        console.log(response);
                        this.setKlassenstufen(true, false).then(resolve("Fehler")).catch(error => console.log(error));
                    }
                }
            });
            xhr.onerror = (() => {
                this.setKlassenstufen(true, false).then(res => { resolve("HTTP-Error"); console.log("An error occurred - ", res); }).catch(error => console.log(error));
            })

        });

    }

    setKlassenstufen(error, data) {
        return new Promise((resolve, reject) => {
            this.resetChoice("Reload");

            let DropdownCreate = document.createElement("div");
            DropdownCreate.className = 'dropdown klassenDropdown';
            this.navigationsleiste.appendChild(DropdownCreate);
            console.log(this.navigationsleiste)

            //Nimmt .klassenDropdown aus dem DOM
            this.klassenDropdown = this.navigationsleiste.querySelector(".klassenDropdown");
            // console.log(this.klassenDropdown);

            if (error) {
                //Sollte nicht passieren
                
                this.klassenDropdown.innerHTML =
                    `
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

                this.klassenDropdown.innerHTML =
                    `
                <div class="dropdown">
                    <button class="btn btn-info dropdown-toggle btn-lg" type="button" id="klassenDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                        <span class='dropdown-description-klassenDropdown'>Klasse auswählen</span>
                    </button>
                    <ul class="dropdown-menu" aria-labelledby="klassenDropdown2">
                        <h6 class="dropdown-header">Klassenstufe auswählen</h6>
                        <div class="dropdown-divider"></div>
                    </ul>
                </div>
               `;

                let dropDownLinkContainerKlassen = this.navigationsleiste.querySelector(".klassenDropdown .dropdown-menu");
                this.dropDownLinkContainerKlassen = dropDownLinkContainerKlassen;
                // console.log(dropDownLinkContainerKlassen);

                sorted.forEach(element => {
                    let link = document.createElement("li");
                    link.innerHTML = `<a class="dropdown-item selectKlasseItem" value="${element}">${element}</a>`;
                    this.dropDownLinkContainerKlassen.appendChild(link);
                });

                //Add Eventlistener
                let selectKlasseItem = this.navigationsleiste.querySelectorAll(".selectKlasseItem");
                selectKlasseItem.forEach(element => {
                    element.addEventListener("click", () => {
                        this.selectKlassenstufe(element.getAttribute("value"));
                        this.getFaecher();
                    });
                });
                resolve("Klassen gesetzt");
            }
        })

    }

    setKlassenstufenCustomName(customName) {
        if (this.klassenDropdown != null) {
            let dropdownDescription = this.navigationsleiste.querySelector(".dropdown-description-klassenDropdown");
            if (dropdownDescription != null) {
                dropdownDescription.innerText = customName;
            } else {
                console.log("Couldn't set the name of this dropdown")
            }

        }
    }

    selectKlassenstufe(klassenstufe) {
        this.ausgewaehlteKlasse = klassenstufe;
    }


    // Fächer
    getFaecher() {
        this.setKlassenstufenCustomName(this.ausgewaehlteKlasse);

        return new Promise((resolve, reject) => {
            //Datenbankabfrage aller verfügbaren Fächer
            var xhr = new XMLHttpRequest();
            xhr.open('POST', 'includes/selectQuiz.php', true);
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            xhr.send("getFaecher&klassenstufe=" + this.ausgewaehlteKlasse);
            //Wenn Antwort
            xhr.onload = (() => {
                if (xhr.status == 200) {
                    let response = xhr.response;
                    console.log(response);
                    if (Utils.IsJsonString(xhr.response) && moreThanZeroInArray(response)) {
                        var parsed = JSON.parse(response);
                        this.setFaecher(false, parsed).then(resolve()).catch(error => console.log(error));
                    } else {
                        console.log(response);
                        this.setFaecher(true, false).then(resolve()).catch(error => console.log(error));
                    }
                }
            });
            xhr.onerror = (() => {
                this.setFaecher(true, false).then(resolve()).catch(error => console.log(error));
            })

        });
    }

    setFaecher(error, data) {
        return new Promise((resolve, reject) => {
            this.resetChoice("Klasse");

            let DropdownCreate = document.createElement("div");
            DropdownCreate.className = 'faecherDropdown';
            this.navigationsleiste.appendChild(DropdownCreate);

            //Nimmt .klassenDropdown aus dem DOM
            this.faecherDropdown = this.navigationsleiste.querySelector(".faecherDropdown");
            // console.log(this.klassenDropdown);

            if (error) {
                //Sollte nicht passieren
                this.faecherDropdown.innerHTML =
                    `
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

                this.faecherDropdown.innerHTML =
                    `
                <div class="dropdown">
                    <button class="btn btn-info dropdown-toggle btn-lg" type="button" id="faecherDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                        <span class='dropdown-description-faecherDropdown'>Fach auswählen</span>
                    </button>
                    <ul class="dropdown-menu" aria-labelledby="faecherDropdown">
                        <h6 class="dropdown-header">Fach auswählen</h6>
                    </ul>
                </div>
               `;

                let dropDownLinkContainerFaecher = this.navigationsleiste.querySelector(".faecherDropdown .dropdown-menu");
                this.dropDownLinkContainerFaecher = dropDownLinkContainerFaecher;
                // console.log(dropDownLinkContainerFaecher);

                sorted.forEach(element => {
                    let link = document.createElement("li");
                    link.innerHTML = `<a class="dropdown-item selectFachItem" value="${element}">${element}</a>`;
                    this.dropDownLinkContainerFaecher.appendChild(link);
                });

                //Add Eventlistener
                let selectFachItem = this.navigationsleiste.querySelectorAll(".selectFachItem");
                selectFachItem.forEach(element => {
                    element.addEventListener("click", () => {
                        this.selectFach(element.getAttribute("value"));
                        this.getThemen();
                    });
                });
                resolve("Fächer gesetzt");
            }
        })


    }

    setFaecherCustomName(customName) {
        if (this.faecherDropdown != null) {
            let dropdownDescription = this.navigationsleiste.querySelector(".dropdown-description-faecherDropdown");
            if (dropdownDescription != null) {
                dropdownDescription.innerText = customName;
            } else {
                console.log("Couldn't set the name of this dropdown")
            }

        }
    }

    selectFach(fach) {
        this.ausgewaehltesFach = fach;
    }

    // Themen
    getThemen() {
        this.setFaecherCustomName(this.ausgewaehltesFach);

        return new Promise((resolve, reject) => {
            //Datenbankabfrage aller verfügbaren Themen
            var xhr = new XMLHttpRequest();
            xhr.open('POST', 'includes/selectQuiz.php', true);
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            xhr.send("getThemen&klassenstufe=" + this.ausgewaehlteKlasse + "&fach=" + this.ausgewaehltesFach);
            //Wenn Antwort
            xhr.onload = (() => {
                if (xhr.status == 200) {
                    let response = xhr.response;
                    console.log(response);
                    if (Utils.IsJsonString(xhr.response) && moreThanZeroInArray(response)) {
                        var parsed = JSON.parse(response);
                        this.setThemen(false, parsed).then(resolve()).catch(error => console.log(error));
                    } else {
                        console.log(this.response);
                        this.setThemen(true, false).then(resolve()).catch(error => console.log(error));
                    }
                }
            });
            xhr.onerror = (() => {
                this.setThemen(true, false).then(resolve()).catch(error => console.log(error));
            })

        });
    }

    setThemen(error, data) {
        return new Promise((resolve, reject) => {
            this.resetChoice("Fach");

            let DropdownCreate = document.createElement("div");
            DropdownCreate.className = 'themenDropdown';
            this.navigationsleiste.appendChild(DropdownCreate);

            //Nimmt .klassenDropdown aus dem DOM
            this.themenDropdown = this.navigationsleiste.querySelector(".themenDropdown");
            // console.log(this.klassenDropdown);

            if (error) {
                //Sollte nicht passieren
                this.themenDropdown.innerHTML =
                    `
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

                this.themenDropdown.innerHTML =
                    `
                <div class="dropdown">
                    <button class="btn btn-info dropdown-toggle btn-lg" type="button" id="themenDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                        <span class='dropdown-description-themenDropdown'>Thema auswählen</span>
                    </button>
                    <ul class="dropdown-menu" aria-labelledby="themenDropdown">
                        <h6 class="dropdown-header">Thema auswählen</h6>
                    </ul>
                </div>
                `;

                let dropDownLinkContainerThemen = this.navigationsleiste.querySelector(".themenDropdown .dropdown-menu");
                this.dropDownLinkContainerThemen = dropDownLinkContainerThemen;
                // console.log(dropDownLinkContainerThemen);

                sorted.forEach(element => {
                    let link = document.createElement("li");
                    link.innerHTML = `<a class="dropdown-item selectThemaItem" value="${element}">${element}</a>`;
                    this.dropDownLinkContainerThemen.appendChild(link);
                });

                //Add Eventlistener
                let selectFachItem = this.navigationsleiste.querySelectorAll(".selectThemaItem");
                selectFachItem.forEach(element => {
                    element.addEventListener("click", () => {
                        this.selectThema(element.getAttribute("value"));
                        this.getQuizze();
                    });;
                });
                resolve("Themen gesetzt");
            }
        })


    }

    setThemenCustomName(customName) {
        if (this.themenDropdown != null) {
            let dropdownDescription = this.navigationsleiste.querySelector(".dropdown-description-themenDropdown");
            if (dropdownDescription != null) {
                dropdownDescription.innerText = customName;
            } else {
                console.log("Couldn't set the name of this dropdown")
            }

        }
    }

    selectThema(thema) {
        this.ausgewaehltesThema = thema;
    }


    // Quizze
    getQuizze() {
        this.setThemenCustomName(this.ausgewaehltesThema);

        return new Promise((resolve, reject) => {
            //Datenbankabfrage aller verfügbaren Themen
            var xhr = new XMLHttpRequest();
            xhr.open('POST', 'includes/selectQuiz.php', true);
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            xhr.send("getQuizze&klassenstufe=" + this.ausgewaehlteKlasse + "&fach=" + this.ausgewaehltesFach + "&thema=" + this.ausgewaehltesThema);
            //Wenn Antwort
            xhr.onload = (() => {
                if (xhr.status == 200) {
                    let response = xhr.response;
                    console.log(response);
                    if (Utils.IsJsonString(xhr.response) && moreThanZeroInArray(response)) {
                        var parsed = JSON.parse(response);
                        this.setQuizze(false, parsed).then(resolve()).catch(error => console.log(error));
                    } else {
                        console.log(this.response);
                        this.setQuizze(true, false).then(resolve()).catch(error => console.log(error));
                    }
                }
            });
            xhr.onerror = (() => {
                this.setQuizze(true, false).then(resolve()).catch(error => console.log(error));
            })

        });
    }

    //Set Quizze
    setQuizze(error, data) {
        return new Promise((resolve, reject) => {
            this.resetChoice("Thema");

            let ElementCreate = document.createElement("div");
            ElementCreate.className = 'quizzeContainer';
            this.navigationsleiste.appendChild(ElementCreate);

            //Nimmt .klassenDropdown aus dem DOM
            this.quizzeContainer = this.navigationsleiste.querySelector(".quizzeContainer");
            // console.log(this.quizzeDropdown);

            if (error) {
                //Sollte nicht passieren
                this.quizzeContainer.innerHTML =
                    `
                <div class="quizAuswahlDescription">Keine Quize dazu gefunden.</div>
                <ul class="results">
                    
                <ul>
                `;
                resolve("Keine Quizze gefunden.");
            } else {
                //Normal execution --- normal

                let sorted = Utils.sortItems(data, "quizname");
                // console.log("Diese Quizze sind sortiert verfügbar: ", sorted);

                this.quizzeContainer.innerHTML =
                    `
                    <div class="quizAuswahlDescription"><b>Quize dazu gefunden</b> (${sorted.length})</div>
                    <ul class="results">
                        
                    <ul>
               `;

                let dropDownLinkContainerQuizze = this.navigationsleiste.querySelector(".quizzeContainer .results");
                this.dropDownLinkContainerQuizze = dropDownLinkContainerQuizze;
                // console.log(dropDownLinkContainerThemen);

                sorted.forEach(element => {
                    let link = document.createElement("li");
                    link.innerHTML = `<li class="quizLink" value="${element["quizId"]}"><a>${element["quizname"]}</a></li>`;
                    this.dropDownLinkContainerQuizze.appendChild(link);
                });

                //Add Eventlistener
                let selectQuizItem = this.navigationsleiste.querySelectorAll(".quizLink");
                selectQuizItem.forEach(element => {
                    element.addEventListener("click", () => {
                        this.selectQuiz(element.getAttribute("value"));
                        window.location.href = `quiz.php?quizId=${element.getAttribute("value")}`;
                    });;
                });
                resolve("Quizze gesetzt");
            }
        })

    }


    selectQuiz(quiz) {
        this.ausgewaehltesQuiz = quiz;
    }




}


let searchQuiz = new SelectQuizNav(document.querySelector(".dropdownContainer"));
searchQuiz.getKlassenstufen();

function getQuizParameter(quizId) {
    return new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'includes/selectQuiz.php', true);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.send("getQuizparams&quizId=" + quizId);
        //Wenn Antwort
        xhr.onload = (() => {
            if (xhr.status == 200) {
                let response = xhr.response;
                // console.log("Quizparameter", response);
                if (Utils.IsJsonString(xhr.response) && moreThanZeroInArray(response)) {
                    var parsed = JSON.parse(response);
                    resolve(parsed);
                } else {
                    reject("Kein Quiz mit der QuizId gefunden.");
                }
            }
        });
        xhr.onerror = (() => {
            reject("Ein Fehler ist aufgetreten. (XMLHttpRequest-Error)");
        })

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
    console.log("You should be redirected! You actually can't see this you hacker!")
} else {
    if (urlParams.has("klassenstufe")) {
        //Klassenstufe, Fach, Thema (QuizID nicht, wegen redirect)
        if (urlParams.has("klassenstufe") && urlParams.has("fach") && urlParams.has("thema")) {
            // alert("Klasse, Fach, Thema enthalten");
            let klassenstufe = urlParams.get("klassenstufe");
            let fach = urlParams.get("fach");
            let thema = urlParams.get("thema");
            console.log("Klasse: " + klassenstufe, "Fach: " + fach, "Thema: " + thema);

            searchQuiz.getKlassenstufen().then(res => {
                console.log(res);
                searchQuiz.selectKlassenstufe(klassenstufe);
                searchQuiz.getFaecher().then(res => {
                    searchQuiz.selectFach(fach);
                    searchQuiz.getThemen().then(res => {
                        searchQuiz.selectThema(thema);
                        searchQuiz.getQuizze().then(res => {
                            console.log("Done!");
                        })
                    })
                })

            })
        } else {
            if (urlParams.has("klassenstufe") && urlParams.has("fach")) {
                // alert("Klasse, Fach enthalten");
                let klassenstufe = urlParams.get("klassenstufe");
                let fach = urlParams.get("fach");
                console.log("Klasse: " + klassenstufe, "Fach: " + fach);

                searchQuiz.getKlassenstufen().then(res => {
                    console.log(res);
                    searchQuiz.selectKlassenstufe(klassenstufe);
                    searchQuiz.getFaecher().then(res => {
                        searchQuiz.selectFach(fach);
                        searchQuiz.getThemen().then(res => {
                            console.log("Done!");
                        })
                    })
                })
            } else {
                if (urlParams.has("klassenstufe")) {
                    let klassenstufe = urlParams.get("klassenstufe");
                    console.log("Klasse enthalten");

                    searchQuiz.getKlassenstufen().then(res => {
                        console.log(res);
                        searchQuiz.selectKlassenstufe(klassenstufe);
                        searchQuiz.getFaecher().then(res => {
                            console.log("Done!");
                        })
                    })
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
reloadButton.addEventListener("click", function(){
    searchQuiz.getKlassenstufen();
})




//Searchbar
function searchBar() {
    let searchbar = document.querySelector("#searchbox");

$("#searchbox").on("change keyup paste", function(){
    //Get input of searchbar
    let input = searchbar.value;
    searchAnything(input);
})

let searchThemen = (input) => {

    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'includes/choosequiz.inc.php', true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    //Wenn Antwort
    xhr.onload = function(){
        if (this.status == 200){
           if (Utils.IsJsonString(this.response)){
                var parsed = JSON.parse(this.response);
                console.log(parsed);
                //Setze Dropdown mit Quizzes
                if (moreThanZeroInArray(parsed)){
                   showresultThemen(parsed);
                }

           } else {
               console.log("searchThemen() else: ", this.responseText);
               showresultThemen(false);
           }

        }
    }
    xhr.send("searchThemen" + "&input="+ input);

}

let searchQuize = (input) => {

    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'includes/choosequiz.inc.php', true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    //Wenn Antwort
    xhr.onload = function(){
        if (this.status == 200){
           if (Utils.IsJsonString(this.response) === true){
                var parsed = JSON.parse(this.response);
                console.log(parsed);
                //Setze Dropdown mit Quizzes
                if (moreThanZeroInArray(parsed)){
                   showresultQuize(parsed);
                }

           } else {
               console.log("searchQuize() else: ", this.responseText);
               showresultQuize(false);
           }

        }
    }
    xhr.send("searchQuize" + "&input="+ input);

}

let searchAnything = (input) => {
    if (input === '' || input === ' '){
        showresultQuize(false);
        return;
    } else {
        console.log("Search: ",input);

        //Auftauchen des Result-Feldes
        let searchResultBox = document.querySelector(".search-results");

        if (searchResultBox.classList.contains("hidden")) {
            searchResultBox.classList.remove("hidden");
            if (searchResultBox.classList.contains("hidden")){
                searchResultBox.classList.remove("hidden");
            }
            searchResultBox.classList.add("fade-in");
            searchResultBox.addEventListener("animationend", () => {
                searchResultBox.classList.remove("fade-in");

            }, false);
        }


        //Suche Themen dazu
        searchThemen(String(input));

        //Suche Quize dazu
        searchQuize(String(input));
    }


}

let showresultThemen = (resutls) => {

            let themenResultContainer = document.querySelector(".search-results > .themen");
            themenResultContainer.innerHTML = '';

            if (resutls === false) {
                themenResultContainer.innerHTML = 
                `
                <h5>Themen <span>(0)</span></h5>
                <p>Keine Themen dazu gefunden...<p>
                `;
                return;
            } else {
                let sorted = resutls.sort((a, b) => {
                    let a1 = a["thema"];
                    let b1 = b["thema"];
                   return a1.localeCompare(b1, undefined, { numeric: true });
                  });
                let links = '';
                sorted.forEach(element => {
                    links +=  `<li><a href="choosequiz.php?klassenstufe=${element["klassenstufe"]}&fach=${element["fach"]}&thema=${element["thema"]}">${element["thema"]}</a><span class="description"> <br>(${element["klassenstufe"]}, ${element["fach"]})</span></li>`;
                });

                let themenResultContainerInner = 
                `
                <h5>Themen <span>(${sorted.length})</span></h5>
                                <ul class="themen-ul">
                                   ${links}
                                </ul>
                `;
                themenResultContainer.innerHTML = themenResultContainerInner;

            }



}

let showresultQuize = (resutls) => {
    let quizResultContainer = document.querySelector(".search-results > .quize");
    quizResultContainer.innerHTML = '';

    if (resutls === false) {
        quizResultContainer.innerHTML = 
        `
        <h5>Quize <span>(0)</span></h5>
        <p>Keine Quize dazu gefunden...<p>
        `;
        return;
    }



    let sorted = resutls.sort((a, b) => {
        let a1 = a["quizname"];
        let b1 = b["quizname"];
       return a1.localeCompare(b1, undefined, { numeric: true });
      });
    let links = '';
    sorted.forEach(element => {
        links +=  `<li><a href="quiz.php?quizId=${element["quizId"]}">${element["quizname"]}</a><span class="description"> <br>(${element["klassenstufe"]}, ${element["fach"]}, ${element["thema"]})</span></li>`;
    });

    let quizResultContainerInner = 
    `
    <h5>Quize <span>(${sorted.length})</span></h5>
                    <ul class="themen-ul">
                       ${links}
                    </ul>
    `;
    quizResultContainer.innerHTML = quizResultContainerInner;


}

/* Search Result Container appear or disappear*/

let searchResultContainerIsclicked = false;

//Check if clicked outside the search-container
document.addEventListener("click", () => {
    console.log("document Clicked! ", searchResultContainerIsclicked);
    if (searchResultContainerIsclicked === false && searchResultContainer.classList.contains("hidden") == false){

        searchResultContainer.classList.remove("fade-out");
        setTimeout(() => {
            searchResultContainer.classList.add("fade-out");
        }, 1); /* Some bug fix because it doesn't work without it */

        setTimeout(() => {
            searchResultContainer.classList.add("hidden");
            searchResultContainer.classList.remove("fade-out");
        }, 400);
    }
});

document.querySelector(".search-container").addEventListener("click", () => {
    searchResultContainerIsclicked = true;
    setTimeout(() => {
        searchResultContainerIsclicked = false;
        console.log("search container is not clicked anymore");
    }, 100);

})

/* Check which animation*/
let searchResultContainer = document.querySelector(".search-results")

searchResultContainer.addEventListener("animationend", () => {

 if (searchResultContainer.classList.contains("fade-in")){
    searchResultContainer.classList.remove("fade-in");
 }   else if (searchResultContainer.classList.contains("fade-out")){
    searchResultContainer.classList.remove("fade-out");
    searchResultContainer.classList.add("hidden");
 }
}, false);
}

searchBar();
