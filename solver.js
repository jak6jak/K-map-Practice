//K-map solver

String.prototype.replaceAll = function (search, replacement) {
  var target = this;
  return target.replace(new RegExp(search, 'g'), replacement);
};

function findGroupings(inputminterms) {

  let groups = [];
  //set up groups array
  /* groups format:
  groups: [
    //array of grouped numbers
        0:  [
             1:  [0,1],
             2:  [0,1,8,9],
             etc:[0]
            ],
    //array of binary with dashes
        1:  [
              1:'000-'
              2:'-00-'
              3:'0000'
            ]

          ]

  */
  for (let i = 0; i < numberOfInputs + 1; i++) {
    groups.push([[], []]);
  }

  //Quinne-McCluskey's Method:
  // 1. Group Minterms according to the number of ones they contain
  for (let i = 0; i < inputminterms.length; i++) {
    let numberOfOnes = (inputminterms[i].match(/[1]/g) || []).length;
    groups[numberOfOnes][0].push([parseInt(inputminterms[i], 2)]);
    groups[numberOfOnes][1].push(inputminterms[i]);
  }
  let primeImplicants = [];
  let stop = false;
  while (stop == false) {
    //Step 2 pair all terms in adjacent groups looking for hamming distance of 1
    for (
      let groupiterator = 0;
      groupiterator < groups.length;
      groupiterator++
    ) {
      let temp = [[], []];

      for (
        let firstGroup = 0;
        firstGroup < groups[groupiterator][1].length;
        firstGroup++
      ) {
        let FirstGroupCombined = false;
        //at last group can't compare with anything so add it to prime implicates 
        if (groupiterator != groups.length - 1) {
          for (
            let secondGroup = 0;
            secondGroup < groups[groupiterator + 1][1].length;
            secondGroup++
          ) {
            let Compare = hammingDistance(
              groups[groupiterator][1][firstGroup],
              groups[groupiterator + 1][1][secondGroup]
            );
            if (Compare.length == 1) {
              FirstGroupCombined = true;
              temp[0].push(
                groups[groupiterator][0][firstGroup].concat(
                  groups[groupiterator + 1][0][secondGroup]
                )
              );
              temp[1].push(
                replaceAt(groups[groupiterator][1][firstGroup], Compare[0], "-")
              );
            }
          }
        }
        // can't combine
        if (FirstGroupCombined == false) {
          primeImplicants.push(groups[groupiterator][0][firstGroup]);
        }
      }
      groups[groupiterator] = temp;
    }
    //Verify primeImplicants
    for (let i = primeImplicants.length - 1; i >= 0; i--) {
      let match = false;
      for (let numberOfOnes = 0; numberOfOnes < groups.length; numberOfOnes++) {
        for (
          let combinedTermsIterator = 0;
          combinedTermsIterator < groups[numberOfOnes][0].length;
          combinedTermsIterator++
        ) {
          let intersection = primeImplicants[i].filter(value =>
            groups[numberOfOnes][0][combinedTermsIterator].includes(value)
          );
          if (intersection.length == primeImplicants[i].length) {
            match = true;
            break;
          }
        }
        if (match == true) {
          break;
        }
      }
      //This has been combined so remove it from primeImplicants
      if (match == true) {
        primeImplicants.splice(i, 1);
      }
    }
    //Remove duplicate primeImplicants
    primeImplicants = removeDuplicateArrays(primeImplicants);

    if (isGroupsEmpty(groups) == true) {
      stop = true;
      return primeImplicants;
    }
  }
}

//Retuns an array of each term seperated.
function getAnswer(_minterms) {
  let result = [];
  _minterms = convertIntegersToMinTerms(_minterms);
  console.log(_minterms);
  let prime = findGroupings(_minterms);
  for (let i = 0; i < prime.length; i++) {
    result.push(convertBinaryToInputs(convertIntToCombinedBinary(prime[i])));
  }
  console.log(result);
  return result;
}
//checks to see if the groups array is empty
//returns boolean
function isGroupsEmpty(groupArray) {
  let empty = true;
  for (let i = 0; i < groupArray.length; i++) {
    if (groupArray[i][0].length != 0) {
      empty = false;
      break;
    }
  }
  return empty;

}

