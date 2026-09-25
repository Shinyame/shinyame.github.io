(() => {
    "use strict";

    const display = document.getElementById("display");
    const displayContainer = document.getElementById("display-container");
    const keypad = document.querySelector(".keypad");
    const historyModal = document.getElementById("history-modal");
    const historyList = document.getElementById("history-list");
    const fullscreenButton = document.getElementById("fullscreen-btn");
    const themeButton = document.getElementById("theme-btn");
    const historyButton = document.getElementById("history-btn");
    const closeHistoryButton = document.getElementById("close-history");

    const HISTORY_KEY = "web-calculator-history";
    const THEME_KEY = "web-calculator-theme";
    const THEMES = ["theme-default", "theme-retro", "theme-neon"];

    let current = "0";
    let previous = null;
    let operator = null;
    let waitingForOperand = false;
    let justCalculated = false;

    function updateDisplay() {
        display.textContent = current;
    }

    function formatNumber(value) {
        if (!Number.isFinite(value)) {
            throw new Error("計算結果が不正です");
        }

        const rounded = Number.parseFloat(value.toPrecision(12));
        return Object.is(rounded, -0) ? "0" : String(rounded);
    }

    function inputDigit(digit) {
        if (waitingForOperand || justCalculated) {
            current = digit;
            waitingForOperand = false;
            justCalculated = false;
            updateDisplay();
            return;
        }

        if (current === "0") {
            current = digit;
        } else if (current === "-0") {
            current = "-" + digit;
        } else if (current.length < 15) {
            current += digit;
        }

        updateDisplay();
    }

    function inputDecimal() {
        if (waitingForOperand || justCalculated) {
            current = "0.";
            waitingForOperand = false;
            justCalculated = false;
        } else if (!current.includes(".")) {
            current += ".";
        }
        updateDisplay();
    }

    function clearCalculator() {
        current = "0";
        previous = null;
        operator = null;
        waitingForOperand = false;
        justCalculated = false;
        updateDisplay();
    }

    function toggleSign() {
        if (current === "0") {
            return;
        }
        current = current.startsWith("-") ? current.slice(1) : "-" + current;
        updateDisplay();
    }

    function percent() {
        const number = Number(current);
        if (!Number.isFinite(number)) {
            clearCalculator();
            return;
        }

        current = formatNumber(number / 100);
        updateDisplay();
    }

    function calculate(a, b, op) {
        switch (op) {
            case "+":
                return a + b;
            case "-":
                return a - b;
            case "×":
                return a * b;
            case "÷":
                if (b === 0) {
                    throw new Error("0で割ることはできません");
                }
                return a / b;
            default:
                return b;
        }
    }

    function showError(message) {
        display.textContent = message;
        setTimeout(() => {
            clearCalculator();
        }, 900);
    }

    function setOperator(nextOperator) {
        const inputValue = Number(current);

        if (!Number.isFinite(inputValue)) {
            clearCalculator();
            return;
        }

        if (operator && previous !== null && !waitingForOperand) {
            try {
                previous = calculate(previous, inputValue, operator);
                current = formatNumber(previous);
                updateDisplay();
            } catch (error) {
                showError(error.message);
                return;
            }
        } else {
            previous = inputValue;
        }

        operator = nextOperator;
        waitingForOperand = true;
        justCalculated = false;
    }

    function calculateResult() {
        if (operator === null || previous === null) {
            return;
        }

        const inputValue = Number(current);

        if (!Number.isFinite(inputValue)) {
            clearCalculator();
            return;
        }

        const expression = `${formatNumber(previous)} ${operator} ${formatNumber(inputValue)}`;

        try {
            const result = formatNumber(calculate(previous, inputValue, operator));
            saveHistory(expression, result);
            current = result;
            previous = null;
            operator = null;
            waitingForOperand = true;
            justCalculated = true;
            updateDisplay();
        } catch (error) {
            showError(error.message);
        }
    }

    function calculateHistoryItem(expression) {
        const parts = expression.match(/^(-?(?:\d+(?:\.\d+)?|\.\d+))\s*([+\-×÷])\s*(-?(?:\d+(?:\.\d+)?|\.\d+))$/);

        if (!parts) {
            return null;
        }

        const a = Number(parts[1]);
        const op = parts[2];
        const b = Number(parts[3]);

        try {
            return formatNumber(calculate(a, b, op));
        } catch {
            return null;
        }
    }

    function saveHistory(expression, result) {
        const history = loadHistory();
        history.unshift({
            expression,
            result,
            time: new Date().toISOString()
        });

        localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 50)));
        renderHistory();
    }

    function loadHistory() {
        try {
            const value = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
            return Array.isArray(value) ? value : [];
        } catch {
            return [];
        }
    }

    function renderHistory() {
        const history = loadHistory();
        historyList.innerHTML = "";

        if (history.length === 0) {
            const item = document.createElement("li");
            item.textContent = "履歴はありません";
            item.style.color = "#aaa";
            item.style.textAlign = "center";
            historyList.appendChild(item);
            return;
        }

        history.forEach(item => {
            const li = document.createElement("li");

            const expression = document.createElement("div");
            expression.className = "history-eq";
            expression.textContent = item.expression;

            const result = document.createElement("div");
            result.textContent = `= ${item.result}`;

            li.appendChild(expression);
            li.appendChild(result);

            li.addEventListener("click", () => {
                current = String(item.result);
                previous = null;
                operator = null;
                waitingForOperand = true;
                justCalculated = true;
                updateDisplay();
                historyModal.classList.add("hidden");
            });

            historyList.appendChild(li);
        });
    }

    function applyTheme() {
        const currentTheme = displayContainer.classList.contains("theme-retro")
            ? "theme-retro"
            : displayContainer.classList.contains("theme-neon")
                ? "theme-neon"
                : "theme-default";

        const index = THEMES.indexOf(currentTheme);
        const nextTheme = THEMES[(index + 1) % THEMES.length];

        displayContainer.classList.remove(...THEMES);
        displayContainer.classList.add(nextTheme);
        localStorage.setItem(THEME_KEY, nextTheme);
    }

    function loadTheme() {
        const storedTheme = localStorage.getItem(THEME_KEY);

        displayContainer.classList.remove(...THEMES);
        displayContainer.classList.add(
            THEMES.includes(storedTheme) ? storedTheme : "theme-default"
        );
    }

    async function toggleFullscreen() {
        try {
            if (document.fullscreenElement) {
                await document.exitFullscreen();
                return;
            }

            if (document.documentElement.requestFullscreen) {
                await document.documentElement.requestFullscreen();
            }
        } catch (error) {
            console.warn("全画面表示を開始できませんでした:", error);
        }
    }

    keypad.addEventListener("click", event => {
        const button = event.target.closest("button");
        if (!button) {
            return;
        }

        const value = button.dataset.value;
        const action = button.dataset.action;

        if (value !== undefined && action === undefined) {
            if (value === ".") {
                inputDecimal();
            } else {
                inputDigit(value);
            }
            return;
        }

        switch (action) {
            case "clear":
                clearCalculator();
                break;
            case "sign":
                toggleSign();
                break;
            case "percent":
                percent();
                break;
            case "operator":
                setOperator(value);
                break;
            case "calculate":
                calculateResult();
                break;
            default:
                break;
        }
    });

    document.addEventListener("keydown", event => {
        if (event.ctrlKey || event.metaKey || event.altKey) {
            return;
        }

        const key = event.key;

        if (/^\d$/.test(key)) {
            event.preventDefault();
            inputDigit(key);
            return;
        }

        if (key === ".") {
            event.preventDefault();
            inputDecimal();
            return;
        }

        if (["+", "-", "*", "/", "x", "X"].includes(key)) {
            event.preventDefault();
            const mappedOperator = key === "*" || key.toLowerCase() === "x"
                ? "×"
                : key === "/"
                    ? "÷"
                    : key;
            setOperator(mappedOperator);
            return;
        }

        if (key === "Enter" || key === "=") {
            event.preventDefault();
            calculateResult();
            return;
        }

        if (key === "%") {
            event.preventDefault();
            percent();
            return;
        }

        if (key === "Escape" || key === "Delete") {
            event.preventDefault();
            clearCalculator();
        }
    });

    fullscreenButton.addEventListener("click", toggleFullscreen);

    themeButton.addEventListener("click", () => {
        applyTheme();
    });

    historyButton.addEventListener("click", () => {
        renderHistory();
        historyModal.classList.remove("hidden");
    });

    closeHistoryButton.addEventListener("click", () => {
        historyModal.classList.add("hidden");
    });

    historyModal.addEventListener("click", event => {
        if (event.target === historyModal) {
            historyModal.classList.add("hidden");
        }
    });

    loadTheme();
    renderHistory();
    updateDisplay();

    if ("serviceWorker" in navigator) {
        window.addEventListener("load", () => {
            navigator.serviceWorker.register("./sw.js")
                .then(registration => {
                    console.log("ServiceWorkerが登録されました:", registration.scope);
                })
                .catch(error => {
                    console.warn("ServiceWorkerの登録に失敗しました:", error);
                });
        });
    }
})();
