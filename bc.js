class BrainfuckProgram {
    constructor(source) {
        this.source = source;
        this.output = '';
    }

    run() {
        this.data = Array(20).fill(0);
        this.location = 0;
        const commands = this.parse(this.source);
        commands.run(this);
        this.displayOutput();
    }

    parse(source) {
        const lexer = new Lexer();
        const parser = new Parser();
        return parser.parse(lexer.tokenize(source));
    }

    displayOutput() {
        const outputBox = document.getElementById('output-box');
        if (outputBox) {
            outputBox.textContent = this.output;
        }
    }
}

class Lexer {
    tokenize(source) {
        return source.split('');
    }
}

class Parser {
    parse(tokens) {
        const commands = new Commands();

        tokens.forEach(token => {
            commands.commands.push(new Command(token));
        });

        return commands;
    }
}

class Commands {
    constructor() {
        this.commands = [];
    }

    run(program) {
        const loopStack = [];

        for (let currentCommandIndex = 0; currentCommandIndex < this.commands.length;) {
            const currentCommand = this.commands[currentCommandIndex];
            currentCommandIndex = currentCommand.run(program, loopStack, currentCommandIndex);
        }
    }
}

class Command {
    constructor(command) {
        this.command = command;
    }

    run(program, loopStack, currentIndex) {
        let newIndex = currentIndex;

        switch (this.command) {
            case '<':
                program.location--;
                break;
            case '>':
                program.location++;
                break;
            case '+':
                program.data[program.location]++;
                break;
            case '-':
                program.data[program.location]--;
                break;
            case '[':
                if (program.data[program.location] === 0) {
                    let loopDepth = 1;
                    while (loopDepth > 0) {
                        newIndex++;
                        const currentCommand = program.source[newIndex];
                        if (currentCommand === '[') {
                            loopDepth++;
                        } else if (currentCommand === ']') {
                            loopDepth--;
                        }
                    }
                } else {
                    loopStack.push(newIndex);
                }
                break;
            case ']':
                if (program.data[program.location] !== 0) {
                    newIndex = loopStack[loopStack.length - 1];
                } else {
                    loopStack.pop();
                }
                break;
            case '.':
                program.output += String.fromCharCode(program.data[program.location]);
                break;
            // Handle other commands as needed
        }

        newIndex++;
        return newIndex;
    }
}

function clearStepInfo() {
    document.getElementById('status').textContent = '';
    document.getElementById('error').textContent = '';
}

// Function to speak text using the browser's speech synthesis
function speakText(text) {
    const speechSynthesis = window.speechSynthesis;

    // Create a new speech synthesis utterance
    const utterance = new SpeechSynthesisUtterance(text);

    // Speak the text
    speechSynthesis.speak(utterance);
}

function appendToInput(command) {
    speakText(command);
    document.getElementById('program-input').value += command;
}

function runProgram() {
    const source = document.getElementById('program-input').value;
    const program = new BrainfuckProgram(source);
    program.run();
    displayStepInfo(program);
}

function stepProgram() {
    clearStepInfo();
    const source = document.getElementById('program-input').value;
    const program = new BrainfuckProgram(source);
    const commands = program.parse(source);

    if (commands.commands.length > 0) {
        const currentIndex = parseInt(document.getElementById('status').textContent) || 0;
        const currentCommand = commands.commands[currentIndex];
        currentCommand.run(program, [], currentIndex);
        displayStepInfo(program);
    } else {
        document.getElementById('error').textContent = 'No commands to step through.';
    }
}

function loadSample() {
    const sampleDropdown = document.getElementById('sample-dropdown');
    const selectedSample = sampleDropdown.options[sampleDropdown.selectedIndex].value;
    document.getElementById('program-input').value = selectedSample;
}

function displayStepInfo(program) {
    document.getElementById('status').textContent = 'Current Index: ' + program.location;
    highlightCurrentCommand(program.location);
    document.getElementById('error').textContent = '';
}

function highlightCurrentCommand(index) {
    const programInput = document.getElementById('program-input');
    if (programInput) {
        const commands = programInput.value.split('');
        commands[index] = '<span style="background-color: #FFFF00;">' + commands[index] + '</span>';
        programInput.innerHTML = commands.join('');
    }
}

