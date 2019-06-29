//starts app creates global variables
let table = document.getElementById("kmapTable");
let canvasBoundingRect = document.getElementById('canvas').getBoundingClientRect();
let SizeofTable = [5, 5];
createTable(SizeofTable);
const exapmleCell = document.getElementById("exampleCell");
let sizeOfCell = exapmleCell.getBoundingClientRect();
document.getElementById('answerForm').addEventListener('submit', parseAnswer, false);
let correctAudio = new Audio("correct.wav");
let incorrectAudio = new Audio("incorrect.wav");

let arrayOfBoxes = [];
let currentColor = 0;

const app = new PIXI.Application({ view: canvas, resizeTo: table, transparent: true });

window.addEventListener('resize', resizeCanvas, false);
app.renderer.plugins.interaction.on('pointerdown', onPointerDown);
app.renderer.plugins.interaction.on('pointerup', onPointerUp);
app.renderer.plugins.interaction.on('pointermove', onPointerMove);
app.renderer.plugins.interaction.on('pointerupoutside', onPointerUp);

let mousedown = false;
let origin = new PIXI.Point(0, 0);

function generateQuestion(numInputs, inputNames) {
  let questionDOM = document.getElementById('question');
  let binaryArray = [];
  let minterms = [];

  for (let i = 0; i < Math.pow(numInputs, 2); i++) {
    binaryArray.push(Math.round(Math.random()));
  }
  for (let i = 0; i < binaryArray.length; i++) {
    if (binaryArray[i] == 1) {
      minterms.push(i);
    }
  }

  minterms.sort((a, b) => a - b);
  questionDOM.textContent = `\u0192(${inputNames.join(", ")}) = \u03A3m(${minterms.join(", ")})`;
  return minterms;
}

//Setup
let numberOfInputs = 4;
let inputNames = ['A', 'B', 'C', 'D'];

minterms = generateQuestion(numberOfInputs, inputNames);
//shuffle for testing purposes
//shuffle(minterms);
let answer = getAnswer(minterms);


function parseAnswer() {
  //check for bogus data
  let userAnswer = document.getElementById('answerBox');
  let invalidFeedback = document.getElementById("invalid-feedback");
  let invalidchar = userAnswer.value.match(/[^ abcd`ABCD+*']/g);

  if (invalidchar == null) {
    //valid answer
    changeInputBoxToNeutral(userAnswer, invalidFeedback);
    let parsedInput = prepareUserInputForChecking(userAnswer.value);
    if (parsedInput == false) {
      changeInputBoxToIncorrect(userAnswer, invalidFeedback, "Contains Invalid Input");

    } else {
      let correctBool = compareWithAnswer(parsedInput, answer, minterms);
      if (correctBool) {
        correctAudio.play();
        changeInputBoxToCorrect(userAnswer, "Correct", invalidFeedback);
        nextQuestion(userAnswer, invalidFeedback);
      } else {
        incorrectAudio.play();
        changeInputBoxToIncorrect(userAnswer, invalidFeedback, "Wrong Answer");
      }
    }

  } else {
    //invalid answer
    changeInputBoxToIncorrect(userAnswer, invalidFeedback, "Contains Invalid Input " + invalidchar);
  }

}
function changeInputBoxToIncorrect(inputBox, errorDOM, errorText) {
  inputBox.style.borderColor = '#f00';
  inputBox.style.boxShadow = '0 0 0 .2rem rgba(220,53,69,.25)';
  errorDOM.style.display = 'inline';
  errorDOM.textContent = errorText;
}
function changeInputBoxToCorrect(inputBox, correctText, errorDOM) {
  inputBox.style.borderColor = 'rgb(140, 255, 101)';
  inputBox.style.boxShadow = ' 0 0 0 .2rem rgb(140, 255, 101)';
  errorDOM.style.display = 'none';
}
function changeInputBoxToNeutral(inputBox, errorDOM) {
  inputBox.style.borderColor = '#ced4da';
  inputBox.style.boxShadow = ' 0 0 0 .2rem rgba(0,123,255,.25)';
  errorDOM.style.display = 'none';
}

function nextQuestion(answerBox, errorDOM) {
  let question = document.getElementById("question");
  setTimeout(function () {
    changeInputBoxToNeutral(answerBox, errorDOM);
    answerBox.value = "";
    minterms = generateQuestion(numberOfInputs, inputNames);
    answer = getAnswer(minterms);
    question.classList.remove("fadeOut");
    question.classList.add("fadeIn");
    resetKmapTable();
  }, 2000);

  question.classList.add("fadeOut");

}

$(window).resize(function () {
  if ($(window).width() < 982) {
    $('.colorButtons').removeClass('btn-group-vertical');
    $('.colorButtons').addClass('btn-group');
  } else {
    $('.colorButtons').addClass('btn-group-vertical');
    $('.colorButtons').removeClass('btn-group');
  }
});

