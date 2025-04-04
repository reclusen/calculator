const calcScreen = document.querySelector(".screen");
const keys = document.querySelectorAll(".key");

const p = document.createElement("p");

keys.forEach((key) => {
    // key.addEventListener("keydown", (e) => {
    //     console.log("key: ", e.key);
    // });

    key.addEventListener("click", (e) => {
        const screenStyles = getComputedStyle(calcScreen);
        const fontSize = screenStyles.fontSize;
        const log = [];
        /* a log object would be nice
        ex:
        const log = new Log();
        log.entry = "2+2"; [shows equation]
        log.result = "4"; [shows evaluated result from equation]
        */
        const prevKeys = [];

        if (calcScreen.children.length > 8 && !key.classList.contains("delete")) {
            const calcRect = calcScreen.getBoundingClientRect();
            const num = calcScreen.firstElementChild.getBoundingClientRect();

            //decrease font size as divs n increase more than 8
            if (num.x > calcRect.x) {
                calcScreen.style.fontSize = `${parseFloat(fontSize) - 4}px`;
            }
        }

        switch (key.className) {
            case "key delete":
                if (calcScreen.children.length === 1) {
                    console.log("reached one digit");
                    calcScreen.firstElementChild.innerText = 0;
                } else {
                    console.log("clicked delete");
                    calcScreen.removeChild(calcScreen.lastElementChild);
                }
                
                if (calcScreen.children.length > 8) {
                    calcScreen.style.fontSize = `${parseFloat(fontSize) + 4}px`;
                }

                break;
            case "key clear":
                const zero = document.createElement("div");
                calcScreen.replaceChildren();

                zero.innerText = 0;
                calcScreen.style.fontSize = `52px`;
                calcScreen.append(zero);

                break;
            case "key plus-minus":
                console.log("pressed plus minus");

                const displayValues = calcScreen.childNodes;

                if (displayValues[0].innerText == "-") {
                    console.log("negative unary pressed");

                    // kind of inefficient; use as temporary solution for now
                    const exps = [];
                    displayValues.forEach((exp) => {
                        if (exp.innerText != "-") {
                            exps.push(exp);
                        }
                    });

                    calcScreen.replaceChildren(...exps);
                    break;
                }

                if (calcScreen.firstElementChild.className == "value" &&
                    calcScreen.firstElementChild.innerText !== "0") {
                        const value = document.createElement("div");

                        value.innerText = "-";
                        calcScreen.replaceChildren(value, ...displayValues);
                }
                break;
            case "key equal":
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

                const precedence = (op) => {
                    switch (op) {
                        case "+":
                        case "-": return 1;
                        case "x":
                        case "/": return 2;
                        case "(":
                        case ")": return 3;
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

                        if (isOperator(infix[j]) || (infix[j] == "(") || (infix[j] == ")")) {
                            postfix += " ";

                            //check while stack is not empty and the precedence of the top value in
                            //the stack is higher
                            while (exp.length != 0 && (precedence(exp[exp.length-1]) > precedence(infix[j]))) {
                                postfix += exp.pop();
                                postfix += " ";
                            }
    
                            exp.push(infix[j]);
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
                            const op2 = parseFloat(exp.pop());
                            const op1 = parseFloat(exp.pop());

                            console.log(postfix.length, j);

                            console.log(`op2 ${op2} | op1 ${op1} | operator ${postfix[j]}`);

                            const res = operate(postfix[j], op1, op2);
                            exp.push(res);
                        }
                        
                        if (!isNaN(postfix[j]) && postfix[j] != " ") {
                            console.log(`postfix: "${postfix[j]}"`);
                            num += postfix[j];
                        }

                        if (postfix[j] == " " && num != "") {
                            exp.push(parseFloat(num));
                            num = "";
                        }

                        console.log(`exp: ${exp}`);
                    }

                    return `${exp.pop()}`;
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

                prevKeys.push("equal");

                break;
            default:
                const value = document.createElement("div");

                if (key.classList.contains("plus-minus")) {
                    value.setAttribute("class", "unary");
                } else if (key.classList.contains("left-paren")) {
                    value.innerText = "(";
                } else if (key.classList.contains("right-paren")) {
                    value.innerText = ")";
                } else {
                    value.innerText = e.target.innerText;
                    if (key.classList.contains("op")) {
                        if (calcScreen.lastElementChild.classList.contains("op")) {
                            console.log("replace op");
                            calcScreen.lastElementChild.innerText = key.innerText;
                            break;
                        }
                        value.setAttribute("class", "op");
                    } else {
                        value.setAttribute("class", "value");
                    }
                }

                if (calcScreen.children.length != 0) {
                    for (let i = 0; i < calcScreen.children.length; i++) {
                        if (calcScreen.children[i].innerText == 1) {
                            calcScreen.children[i].style.paddingLeft = "10px";
                        }
                    }
                }
                
                console.log("created div");
                console.log(`screen children: ${calcScreen.children.length}`);

                
                if (calcScreen.children.length === 1 
                    && calcScreen.firstElementChild.innerText == 0
                    && !key.classList.contains("op")) {
                    calcScreen.firstElementChild.replaceWith(value);
                    console.log("replace zero");
                } else {
                    console.log("appended value");
                    if (prevKeys.includes("equal")) {
                        console.log("clear previous op");
                        calcScreen.replaceChildren();
                    }
                    calcScreen.append(value);
                }
                break;       
        }
    });
});

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