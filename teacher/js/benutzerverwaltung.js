"use strict";
import * as Utils from "../../includes/utils.js";
import {
  changeGroups,
  changePermissions,
  addPermission,
  editScores
} from "./benutzerverwaltung.inc.js";

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
    this.editBtn = null;
    this.resultDescriptionContainer = null;
    this.resultBox = null;

    //Edit
    this.editTable = null;
    this.editContainer = null;
    this.editTableBody = null;

    this.searchReloadBtn = null;
    this.editReloadBtn = null;
  }

  prepareEdit() {
    if (!this.editContainer) return "no edit container";
    this.editContainer.classList.add("hidden");

    let reloadBtn = this.editContainer.querySelector("#reload");
    if (!reloadBtn) return "no reload button";
    reloadBtn.addEventListener("click", () => {
      this.edit(this.choosenArray);
    });

    //Edit Btn
    this.editReloadBtn = reloadBtn;
    this.clear(this.editTableBody);

    //Change All
    let thead = this.editTable.querySelector("thead");
    let changeAllKlassenstufeBtn = thead.querySelector(
      "#klassenstufe #changeAll"
    );
    let changeAllauthenticatedBtn = thead.querySelector(
      "#authenticated #changeAll"
    );
    let changeAllgroupsBtn = thead.querySelector("#groups #changeAll");
    let changeAllpermissionsBtn = thead.querySelector(
      "#permissions #changeAll"
    );
    let changeAllOtherBtn = thead.querySelector("#other #btn");

    changeAllKlassenstufeBtn.addEventListener("click", async () => {
      if (
        !(await Utils.userHasPermissions([
          "editUserInformation",
          "benutzerverwaltungChangeKlassenstufe",
        ]))
      ) {
        return false;
      }
      let type = false;

      type = await Utils.getUserInput(
        "Auswahl treffen",
        "Welche Aktion möchtest du ausfürhen?",
        false,
        "select",
        false,
        false,
        false,
        {
          "Klassenstufe ändern": "changeKlassenstufe",
          "Klassenstufe entfernen": "removeKlassenstufe",
        },
        true
      );

      if (type === "changeKlassenstufe") {
        let availableKlassenstufen = await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "benutzerverwaltung&operation=other&type=getAllKlassenstufenUserCanBe",
            "./includes/benutzerverwaltung.inc.php",
            "application/x-www-form-urlencoded",
            true,
            true,
            false,
            true
          )
        );
        let choosen = await Utils.chooseFromArrayWithSearch(
          availableKlassenstufen,
          false,
          "Klassenstufe auswählen",
          false,
          true
        );
        if (choosen == false || !choosen.length > 0) {
          Utils.alertUser("Nachricht", "Keine Aktion unternommen", false);
          return false;
        }
        for (const current of this.choosenArray) {
          await Utils.makeJSON(
            await Utils.sendXhrREQUEST(
              "POST",
              "benutzerverwaltung&operation=changeValue&type=klassenstufe&userID=" +
                current +
                "&input=" +
                choosen[0],
              "./includes/benutzerverwaltung.inc.php",
              "application/x-www-form-urlencoded",
              true,
              false,
              false,
              true,
              false
            )
          );
        }
      } else if (type === "removeKlassenstufe") {
        for (const current of this.choosenArray) {
          await Utils.makeJSON(
            await Utils.sendXhrREQUEST(
              "POST",
              "benutzerverwaltung&operation=changeValue&type=klassenstufe&userID=" +
                current +
                "&input=",
              "./includes/benutzerverwaltung.inc.php",
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

      this.edit(this.choosenArray);
    });

    changeAllauthenticatedBtn.addEventListener("click", async () => {
      if (
        !(await Utils.userHasPermissions([
          "editUserInformation",
          "benutzerverwaltungChangeAuthenticated",
        ]))
      ) {
        return false;
      }
      let userInput = await Utils.getUserInput(
        "Bestätigungsstatus ändern",
        "Sollen die Benutzer bestätigt sein?",
        false,
        "yes/no",
        false,
        false,
        false
      );
      if (userInput === false) {
        Utils.alertUser("Nachricht", "Keine Aktion unternommen", false);
        return false;
      }
      for (const current of this.choosenArray) {
        await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "benutzerverwaltung&operation=changeValue&type=authenticated&userID=" +
              current +
              "&input=" +
              userInput,
            "./includes/benutzerverwaltung.inc.php",
            "application/x-www-form-urlencoded",
            true,
            false,
            false,
            true,
            false
          )
        );
      }
      this.edit(this.choosenArray);
    });

    changeAllgroupsBtn.addEventListener("click", async () => {
      if (
        !(await Utils.userHasPermissions([
          "editUserInformation",
          "benutzerverwaltungChangeGroups",
        ]))
      ) {
        return false;
      }

      let method = await Utils.getUserInput(
        "Methode auswählen",
        "Wähle die Methode aus",
        false,
        "select",
        false,
        false,
        false,
        {
          "Überschreiben (nur ausgewählte setzen)": "overwrite",
          Hinzufügen: "add",
          Entfernen: "remove",
          "Alle entfernen": "removeAll",
        },
        true
      );

      if (method === "add") {
        let allGroupsUserCanAdd = await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "benutzerverwaltung&operation=other&type=getGroupsUserCanAdd",
            "./includes/benutzerverwaltung.inc.php",
            "application/x-www-form-urlencoded",
            true,
            false,
            false,
            true
          )
        );

        let choosen = await Utils.chooseFromArrayWithSearch(
          allGroupsUserCanAdd,
          true,
          "Auswahl",
          false,
          true
        );
        if (!choosen || !choosen.length > 0) {
          await Utils.alertUser("Nachricht", "Keine Aktion unternommen");
          return false;
        }
        for (const current of this.choosenArray) {
          for (const currentGroup of choosen) {
            await Utils.makeJSON(
              await Utils.sendXhrREQUEST(
                "POST",
                "benutzerverwaltung&operation=changeValue&type=changeGroups&method=add&group=" +
                  currentGroup +
                  "&userID=" +
                  current,
                "./includes/benutzerverwaltung.inc.php",
                "application/x-www-form-urlencoded",
                true,
                false,
                false,
                true
              )
            );
          }
        }
      } else if (method === "remove") {
        let allGroupsUserCanAdd = await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "benutzerverwaltung&operation=other&type=getGroupsUserCanAdd",
            "./includes/benutzerverwaltung.inc.php",
            "application/x-www-form-urlencoded",
            true,
            false,
            false,
            true
          )
        );

        let choosen = await Utils.chooseFromArrayWithSearch(
          allGroupsUserCanAdd,
          true,
          "Auswahl",
          false,
          true
        );
        if (!choosen || !choosen.length > 0) {
          await Utils.alertUser("Nachricht", "Keine Aktion unternommen");
          return false;
        }
        for (const current of this.choosenArray) {
          for (const currentGroup of choosen) {
            await Utils.makeJSON(
              await Utils.sendXhrREQUEST(
                "POST",
                "benutzerverwaltung&operation=changeValue&type=changeGroups&method=remove&group=" +
                  currentGroup +
                  "&userID=" +
                  current,
                "./includes/benutzerverwaltung.inc.php",
                "application/x-www-form-urlencoded",
                true,
                false,
                false,
                true
              )
            );
          }
        }
      } else if (method === "overwrite") {
        let allGroupsUserCanAdd = await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "benutzerverwaltung&operation=other&type=getGroupsUserCanAdd",
            "./includes/benutzerverwaltung.inc.php",
            "application/x-www-form-urlencoded",
            true,
            false,
            false,
            true
          )
        );

        let choosen = await Utils.chooseFromArrayWithSearch(
          allGroupsUserCanAdd,
          true,
          "Auswahl",
          false,
          true
        );
        if (!choosen || !choosen.length > 0) {
          await Utils.alertUser("Nachricht", "Keine Aktion unternommen");
          return false;
        }
        for (const current of this.choosenArray) {
          await Utils.makeJSON(
            await Utils.sendXhrREQUEST(
              "POST",
              "benutzerverwaltung&operation=changeValue&type=changeGroups&method=removeAll&userID=" +
                current,
              "./includes/benutzerverwaltung.inc.php",
              "application/x-www-form-urlencoded",
              true,
              false,
              false,
              true
            )
          );
          for (const currentGroup of choosen) {
            await Utils.makeJSON(
              await Utils.sendXhrREQUEST(
                "POST",
                "benutzerverwaltung&operation=changeValue&type=changeGroups&method=add&group=" +
                  currentGroup +
                  "&userID=" +
                  current,
                "./includes/benutzerverwaltung.inc.php",
                "application/x-www-form-urlencoded",
                true,
                false,
                false,
                true
              )
            );
          }
        }
      } else if (method === "removeAll") {
        for (const current of this.choosenArray) {
          await Utils.makeJSON(
            await Utils.sendXhrREQUEST(
              "POST",
              "benutzerverwaltung&operation=changeValue&type=changeGroups&method=removeAll&userID=" +
                current,
              "./includes/benutzerverwaltung.inc.php",
              "application/x-www-form-urlencoded",
              true,
              false,
              false,
              true
            )
          );
        }
      }
      this.edit(this.choosenArray);
    });

    changeAllpermissionsBtn.addEventListener("click", async () => {
      if (
        !(await Utils.userHasPermissions([
          "editUserInformation",
          "benutzerverwaltungChangePermissions",
        ]))
      ) {
        return false;
      }

      let type = await Utils.getUserInput(
        "Typ auswählen",
        "Wähle den Typen aus",
        false,
        "select",
        false,
        false,
        false,
        {
          "Erlaubte Berechtigungen": "allowedPermissions",
          "Verbotene Berechtigungen": "forbiddenPermissions",
        },
        true
      );

      let method = await Utils.getUserInput(
        "Methode auswählen",
        "Wähle die Methode aus",
        false,
        "select",
        false,
        false,
        false,
        {
          "Überschreiben (nur ausgewählte setzen)": "overwrite",
          Hinzufügen: "add",
          Entfernen: "remove",
          "Alle entfernen": "removeAll",
        },
        true
      );

      if (type === "allowedPermissions") {
        if (method === "add") {
          let choosen = await addPermission([]);
          if (!choosen || !choosen.length > 0) {
            await Utils.alertUser("Nachricht", "Keine Aktion unternommen");
            return false;
          }
          let value = await Utils.getUserInput(
            "Wert eingeben",
            "Welchen Wert möchtest du für alle ausgewählten Berechtigungen für alle ausgewählten Benutzer sezten?",
            false,
            "text"
          );
          if (Utils.isEmptyInput(value, true)) {
            await Utils.alertUser("Nachricht", "Keine Aktion unternommen");
            return false;
          }
          for (const current of this.choosenArray) {
            for (const currentPermission of choosen) {
              await Utils.makeJSON(
                await Utils.sendXhrREQUEST(
                  "POST",
                  "benutzerverwaltung&operation=changePermissions&type=allowedPermissions&secondOperation=addPermission&permissionName=" +
                    currentPermission +
                    "&value=" +
                    value +
                    "&userID=" +
                    current,
                  "./includes/benutzerverwaltung.inc.php",
                  "application/x-www-form-urlencoded",
                  true,
                  false,
                  false,
                  false
                )
              );
            }
          }
        } else if (method === "remove") {
          let choosen = await addPermission([]);
          if (!choosen || !choosen.length > 0) {
            await Utils.alertUser("Nachricht", "Keine Aktion unternommen");
            return false;
          }
          for (const current of this.choosenArray) {
            for (const currentPermission of choosen) {
              await Utils.makeJSON(
                await Utils.sendXhrREQUEST(
                  "POST",
                  "benutzerverwaltung&operation=changePermissions&type=allowedPermissions&secondOperation=removePermission&permissionName=" +
                    currentPermission +
                    "&userID=" +
                    current,
                  "./includes/benutzerverwaltung.inc.php",
                  "application/x-www-form-urlencoded",
                  true,
                  false,
                  false,
                  false
                )
              );
            }
          }
        } else if (method === "overwrite") {
          let choosen = await addPermission([]);
          if (!choosen || !choosen.length > 0) {
            await Utils.alertUser("Nachricht", "Keine Aktion unternommen");
            return false;
          }
          for (const current of this.choosenArray) {
            await Utils.makeJSON(
              await Utils.sendXhrREQUEST(
                "POST",
                "benutzerverwaltung&operation=changePermissions&type=allowedPermissions&secondOperation=removeAllPermissions&userID=" +
                  current,
                "./includes/benutzerverwaltung.inc.php",
                "application/x-www-form-urlencoded",
                true,
                false,
                false,
                false
              )
            );

            for (const currentPermission of choosen) {
              await Utils.makeJSON(
                await Utils.sendXhrREQUEST(
                  "POST",
                  "benutzerverwaltung&operation=changePermissions&type=allowedPermissions&secondOperation=addPermission&permissionName=" +
                    currentPermission +
                    "&value=" +
                    value +
                    "&userID=" +
                    current,
                  "./includes/benutzerverwaltung.inc.php",
                  "application/x-www-form-urlencoded",
                  true,
                  false,
                  false,
                  false
                )
              );
            }
          }
        } else if (method === "removeAll") {
          for (const current of this.choosenArray) {
            await Utils.makeJSON(
              await Utils.sendXhrREQUEST(
                "POST",
                "benutzerverwaltung&operation=changePermissions&type=allowedPermissions&secondOperation=removeAllPermissions&userID=" +
                  current,
                "./includes/benutzerverwaltung.inc.php",
                "application/x-www-form-urlencoded",
                true,
                false,
                false,
                false
              )
            );
          }
        }
      } else if (type === "forbiddenPermissions") {
        if (method === "add") {
          let choosen = await addPermission([]);
          if (!choosen || !choosen.length > 0) {
            await Utils.alertUser("Nachricht", "Keine Aktion unternommen");
            return false;
          }
          for (const current of this.choosenArray) {
            for (const currentPermission of choosen) {
              await Utils.makeJSON(
                await Utils.sendXhrREQUEST(
                  "POST",
                  "benutzerverwaltung&operation=changePermissions&type=forbiddenPermissions&secondOperation=addPermission&permissionName=" +
                    currentPermission +
                    "&userID=" +
                    current,
                  "./includes/benutzerverwaltung.inc.php",
                  "application/x-www-form-urlencoded",
                  true,
                  false,
                  false,
                  false
                )
              );
            }
          }
        } else if (method === "remove") {
          let choosen = await addPermission([]);
          if (!choosen || !choosen.length > 0) {
            await Utils.alertUser("Nachricht", "Keine Aktion unternommen");
            return false;
          }
          for (const current of this.choosenArray) {
            for (const currentPermission of choosen) {
              await Utils.makeJSON(
                await Utils.sendXhrREQUEST(
                  "POST",
                  "benutzerverwaltung&operation=changePermissions&type=forbiddenPermissions&secondOperation=removePermission&permissionName=" +
                    currentPermission +
                    "&userID=" +
                    current,
                  "./includes/benutzerverwaltung.inc.php",
                  "application/x-www-form-urlencoded",
                  true,
                  false,
                  false,
                  false
                )
              );
            }
          }
        } else if (method === "overwrite") {
          let choosen = await addPermission([]);
          if (!choosen || !choosen.length > 0) {
            await Utils.alertUser("Nachricht", "Keine Aktion unternommen");
            return false;
          }
          for (const current of this.choosenArray) {
            for (const current of this.choosenArray) {
              await Utils.makeJSON(
                await Utils.sendXhrREQUEST(
                  "POST",
                  "benutzerverwaltung&operation=changePermissions&type=forbiddenPermissions&secondOperation=removeAllPermissions&userID=" +
                    current,
                  "./includes/benutzerverwaltung.inc.php",
                  "application/x-www-form-urlencoded",
                  true,
                  false,
                  false,
                  false
                )
              );
            }
            for (const currentPermission of choosen) {
              await Utils.makeJSON(
                await Utils.sendXhrREQUEST(
                  "POST",
                  "benutzerverwaltung&operation=changePermissions&type=forbiddenPermissions&secondOperation=addPermission&permissionName=" +
                    currentPermission +
                    "&userID=" +
                    current,
                  "./includes/benutzerverwaltung.inc.php",
                  "application/x-www-form-urlencoded",
                  true,
                  false,
                  false,
                  false
                )
              );
            }
          }
        } else if (method === "removeAll") {
          for (const current of this.choosenArray) {
            await Utils.makeJSON(
              await Utils.sendXhrREQUEST(
                "POST",
                "benutzerverwaltung&operation=changePermissions&type=forbiddenPermissions&secondOperation=removeAllPermissions&userID=" +
                  current,
                "./includes/benutzerverwaltung.inc.php",
                "application/x-www-form-urlencoded",
                true,
                false,
                false,
                false
              )
            );
          }
        }
      }
      this.edit(this.choosenArray);
    });

    changeAllOtherBtn.addEventListener("click", async () => {
      let type = await Utils.getUserInput(
        "Auswahl treffen",
        "Welche Aktion möchtest du ausfürhen?",
        false,
        "select",
        false,
        false,
        false,
        {
          "Benutzer löschen": "deleteUser",
          "Von allen Geräten abmelden": "logoutFromAlldevices",
          "Neue Nachricht": "newComeBackMessage",
          "Bestimmte Nachricht löschen": "removeSpecificComeBackmessage",
          "Alle Nachrichten löschen": "removeAllComeBackMessages",
          "Der Öffentlichkeit anzeigen": "showPublic",
          "Passwort ändern": "changePassword"
        },
        true
      );
      if (type === "changePassword") {
        if (
          !(await Utils.userHasPermissions([
            "editUserInformation",
            "benutzerverwaltungChangePasswords",
          ]))
        ) {
          return false;
        }
        let userInput = await Utils.getUserInput(
          "Neues Passwort eingeben",
          "Das Passwort wird hier im Klartext angezeigt, um Tippfehler zu vermeiden.",
          false
        );
        if (Utils.isEmptyInput(userInput)) {
          Utils.alertUser("Nachricht", "Keine Aktion unternommen", false);
          return false;
        }
        for (const current of this.choosenArray) {
          await Utils.makeJSON(
            await Utils.sendXhrREQUEST(
              "POST",
              "benutzerverwaltung&operation=changeValue&type=password&userID=" +
                current +
                "&input=" +
                JSON.stringify({userInput}),
              "./includes/benutzerverwaltung.inc.php",
              "application/x-www-form-urlencoded",
              true,
              false,
              false,
              true,
              false
            )
          );
        }
      } else if (type === "deleteUser") {
        //Done
        if (
          !(await Utils.userHasPermissions(["benutzerverwaltungDeleteUsers"]))
        ) {
          return false;
        }
        if (
          !(await Utils.askUser(
            "Warnung",
            "Willst du wirklich diesen Benutzer löschen?",
            false
          ))
        ) {
          Utils.alertUser(
            "Keine Eingabe",
            "Benutzer wurde <b>nicht</b> gelöscht.",
            false
          );
          return false;
        }
        for (const current of this.choosenArray) {
          let response = await Utils.makeJSON(
            await Utils.sendXhrREQUEST(
              "POST",
              "benutzerverwaltung&operation=deleteUser&userID=" + current,
              "./includes/benutzerverwaltung.inc.php",
              "application/x-www-form-urlencoded",
              true,
              false,
              false,
              true,
              false
            )
          );
          if (response["status"] == "success") {
            this.choosenArray = Utils.removeFromArray(
              this.choosenArray,
              current
            );
          }
        }

        this.edit(this.choosenArray);
      } else if (type === "logoutFromAlldevices") {
        //Done
        if (
          !(await Utils.userHasPermissions(["benutzerverwaltungDeleteUsers"]))
        ) {
          return false;
        }
        if (
          !(await Utils.askUser(
            "Warnung",
            "Willst du wirklich den Benutzer von allen angemeldeten Geräten abmelden?",
            false
          ))
        ) {
          Utils.alertUser("Keine Eingabe", "Keine Aktion unternommen.", false);
          return false;
        }
        for (const current of this.choosenArray) {
          let response = await Utils.makeJSON(
            await Utils.sendXhrREQUEST(
              "POST",
              "benutzerverwaltung&operation=changeValue&type=logOutFromAllDevices&userID=" +
                current,
              "./includes/benutzerverwaltung.inc.php",
              "application/x-www-form-urlencoded",
              true,
              false,
              false,
              true,
              false
            )
          );
        }

        this.edit(this.choosenArray);
      } else if (type === "newComeBackMessage") {
        if (
          !(await Utils.userHasPermissions([
            "benutzerverwaltungCreateComeBackMessages",
          ]))
        ) {
          return false;
        }
        let message = await Utils.getUserInput(
          "Nachricht eingeben",
          "Gebe die gewünschte Nachricht ein.",
          false,
          "text"
        );
        if (Utils.isEmptyInput(message, true)) {
          await Utils.alertUser("Nachricht", "Kein Aktion unternommen");
          return false;
        }
        for (const current of this.choosenArray) {
          await Utils.makeJSON(
            await Utils.sendXhrREQUEST(
              "POST",
              "benutzerverwaltung&operation=changeValue&type=newComeBackMessage&userID=" +
                current +
                "&message=" +
                message,
              "./includes/benutzerverwaltung.inc.php",
              "application/x-www-form-urlencoded",
              true,
              false,
              false,
              true,
              false
            )
          );
        }

        this.edit(this.choosenArray);
      } else if (type === "removeAllComeBackMessages") {
        if (
          !(await Utils.userHasPermissions([
            "benutzerverwaltungCreateComeBackMessages",
          ]))
        ) {
          return false;
        }
        if (
          !(await Utils.askUser(
            "Warnung",
            "Willst du wirklich alle ausstehenden Nachrichten entfernen?",
            false
          ))
        ) {
          Utils.alertUser("Keine Eingabe", "Keine Aktion unternommen.", false);
          return false;
        }
        for (const current of this.choosenArray) {
          await Utils.makeJSON(
            await Utils.sendXhrREQUEST(
              "POST",
              "benutzerverwaltung&operation=changeValue&type=removeAllComeBackMessages&userID=" +
                current,
              "./includes/benutzerverwaltung.inc.php",
              "application/x-www-form-urlencoded",
              true,
              false,
              false,
              true,
              false
            )
          );
        }

        this.edit(this.choosenArray);
      } else if (type === "removeSpecificComeBackmessage") {
        if (
          !(await Utils.userHasPermissions([
            "benutzerverwaltungCreateComeBackMessages",
          ]))
        ) {
          return false;
        }

        let allMessages = new Array();

        for (const current of this.choosenArray) {
          let allCurrentMessages = await Utils.makeJSON(
            await Utils.sendXhrREQUEST(
              "POST",
              "benutzerverwaltung&operation=other&type=getAllComeBackMessagesFromUser&userID=" +
                current,
              "./includes/benutzerverwaltung.inc.php",
              "application/x-www-form-urlencoded",
              true,
              true,
              false,
              true,
              false
            )
          );
          if (allCurrentMessages == false || !allCurrentMessages.length > 0) {
            continue;
          }
          for (const currentMessage of allCurrentMessages) {
            allMessages = Utils.addToArray(allMessages, currentMessage, false);
            console.log(allMessages);
          }
        }
        console.log(allMessages);

        let messagesToRemove = await Utils.chooseFromArrayWithSearch(
          allMessages,
          false,
          "Nachrichten auswählen",
          false,
          true
        );

        if (!messagesToRemove || !messagesToRemove.length > 0) {
          await Utils.alertUser(
            "Nachricht",
            "Keine Nachricht entfernt.",
            false
          );
          return false;
        }

        if (!messagesToRemove || !messagesToRemove.length > 0) {
          await Utils.alertUser("Nachricht", "Keine Aktion unternommen", false);
          return false;
        }
        for (const current of this.choosenArray) {
          for (const currentMessage of messagesToRemove) {
            await Utils.makeJSON(
              await Utils.sendXhrREQUEST(
                "POST",
                "benutzerverwaltung&operation=changeValue&type=removeSpecificComeBackmessage&userID=" +
                  current +
                  "&message=" +
                  currentMessage,
                "./includes/benutzerverwaltung.inc.php",
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
        this.edit(this.choosenArray);
      } else if (type === "showPublic") {
        if (
          !(await Utils.userHasPermissions([
            "editUserInformation",
            "benutzerverwaltungChangeShowPublic",
          ]))
        ) {
          return false;
        }
        let userInput = await Utils.getUserInput(
          "Eingabe",
          "Welchen Wert möchtest du setzen?",
          false,
          "select",
          false,
          false,
          true,
          { Ja: "1", Nein: "0" },
          true
        );
        if (userInput === false) {
          Utils.alertUser("Nachricht", "Keine Aktion unternommen", false);
          return false;
        }
        for (const current of this.choosenArray) {
          await Utils.makeJSON(
            await Utils.sendXhrREQUEST(
              "POST",
              "benutzerverwaltung&operation=changeValue&type=showPublic&userID=" +
                current +
                "&input=" +
                userInput,
              "./includes/benutzerverwaltung.inc.php",
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
    });
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
    this.permissionsAllowedSelectContainer = permissionsAllowedSelectContainer;
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
    let searchWhileTypingContainer = selectionFiltersContainer.querySelector(
      "#other #searchWhileTyping"
    );
    if (!searchWhileTypingContainer) return "no search while typin container";
    let searchWhileTypingCheckbox = searchWhileTypingContainer.querySelector(
      "#allowSearchWhileTyping"
    );
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
        this.oldCheckedArray = Utils.copyArray(this.choosenArray);
        let allCheckBtns = this.resultTable.querySelectorAll(".result #select");

        allCheckBtns.forEach((element) => {
          let dataValue = element.closest(".result").getAttribute("data-value");
          element.checked = true;
          this.choosenArray = Utils.addToArray(
            this.choosenArray,
            dataValue,
            false
          );
        });
      } else {
        console.log("unchecked");
        let allCheckBtns = this.resultTable.querySelectorAll(".result #select");

        allCheckBtns.forEach((element) => {
          let dataValue = element.closest(".result").getAttribute("data-value");

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

    let editBtn = this.container.querySelector("#editBtn");
    if (!editBtn) return "no editBtn";
    this.editBtn = editBtn;
    this.updateEditBtn();
    editBtn.addEventListener("click", () => {
      this.edit(this.choosenArray);
    });

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

    //Edit Container
    let editContainer = this.container.querySelector("#editContainer");
    if (!editContainer) return "no edit container";
    this.editContainer = editContainer;
    let editTable = editContainer.querySelector("#editTable");
    if (!editTable) return "no editTable";
    this.editTable = editTable;
    let editTableBody = editTable.querySelector("tbody");
    if (!editTableBody) return "no editTableBody";
    this.editTableBody = editTableBody;
  }

  updateEditBtn() {
    console.log(this.choosenArray.length);
    if (this.choosenArray.length > 0) {
      this.editBtn.disabled = false;
    } else {
      this.editBtn.disabled = true;
    }
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
      Utils.listenToChanges(input, "input", 450, () => {
        if (this.searchWhileTyping) {
          this.search();
        }
      });
      this.usernameSelectContainer.classList.remove("hidden");
    } else if (filter === this.emailSelectContainer) {
      //Email
      let input = this.emailSelectContainer.querySelector("#textInput");
      Utils.listenToChanges(input, "input", 450, () => {
        if (this.searchWhileTyping) {
          this.search();
        }
      });
      this.emailSelectContainer.classList.remove("hidden");
    } else if (filter === this.userIDSelectContainer) {
      //UserID
      let input = this.userIDSelectContainer.querySelector("#numberInput");
      Utils.listenToChanges(input, "input", 450, () => {
        if (this.searchWhileTyping) {
          this.search();
        }
      });
      this.userIDSelectContainer.classList.remove("hidden");
    } else if (filter === this.rankingSelectContainer) {
      //UserID
      let input = this.rankingSelectContainer.querySelector("#numberInput");
      Utils.listenToChanges(input, "input", 450, () => {
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
              this.groupsSearchArray = Utils.removeFromArray(
                this.groupsSearchArray,
                element
              );
              update();
            });
          });
        }
      };

      let addBtn = this.groupsSelectContainer.querySelector("#addBtn");
      addBtn = Utils.removeAllEventlisteners(addBtn);
      addBtn.addEventListener("click", async () => {
        let availableGroups = await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "benutzerverwaltung&operation=other&type=getAvailableGroups",
            "./includes/benutzerverwaltung.inc.php",
            "application/x-www-form-urlencoded",
            true,
            true,
            false,
            true
          )
        );
        let choosen = await Utils.chooseFromArrayWithSearch(
          availableGroups,
          false,
          "Gruppen auswählen",
          this.groupsSearchArray,
          true
        );
        if (choosen && choosen.length > 0) {
          for (const current of choosen) {
            this.groupsSearchArray = Utils.addToArray(
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
      addBtn = Utils.removeAllEventlisteners(addBtn);

      let add = async () => {
        let toAdd = await addPermission([]);
        if (toAdd && toAdd.length > 0) {
          for (const current of toAdd) {
            let input = await Utils.getUserInput(
              "Eingabe",
              `Welchen Wert soll die Berechtigung ${current} haben?`,
              false,
              "text",
              1,
              1,
              false
            );
            if (!Utils.isEmptyInput(input, true)) {
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
      addBtn = Utils.removeAllEventlisteners(addBtn);

      let add = async () => {
        let toAdd = await addPermission([]);
        if (toAdd && toAdd.length > 0) {
          for (const current of toAdd) {
            this.permissionsForbiddenArray = Utils.addToArray(
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
              this.permissionsForbiddenArray = Utils.removeFromArray(
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
              this.klassenstufenSearchArray = Utils.removeFromArray(
                this.klassenstufenSearchArray,
                element
              );
              update();
            });
          });
        }
      };

      let addBtn = this.klassenstufeSelectContainer.querySelector("#addBtn");
      addBtn = Utils.removeAllEventlisteners(addBtn);
      addBtn.addEventListener("click", async () => {
        let availableKlassenstufen = await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "benutzerverwaltung&operation=other&type=getAllKlassenstufen",
            "./includes/benutzerverwaltung.inc.php",
            "application/x-www-form-urlencoded",
            true,
            true,
            false,
            true
          )
        );
        let choosen = await Utils.chooseFromArrayWithSearch(
          availableKlassenstufen,
          false,
          "Klassenstufe auswählen",
          this.klassenstufenSearchArray,
          true
        );
        if (choosen && choosen.length > 0) {
          for (const current of choosen) {
            this.klassenstufenSearchArray = Utils.addToArray(
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
      Utils.listenToChanges(select, "change", 200, () => {
        if (this.searchWhileTyping) {
          this.search();
        }
      });
      this.authenticatedSelectContainer.classList.remove("hidden");
    } else if (filter === this.isOnlineSelectContainer) {
      let select = this.isOnlineSelectContainer.querySelector("#selectInput");
      Utils.listenToChanges(select, "change", 200, () => {
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
    //Utils.toggleLodingAnimation(this.container)
    this.searchBtn.classList.add("loading");
    this.choosenArray = new Array();
    this.editContainer.classList.add("hidden");
    this.clear(this.editTableBody);

    if (this.filterType === "username") {
      let input =
        this.usernameSelectContainer.querySelector("#textInput").value;
      this.showResults(
        Utils.makeJSON(
          await Utils.makeJSON(
            await Utils.sendXhrREQUEST(
              "POST",
              "benutzerverwaltung&operation=search&type=username&input=" +
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
          )
        )
      );
    } else if (this.filterType === "email") {
      let input = this.emailSelectContainer.querySelector("#textInput").value;
      this.showResults(
        Utils.makeJSON(
          await Utils.makeJSON(
            await Utils.sendXhrREQUEST(
              "POST",
              "benutzerverwaltung&operation=search&type=email&input=" +
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
          )
        )
      );
    } else if (this.filterType === "userID") {
      let input =
        this.userIDSelectContainer.querySelector("#numberInput").value;
      this.showResults(
        Utils.makeJSON(
          await Utils.makeJSON(
            await Utils.sendXhrREQUEST(
              "POST",
              "benutzerverwaltung&operation=search&type=userID&input=" +
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
          )
        )
      );
    } else if (this.filterType === "groups") {
      this.showResults(
        Utils.makeJSON(
          await Utils.makeJSON(
            await Utils.sendXhrREQUEST(
              "POST",
              "benutzerverwaltung&operation=search&type=groups&input=" +
                JSON.stringify(this.groupsSearchArray) +
                "&limitResults=" +
                this.limiter.value,
              "./includes/benutzerverwaltung.inc.php",
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
        Utils.makeJSON(
          await Utils.makeJSON(
            await Utils.sendXhrREQUEST(
              "POST",
              "benutzerverwaltung&operation=search&type=klassenstufe&input=" +
                JSON.stringify(this.klassenstufenSearchArray) +
                "&limitResults=" +
                this.limiter.value,
              "./includes/benutzerverwaltung.inc.php",
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
        Utils.makeJSON(
          await Utils.makeJSON(
            await Utils.sendXhrREQUEST(
              "POST",
              "benutzerverwaltung&operation=search&type=permissionsAllowed&input=" +
                JSON.stringify(this.permissionsAllowedObject) +
                "&limitResults=" +
                this.limiter.value,
              "./includes/benutzerverwaltung.inc.php",
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
        Utils.makeJSON(
          await Utils.makeJSON(
            await Utils.sendXhrREQUEST(
              "POST",
              "benutzerverwaltung&operation=search&type=permissionsForbidden&input=" +
                JSON.stringify(this.permissionsForbiddenArray) +
                "&limitResults=" +
                this.limiter.value,
              "./includes/benutzerverwaltung.inc.php",
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
        Utils.makeJSON(
          await Utils.makeJSON(
            await Utils.sendXhrREQUEST(
              "POST",
              "benutzerverwaltung&operation=search&type=ranking&input=" +
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
          )
        )
      );
    } else if (this.filterType == "authenticated") {
      let select =
        this.authenticatedSelectContainer.querySelector("#selectInput");
      let input = select[select.selectedIndex].getAttribute("data-value");
      this.showResults(
        Utils.makeJSON(
          await Utils.makeJSON(
            await Utils.sendXhrREQUEST(
              "POST",
              "benutzerverwaltung&operation=search&type=authenticated&input=" +
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
          )
        )
      );
    } else if (this.filterType === "isOnline") {
      let select = this.isOnlineSelectContainer.querySelector("#selectInput");
      let input = select[select.selectedIndex].getAttribute("data-value");
      this.showResults(
        Utils.makeJSON(
          await Utils.makeJSON(
            await Utils.sendXhrREQUEST(
              "POST",
              "benutzerverwaltung&operation=search&type=isOnline&input=" +
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
          )
        )
      );
    } else if (this.filterType === "all") {
      this.showResults(
        Utils.makeJSON(
          await Utils.makeJSON(
            await Utils.sendXhrREQUEST(
              "POST",
              "benutzerverwaltung&operation=search&type=all&limitResults=" +
                this.limiter.value,
              "./includes/benutzerverwaltung.inc.php",
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
      if (Utils.isEmptyInput(username)) {
        username = false;
      }

      //Email
      let email = this.emailSelectContainer.querySelector("#textInput").value;
      if (Utils.isEmptyInput(email)) {
        email = false;
      }

      //userID
      let userID =
        this.userIDSelectContainer.querySelector("#numberInput").value;
      if (Utils.isEmptyInput(userID)) {
        userID = false;
      }

      //ranking
      let ranking =
        this.rankingSelectContainer.querySelector("#numberInput").value;
      if (Utils.isEmptyInput(ranking)) {
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
        isOnlineSelect[isOnlineSelect.selectedIndex].getAttribute("data-value");
      if (Utils.isEmptyInput(isOnline)) {
        isOnline = false;
      }

      //authenticated
      let authenticatedSelect =
        this.authenticatedSelectContainer.querySelector("#selectInput");
      let authenticated =
        authenticatedSelect[authenticatedSelect.selectedIndex].getAttribute(
          "data-value"
        );
      if (Utils.isEmptyInput(authenticated)) {
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
        Utils.makeJSON(
          await Utils.makeJSON(
            await Utils.sendXhrREQUEST(
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
                JSON.stringify(klassenstufen) +
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
              "./includes/benutzerverwaltung.inc.php",
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
    results = Utils.makeJSON(results);

    if (!results.length > 0) {
      this.resultTable.classList.add("hidden");
      this.resultDescriptionContainer.innerHTML = "Keine Ergebnisse...";
      return false;
    }
    this.resultDescriptionContainer.innerHTML = `${results.length} Ergebnisse`;

    let tableBody = this.resultTable.querySelector("tbody");
    if (!tableBody) return false;
    this.tableBody = tableBody;

    results = Utils.sortItems(results, "username"); //Just sort it to better overview

    for (const result of results) {
      //console.log(user);
      let tableRow = document.createElement("tr");
      tableRow.classList.add("result");
      tableRow.setAttribute("data-value", result["userID"]);

      let showPublicText = "Nein";
      if (Boolean(Utils.makeJSON(result["showPublic"]))) {
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
      let usersGroups = Utils.makeJSON(result["groups"]);
      Utils.listOfArrayToHTML(groupsInner, usersGroups, "Keine Gruppen");

      //Allowed Permissions
      let permissionsInner = tableRow.querySelector("#permissionsAllowed");
      Utils.objectKEYVALUEToHTML(
        permissionsInner,
        result["permissionsAllowed"],
        "Keine zusätzlichen"
      );

      //Forbidden Permissions
      let forbiddenPermissionsInner = tableRow.querySelector(
        "#permissionsForbidden"
      );
      Utils.listOfArrayToHTML(
        forbiddenPermissionsInner,
        result["permissionsForbidden"],
        "Keine zusätzlichen"
      );

      //Next Messages
      let nextMessagesInner = tableRow.querySelector("#nextMessages");
      Utils.listOfArrayToHTML(nextMessagesInner, result["nextMessages"]);

      let checkBox = tableRow.querySelector(".select #select");
      checkBox.addEventListener("change", (event) => {
        if (event.target.checked) {
          this.choosenArray = Utils.addToArray(
            this.choosenArray,
            result["userID"],
            false
          );
        } else {
          this.choosenArray = Utils.removeFromArray(
            this.choosenArray,
            result["userID"]
          );
        }
        this.updateEditBtn();
      });

      let chooseThis = tableRow.querySelector(".select #chooseOnly");
      if (!chooseThis) continue;

      chooseThis.addEventListener("click", (event) => {
        this.choosenArray = Utils.addToArray(
          this.choosenArray,
          result["userID"],
          false
        );
        this.edit(this.choosenArray);
      });
    }
    this.searchReloadBtn.disabled = false;
    this.resultTable.classList.remove("hidden");
  }

  clear(element) {
    element.innerHTML = "";
  }

  async edit(choosen, reloadOnlyOne = false) {
    if (!choosen || !choosen.length > 0) {
      this.editContainer.classList.add("hidden");
      this.clear(this.editTableBody);
      return false;
    }
    this.editReloadBtn.disabled = true;
    console.log("Edit:", choosen);

    if (!reloadOnlyOne) {
      this.resultTable.classList.add("hidden");
      this.clear(this.tableBody);
      this.editContainer.classList.add("hidden");
      this.clear(this.editTableBody);
    }

    for (let current of choosen) {
      //Get current
      //Get Data
      current = await Utils.makeJSON(
        await Utils.sendXhrREQUEST(
          "POST",
          "benutzerverwaltung&operation=getFullInformation&userID=" + current,
          "./includes/benutzerverwaltung.inc.php",
          "application/x-www-form-urlencoded",
          true,
          true,
          false,
          true
        )
      );
      if (!current) {
        console.log("no data");
        continue;
      }

      if (current["userID"]) {
        let tableRow;
        if (!reloadOnlyOne) {
          tableRow = document.createElement("tr");
          this.editTableBody.appendChild(tableRow);
        } else {
          try {
            tableRow = this.editTable.querySelector(
              `tbody .result[data-value="${current["userID"]}"]`
            );
            console.log(tableRow);
          } catch {
            tableRow = document.createElement("tr");
            this.editTableBody.appendChild(tableRow);
          }
        }

        tableRow.classList.add("result");
        tableRow.setAttribute("data-value", current["userID"]);

        tableRow.innerHTML = `
        <td id="userID">${current["userID"]}</td>
        <td id="username"><span id="text">${
          current["username"]
        }</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button></td>
        <td id="email"><span id="text">${
          current["email"]
        }</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button></td>
        <td id="klassenstufe"><span id="text">${
          current["klassenstufe"]
        }</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button></td>
        <td id="authenticated"><span id="text">${
          current["authenticated"]
        }</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button></td>
        <td id="groups"><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button><span id="text">${JSON.stringify(
          current["groups"]
        )}</span></td>
        <td id="permissions"><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button><div><b>Erlaubt:</b></div><div id="permissionsAllowed"></div><b>Verboten:</b><div id="permissionsForbidden"></div></span></td>
        <td id="other"><button type="button" id="other-btn">Optionen</button></td>
        `;

        let groupsInner = tableRow.querySelector("#groups #text");
        Utils.listOfArrayToHTML(groupsInner, current["groups"]);

        //Allowed Permissions
        let permissionsInner = tableRow.querySelector(
          "#permissions #permissionsAllowed"
        );
        Utils.objectKEYVALUEToHTML(
          permissionsInner,
          current["permissionsAllowed"],
          "Keine zusätzlichen"
        );

        //Forbidden Permissions
        let forbiddenPermissionsInner = tableRow.querySelector(
          "#permissions #permissionsForbidden"
        );
        Utils.listOfArrayToHTML(
          forbiddenPermissionsInner,
          current["permissionsForbidden"],
          "Keine zusätzlichen"
        );

        //Username
        let changeUsernameBtn = tableRow.querySelector("#username #change");
        changeUsernameBtn.addEventListener("click", async () => {
          if (
            !(await Utils.userHasPermissions([
              "editUserInformation",
              "benutzerverwaltungChangeUsername",
            ]))
          ) {
            return false;
          }
          let userInput = await Utils.getUserInput(
            "Eingabefeld",
            `Wie soll der Nutzer heißen?`,
            false,
            "text",
            current["username"],
            current["username"],
            true
          );
          if (userInput === false) {
            Utils.alertUser("Nachricht", "Keine Aktion unternommen", false);
            return false;
          }
          await Utils.makeJSON(
            await Utils.sendXhrREQUEST(
              "POST",
              "benutzerverwaltung&operation=changeValue&type=username&userID=" +
                current["userID"] +
                "&input=" +
                userInput,
              "./includes/benutzerverwaltung.inc.php",
              "application/x-www-form-urlencoded",
              true,
              true,
              false,
              true,
              false
            )
          );
          this.edit([current["userID"]], true);
        });

        //Email
        let changeEmailBtn = tableRow.querySelector("#email #change");
        changeEmailBtn.addEventListener("click", async () => {
          if (
            !(await Utils.userHasPermissions([
              "editUserInformation",
              "benutzerverwaltungChangeEmail",
            ]))
          ) {
            return false;
          }
          let userInput = await Utils.getUserInput(
            "Eingabefeld",
            `Wie soll die E-Mail lauten?`,
            false,
            "text",
            current["email"],
            current["email"],
            true
          );
          if (userInput === false) {
            Utils.alertUser("Nachricht", "Keine Aktion unternommen", false);
            return false;
          }
          await Utils.makeJSON(
            await Utils.sendXhrREQUEST(
              "POST",
              "benutzerverwaltung&operation=changeValue&type=email&userID=" +
                current["userID"] +
                "&input=" +
                userInput,
              "./includes/benutzerverwaltung.inc.php",
              "application/x-www-form-urlencoded",
              true,
              true,
              false,
              true,
              false
            )
          );
          this.edit([current["userID"]], true);
        });

        //Klassenstufe
        let changeKlassenstufeBtn = tableRow.querySelector(
          "#klassenstufe #change"
        );
        changeKlassenstufeBtn.addEventListener("click", async () => {
          if (
            !(await Utils.userHasPermissions([
              "editUserInformation",
              "benutzerverwaltungChangeKlassenstufe",
            ]))
          ) {
            return false;
          }
          let type = false;
          if (current["klassenstufe"]) {
            type = await Utils.getUserInput(
              "Auswahl treffen",
              "Welche Aktion möchtest du ausfürhen?",
              false,
              "select",
              false,
              false,
              false,
              {
                "Klassenstufe ändern": "changeKlassenstufe",
                "Klassenstufe entfernen": "removeKlassenstufe",
              },
              true
            );
          } else {
            type = "changeKlassenstufe";
          }

          if (type === "changeKlassenstufe") {
            let availableKlassenstufen = await Utils.makeJSON(
              await Utils.sendXhrREQUEST(
                "POST",
                "benutzerverwaltung&operation=other&type=getAllKlassenstufenUserCanBe",
                "./includes/benutzerverwaltung.inc.php",
                "application/x-www-form-urlencoded",
                true,
                true,
                false,
                true
              )
            );
            let choosen = await Utils.chooseFromArrayWithSearch(
              availableKlassenstufen,
              false,
              "Klassenstufe auswählen",
              current["klassenstufe"],
              true
            );
            if (choosen == false || !choosen.length > 0) {
              Utils.alertUser("Nachricht", "Keine Aktion unternommen", false);
              return false;
            }
            await Utils.makeJSON(
              await Utils.sendXhrREQUEST(
                "POST",
                "benutzerverwaltung&operation=changeValue&type=klassenstufe&userID=" +
                  current["userID"] +
                  "&input=" +
                  choosen[0],
                "./includes/benutzerverwaltung.inc.php",
                "application/x-www-form-urlencoded",
                true,
                true,
                false,
                true,
                false
              )
            );
          } else if (type === "removeKlassenstufe") {
            await Utils.makeJSON(
              await Utils.sendXhrREQUEST(
                "POST",
                "benutzerverwaltung&operation=changeValue&type=klassenstufe&userID=" +
                  current["userID"] +
                  "&input=",
                "./includes/benutzerverwaltung.inc.php",
                "application/x-www-form-urlencoded",
                true,
                true,
                false,
                true,
                false
              )
            );
          }

          this.edit([current["userID"]], true);
        });
        //Bestätigung
        let changeAuthenticatedBtn = tableRow.querySelector(
          "#authenticated #change"
        );

        changeAuthenticatedBtn.addEventListener("click", async () => {
          if (
            !(await Utils.userHasPermissions([
              "editUserInformation",
              "benutzerverwaltungChangeAuthenticated",
            ]))
          ) {
            return false;
          }
          let userInput = await Utils.getUserInput(
            "Bestätigungsstatus ändern",
            "Soll der Benutzer bestätigt sein?",
            false,
            "yes/no",
            false,
            false,
            false
          );
          if (userInput === false) {
            Utils.alertUser("Nachricht", "Keine Aktion unternommen", false);
            return false;
          }
          await Utils.makeJSON(
            await Utils.sendXhrREQUEST(
              "POST",
              "benutzerverwaltung&operation=changeValue&type=authenticated&userID=" +
                current["userID"] +
                "&input=" +
                userInput,
              "./includes/benutzerverwaltung.inc.php",
              "application/x-www-form-urlencoded",
              true,
              true,
              false,
              true,
              false
            )
          );
          this.edit([current["userID"]], true);
        });

        let changeGroupsBtn = tableRow.querySelector("#groups #change");
        changeGroupsBtn.addEventListener("click", async () => {
          if (
            !(await Utils.userHasPermissions([
              "editUserInformation",
              "benutzerverwaltungChangeGroups",
            ]))
          ) {
            return false;
          }
          await changeGroups(current["userID"]);
          this.edit([current["userID"]], true);
        });

        let changePermissionsBtn = tableRow.querySelector(
          "#permissions #change"
        );
        changePermissionsBtn.addEventListener("click", async () => {
          if (
            !(await Utils.userHasPermissions([
              "editUserInformation",
              "benutzerverwaltungChangePermissions",
            ]))
          ) {
            return false;
          }
          await changePermissions(current["userID"]);
          this.edit([current["userID"]], true);
        });

        let otherBtn = tableRow.querySelector("#other #other-btn");

        otherBtn.addEventListener("click", async () => {
          let type = await Utils.getUserInput(
            "Auswahl treffen",
            "Welche Aktion möchtest du ausfürhen?",
            false,
            "select",
            false,
            false,
            false,
            {
              "Benutzer löschen": "deleteUser",
              "Von allen Geräten abmelden": "logoutFromAlldevices",
              "Neue Nachricht": "newComeBackMessage",
              "Bestimmte Nachricht löschen": "removeSpecificComeBackmessage",
              "Alle Nachrichten löschen": "removeAllComeBackMessages",
              "Der Öffentlichkeit anzeigen": "showPublic",
              "Passwort ändern": "changePassword",
              "Scores bearbeiten / löschen": "editScores",
              "Alle Scores löschen / Scores zurücksetzen": "removeAllScores"
            },
            true
          );
          if (type === "changePassword") {
            if (
              !(await Utils.userHasPermissions([
                "editUserInformation",
                "benutzerverwaltungChangePasswords",
              ]))
            ) {
              return false;
            }
            let userInput = await Utils.getUserInput(
              "Neues Passwort eingeben",
              "Das Passwort wird hier im Klartext angezeigt, um Tippfehler zu vermeiden.",
              false
            );
            if (Utils.isEmptyInput(userInput)) {
              Utils.alertUser("Nachricht", "Keine Aktion unternommen", false);
              return false;
            }
            await Utils.makeJSON(
              await Utils.sendXhrREQUEST(
                "POST",
                "benutzerverwaltung&operation=changeValue&type=password&userID=" +
                  current["userID"] +
                  "&input=" +
                  JSON.stringify({userInput}),
                "./includes/benutzerverwaltung.inc.php",
                "application/x-www-form-urlencoded",
                true,
                true,
                false,
                true,
                false
              )
            );
          } else if (type === "deleteUser") {
            //Done
            if (
              !(await Utils.userHasPermissions([
                "benutzerverwaltungDeleteUsers",
              ]))
            ) {
              return false;
            }
            if (
              !(await Utils.askUser(
                "Warnung",
                "Willst du wirklich diesen Benutzer löschen?",
                false
              ))
            ) {
              Utils.alertUser(
                "Keine Eingabe",
                "Benutzer wurde <b>nicht</b> gelöscht.",
                false
              );
              return false;
            }
            let response = await Utils.makeJSON(
              await Utils.sendXhrREQUEST(
                "POST",
                "benutzerverwaltung&operation=deleteUser&userID=" +
                  current["userID"],
                "./includes/benutzerverwaltung.inc.php",
                "application/x-www-form-urlencoded",
                true,
                true,
                false,
                true,
                false
              )
            );
            if (response["status"] == "success") {
              this.choosenArray = Utils.removeFromArray(
                this.choosenArray,
                current["userID"]
              );
            }
            this.edit(this.choosenArray);
          } else if (type === "logoutFromAlldevices") {
            //Done
            if (
              !(await Utils.userHasPermissions([
                "benutzerverwaltungDeleteUsers",
              ]))
            ) {
              return false;
            }
            if (
              !(await Utils.askUser(
                "Warnung",
                "Willst du wirklich den Benutzer von allen angemeldeten Geräten abmelden?",
                false
              ))
            ) {
              Utils.alertUser(
                "Keine Eingabe",
                "Keine Aktion unternommen.",
                false
              );
              return false;
            }
            let response = await Utils.makeJSON(
              await Utils.sendXhrREQUEST(
                "POST",
                "benutzerverwaltung&operation=changeValue&type=logOutFromAllDevices&userID=" +
                  current["userID"],
                "./includes/benutzerverwaltung.inc.php",
                "application/x-www-form-urlencoded",
                true,
                true,
                false,
                true,
                false
              )
            );
            this.edit([current["userID"]], true);
          } else if (type === "newComeBackMessage") {
            if (
              !(await Utils.userHasPermissions([
                "benutzerverwaltungCreateComeBackMessages",
              ]))
            ) {
              return false;
            }
            let message = await Utils.getUserInput(
              "Nachricht eingeben",
              "Gebe die gewünschte Nachricht ein.",
              false,
              "text"
            );
            if (Utils.isEmptyInput(message, true)) {
              await Utils.alertUser("Nachricht", "Kein Aktion unternommen");
              return false;
            }
            console.log(message);
            await Utils.makeJSON(
              await Utils.sendXhrREQUEST(
                "POST",
                "benutzerverwaltung&operation=changeValue&type=newComeBackMessage&userID=" +
                  current["userID"] +
                  "&message=" +
                  message,
                "./includes/benutzerverwaltung.inc.php",
                "application/x-www-form-urlencoded",
                true,
                true,
                false,
                true,
                false
              )
            );
            this.edit([current["userID"]], true);
          } else if (type === "removeAllComeBackMessages") {
            if (
              !(await Utils.userHasPermissions([
                "benutzerverwaltungCreateComeBackMessages",
              ]))
            ) {
              return false;
            }
            if (
              !(await Utils.askUser(
                "Warnung",
                "Willst du wirklich alle ausstehenden Nachrichten entfernen?",
                false
              ))
            ) {
              Utils.alertUser(
                "Keine Eingabe",
                "Keine Aktion unternommen.",
                false
              );
              return false;
            }
            await Utils.makeJSON(
              await Utils.sendXhrREQUEST(
                "POST",
                "benutzerverwaltung&operation=changeValue&type=removeAllComeBackMessages&userID=" +
                  current["userID"],
                "./includes/benutzerverwaltung.inc.php",
                "application/x-www-form-urlencoded",
                true,
                true,
                false,
                true,
                false
              )
            );
            this.edit([current["userID"]], true);
          } else if (type === "removeSpecificComeBackmessage") {
            if (
              !(await Utils.userHasPermissions([
                "benutzerverwaltungCreateComeBackMessages",
              ]))
            ) {
              return false;
            }
            let allMessages = await Utils.makeJSON(
              await Utils.sendXhrREQUEST(
                "POST",
                "benutzerverwaltung&operation=other&type=getAllComeBackMessagesFromUser&userID=" +
                  current["userID"],
                "./includes/benutzerverwaltung.inc.php",
                "application/x-www-form-urlencoded",
                true,
                true,
                false,
                true,
                false
              )
            );
            if (!allMessages || !allMessages.length > 0) {
              await Utils.alertUser(
                "Nachricht",
                "Es gibt keine Nachrichten zum entfernen.",
                false
              );
              return false;
            }

            let messagesToRemove = await Utils.chooseFromArrayWithSearch(
              allMessages,
              false,
              "Nachrichten auswählen",
              false,
              true
            );
            if (!messagesToRemove || !messagesToRemove.length > 0) {
              await Utils.alertUser(
                "Nachricht",
                "Keine Aktion unternommen",
                false
              );
              return false;
            }
            for (const message of messagesToRemove) {
              await Utils.makeJSON(
                await Utils.sendXhrREQUEST(
                  "POST",
                  "benutzerverwaltung&operation=changeValue&type=removeSpecificComeBackmessage&userID=" +
                    current["userID"] +
                    "&message=" +
                    message,
                  "./includes/benutzerverwaltung.inc.php",
                  "application/x-www-form-urlencoded",
                  true,
                  true,
                  false,
                  true,
                  false
                )
              );
            }
            this.edit([current["userID"]], true);
          } else if (type === "showPublic") {
            if (
              !(await Utils.userHasPermissions([
                "benutzerverwaltungChangeShowPublic",
              ]))
            ) {
              return false;
            }
            let userInput = await Utils.getUserInput(
              "Eingabe",
              "Welchen Wert möchtest du setzen?",
              false,
              "select",
              false,
              false,
              true,
              { Ja: "1", Nein: "0" },
              true
            );
            if (userInput === false) {
              Utils.alertUser("Nachricht", "Keine Aktion unternommen", false);
              return false;
            }
            await Utils.makeJSON(
              await Utils.sendXhrREQUEST(
                "POST",
                "benutzerverwaltung&operation=changeValue&type=showPublic&userID=" +
                  current["userID"] +
                  "&input=" +
                  userInput,
                "./includes/benutzerverwaltung.inc.php",
                "application/x-www-form-urlencoded",
                true,
                true,
                false,
                true,
                false
              )
            );
          } else if (type === "editScores") {
            if (
              !(await Utils.userHasPermissions([
                "benutzerverwaltungEditScores",
              ]))
            ) {
              return false;
            }

            await editScores(current["userID"]);
            this.edit([current["userID"]], true);
          } else if (type === "removeAllScores") {
            if (!Utils.userHasPermissions(["benutzerverwaltungDeleteEntries"])) {
              return false;
            }
            if (await Utils.askUser("Scores zurücksetzen / löschen", "Bist du dir sicher, dass alle Score-Einträge dieses Nutzers löschen möchtest?")) {
              await Utils.makeJSON(
                await Utils.makeJSON(
                  await Utils.sendXhrREQUEST(
                    "POST",
                    "scoreverwaltung&operation=removeAllScores&userID=" + current["userID"],
                    "/teacher/includes/benutzerverwaltung.inc.php",
                    "application/x-www-form-urlencoded",
                    true,
                    true,
                    false,
                    true
                  )
                )
              )
              this.edit([current["userID"]], true);
            }
          } 
        });
      }
      this.editContainer.classList.remove("hidden");
    }
    this.editReloadBtn.disabled = true;
  }
}

let container = document.getElementById("benutzerverwaltungContainer");
console.log(container);

let benutzerververwaltungContainer = container.querySelector(
  "#benutzerverwaltung"
);
let benutzerverwaltung = new Benutzerverwaltung(benutzerververwaltungContainer);

console.log(benutzerverwaltung.prepareSearch());
console.log(benutzerverwaltung.prepareEdit());

//CreateUser
let createUserForm = document.getElementById("createNewUserForm");
createUserForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  let username = createUserForm.querySelector("#uid").value;
  let password = createUserForm.querySelector("#password").value;
  let email = createUserForm.querySelector("#email").value;

  let response = await Utils.makeJSON(
    await Utils.sendXhrREQUEST(
      "POST",
      "benutzerverwaltung&operation=createNewUser&username=" +
        username +
        "&password=" +
        JSON.stringify({password}) +
        "&email=" +
        email,
      "./includes/benutzerverwaltung.inc.php",
      "application/x-www-form-urlencoded",
      true,
      true,
      false,
      true,
      false
    )
  );
  if (!response) return false;
  if (response["status"] == "success") {
    createUserForm.reset();
    let userID = response["data"]["createduserID"];
    benutzerverwaltung.choosenArray = Utils.addToArray(
      benutzerverwaltung.choosenArray,
      userID,
      false
    );
    benutzerverwaltung.edit(benutzerverwaltung.choosenArray);
  }
});
