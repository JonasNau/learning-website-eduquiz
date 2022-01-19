class Calculator {
    constructor(previousOperandTextElement, currentOperandTextElement){
        this.previousOperandTextElement = previousOperandTextElement;
        this.currentOperandTextElement = currentOperandTextElement;
        this.clear();
    }

    clear() {
        this.currentOperand = "";
        this.previousOperand = "";
        this.operation = undefined;
    }

    delete() {
        this.currentOperand = this.currentOperand.toString().slice(0, -1);

        /* My Idea -works-
        this.currentOperand = this.currentOperand.toString();
        this.currentOperand = this.currentOperand.substring(0, this.currentOperand.length - 1);
        */
    }

    appendNumber(number) {
       /* if (number === "." && this.currentOperand === "") return; */
       console.log(number);
        if (number === "." && this.currentOperand.includes(".")) return;
        this.currentOperand = this.currentOperand.toString() + number.toString();
    }

    chooseOperation(operation) {
        console.log(operation);
        if (this.currentOperand === "") return;
        if (this.previousOperand != "") {
            this.compute();
        }
        this.operation = operation;
        this.previousOperand =  this.currentOperand; /* Setzt die Aktuelle Zahl zu der Sekondären Oben*/
        this.currentOperand = "";
    }

    compute() {
        let result;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        if (isNaN(prev) || isNaN(current)) return;
        switch (this.operation) {
            case "+":
                result = prev + current;
                break;
            case "-":
                result = prev - current;
                break;
            case "*":
                result = prev * current;
                break;
            case "÷":
                result = prev / current;
                break;
            default:
                break;
        }
        this.currentOperand = result;
        this.operation = null;
        this.previousOperand = "";
    }

   getDisplayNumber(number){
       let stringNumber = number.toString();
       let integerDigits = parseFloat(stringNumber.split(".")[0]);
       let decimalDigits = stringNumber.split(".")[1];
       let integerDisplay;
       if (isNaN(integerDigits)){
           integerDisplay = "";
       } else {
           integerDisplay = integerDigits.toLocaleString("de", {
               maximumFractionDigits: 0
           })
       }
       console.log(decimalDigits);
       if (decimalDigits != null){
           return `${integerDisplay}.${decimalDigits}`;
       } else {
           return integerDisplay;
       }


       /*
       let floatNumber = parseFloat(number);
       if (isNaN(floatNumber)) return "";
        return floatNumber.toLocaleString("en");
        */
   } 

    updateDisplay() {
        this.currentOperandTextElement.innerText = this.getDisplayNumber(this.currentOperand);
        if (this.operation != undefined) {
            previousOperandTextElement.innerText = `${this.getDisplayNumber(this.previousOperand)} ${this.operation}`
            
        } else {
            this.previousOperandTextElement.innerText = this.previousOperand;
        }
        console.log(this.currentOperand);
       
        
    }

    comfortEquals(){
        if (this.currentOperandTextElement.innerText == ""){
            this.currentOperand = this.previousOperand;
            this.previousOperand = "";
            this.operation = null;
            
        }
    }

}





const numberButtons = document.querySelectorAll("[data-number]");
const operationButtons = document.querySelectorAll("[data-operation]");
const commaButton = document.querySelector("[data-comma]")
const equalsButton = document.querySelector("[data-equals]");
const deleteButton = document.querySelector("[data-delete]");
const allclearButton = document.querySelector("[data-all-clear]");
const previousOperandTextElement = document.querySelector("[data-previous-operand]");
const currentOperandTextElement = document.querySelector("[data-current-operand]");

const calculator = new Calculator(previousOperandTextElement, currentOperandTextElement);

numberButtons.forEach(button => {
    button.addEventListener("click", () => {
        console.log("Button pressed!")
        calculator.appendNumber(button.innerText);
        calculator.updateDisplay();
    })
})

operationButtons.forEach(button => {
    button.addEventListener("click", () => {
        calculator.chooseOperation(button.innerText);
        calculator.updateDisplay();
    })
})

commaButton.addEventListener("click", () =>{
    calculator.appendNumber(".");
    calculator.updateDisplay();

})


equalsButton.addEventListener("click", () =>{
    calculator.compute();
    calculator.comfortEquals();
    calculator.updateDisplay();

})

allclearButton.addEventListener("click", () => {
    calculator.clear();
    calculator.updateDisplay();
})

deleteButton.addEventListener("click", () => {
    calculator.delete();
    calculator.updateDisplay();
})

function addDigit(number) {
    calculator.appendNumber(number)
    calculator.updateDisplay();
}

//Implement Keyboard
const numberButtonsKeyboard = document.addEventListener("keydown", (key) =>{
    console.log(key);
    key = key.key; //Sets the Key which has many types to only key (for example E, e , a ,1 ,4 ,o)
    
    switch (key) {
        case "1":
            addDigit("1");
        break;
        case "2":
            addDigit("2");
        break;
        case "3":
            addDigit("3");
        break;
        case "4":
            addDigit("4");
        break;
        case "5":
            addDigit("5");
        break;
        case "6":
            addDigit("6");
        break;
        case "7":
            addDigit("7");
        break;
        case "8":
            addDigit("8");
        break;
        case "9":
            addDigit("9");
        break;
        case "0":
            addDigit("0");
        break;
        case ",":
            addDigit(".");
        break;
        case ".":
            addDigit(".");
        break;
        case "Enter":
            calculator.compute();
            calculator.comfortEquals();
            calculator.updateDisplay();
        break;
        case "=":
            calculator.compute();
            calculator.comfortEquals();
            calculator.updateDisplay();
        break;
        case " ":
            calculator.clear();
            calculator.updateDisplay();
        break;
        case "/":
            calculator.chooseOperation("÷");
            calculator.updateDisplay();
        break;
        case "*":
            calculator.chooseOperation("*");
            calculator.updateDisplay();
        break;
        case "-":
            calculator.chooseOperation("-");
            calculator.updateDisplay();
        break;
        case "+":
            calculator.chooseOperation("+");
            calculator.updateDisplay();
        break;
        case "Backspace":
            calculator.delete();
            calculator.updateDisplay();
        break;

    }



})