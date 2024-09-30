document.getElementsByClassName("navItem")[2].style.background = "#66B2FF"
document.getElementsByClassName("navImg")[2].setAttribute("stroke", "#333333")


const ws = new WebSocket('ws://localhost:8080');

ws.onmessage = (event) => {
    const logs = document.getElementById('logs');
    logs.textContent += event.data;
};