let operator, calculatorUserInput = [], expression = [];
const display = document.querySelector('.display .display-number p');
const numberButtons = document.querySelectorAll('.number');
const operators = document.querySelectorAll('.operator')
const plusMinus = document.querySelector('.plus-minus');
const reset = document.querySelector(".reset");
const percent = document.querySelector(".percent");
const deleteButton = document.querySelector('.delete');
const deleteButtonArrow = deleteButton.querySelector('.arrow');

// Object controlling UI Elements
calculatorUI = {
	render: function(content) {
		if (Array.isArray(content)) {
			content = content.join("");
		}
		display.textContent = content;
	}
}

// Object controlling event handlers
calculatorHandlers = {
	numberHandler: function(e) {
		// Get the number from data-target and push into userinput array
		const number = this.dataset.target;
		// If a . exists, return from the function without doing anything;
		checkForDotAndPushToUserInputArray(number);
	},
	operatorHandler: function(e) {
		// Get the operator from data-type
		const operator = this.dataset.type;

		// If the operator is the equals operator, initiate evaluation and make sure the last number
		// in the user input array is pushed. Then render the result.
		if (operator === '=') {
			onEqualKey();
		} else {
			onOperatorKey(operator);
		}
	},
	resetHandler: function() {
		calculator.resetCalc();
	},
	keydownHandler: function(e) {
		const key = document.querySelector(`div[data-keycode="${e.keyCode}"]`);
		if (!key) return;
		// Get the key and check if it has data.target attribute
		// If it is a dot, just pass it to checkfordot function
		// If not, convert to number and push to the checkfordot function
		const keyHasDatasetTarget = key.dataset.target;
		const noShiftKey = !e.shiftKey;
		const keyIsDot = key.dataset.target === ".";
		if (keyHasDatasetTarget) {
			if (noShiftKey) {
				if (keyIsDot) {
					var calcButtonVal = ".";
				} else {
					var calcButtonVal = key.dataset.target;
				}
				checkForDotAndPushToUserInputArray(calcButtonVal);
			}
		}

		const isBackSpace = key.dataset.keycode === "8";
		if (isBackSpace) {
			calculator.removeCurrentNumber();
		}

		const isEqualKey = key.dataset.keycode === "13";
		if (isEqualKey) {
			onEqualKey();
		}

		const isPlusKey = key.dataset.type === "+";
		if (isPlusKey) {
			onOperatorKey("+");
		}

		const isMinusKey = key.dataset.type === "-";
		if (isMinusKey) {
			onOperatorKey("-");
		}

		const isMultiplicationKey = key.dataset.type === "*";
		if (isMultiplicationKey) {
			onOperatorKey("*");
		}

		const isShiftAndDivisionKey = e.keyCode === 55 && e.shiftKey;
		if (isShiftAndDivisionKey) {
			onOperatorKey("/");
		}

		const isResetKey = key.dataset.keycode === "67";
		if (isResetKey) {
			calculator.resetCalc();
			removeBlockFromDeleteButton();
			removeOpacityFromDeleteButton();
		}
 	},
 	plusMinusHandler: function() {
 		calculator.flipValue();
 	},
 	percentHandler: function() {
 		calculator.toPercentage();
 	},
 	deleteHandler: function() {
 		calculator.removeCurrentNumber();
 	}
}