// Returns false with invalid input otherwise return true
function prepareUserInputForChecking(input) {
  splitInput = validateLetterInput(input);
  if (splitInput == false) {
    return false;
  }
  //Sort 
  for (let i = 0; i < splitInput.length; i++) {
    let arryOfString = splitInput[i].split(/(?=[a-z])/g);
    splitInput[i] = arryOfString.sort().join('');
  }
  return splitInput;
}

//Returns true or false if correct
//Input is the user answer, answer is computer found answer, key is minterms as integers to see if they are equivlent.
function compareWithAnswer(userInput, answer, key) {
  //First for testing purposes check the computer userInput to see if correct
  for (let i = 0; i < Math.pow(numberOfInputs, 2); i++) {
    let evaluatedAnswer = evaluateMintermFunction(userInput, i.toString(2).padStart(numberOfInputs, '0'));
    if (evaluatedAnswer == true) {
      if (!key.includes(i)) {
        console.log("we generated wrong userInput");
        return false;
      }
    } else {
      if (key.includes(i)) {
        console.log("we generated wrong userInput");
        return false;
      }
    }

  }
  //Check to see that cost is less or equivalent
  let userCost = getCost(userInput);
  let answerCost = getCost(answer);

  console.log("User cost: " + userCost);
  console.log("answerCost " + answerCost);
  if (userCost <= answerCost) {
    return true;
  } else {
    return false;
  }
}

//Gets cost of digital logic
function getCost(minterm) {
  let cost = 0;
  for (let i = 0; i < minterm.length; i++) {
    let trimmedMinterm = removeTilde(minterm[i]);
    cost = cost + trimmedMinterm.length;
    //add cost for gate itself.
    cost = cost + 1;
  }
return cost;
}

//returns true or false if minterm returns true or false for input
// minterms in array letter form each term seperated, input in binary
function evaluateMintermFunction(SOPminterms, binaryInput) {
  let minTermEquation = '';

  for (let i = 0; i < SOPminterms.length; i++) {
    let correctedBinaryInput = binaryInput;
    //check to see if we are missing any inputs, If so then we need binary input to reflect that.
    if (removeTilde(SOPminterms[i]).length < numberOfInputs) {
      let missingInputs = findMissingInputs(SOPminterms[i]);
      for (let j = missingInputs.length - 1; j >= 0; j--) {
        correctedBinaryInput = correctedBinaryInput.slice(0, inputNames.indexOf(missingInputs[j])) + correctedBinaryInput.slice(inputNames.indexOf(missingInputs[j]) + 1);
      }
    }

    //flip binary input where there is a tilde
    let tildeIndexs = [];
    tildeIndexs = findIndexesOfChar(SOPminterms[i], "`");
    tildeIndexs = tildeIndexs.concat(findIndexesOfChar(SOPminterms[i], "'"));

    //flip if tilde in front
    for (let k = 0; k < tildeIndexs.length; k++) {
      correctedBinaryInput = replaceAt(correctedBinaryInput, (tildeIndexs[k] - k) - 1, 1 - parseInt(correctedBinaryInput.charAt((tildeIndexs[k] - k) - 1), 2));
    }
    //place correcctedBinaryInput[j] + correcctedBinaryInput[j +1]
    for (let j = 0; j < correctedBinaryInput.length; j++) {
      if (j == correctedBinaryInput.length - 1) {
        minTermEquation += correctedBinaryInput[j];
      } else {
        minTermEquation += correctedBinaryInput[j] + "*";
      }
    }
    if (i != SOPminterms.length - 1) {
      minTermEquation += "+";
    }

  }
  //evaluate the minterm equation to get final answer
  let answerEquation = eval(minTermEquation);
  if (answerEquation >= 1) {
    return true;
  } else return false;


}

function findIndexesOfChar(inputString, char) {
  let indices = [];
  for (let i = 0; i < inputString.length; i++) {
    if (inputString[i] === char) indices.push(i);
  }
  return indices;
}

