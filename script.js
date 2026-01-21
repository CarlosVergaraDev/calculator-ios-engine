/**
 * Calculator State Management
 * Tracks all variables for calculator operations
 */
let currentOperand = '0';
let previousOperand = '';
let operation = null;
let shouldResetScreen = false;

const currentDisplay = document.getElementById('current-operand');
const previousDisplay = document.getElementById('previous-operand');

/**
 * Updates the display with proper formatting
 * Handles overflow by adjusting font size dynamically
 */
function updateDisplay() {
    // Update previous operand display
    let operationSymbol = '';
    switch (operation) {
        case '+': operationSymbol = '+'; break;
        case '-': operationSymbol = '−'; break;
        case '*': operationSymbol = '×'; break;
        case '/': operationSymbol = '÷'; break;
    }
    
    previousDisplay.textContent = previousOperand + (operationSymbol ? ` ${operationSymbol}` : '');
    
    // Format current operand for display
    let displayValue = currentOperand;
    
    // Add commas for thousands separator
    if (currentOperand !== '' && currentOperand !== '-') {
        const parts = currentOperand.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        displayValue = parts.join('.');
    }
    
    currentDisplay.textContent = displayValue;
    
    // Dynamically adjust font size based on length
    adjustFontSize();
}

/**
 * Adjusts font size based on content length to prevent overflow
 */
function adjustFontSize() {
    const maxLength = 9; // Max characters before scaling
    const currentText = currentDisplay.textContent.replace(/,/g, ''); // Remove commas for length check
    
    if (currentText.length > maxLength) {
        // Calculate new font size (minimum 2rem)
        const scaleFactor = Math.max(0.7, maxLength / currentText.length);
        const newSize = Math.max(2, 5 * scaleFactor); // Base size is 5rem
        currentDisplay.style.fontSize = `${newSize}rem`;
    } else {
        // Reset to default size
        currentDisplay.style.fontSize = '5rem';
    }
}

/**
 * Appends a number or decimal point to the current operand
 * @param {string} number - The number or decimal to append
 */
function appendNumber(number) {
    // Reset screen if needed (after calculation or error)
    if (shouldResetScreen) {
        currentOperand = '';
        shouldResetScreen = false;
    }
    
    // Handle decimal point
    if (number === '.') {
        if (currentOperand.includes('.')) return;
        if (currentOperand === '' || currentOperand === '-') {
            currentOperand += '0.';
        } else {
            currentOperand += '.';
        }
        updateDisplay();
        return;
    }
    
    // Replace initial zero or start new number
    if (currentOperand === '0' || currentOperand === '-0') {
        if (number === '0') return; // Prevent multiple leading zeros
        
        if (currentOperand === '-0') {
            currentOperand = '-' + number;
        } else {
            currentOperand = number;
        }
    } else {
        currentOperand += number;
    }
    
    updateDisplay();
    
    // Add visual feedback
    addButtonFeedback(number === '.' ? 'decimal' : 'number');
}

/**
 * Clears the calculator display and resets state
 */
function clearDisplay() {
    currentOperand = '0';
    previousOperand = '';
    operation = null;
    shouldResetScreen = false;
    updateDisplay();
    removeActiveOperator();
    addButtonFeedback('clear');
}

/**
 * Sets the mathematical operation to perform
 * @param {string} op - The operation symbol (+, -, *, /)
 */
function setOperation(op) {
    // If no current operand, use 0
    if (currentOperand === '' || currentOperand === '-') {
        currentOperand = '0';
    }
    
    // If there's already a pending operation, calculate it first
    if (operation !== null && !shouldResetScreen) {
        calculate();
    }
    
    operation = op;
    previousOperand = currentOperand;
    currentOperand = '';
    shouldResetScreen = false;
    
    updateDisplay();
    highlightActiveOperator(op);
    addButtonFeedback('operation');
}

/**
 * Performs the calculation based on stored operation and operands
 */
function calculate() {
    if (operation === null || previousOperand === '') return;
    
    const prev = parseFloat(previousOperand.replace(/,/g, ''));
    const current = parseFloat(currentOperand.replace(/,/g, ''));
    
    if (isNaN(prev) || isNaN(current)) {
        // Handle error state
        currentOperand = 'Error';
        previousOperand = '';
        operation = null;
        shouldResetScreen = true;
        updateDisplay();
        return;
    }
    
    let computation;
    switch (operation) {
        case '+':
            computation = prev + current;
            break;
        case '-':
            computation = prev - current;
            break;
        case '*':
            computation = prev * current;
            break;
        case '/':
            if (current === 0) {
                // Handle division by zero
                currentOperand = 'Error';
                previousOperand = '';
                operation = null;
                shouldResetScreen = true;
                updateDisplay();
                return;
            }
            computation = prev / current;
            break;
        default:
            return;
    }
    
    // Format result to avoid floating point precision issues
    currentOperand = formatResult(computation);
    previousOperand = '';
    operation = null;
    shouldResetScreen = true;
    
    updateDisplay();
    removeActiveOperator();
    addButtonFeedback('equals');
}