// Object handling calculator logic
const calculator = {
	add: function(one, two) {
		return one + two;
	},
	multiply: function(one, two) {
		return one * two;
	},
	subtract: function(one, two) {
		return one - two;
	},
	divide: function(one, two) {
		return one / two;
	},
	evaluate: function(arr) {
		if (arr.length < 3 || arr[arr.length - 1] === "0") return;
		const lastItemOfExpression = arr[arr.length - 1];
		const lastItemOfExpressionIsDot = lastItemOfExpression === "."
		if (lastItemOfExpressionIsDot) {
			arr.pop();
		}
		
		arr = buildExpressionFromArray(arr);

		const expressionArray = arr;
		let total = 0;
		// While there is more than one number in the array, keep evaluating the expression
		while (arr.length > 1) {
			const indexOfMultiply = arr.indexOf("*");
			const indexOfDivide = arr.indexOf("/");
			// Find the first operator and perform multiplication or division
			decideIfMultiplyOrDivide(expressionArray);

			// Only add and subtract if there are no multiplication or division operators in the array
			if (indexOfMultiply === -1 && indexOfDivide === -1) {
				decideIfAddOrSubtract(expressionArray);
			}
		}
		// Loop is over, there is only one item left in the array. Return the total value.
		total = arr[0];
		return total;
	},
	resetCalc: function () {
		expression = [];
		calculatorUserInput = [];
		calculatorUI.render(0);
		removeBlockFromDeleteButton();
		removeOpacityFromDeleteButton();
	},
	toPercentage: function() {
		if (calculatorUserInput.length > 0 && expression.length === 0) {
			const number = Number(calculatorUserInput.join(""));
			expression.push(number);
			calculatorUserInput = [];
		}
		if (expression.length > 1 || expression.length === 0) return;
		const number = expression[0];
		expression[0] = (number / 100) * 1;
		calculatorUI.render(expression.join(""));
	},
	flipValue: function() {
		if (calculatorUserInput.length > 0 && expression.length === 0) {
			const number = Number(calculatorUserInput.join(""));
			expression.push(number);
			calculatorUserInput = [];
		}
		if (expression.length > 1 || expression.length === 0) return;
		const number = expression[0];
		if (number > 0) {
			expression[0] = -Math.abs(number);
		} else {
			expression[0] = Math.abs(number);
		}
		calculatorUI.render(expression.join(""));
	},
	removeCurrentNumber() {
		const expressionLengthIsZero = expression.length === 0; 
		if (expressionLengthIsZero) {
			let lastItemPosition = calculatorUserInput.length - 1;
			calculatorUserInput.splice(lastItemPosition, 1);
			calculatorUI.render(calculatorUserInput.join(""));

			const userInputIsEmpty = calculatorUserInput.length === 0;
			if (userInputIsEmpty) {
				calculator.resetCalc();
			}
		} else {
			addItemToExpressionFromInput();
			let fullExpressionAfterDelete = [], temporaryNum = [];
			const expressionPieces = expression.join("").split("");
			const lastItemPosition = expressionPieces.length - 1;
			expressionPieces.splice(lastItemPosition, 1);

			function constructNumberStringAndPushToFullExpressionArr() {
				const number = temporaryNum.join("");
				if (number) {
					fullExpressionAfterDelete.push(number);
				}
				temporaryNum = [];
			}

			expressionPieces.forEach(function reBuildExpression(item, index) {
				const itemIsOperator = item === '/' || item === '*' || item === "+" || item === '-';
				if (!itemIsOperator) {
					temporaryNum.push(item);
				} else {	
					constructNumberStringAndPushToFullExpressionArr();
					fullExpressionAfterDelete.push(item);
				}
				if (index === expressionPieces.length - 1) {
					const temporaryNumHasContents = temporaryNum.length > 0;
					if (temporaryNumHasContents) constructNumberStringAndPushToFullExpressionArr();
				}
			});

			expression = fullExpressionAfterDelete;
			calculatorUI.render(expression.join(""));

			
			const expressionIsEmpty = expression.length === 0;
			if (expressionIsEmpty) {
				calculator.resetCalc();
			}
		}
	}
};

// If expression exists, render expression. Otherwise, render whatever is in 
// calculator user input array
function checkForExpression() {
	if (!expression.length) {
		calculatorUI.render(calculatorUserInput);
	} else {
		const buildExpression = expression.concat(calculatorUserInput);
		calculatorUI.render(buildExpression);
	}
}

// If there is an expression to evaluate (meaning expression array is greater than 1),
// Convert whatever is in the calculatorUserInput array to number and push it to the expression array
// then evaluate the expression. If there is a result, render result. Otherwise, render expression.
function onEqualKey() {
	const userInputEmpty = calculatorUserInput.length === 0;
	const expressionLengthIsTwo = expression.length === 2;

	if (expression.length === 1 || expression.length === 0) return;
	addItemToExpressionFromInput();

	const validExpression = expression.length >= 3;
	if (validExpression) {
		const lastItem = expression[expression.length - 1];
		const lastItemIsOperator = lastItem === '*' 
									|| lastItem === '/'
									|| lastItem === '+'
									|| lastItem === '-'
		if (lastItemIsOperator) {
			expression.pop();
		}
		const result = calculator.evaluate(expression);
		if (result) {
			calculatorUI.render(result);
			expression = [result];
		} else {
			calculatorUI.render(expression);
			expression = [];
		}
	}
}

// If the last item in expression array is not a number, push the number and operator and empty user input.
// Otherwise, add to the number already in expression array, then push the operator and empty user input.
function onOperatorKey(operator) {
	const isFirstItemInInput = calculatorUserInput.length === 0;
	const noExpression = expression.length === 0;
	if (isFirstItemInInput && noExpression) return;
	addItemToExpressionFromInput();
	const lastItem = expression.length - 1;
	const lastExpressionItem = expression[lastItem]

	const lastExpressionItemIsNotOperator = lastExpressionItem !== '+' 
											&& lastExpressionItem !== "-" 
											&& lastExpressionItem !== "*"
											&& lastExpressionItem !== '/';
	
	if (lastExpressionItemIsNotOperator) {
		expression.push(operator);
	}

	if (expression.length > 0) {
		calculatorUI.render(expression);
	}
}

function addItemToExpressionFromInput() {
	const inputIsEmpty = calculatorUserInput.length === 0;
	if (inputIsEmpty) return; 
	const userInput = calculatorUserInput.join("");
	expression.push(userInput);
	calculatorUserInput = [];
}

