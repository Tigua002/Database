document.getElementsByClassName("navItem")[2].style.background = "#66B2FF"
document.getElementsByClassName("navImg")[2].setAttribute("stroke", "#333333")


const ws = new WebSocket('ws://dataspot.gusarov.site:8080');

ws.onmessage = function (event) {
    const consoleOutputDiv = document.getElementById('consoleOutput');
    consoleOutputDiv.innerHTML += event.data + '<br>';
};

ws.onopen = function () {
    console.log('Connected to server');
};

ws.onerror = function (error) {
    console.error('WebSocket Error: ', error);
};

// const consoleDiv = document.getElementById('console');
// const ws = new WebSocket('ws://dataspot.gusarov.site:8080');

// ws.onmessage = (event) => {
//     const message = event.data;
//     const newMessage = document.createElement('div');
//     newMessage.textContent = message;
//     consoleDiv.appendChild(newMessage);
//     consoleDiv.scrollTop = consoleDiv.scrollHeight;
// };
