const calcScreen = document.querySelector(".screen");
const keys = document.querySelectorAll(".key");

window.addEventListener("load", (e) => {
    const defaultValue = document.createElement("div");
    defaultValue.innerText = 0;

    calcScreen.append(defaultValue);
});

keys.forEach((key) => {
    key.addEventListener("click", (e) => {
        console.log("click top scope")
        calculator(e, "mouse");
    });

    key.addEventListener("keydown", (e) => {
        console.log("key top scope", e.eventPhase);
        calculator(e, "key");
    })
});

function calculator(e, type) {
    //for screen value appending and manipulation
    const displayValues = calcScreen.children;

    //for disabling the dot button when necessary
    const dotBtn = document.querySelector(".key.dot");
    //for clearing the result on display after a calculation
    const numKeys = document.querySelectorAll(".key.num");

    const exps = [];

    const screenStyles = getComputedStyle(calcScreen);
    const fontSize = screenStyles.fontSize;

    const screenValue = document.createElement("div");

    if (displayValues.length > 7) {
        const calcRect = calcScreen.getBoundingClientRect();
        const num = calcScreen.firstElementChild.getBoundingClientRect();

        //decrease font size as divs n increase more than 8
        if (num.x > calcRect.x) {
            calcScreen.style.fontSize = `${parseFloat(fontSize) - 4}px`;
        }
    }

    let keyValue = "";

    if (type == "mouse") {
        let length = e.currentTarget.className.split(" ").length;

        screenValue.innerText = e.currentTarget.innerText;
        keyValue = e.currentTarget.classList[length-1];
    }
    
    if (type == "key") {
        screenValue.innerText = e.key;
        keyValue = e.key;
    }

    console.log(`keyValue: ${keyValue}`);

    switch (keyValue) {
        case "n":
        case "plus-minus":
            /*
            behavior(s):
                - when this key is pressed once, it appends it to the current number
                - when pressed twice, it removes it from the expression 
                - CANNOT repeat more than once
                - SHOULD NOT allow to be appended after an operator or a parenthesis
            */
            console.log("pressed plus minus");

            let valueCounter = 0;
            screenValue.innerText = "-";

            console.log("negative unary pressed");

            for (let i = displayValues.length - 1; i >= 0; i--) {
                //-----------------------------------------------------------------------------
                /*
                if the number is more than one digit, the condition assumes that
                the number length is from lastElementChild to the nearest and most recent
                operator node, after which the unary operator is appended
                */
                if (displayValues[i].className == "op" || displayValues[i].innerText == "(") {
                    displayValues[i].insertAdjacentElement('afterend', screenValue);

                    screenValue.setAttribute("class", "unary");
                    break;
                }

                if (displayValues[i].className == "value") {
                    valueCounter++;
                }

                if (valueCounter == displayValues.length) {
                    calcScreen.replaceChildren(screenValue, ...displayValues);

                    screenValue.setAttribute("class", "unary");
                    break;
                }

                //-----------------------------------------------------------------------------

                //-----------------------------------------------------------------------------
                /*
                for removing the unary property, the reverse loop looks for the div that owns
                the lone class "unary", to properly identify where in the stack of values
                it is located
                */
                if (displayValues[i].className == "unary") {
                    let second = [];

                    /*
                    as the children property of HTMLCollection does not have a method that supports
                    list iterations such as the childNodes property, the values are appended to a list
                    */
                    for (let j = 0; j < displayValues.length; j++) {
                        exps.push(displayValues[j]);
                    }

                    //for whole values
                    if (valueCounter == displayValues.length - 1) {
                        second = exps.slice(1, displayValues.length);

                        calcScreen.replaceChildren(...second);

                        break;
                    }

                    //for handling other sorts of expressions
                    if ((displayValues[i-1].className == "op" || displayValues[i-1].innerText == "(")) {
                        const first = exps.slice(0, i);
                        second = exps.slice(i+1, displayValues.length);

                        calcScreen.replaceChildren(...first, ...second);

                        break;   
                    }
                    //-----------------------------------------------------------------------------
                }
            }

            break;
        case ".":
        case "dot":
            /*
            behavior:
                - can only be typed after a number and ONLY a number
                - CANNOT be repeated twice
            */

            //-----------------------------------------------------------------------------
            /*
            to keep it simple, disabling the button disallows funny syntax
            */
            if (calcScreen.lastElementChild.className == "value") {
                dotBtn.setAttribute("disabled", "");
                screenValue.setAttribute("class", "dot");
                calcScreen.append(screenValue);
            }
            //-----------------------------------------------------------------------------

            break;
        case "Backspace":
        case "delete":
            /*
            behavior:
                - deletes the last value from the screen
                - if there is only one value, set value to 0 after deletion
                - when an expression reaches a specific number of values/symbols,
                    the fontSize property is decreased to 4px from its previously set size
            */

            if (displayValues.length === 1) {
                console.log("reached one digit");
                if (calcScreen.firstElementChild.innerText == 0) {
                    calcScreen.firstElementChild.replaceWith(calcScreen.firstElementChild);
                    break;
                }
                
                calcScreen.firstElementChild.innerText = 0;
                dotBtn.removeAttribute("disabled");
            } else {
                console.log("clicked delete");
                calcScreen.removeChild(calcScreen.lastElementChild);
            }
            
            if (displayValues.length > 7) {
                calcScreen.style.fontSize = `${parseFloat(fontSize) + 4}px`;
            }

            break;
        case "c":
        case "clear":
            /*
            behavior:
                - should clear ALL inputted values from the screen (with the exception that the only remaining value is 0)
                - must properly display 0 upon clearing values
            */

            calcScreen.replaceChildren();

            screenValue.innerText = 0;
            calcScreen.style.fontSize = `52px`;
            calcScreen.append(screenValue);

            dotBtn.removeAttribute("disabled");

            break;

        case "0":
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
        case "8":
        case "9":
            if (!e.target.classList.contains("hit-clear")) {
                if (displayValues.length == 1 && displayValues[0].innerText == 0) {
                    calcScreen.firstElementChild.replaceWith(screenValue);
                    break;
                }
                calcScreen.append(screenValue);
                break;
            }
        case "hit-clear":
            calcScreen.replaceChildren();
            numKeys.forEach((key) => key.classList.remove("hit-clear") );
            
            calcScreen.append(screenValue);

            break;
        case "[":
        case "left-paren":
            screenValue.innerText = "(";
            screenValue.setAttribute("class", "symb");

            if (calcScreen.children.length === 1
                && calcScreen.firstElementChild.innerText == 0) {
                    calcScreen.firstElementChild.replaceWith(screenValue);
                    break;
            }

            if (calcScreen.lastElementChild.className == "dot") break;

            calcScreen.append(screenValue);
            break;
        case "]":
        case "right-paren":
            console.log("pressed right-paren");
            /*
            not allow the closing parenthesis to be appended if there is only one value in the display,
            and the value is either zero or an open parenthesis
            */
            if (displayValues.length == 1
                && (calcScreen.firstElementChild.innerText == 0 || 
                    (calcScreen.firstElementChild.innerText == "("))) {
                    break;
            }

            //just the same as the one above, with unlikely
            if (calcScreen.lastElementChild.innerText == "(" 
                || calcScreen.lastElementChild.className == "dot"
                || calcScreen.lastElementChild.className == "op") {
                break;
            }

            screenValue.innerText = ")";
            screenValue.setAttribute("class", "symb");

            calcScreen.append(screenValue);

            break;
        case "=":
        case "equal":
        case "Enter":
            //the most complex one among the rest of the keys
            /*
            behavior:
                - presumes that the inputted values form a valid expression, and evaluates it according to the provided
                    set of operations
            
            how it works:
                - there are four functions:
                    > isOperator, which checks for whether the current displayed value is an operator
                    > precedence, which checks for operator precedence according to mathematical rules
                    > infixToPostfix, which is responsible for parsing the infix expression that is commonly
                    seen in mathematical texts and is purposely made to be readable by humans (e.g. 1 + 1 - 2)
                    > evalPostfix, which takes in a postfix expression whereupon evaluation should result into the desired
                    result as we humans would understand it were it to be written in infix notation
                - the main reason for using postfix is that converting from infix to postfix allows to make
                    much clearer sense of what is being evaluated, and this is possible by first pushing operators in a stack
                    by order of precedence. after the resulting postfix expression is constructed, the evaluation process
                    has set conditions that account for negative values and decimal numbers, which are then calculated in the order
                    of which the operators were appended in the expression itself
            */

            let infix = "";
            const exp = [];

            const isOperator = (op) => {
                switch (op) {
                    case "+":
                    case "-":
                    case "x":
                    case "/": return true;
                    default: return false;
                }
            };

            for (let i = 0; i < calcScreen.children.length; i++) {
                infix += calcScreen.children[i].innerText;
            }

            if (isNaN(infix[infix.length - 1]) && infix[infix.length - 1] != ")") {
                screenValue.innerText = "undefined";
                calcScreen.replaceChildren(screenValue);

                numKeys.forEach((key) => {
                    key.classList.add("hit-clear");
                });
                
                break;
            }

            const precedence = (op) => {
                switch (op) {
                    case "+":
                    case "-": return 1;
                    case "x":
                    case "/": return 2;
                }
                return -1;
            };

            //infix to postfix
            const infixToPostfix = (infix) => {
                let postfix = "";

                for (let j = 0; j < infix.length; j++) {
                    if (!isNaN(infix[j]) || infix[j] == ".") {
                        postfix += infix[j];
                    }
                    
                    if (isOperator(infix[j])) {
                        if (infix[j-1] == " " && infix[j] == "-" && (!isNaN(infix[j+1]) && infix[j+1] != " ")) {
                            postfix += infix[j];
                            continue;
                        }

                        postfix += " ";

                        //check while stack is not empty and the precedence of the top value in
                        //the stack is higher
                        while (exp.length != 0 && (precedence(exp[exp.length-1]) > precedence(infix[j])) && exp[exp.length-1] != "(") {
                            postfix += exp.pop();
                            postfix += " ";
                        }

                        exp.push(infix[j]);
                    }
                    
                    if (infix[j] == "(") {
                        exp.push(infix[j]);
                    }
                    
                    if (infix[j] == ")") {
                        postfix += " ";
                        while (exp.length != 0 && exp[exp.length-1] != "(") {
                            postfix += exp.pop();
                            postfix += " ";
                        }
                        exp.pop();
                    }
                }

                postfix += " ";
                while (exp.length != 0) {
                    postfix += exp.pop();
                    postfix += " ";
                }

                return postfix.slice(0, exp.length-1);
            };
            
            const evalPostfix = (postfix) => {
                let num = "";
                for (let j = 0; j < postfix.length; j++) {
                    if (isOperator(postfix[j])) {
                        //append number to num string
                        if (postfix[j-1] != " " && postfix[j] == "-" && (!isNaN(postfix[j+1]))) {
                            num += postfix[j];
                            continue;
                        }

                        const op2 = exp.pop();
                        const op1 = exp.pop();

                        const res = operate(postfix[j], op1, op2);
                        
                        exp.push(res);
                    }
                    
                    if ((!isNaN(postfix[j]) && postfix[j] != " ") || postfix[j] == ".") {
                        num += postfix[j];
                    }

                    if (postfix[j] == " " && num != "") {
                        exp.push(parseFloat(num));
                        num = "";
                    }
                }
                
                const res = exp.pop();
                if (res.toString().includes(".")) {
                    return res.toFixed(2);
                } else {
                    return res.toString();
                }
            }

            const postfix = infixToPostfix(infix);
            const res = evalPostfix(postfix);
            
            console.log(infix, postfix, res);

            calcScreen.replaceChildren();

            for (let i = 0; i < res.length; i++) {
                const div = document.createElement("div");
                div.innerText = res[i];
                div.setAttribute("class", "value");
                calcScreen.append(div);
            }
            
            numKeys.forEach((key) => {
                key.classList.add("hit-clear");
                key.blur();
            });

            break;
        default:
            if (type == "mouse") screenValue.innerText = e.currentTarget.innerText;

            if (type == "key") {
                if (e.key == "Tab" || e.key.includes("Shift") || e.key.includes("Alt") || e.key.includes("Ctrl") 
                    || e.key == "Meta" || e.key.includes("Arrow")) {
                    console.log("lmao no");
                    break;
                }
                
                if (e.key == "*") {
                    screenValue.innerText = "x";
                } else {
                    screenValue.innerText = e.key;
                }
            }
            
            /*
            does not allow operator duplication by instead replacing the current operator
            on the screen
            */
            const ops = ["+", "-", "*", "/"];

            if (ops.includes(screenValue.innerText)) {
                if (calcScreen.lastElementChild.className == "op") {
                    console.log("replace op");
                    calcScreen.lastElementChild.innerText = screenValue.innerText;

                    break;
                }

                if (calcScreen.lastElementChild.className == "dot" || calcScreen.lastElementChild.className == "symb") {
                    break;
                }

                //removes disabled attribute if an operator is inputted
                if (calcScreen.lastElementChild.className == "value") {
                    dotBtn.removeAttribute("disabled");
                }

                screenValue.setAttribute("class", "op");
            } else {
                screenValue.setAttribute("class", "value");
            }

            //some idiotic code
            if (calcScreen.children.length != 0) {
                for (let i = 0; i < calcScreen.children.length; i++) {
                    if (calcScreen.children[i].innerText == 1) {
                        calcScreen.children[i].style.paddingLeft = "10px";
                    }
                }
            }

            console.log("created div");
            console.log(`screen children: ${calcScreen.children.length}`);

            /*
            if there is one value on the screen, specifically zero, it does not append the desired key value
            such as an operator, a closing parenthesis, and a dot 
            */
            if (displayValues.length === 1
                && calcScreen.firstElementChild.innerText == 0
                && !(ops.includes(screenValue.innerText) || screenValue.innerText == ".")) {
                    calcScreen.firstElementChild.replaceWith(screenValue);
                    console.log("replace zero");
                    break;
            }

            console.log("appended value");
            calcScreen.append(screenValue);
            break;
    }
}

//simple calculating function
function operate(op, x, y) {
    let res = 0;
    switch (op) {
        case "+":
            res = x + y;
            break;
        case "-":
            res = x - y;
            break;
        case "x":
            res = x * y;
            break;
        case "/":
            if (y === 0) {
                return "undefined";
            }
            res = x / y;
            break;
    }

    return res;
}