/**
 * Formats calculation results to avoid scientific notation
 * and limit decimal places
 * @param {number} num - The number to format
 * @returns {string} - Formatted number as string
 */
function formatResult(num) {
    // Handle very large/small numbers
    if (!isFinite(num)) {
        return 'Error';
    }
    
    // Limit decimal places to 10
    const rounded = Math.round(num * 10000000000) / 10000000000;
    
    // Convert to string and remove trailing zeros
    let result = rounded.toString();
    
    // If it's a decimal, remove unnecessary trailing zeros
    if (result.includes('.')) {
        result = result.replace(/\.?0+$/, '');
    }
    
    // If the number is too long, use exponential notation
    if (result.length > 15) {
        return rounded.toExponential(8);
    }
    
    return result;
}

/**
 * Toggles the sign of the current operand
 */
function toggleSign() {
    if (currentOperand === '0' || currentOperand === '') {
        currentOperand = '-0';
    } else if (currentOperand.startsWith('-')) {
        currentOperand = currentOperand.substring(1);
    } else {
        currentOperand = '-' + currentOperand;
    }
    updateDisplay();
    addButtonFeedback('sign');
}

/**
 * Converts the current operand to a percentage
 */
function percentage() {
    if (currentOperand === '' || currentOperand === '-') return;
    
    const num = parseFloat(currentOperand.replace(/,/g, '')) / 100;
    currentOperand = formatResult(num);
    updateDisplay();
    addButtonFeedback('percentage');
}

/**
 * Highlights the active operator button
 * @param {string} op - The operation to highlight
 */
function highlightActiveOperator(op) {
    // Remove active class from all operator buttons
    removeActiveOperator();
    
    // Add active class to the corresponding button
    const operatorButtons = {
        '+': '[data-action="add"]',
        '-': '[data-action="subtract"]',
        '*': '[data-action="multiply"]',
        '/': '[data-action="divide"]'
    };
    
    const selector = operatorButtons[op];
    if (selector) {
        const button = document.querySelector(selector);
        if (button) button.classList.add('active');
    }
}

/**
 * Removes active class from all operator buttons
 */
function removeActiveOperator() {
    const operatorButtons = document.querySelectorAll('.orange');
    operatorButtons.forEach(button => {
        button.classList.remove('active');
    });
}

/**
 * Adds visual feedback to pressed buttons
 * @param {string} type - The type of button pressed
 */
function addButtonFeedback(type) {
    let selector;
    
    switch (type) {
        case 'clear':
            selector = '[data-action="clear"]';
            break;
        case 'sign':
            selector = '[data-action="sign"]';
            break;
        case 'percentage':
            selector = '[data-action="percentage"]';
            break;
        case 'equals':
            selector = '[data-action="equals"]';
            break;
        case 'operation':
            // Operation feedback is handled by highlightActiveOperator
            return;
        default:
            // For numbers and decimal
            selector = `[data-number="${type === 'decimal' ? '.' : type}"]`;
    }
    
    const button = document.querySelector(selector);
    if (button) {
        button.classList.add('pressed');
        setTimeout(() => {
            button.classList.remove('pressed');
        }, 200);
    }
}

/**
 * Initialize calculator with default display
 */
function initializeCalculator() {
    updateDisplay();
    
    // Add keyboard support
    document.addEventListener('keydown', handleKeyboardInput);
}

/**
 * Handles keyboard input for calculator
 * @param {KeyboardEvent} event - The keyboard event
 */
function handleKeyboardInput(event) {
    const key = event.key;
    
    // Prevent default for calculator keys
    if (/[\d\+\-\*\/\.=]|Enter|Escape|Backspace|%/.test(key)) {
        event.preventDefault();
    }
    
    // Number keys
    if (/[\d]/.test(key)) {
        appendNumber(key);
    }
    
    // Decimal point
    if (key === '.') {
        appendNumber('.');
    }
    
    // Operations
    if (key === '+') setOperation('+');
    if (key === '-') setOperation('-');
    if (key === '*') setOperation('*');
    if (key === '/') setOperation('/');
    
    // Equals and Enter
    if (key === '=' || key === 'Enter') {
        calculate();
    }
    
    // Clear and Escape
    if (key === 'Escape' || key === 'Delete') {
        clearDisplay();
    }
    
    // Percentage
    if (key === '%') {
        percentage();
    }
    
    // Backspace (remove last digit)
    if (key === 'Backspace') {
        if (currentOperand.length > 1) {
            currentOperand = currentOperand.slice(0, -1);
        } else {
            currentOperand = '0';
        }
        updateDisplay();
    }
}

// Initialize calculator when page loads
window.addEventListener('DOMContentLoaded', initializeCalculator);