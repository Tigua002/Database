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
// const ws = new WebSocket('ws://localhost:8080');
const ws = new WebSocket('wss://localhost:8080');

fetch('/file')
    .then(response => response.text())
    .then(data => {
        let lines = data.split("\n")
        lines.forEach(line => {
            let newMessage = document.createElement("h1")
            newMessage.setAttribute("class", "consoleLine")
            consoleDiv.appendChild(newMessage)
            newMessage.innerHTML = line
            
        })
        consoleDiv.scrollTop = consoleDiv.scrollHeight;
    });

ws.onmessage = (event) => {
    document.getElementById('consoleOutput').textContent = event.data;
};

ws.onclose = () => {
    console.log('WebSocket connection closed');
};
