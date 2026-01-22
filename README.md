
# iOS Calculator in JavaScript

Web application that replicates the behavior and visual style of the iOS calculator, built using plain HTML, CSS, and JavaScript. The project focuses on proper state management, error handling, and a consistent user experience.

## Features

- iOS-inspired calculator interface
- Basic operations: addition, subtraction, multiplication, and division
- Decimal and percentage handling
- Sign toggle (+/-)
- Dynamic font scaling to prevent display overflow
- Thousands separator formatting
- Common error prevention (division by zero, invalid input)
- Full keyboard support
- Responsive layout

## Technologies Used

- HTML5
- CSS3 (Grid, Flexbox)
- JavaScript (ES6+)

## Project Structure

``` 
/
├── index.html   # Main application structure
├── style.css    # Visual styles and layout
└── script.js    # Calculator logic and state management

``` 
## Usage

1. Clone or download the repository.
2. Open the `index.html` file in a modern web browser.
3. Use the mouse or keyboard to perform calculations.

No dependencies or build steps are required.

## Technical Notes

- Calculator state is handled through internal variables.
- Result formatting avoids common JavaScript floating-point precision issues.
- Font size adjusts dynamically to prevent screen overflow.
