"use strict";

const textInputField = document.getElementById("textInput");
let input;
const list = document.getElementById("list");
const addButton = document.getElementById("addButton");
let idcounter = 1;


function checkValid(){
    if (textInputField.value != "" && textInputField.value != null){
        createTaskElement();
    }
}
/*
let Task = {
    id: 1,
    delete() {
        document.getElementById(id).remove;
    },
}
*/

function createTaskElement(){
   input = textInputField.value;
   textInputField.value = null;
   
   let ElementToAdd = document.createElement("li");
   ElementToAdd.innerHTML = ` <div class="inputBox_container">
   <input type="text" class="description" disabled value=""></div> 
   <button class="deleteButton">X</button>
 `
    list.appendChild(ElementToAdd);

    //Style
    ElementToAdd.className= "item";

    ElementToAdd.id = idcounter;
    let idofElement = idcounter;
    // alert(input);
    //Task Value
    let TaskValue = document.getElementById(idofElement).querySelector(".description");
    TaskValue.value = input;
    

    //Delete
    let deleteButton = document.getElementById(idofElement).querySelector(".deleteButton");
    deleteButton.addEventListener("click", function() {
        document.getElementById(idofElement).remove();
      });

    //Change Color
    let detectField = document.getElementById(idofElement).querySelector(".inputBox_container");
    detectField.addEventListener("click", function() {
        document.getElementById(idofElement).classList.toggle("item-green");
      });

    /*
    let changeColor = document.getElementById(idofElement);
    changeColorField.addEventListener("click", function(){
        alert("Worked!");
        changeColor.classList.toggle("item-green");
    })
    */
    


    idcounter++;
}

//EventListener TextBox
textInputField.addEventListener("keyup", (event) => {
    // console.log(`key=${event.key}, code=${event.code}`);
    let keyevent = event.key;
    if (keyevent == "Enter"){
        checkValid();
    }
});
//EventListener addButton
addButton.addEventListener("click", function() {
   checkValid();
  });


