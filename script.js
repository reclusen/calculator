window.addEventListener("load", () => {
    const defaultValue = document.createElement("div");
    defaultValue.innerText = 0;

    document.querySelector(".screen").append(defaultValue);
});

class Calculator {
    ui = null;
    exprs = [];

    constructor() {
        this.input = "";
    }

    //logic
    /*
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

    #isOperator(op) {
        switch (op) {
            case "+":
            case "-":
            case "x":
            case "/": return true;
            default: return false;
        }
    }

    #precedence(op) {
        switch (op) {
            case "+":
            case "-": return 1;
            case "x":
            case "/": return 2;
        }
        return -1;
    }

    #infixToPostfix(infix) {
        let postfix = "";

        for (let j = 0; j < infix.length; j++) {
            if (!isNaN(infix[j]) || infix[j] == ".") {
                postfix += infix[j];
            }
            
            if (this.#isOperator(infix[j])) {
                if (infix[j-1] == " " && infix[j] == "-" && (!isNaN(infix[j+1]) && infix[j+1] != " ")) {
                    postfix += infix[j];
                    continue;
                }

                postfix += " ";

                //check while stack is not empty and the precedence of the top value in the stack is higher
                while (this.exprs.length != 0 && (this.#precedence(this.exprs[this.exprs.length-1]) > 
                        this.#precedence(infix[j])) && this.exprs[this.exprs.length-1] != "(") {
                    postfix += this.exprs.pop();
                    postfix += " ";
                }

                this.exprs.push(infix[j]);
            }
            
            if (infix[j] == "(") {
                this.exprs.push(infix[j]);
            }

            if (infix[j] == ")") {
                postfix += " ";
                while (this.exprs.length != 0 && this.exprs[this.exprs.length-1] != "(") {
                    postfix += this.exprs.pop();
                    postfix += " ";
                }
                this.exprs.pop();
            }
        }

        postfix += " ";
        while (this.exprs.length != 0) {
            postfix += this.exprs.pop();
            postfix += " ";
        }

        return postfix.slice(0, this.exprs.length-1);
    }

    evaluate() {
        const postfix = this.#infixToPostfix(this.input);

        let num = "";

        for (let j = 0; j < postfix.length; j++) {
            if (this.#isOperator(postfix[j])) {
                //append number to num string
                if (postfix[j-1] != " " && postfix[j] == "-" && (!isNaN(postfix[j+1]))) {
                    num += postfix[j];
                    continue;
                }

                const op2 = this.exprs.pop();
                const op1 = this.exprs.pop();

                const res = this.#operate(postfix[j], op1, op2);
                
                this.exprs.push(res);
            }
            
            if ((!isNaN(postfix[j]) && postfix[j] != " ") || postfix[j] == ".") {
                num += postfix[j];
            }

            if (postfix[j] == " " && num != "") {
                this.exprs.push(parseFloat(num));
                num = "";
            }
        }
        
        const res = this.exprs.pop();
        if (res.toString().includes(".")) {
            return res.toFixed(2);
        } else {
            return res.toString();
        }
   
    }

    #operate(op, x, y) {
        switch (op) {
            case "+":
                return x + y;
            case "-":
                return x - y;
            case "x":
                return x * y;
            case "/":
                if (y == 0) {
                    return "undefined";
                }

                return x / y;
        }
    }



    getKeyType(element) {
        return element.classList.value.split(" ").pop();
    }

    set initialize(params) {
        const ui = new UI();

        ui.currentKey = params.currentKey;
        ui.currentKeyType = params.currentKeyType;
        ui.screenValue.innerText = params.screenValue;

        this.ui = ui;
    }
}

class UI {
    display = document.querySelector(".screen");
    displayValues = this.display.children;

    exprs = [];

    constructor() {
        this.currentKey = null;
        this.currentKeyType = "";
        this.screenValue = document.createElement("div");
    }

    //UI
    renderScreenFontSize() {
        const fontSize = getComputedStyle(this.display).fontSize;

        if (this.displayValues.length > 7) {
            const calcRect = this.display.getBoundingClientRect();
            const num = this.display.firstElementChild.getBoundingClientRect();

            //decrease font size as divs n increase more than 8
            if (num.x > calcRect.x) {
                this.display.style.fontSize = `${parseFloat(fontSize) - 4}px`;
            }
        }

        if (this.displayValues.length > 7 && this.currentKeyType == "delete") {
            this.display.style.fontSize = `${parseFloat(fontSize) + 4}px`;
        }
    }

    //sets the key attribute for a specific key to be referred to when needed
    setValueAttribute(value) {
        this.screenValue.setAttribute("class", value);
    }

    setText(element, text) {
        element.innerText = text;
    }
}

calculator();

function calculator() {
    const keys = document.querySelectorAll(".key");

    handleKeyInput(keys);
}

function handleKeyInput(keys) {
    let calc = new Calculator();

    keys.forEach(key => {
        key.addEventListener("click", e => {
            setInputEventType(calc, "mouse", {element: e.currentTarget});
            calc.ui.renderScreenFontSize();
            handleKey(calc, "mouse");
        });

        key.addEventListener("keydown", e => {
            if (e.key == "Shift" || e.key == "Alt" || e.key == "Control" || e.key == "Tab") {
                e.preventDefault();
                return false;
            }

            setInputEventType(calc, "keyboard", {element: e.currentTarget, key: e.key});
            calc.ui.renderScreenFontSize();
            handleKey(calc, "keyboard");
        });
    })
}

function handleKey(calc, currentEvent) {
    const dotBtn = document.querySelector(".key.dot");

    switch (calc.ui.currentKeyType) {
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
            calc.ui.setText(calc.ui.screenValue, "-");

            for (let i = calc.ui.displayValues.length - 1; i >= 0; i--) {
                //-----------------------------------------------------------------------------
                /*
                if the number is more than one digit, the condition assumes that
                the number length is from lastElementChild to the nearest and most recent
                operator node, after which the unary operator is appended
                */
                if (calc.getKeyType(calc.ui.displayValues[i]) == "op" || calc.ui.displayValues[i].innerText == "(") {
                    calc.ui.setValueAttribute("unary");
                    calc.ui.displayValues[i].insertAdjacentElement("afterend", calc.ui.screenValue);
                    console.log("screenValue:", calc.ui.screenValue);

                    break;
                }

