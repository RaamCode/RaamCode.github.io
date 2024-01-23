// Function to speak text using the browser's speech synthesis
function speakText(text) {
    const speechSynthesis = window.speechSynthesis;

    // Create a new speech synthesis utterance
    const utterance = new SpeechSynthesisUtterance(text);

    // Speak the text
    speechSynthesis.speak(utterance);
}

function countRaamCode() {
    let inputText = document.getElementById('program-input').value;
    let words = inputText.split(/\s+/);
    let wordCount = {};

    // Counting words
    words.forEach(word => {
        wordCount[word] = (wordCount[word] || 0) + 1;
    });

    // Sorting by word count in descending order
    let sortedWordCount = Object.entries(wordCount)
        .sort((a, b) => b[1] - a[1]);

    // Formatting output
    let outputText = sortedWordCount
        .map(([word, count]) => `${word}: ${count}`)
        .join('\n');

    // Displaying in output textarea
    document.getElementById('output').value = outputText;
    speakText(outputText);
}

function newRaamCode() {
    document.getElementById('program-input').value = '';
    document.getElementById('input').value = '';
    document.getElementById('output').value = '';
    document.getElementById('error').value = '';
    document.getElementById('status').value = '';
}

function saveRaamCode() {
    saveToFile(document.getElementById('program-input').value);
}
 
class RaamCodeProgram {
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
        const output = document.getElementById('output');
        if (output) {
            output.value = this.output;
            speakText(this.output);
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
            case 'ॐ':
                program.location--;
                break;
            case 'ज':
                program.location++;
                break;
            case 'श':
                program.data[program.location]++;
                break;
            case 'र':
                program.data[program.location]--;
                break;
            case 'ह':
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
            case 'क':
                if (program.data[program.location] !== 0) {
                    newIndex = loopStack[loopStack.length - 1];
                } else {
                    loopStack.pop();
                }
                break;
            case 'न':
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

function appendToInput(command) {
    speakText(command);
    document.getElementById('program-input').value += command;
}

function runProgram() {
    const source = document.getElementById('program-input').value.replace(/(\S)\S* /g, '$1');
    const mool = source.replace(/[^ॐजशरहकनव]/g, '');
    document.getElementById('mool').value = mool;
    const program = new RaamCodeProgram(mool);
    program.run();
    displayStepInfo(program);
}

function stepProgram() {
    clearStepInfo();
    const source = document.getElementById('program-input').value;
    const program = new RaamCodeProgram(source);
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
    //speakText(selectedSample);
    sampleDropdown.selectedInde = -1;
}

function chantRaamCode() {
    speakText(document.getElementById('program-input').value);
}

function displayStepInfo(program) {
    document.getElementById('status').value = 'Current Index: ' + program.location;
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

