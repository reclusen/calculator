const calcScreen = document.querySelector(".screen");
const keys = document.querySelectorAll(".key");

keys.forEach((key) => {
    key.addEventListener("click", (e) => {        
        switch (key.className) {
            case "key delete":
                if (calcScreen.children.length === 1) {
                    console.log("reached one digit");
                    calcScreen.firstElementChild.innerText = 0;
                } else {
                    console.log("clicked delete");
                    calcScreen.removeChild(calcScreen.lastElementChild);
                }
                break;
            case "key clear":
                const zero = document.createElement("div");
                calcScreen.replaceChildren();

                zero.innerText = 0;
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

                for (let i = 0; i < calcScreen.children.length; i++) {
                    infix += calcScreen.children[i].innerText;   
                }

                const isOperator = (op) => {
                    switch (op) {
                        case "+":
                        case "-":
                        case "*":
                        case "/": return true;
                        default: return false;
                    }
                };

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
                            //check while stack is not empty and the precedence of the top value in
                            //the stack is higher
                            while (exp.length != 0 && (precedence(exp[exp.length-1]) > precedence(infix[j]))) {
                                postfix += exp[exp.length-1];
                                exp.pop();
                            }
    
                            exp.push(infix[j]);
                        }
                    }

                    while (exp.length != 0) {
                        postfix += exp[exp.length-1];
                        exp.pop();
                    }

                    return postfix;
                };

                const evalPostfix = (postfix) => {
                    for (let j = 0; j < postfix.length; j++) {
                        if (isOperator(postfix[j])) {
                            const op2 = exp.pop();
                            const op1 = exp.pop();

                            console.log(`op2 ${op2} | op1 ${op1} | operator ${postfix[j]}`);

                            const res = operate(postfix[j], op1, op2);
                            exp.push(res);
                        } else {
                            exp.push(parseFloat(postfix[j]));
                        }

                        console.log(`stack: ${exp}`);
                    }

                    console.log(`stack: ${exp}`);

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

                break;
            default:
                const value = document.createElement("div");

                if (key.className.includes("left-paren")) {
                    value.innerText = "(";
                } else if (key.className.includes("right-paren")) {
                    value.innerText = ")";
                } else {
                    value.innerText = e.target.innerText;
                    if (key.className.includes("key op")) {
                        if (calcScreen.lastElementChild.classList.contains("op")) {
                            console.log("replace op");
                            calcScreen.lastElementChild.innerText = key.innerText;
                            break;
                        }
                        value.setAttribute("class", "op");
                    } else {
                        value.setAttribute("class", "value");
                    }

                    if (key.className.includes("plus-minus")) {
                        value.setAttribute("class", "unary");
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