                if (calc.getKeyType(calc.ui.displayValues[i]) == "value") {
                    valueCounter++;
                }

                if (valueCounter == calc.ui.displayValues.length) {
                    calc.ui.setValueAttribute("unary");
                    calc.ui.display.replaceChildren(calc.ui.screenValue, ...calc.ui.displayValues);
                    break;
                }


                //-----------------------------------------------------------------------------
                /*
                for removing the unary property, the reverse loop looks for the div that owns
                the lone class "unary", to properly identify where in the stack of values
                it is located
                */
                if (calc.getKeyType(calc.ui.displayValues[i]) == "unary") {
                    let second = [];

                    /*
                    as the children property of HTMLCollection does not have a method that supports
                    list iterations such as the childNodes property, the values are appended to a list
                    */
                    for (let j = 0; j < calc.ui.displayValues.length; j++) {
                        calc.exprs.push(calc.ui.displayValues[j]);
                    }

                    //for whole values
                    if (valueCounter == calc.ui.displayValues.length - 1) {
                        second = calc.exprs.slice(1, calc.ui.displayValues.length);

                        calc.ui.display.replaceChildren(...second);

                        break;
                    }

                    //for handling other sorts of expressions
                    if ((calc.getKeyType(calc.ui.displayValues[i-1]) == "op" || calc.ui.displayValues[i-1].innerText == "(")) {
                        const first = calc.exprs.slice(0, i);
                        second = calc.exprs.slice(i+1, calc.ui.displayValues.length);

                        calc.ui.display.replaceChildren(...first, ...second);

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
            if (calc.getKeyType(calc.ui.display.lastElementChild) == "value") {
                dotBtn.setAttribute("disabled", "");
                calc.ui.setValueAttribute("dot");

                calc.ui.display.append(calc.ui.screenValue);
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

            if (calc.ui.displayValues.length === 1) {
                console.log("reached one digit");
                if (calc.ui.display.firstElementChild.innerText == 0) {
                    calc.ui.display.firstElementChild.replaceWith(calc.ui.display.firstElementChild);
                    break;
                }
                
                calc.ui.setText(calc.ui.display.firstElementChild, 0);
                dotBtn.removeAttribute("disabled");
            } else {
                console.log("clicked delete");
                calc.ui.display.removeChild(calc.ui.display.lastElementChild);
            }

            calc.renderScreenFontSize();

            break;
        case "c":
        case "clear":
            /*
            behavior:
                - should clear ALL inputted values from the screen (with the exception that the only remaining value is 0)
                - must properly display 0 upon clearing values
            */
           {
            calc.ui.display.replaceChildren();

            calc.ui.setText(calc.ui.screenValue, 0);
            calc.ui.display.style.fontSize = `52px`;

            calc.ui.display.append(calc.ui.screenValue);

            if (dotBtn.hasAttribute("disabled")) dotBtn.removeAttribute("disabled");

            break;
           }
        case "plus":
        case "+":
        case "minus":
        case "-":
        case "mult":
        case "*":
        case "div":
        case "/":
            if (calc.ui.currentKeyType == "mult" || calc.ui.currentKeyType == "*") calc.ui.setText(calc.ui.screenValue, "x");

            /*
            does not allow operator duplication by instead replacing the current operator
            on the screen
            */
            if (calc.getKeyType(calc.ui.display.lastElementChild) == "op") {
                console.log("replace op");
                calc.ui.setText(calc.ui.display.lastElementChild, calc.ui.screenValue.innerText);

                break;
            }

            if (calc.getKeyType(calc.ui.display.lastElementChild) == "dot" || calc.getKeyType(calc.ui.display.lastElementChild) == "symb") {
                break;
            }

            //removes disabled attribute from dotBtn if an operator is inputted
            if (calc.getKeyType(calc.ui.display.lastElementChild) == "value") {
                dotBtn.removeAttribute("disabled");
            }

            calc.ui.setValueAttribute("op");
            calc.ui.display.append(calc.ui.screenValue);
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
            /*
            this case is specifically for keypresses where if the condition is not met, 
            it will fallthrough to the next case statement and removes the hit-clear class 
            once another set of expressions are inputted
            */
            if (calc.getKeyType(calc.ui.currentKey) != "hit-clear") {
                if (calc.ui.displayValues.length == 1 && calc.ui.displayValues[0].innerText == 0) {
                    calc.ui.display.replaceWith(calc.ui.screenValue);
                    break;
                }

                calc.ui.display.append(calc.ui.screenValue);
            }

            break;
        case "hit-clear":
            //do not replace last value in the display if it is an operator
            if (calc.getKeyType(calc.ui.display.lastElementChild) == "op") { 
                calc.ui.display.append(calc.ui.screenValue);
                break;
            }

            calc.ui.display.replaceChildren();
            document.querySelectorAll(".key").forEach(key => { if (key.classList.contains("num")) key.classList.remove("hit-clear") });
   
            calc.ui.display.append(calc.ui.screenValue);

            break;
        case "[":
        case "left-paren":
            calc.ui.setText(calc.ui.screenValue, "(");
            calc.ui.setValueAttribute("symb");

            if (calc.ui.displayValues.length === 1
                && calc.ui.display.firstElementChild.innerText == 0) {
                    calc.ui.display.firstElementChild.replaceWith(calc.ui.screenValue);
                    break;
            }

            if (calc.ui.display.lastElementChild.className == "dot") break;

            calc.ui.display.append(calc.ui.screenValue);
            break;
        case "]":
        case "right-paren":
            console.log("pressed right-paren");
            /*
            not allow the closing parenthesis to be appended if there is only one value in the display,
            and the value is either zero or an open parenthesis
            */
            if (calc.ui.displayValues.length == 1
                && (calc.getKeyType(calc.ui.display.firstElementChild) == "value" || 
                    (calc.ui.display.firstElementChild.innerText == "("))) {
                    break;
            }

            //just the same as the one above, but unlikely
            if (calc.ui.display.lastElementChild.innerText == "(" 
                || calc.ui.display.lastElementChild.className == "dot"
                || calc.ui.display.lastElementChild.className == "op") {
                break;
            }

            calc.ui.setText(calc.ui.screenValue, ")");
            calc.ui.setValueAttribute("symb");

            calc.ui.display.append(calc.ui.screenValue);

            break;
        case "=":
        case "equal":
        case "Enter":
            //the most complex one among the rest of the keys
            /*
            behavior:
                - presumes that the inputted values form a valid expression, and evaluates it according to the provided
                    set of operations
            */

            let input = "";

            for (let i = 0; i < calc.ui.display.children.length; i++) {
                input += calc.ui.display.children[i].innerText;
            }

            if (isNaN(input[input.length - 1]) && input[input.length - 1] != ")") {
                calc.ui.setText(calc.ui.screenValue, "undefined");

                calc.ui.display.replaceChildren(calc.ui.screenValue);

                document.querySelectorAll(".key").forEach((key) => key.classList.add("hit-clear") );

                break;
            }
            
            calc.input = input;

            const res = calc.evaluate();

            calc.ui.display.replaceChildren();

            for (let i = 0; i < res.length; i++) {
                const div = document.createElement("div");
                calc.ui.setText(div, res[i]);
                div.setAttribute("class", "value");
                calc.ui.display.append(div);
            }
            
            document.querySelectorAll(".key").forEach((key) => {
                if (key.classList.contains("num")) {
                    key.classList.add("hit-clear");
                    key.blur();
                }
            });

            break;
        default:
            if (currentEvent == "mouse") calc.ui.setText(calc.ui.screenValue, calc.ui.currentKey.innerText);

            if (currentEvent == "key") {
                if (calc.ui.currentKey == "*") calc.ui.screenValue.innerText = "x";
                else calc.ui.screenValue.innerText = calc.currentElement;
            }

            calc.ui.setValueAttribute("value");

            console.log(`screen children: ${calc.ui.displayValues.length}`);

            /*
            if there is one value on the screen, specifically zero, it does not append the desired key value
            such as an operator, a closing parenthesis, and a dot 
            */
            if (calc.ui.displayValues.length === 1
                && calc.ui.display.firstElementChild.innerText == 0
                && (calc.getKeyType(calc.ui.screenValue) != "op") || calc.ui.screenValue.innerText == ".") {
                    calc.ui.display.firstElementChild.replaceWith(calc.ui.screenValue);
                    console.log("replace zero");
                    break;
            }

            console.log("appended value");
            calc.ui.display.append(calc.ui.screenValue);
            break;
    }
}

function setInputEventType(calc, eventName, {element, key}) {
    let keyValue = "";
    let screenValueText = "";

    if (eventName == "mouse") {
        keyValue = element.classList.value.split(" ").pop();
        screenValueText = element.innerText;
    }

    if (eventName == "keyboard") {
        keyValue = key;
        //only match the given keyboard bindings and not the key names themselves (e.g. Enter (=), Backspace (for deletions))
        if (!key.match(/^[A-Za-z]+$/) && key.length == 1) {
            screenValueText = key;
        }
    }

    console.log(element, keyValue, screenValueText);

    calc.initialize = {
        currentKey: element,
        currentKeyType: keyValue,
        screenValue: screenValueText
    };
}