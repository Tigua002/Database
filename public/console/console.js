document.getElementsByClassName("navItem")[2].style.background = "#66B2FF"
document.getElementsByClassName("navImg")[2].setAttribute("stroke", "#333333")


const ws = new WebSocket('wss://172.104.242.87:8080');

ws.onopen = () => {
    console.log('WebSocket connection opened');
};

ws.onmessage = (event) => {
    const logs = document.getElementById('logs');
    logs.textContent += event.data + '\n';
    let h1 = document.createElement("h1");
    h1.textContent = event.data;
    logs.appendChild(h1);
};

ws.onerror = (error) => {
    console.error('WebSocket error:', error);
};

ws.onclose = () => {
    console.log('WebSocket connection closed');
};


