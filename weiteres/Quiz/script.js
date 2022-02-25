

class Quiz {
    constructor(file){
        this.file = file;
        this.numberOfQuestions;
        this.questionNumberNow = 0;
        this.score = 0;
        
    }

    createQuiz(){

        

        this.file = file; //

        //Print out every Question
        for (let i = 0; i < file.length; i++) {
            //console.log(file[i].question);
        }

        //Check and set number of Questions
        this.numberOfQuestions = file.length;
        console.log("Number of Questions: " + this.numberOfQuestions);

        //Check




        //End of create Quiz



    }

    createNextCard(){
        //Set Score and Counter
        this.questionNumberNow++;
       

        if (this.questionNumberNow > this.numberOfQuestions ) {
            // endQuiz();
            this.showResult();
            return;
        }

        scoreTextElement.innerText = this.score;
        counterTextElement.innerText = `${this.questionNumberNow} / ${this.numberOfQuestions}`;

        /*
        //Paste answerBox to DOM
        let answerBox = document.createElement("div");
        answerBox.className = "answerBox";
        quizBody.appendChild(answerBox);
        */

        //checkType and set Type
        let questiontype = file[this.questionNumberNow -1].type;
        console.log("Type of the actual Question: " + questiontype);


        //Set Question
        questionTextElement.innerText = file[this.questionNumberNow -1].question;
        
        //get right Answer
        let rightAnswer = file[this.questionNumberNow -1].rightAnswer;
        console.log("Right answer:" + rightAnswer);
        
        let splittedString = questiontype.split("-");
        let firstAttribute = splittedString[0];
        console.log("Splitted String: " + splittedString);

        switch(firstAttribute){
            case "standard":
                console.log(this.questionNumberNow + " Question = case: standard")
                for (let i = 0; i < Object.keys(file[this.questionNumberNow -1].answers).length; i++) {
                    let button = document.createElement("button");
                    button.innerHTML = `<span class="answerText">Text1</span>`
                    button.className = "answerButton";
                    button.id = i +1;
                    
                    /*
                    //Check if its the right button and then add special Attribute
                    if (i + 1 == rightAnswer){
                        button.setAttribute("data-right", false);
                    }
                    */

                    //Add Button to DOM
                    answerBox.appendChild(button);


                    if (i + 1 == rightAnswer){
                       // button.setAttribute("data-right", false);
                       button.addEventListener("click", () =>{
                        this.checkStandard(true);
                    });
                    } else {
                         //Add EventListener
                        button.addEventListener("click", () =>{
                        this.checkStandard(false);
                    });
                    }
                   

                    //Set Answer Text
                    let questionsOBJ = this.file[this.questionNumberNow -1].answers;
                    var key = Object.keys(questionsOBJ)[i];
                    let value = questionsOBJ[key];
                    button.innerText = value;
                    

                    
                    
                    
                    
                }
                

            break;
        }
        //check number of answers

        

        //Set Buttons (answers)

    
    }

    checkStandard(check){
        if (check == true){
            alert("correct!")
            this.clearBox();
            this.increaseScore();
        }else{
            alert("wrong!");
            this.clearBox();
        }

        this.createNextCard();
    }

    increaseScore(){
        this.score++;
        scoreTextElement.innerText = this.score;
    }

    clearBox(){
        questionTextElement.innerHTML = "";
        answerBox.innerHTML = "";
    }

    showResult(){
        quizBody.innerHTML = `<div class="result-box"></div>`; 
        let resultBox = document.querySelector(".result-box");
        resultBox.innerText = `Du hast ${this.score} von ${this.numberOfQuestions} Punkten erreicht.`
    }

}

//Question File
let file = [

    {
        "type": "standard-6",
        "question": "Was ist1 die Hauptstadt von Deutschland?",
        "answers": {
            "answer1": "Frankfurt",
            "answer2": "Berlin",
            "answer3": "Hof",
            "answer4": "Erfurt",
            "answer5": "München",
            "answer6": "Gera"
        },
        "rightAnswer": 2
    },
    {
        "type": "standard-5",
        "question": "Was ist2 die Hauptstadt von Deutschland?",
        "answers": {
            "answer1": "Frankfurt",
            "answer2": "Berlin",
            "answer3": "Hof",
            "answer4": "Erfurt",
            "answer5": "München"
            
        },
        "rightAnswer": 2
    },
    {
        "type": "standard-4",
        "question": "Was ist3 die Hauptstadt von Deutschland?",
        "answers": {
            "answer1": "Frankfurt",
            "answer2": "Berlin",
            "answer3": "Erfurt",
            "answer4": "München"
            
        },
        "rightAnswer": 2
    },
    {
        "type": "standard-4",
        "question": "Was ist3 die Hauptstadt von Deutschland?",
        "answers": {
            "answer1": "Frankfurt",
            "answer2": "Berlin",
            "answer3": "Erfurt",
            "answer4": "München"
            
        },
        "rightAnswer": 2
    },
    {
        "type": "standard-4",
        "question": "Was ist3 die Hauptstadt von Deutschland?",
        "answers": {
            "answer1": "Frankfurt",
            "answer2": "Berlin",
            "answer3": "Erfurt",
            "answer4": "München"
            
        },
        "rightAnswer": 2
    },
    {
        "type": "standard-4",
        "question": "Was ist3 die Hauptstadt von Deutschland?",
        "answers": {
            "answer1": "Frankfurt",
            "answer2": "Berlin",
            "answer3": "Erfurt",
            "answer4": "München"
            
        },
        "rightAnswer": 2
    }
]


const quizBody = document.querySelector("#container-quiz .body");
const counterTextElement = document.querySelector(".counter-element #counter");
const scoreTextElement = document.querySelector(".score-element #score");
const answerBox = document.querySelector(".answerBox");
const questionTextElement = document.querySelector(".question");
let quiz = new Quiz(file);


document.addEventListener("keyup", (key) =>{
    console.log(key);
    key = key.key; //Sets the Key which has many types to only key (for example E, e , a ,1 ,4 ,o)
    if (key = "Enter"){
       
    }
   
})

console.log(Object.keys(file[0].answers).length);

//Quiz Object
quiz.createQuiz();
quiz.createNextCard();




    


