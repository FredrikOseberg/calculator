let operator, calculatorUserInput = [], expression = [];
const display = document.querySelector('.display .number p');
const numberButtons = document.querySelectorAll('.number');
const operators = document.querySelectorAll('.operator')
const reset = document.querySelector(".reset");

// If expression exists, render expression. Otherwise, render whatever is in 
// calculator user input array
function checkForExpression() {
	if (!expression.length) {
		calculatorUI.render(calculatorUserInput.join(""));
	} else {
		const buildExpression = expression.concat(calculatorUserInput);
		calculatorUI.render(buildExpression.join(""));
	}
}

// Reset expression, user input and render 0 to the display


// If there is an expression to evaluate (meaning expression array is greater than 1),
// Convert whatever is in the calculatorUserInput array to number and push it to the expression array
// then evaluate the expression. If there is a result, render result. Otherwise, render expression.
function onEqualKey() {
	if (expression.length === 1 || expression.length === 0) return;
	const number = Number(calculatorUserInput.join(""));
	expression.push(number);
	calculatorUserInput = [];
	const result = calculator.evaluate(expression);
	if (result) {
		calculatorUI.render(result);
		expression = [result];
	} else {
		calculatorUI.render(expression);
		expression = [];
	}
}

// If the last item in expression array is not a number, push the number and operator and empty user input.
// Otherwise, add to the number already in expression array, then push the operator and empty user input.
function onOperatorKey(operator) {
	const length = expression.length;
	// Set number equal to what is currently in the calculatorUserInput
	// If the last item of expression array is not number, push the number and operator and empty userinput
	if (typeof expression[length - 1] !== 'number') {
		if (calculatorUserInput.length) {
			const number = Number(calculatorUserInput.join(""));
			expression.push(number);
			expression.push(operator);
			calculatorUserInput = [];
		}
	// If the last item of the expression array is a number. Add whatever the user types to the number
	// And add the number back to the expression array at the length - 1 position. Then push the operator.
	} else {
		let tempArr = [expression[length - 1]];
		tempArr = Number(tempArr.concat(calculatorUserInput).join(""));
		expression[length - 1] = tempArr;
		expression.push(operator);
		calculatorUserInput = [];
	}
	// If there is an expression, render it.
	if (expression.length > 0) {
		calculatorUI.render(expression.join(""));
	}
}

function checkForDotAndPushToUserInputArray(number) {
	if (number === '.') {
		if (calculatorUserInput.indexOf(number) !== -1) {
			return;
		}

		// If expression.length is one, a result has been calculated
		// Therefore, we are now editing that specific result
		// If there is a dot in the expression array already, return from this function
		if (expression.length === 1) {
			const expressionArr = expression.join("").split("");
			if (expressionArr.indexOf(".") !== -1) {
				return;
			} 
		}
		// If the dot is the first item in the array, return from the function
		if (calculatorUserInput.length === 0) {
			return;
		}
	}


	calculatorUserInput.push(number);
	// Render user input if there is no expression yet, otherwise, render expression
	checkForExpression();
}

// Object controlling UI Elements
calculatorUI = {
	render: function(content) {
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
		if (key.dataset.target) {
			if (!e.shiftKey) {
				if (key.dataset.target === ".") {
					var number = key.dataset.target;
				} else {
					var number = Number(key.dataset.target);
				}
				checkForDotAndPushToUserInputArray(number);
			}
		}

		if (key.dataset.keycode === "13") {
			onEqualKey();
		}

		if (key.dataset.type === "+") {
			onOperatorKey("+");
		}

		if (key.dataset.type === "-") {
			onOperatorKey("-");
		}

		if (key.dataset.type === "*") {
			onOperatorKey("*");
		}

		if (e.keyCode === 55 && e.shiftKey) {
			onOperatorKey("/");
		}

		if (key.dataset.keycode === "67") {
			calculator.resetCalc();
		}
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
	}
};

// Create a function that takes a mathematic expression from an array and
// gives that expression to the proper function (passed as callback) and 
// replaces the expression with the result in the array
function createMathOperatorFunction(operator, func, arr) {
	return function() {
		if (arr.indexOf(operator) !== -1) {
			while (arr.indexOf(operator) !== -1) {
				const position = arr.indexOf(operator);
				const firstNumber = arr[position - 1];
				const secondNumber = arr[position + 1];
				total = func(firstNumber, secondNumber);
				arr.splice(position - 1, 3, total);
			}
		}
	}
}

// Check if the expression in a given array should multiply or divide
function decideIfMultiplyOrDivide(arr) {
	const multiplyFunction = createMathOperatorFunction("*", calculator.multiply, arr);
	const dividerFunction = createMathOperatorFunction("/", calculator.divide, arr);
	arr.forEach(item => {
		if (item === "*") {
			multiplyFunction();
		} else if( item === '/') {
			dividerFunction();
		}
	});
}

// Check if the expression in a given array should add or subtract
function decideIfAddOrSubtract(arr) {
	const adderFunction = createMathOperatorFunction("+", calculator.add, arr);
	const subtractFunction = createMathOperatorFunction("-", calculator.subtract, arr);
	arr.forEach(item => {
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
window.addEventListener('keydown', calculatorHandlers.keydownHandler);


