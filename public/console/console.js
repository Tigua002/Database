document.getElementsByClassName("navItem")[2].style.background = "#66B2FF"
document.getElementsByClassName("navImg")[2].setAttribute("stroke", "#333333")


// const ws = new WebSocket('ws://dataspot.gusarov.site:8080');

// ws.onmessage = function (event) {
//     const consoleOutputDiv = document.getElementById('consoleOutput');
//     consoleOutputDiv.innerHTML += event.data + '<br>';
// };

// ws.onopen = function () {
//     console.log('Connected to server');
// };

// ws.onerror = function (error) {
//     console.error('WebSocket Error: ', error);
// };

const consoleDiv = document.getElementById('consoleOutput');
const ws = new WebSocket('ws://localhost:8080');

ws.onmessage = (event) => {
    console.log("News!");
    const message = event.data;
    const lines = message.split('\n'); // Split the message by line breaks
    lines.forEach(line => {
        const newMessage = document.createElement('div');
        newMessage.setAttribute("class", "consoleLine")
        newMessage.innerHTML = line;
        consoleDiv.appendChild(newMessage);
    });
    consoleDiv.scrollTop = consoleDiv.scrollHeight;
};

ws.onopen = function (event) {
    console.log('Connected to server');
};