function checkForDotAndPushToUserInputArray(calcInput) {
	const inputIsDot = calcInput === ".";
	if (inputIsDot) {
		const numberHasDot = calculatorUserInput.indexOf(".") !== -1;
		if (numberHasDot) return;
		const lastItem = calculatorUserInput.length - 1;
		const lastUserInputItem = calculatorUserInput[lastItem] 
		const lastCalculatorItemIsDot = lastUserInputItem === "."
		if(lastCalculatorItemIsDot) {
			return;
		}
	}

	const expressionExists = expression.length > 0;
	const userInputIsEmpty = calculatorUserInput === 1;
	if (inputIsDot && expressionExists && userInputIsEmpty) {
		return;
	}

	calculatorUserInput.push(calcInput);
	// Render user input if there is no expression yet, otherwise, render expression
	checkForExpression();
	checkIfDeleteButtonShouldDisplay();
}

// Create a function that takes a mathematic expression from an array and
// gives that expression to the proper function (passed as callback) and 
// replaces the expression with the result in the array
function createMathOperatorFunction(operator, func, arr) {
	return function() {
		if (arr.indexOf(operator) !== -1) {
				const position = arr.indexOf(operator);
				const firstNumber = arr[position - 1];
				const secondNumber = arr[position + 1];
				total = func(firstNumber, secondNumber);
				arr.splice(position - 1, 3, total);
		}
	}
}

// Check if the expression in a given array should multiply or divide
function decideIfMultiplyOrDivide(arr) {
	const tempArr = arr;
	const multiplyFunction = createMathOperatorFunction("*", calculator.multiply, arr);
	const dividerFunction = createMathOperatorFunction("/", calculator.divide, arr);
	tempArr.forEach(item => {
		if (item === "*") {
			multiplyFunction();
		} else if( item === '/') {
			dividerFunction();
		}
	});
}

// Check if the expression in a given array should add or subtract
function decideIfAddOrSubtract(arr) {
	const tempArr = arr;
	const adderFunction = createMathOperatorFunction("+", calculator.add, arr);
	const subtractFunction = createMathOperatorFunction("-", calculator.subtract, arr);
	tempArr.forEach(item => {
		if (item === '+') {
			adderFunction();
		} else if (item === "-") {
			subtractFunction();
		}
	});
}


// Event listeners
numberButtons.forEach(number => number.addEventListener('click', calculatorHandlers.numberHandler));
operators.forEach(operator => operator.addEventListener	('click', calculatorHandlers.operatorHandler));
reset.addEventListener('click', calculatorHandlers.resetHandler);
plusMinus.addEventListener('click', calculatorHandlers.plusMinusHandler);
percent.addEventListener('click', calculatorHandlers.percentHandler);
deleteButton.addEventListener('click', calculatorHandlers.deleteHandler);
window.addEventListener('keydown', calculatorHandlers.keydownHandler);

function checkIfDeleteButtonShouldDisplay() {
	const expressionIsNotEmpty = expression.length > 0;
	if (expressionIsNotEmpty) {
		addDisplayBlockToDeleteButton();
		setTimeout(function addClassToDeleteButton () {
			addOpacityOneToDeleteButton();
		}, 150)
	} else {
		const userInput = checkIfCalculateInputIsEmpty();
		const noExpression = expression.length === 0;
		if (!userInput) {
			removeBlockFromDeleteButton();
			removeOpacityFromDeleteButton();
		} else {
			addDisplayBlockToDeleteButton();
			setTimeout(function addClassToDeleteButton () {
				addOpacityOneToDeleteButton();
			}, 150)
		}
	}
}

function checkIfCalculateInputIsEmpty() {
	return calculatorUserInput.length > 0 ? true : false;
}

function addDisplayBlockToDeleteButton() {
	deleteButton.classList.add('delete-button-block');
	deleteButtonArrow.classList.add('delete-button-block');
}

function removeBlockFromDeleteButton() {
	deleteButton.classList.remove('delete-button-block');
	deleteButtonArrow.classList.remove('delete-button-block');
}

function addOpacityOneToDeleteButton() {
	deleteButton.classList.add('delete-button-opacity');
	deleteButtonArrow.classList.add('delete-button-opacity');
}

function removeOpacityFromDeleteButton() {
	deleteButton.classList.remove('delete-button-opacity');
	deleteButtonArrow.classList.remove('delete-button-opacity');
}

function buildExpressionFromArray(arr) {
	let temp = [];
	let result = [];
	const regExp = /\+/ig
	arr.forEach(function buildExpression(item) {
		const itemIsNotOperator = item !== '+' 
								  && item !== '-'
								  && item !== '*'
								  && item !== '/';

		if (itemIsNotOperator) {
			const number = Number(item);
			temp.push(number);
		} else {
			temp.push(item);
		}
	});

	temp.forEach(function checkValidExpression(item, index) {
		const nextItem = temp[index + 1];
		if (typeof item === 'number' && typeof nextItem === 'number') {
			item = item + nextItem;
			temp.splice(index + 1, 1);
		}
		result.push(item);
	});

	return result;
}



