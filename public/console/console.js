document.getElementsByClassName("navItem")[2].style.background = "#66B2FF"
document.getElementsByClassName("navImg")[2].setAttribute("stroke", "#333333")


const ws = new WebSocket('ws://172.104.242.87:8080');

ws.onmessage = (event) => {
    const logs = document.getElementById('logs');
    logs.textContent += event.data;
    let h1 = document.createElement("h1")
    h1.innerHTML = event.data
    logs.appendChild(h1)
};