//finds the missing inputname
function findMissingInputs(input) {
  let newinput = input.replace(/[`']/g, '');
  return newinput.split('')
    .filter(x => !inputNames.includes(x))
    .concat(inputNames.filter(x => !newinput.includes(x)));
}

function removeTilde(input) {
  let newinput = input.replace(/[`']/g, '');
  return newinput;
}

// returns array of input or false
function validateLetterInput(input) {
  input = input.replaceAll("\\*", "");

  //first split up everything by +
  let splitInput = input.split(/[ +]/);
  //remove empty strings
  splitInput = splitInput.filter(function (el) {
    return el.length > 0;
  });
  //Validate input for sanity
  //Check that ` is preceded by letter
  //check that there is no duplicate letters
  for (let index = 0; index < splitInput.length; index++) {
    let currentString = splitInput[index].toLowerCase();
    let inputs = '';
    for (let splitIndex = 0; splitIndex < currentString.length; splitIndex++) {
      if (currentString.charAt(splitIndex) == "`" || currentString.charAt(splitIndex) == "'") {
        if (splitIndex == 0) {
          //Cannot have ` at beginning
          return false;
        } else if (!isLetter(currentString.charAt(splitIndex - 1))) {
          return false;
        }
      } else if (isLetter(currentString.charAt(splitIndex))) {
        if (inputs.includes(currentString.charAt(splitIndex))) {
          return false;
        } else {
          inputs = inputs + currentString.charAt(splitIndex);
        }
      } else {
        //not letter or ` must be invalid
        return false;
      }

    }
  }
  return splitInput;
}

function isLetter(str) {
  if (str.length > 1) {
    return false;
  }
  let letters = /^[A-Za-z]+$/;
  if (str.match(letters)) {
    return true;
  }
  else {
    return false;
  }
}
//accepts an array to convert into a string of Inputs for answer.
function convertBinaryToInputs(binaryString) {
  let result = '';
  for (let stringIncrement = 0; stringIncrement < binaryString.length; stringIncrement++) {
    if (binaryString.charAt(stringIncrement) == '1') {
      result += inputNames[stringIncrement];
    } else if (binaryString.charAt(stringIncrement) == '0') {
      result += inputNames[stringIncrement] + "'";
    }
  }
  return result;
}
function convertIntToCombinedBinary(arrayToConvert) {
  //converts [0,1,8,9] into '-00-' for example
  //first convert to binary
  let binaryArray = convertIntegersToMinTerms(arrayToConvert);
  let result = binaryArray[0];
  for (let i = 0; i < binaryArray.length; i++) {
    let dashIndexs = hammingDistance(binaryArray[0], binaryArray[i]);

    for (let dashIterator = 0; dashIterator < dashIndexs.length; dashIterator++) {
      result = replaceAt(result, dashIndexs[dashIterator], '-');
    }
  }
  return result;

}
function convertIntegersToMinTerms(arrayOfInts) {
  let minTermArray = [];
  for (let i = 0; i < arrayOfInts.length; i++) {
    let binary = arrayOfInts[i].toString(2);
    //add padding
    binary = binary.padStart(numberOfInputs, '0');
    minTermArray.push(binary);
  }
  return minTermArray;
}
//PARAM array is and array of arrays this function will remove arrays that
//contain the same elements
function removeDuplicateArrays(removalArray) {
  for (let i = removalArray.length - 1; i >= 1; i--) {
    removalArray[i].sort();
    let match = false;
    for (let j = i - 1; j >= 0; j--) {
      if (removalArray[i].length == removalArray[j].length) {
        removalArray[j].sort();
        for (let compareIterator = 0; compareIterator < removalArray[i].length; compareIterator++) {
          if (removalArray[i][compareIterator] != removalArray[j][compareIterator]) {
            match = false;
            break;
          }
          match = true;
        }
        if (match == true) {
          removalArray.splice(j, 1);
          i--;
        }
      }
    }
  }
  return removalArray;
}

function includesAll(currentValue, arrayToCheck) {
  return arrayToCheck.includes(currentValue);
}
//Returns the index where the strings are different
function hammingDistance(a, b) {
  if (a.length !== b.length) {
    console.log("strings must be of same length" + a + " " + b);
    return -1;
  }

  let differnce = [];

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      differnce.push(i);
    }
  }

  return differnce;
}
function replaceAt(string, index, replace) {
  return string.substring(0, index) + replace + string.substring(index + 1);
}

/**
 * Shuffles array in place. ES6 version
 * @param {Array} a items An array containing the items.
 */
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
