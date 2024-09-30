document.getElementsByClassName("navItem")[2].style.background = "#66B2FF"
document.getElementsByClassName("navImg")[2].setAttribute("stroke", "#333333")


const ws = new WebSocket('wss://dataspot.gusarov.site:8080');

ws.onmessage = function (event) {
    const consoleOutputDiv = document.getElementById('consoleOutput');
    consoleOutputDiv.innerHTML += event.data + '<br>';
};

ws.onopen = function () {
    console.log('Connected to server');
};


