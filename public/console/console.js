document.getElementsByClassName("navItem")[2].style.background = "#66B2FF"
document.getElementsByClassName("navImg")[2].setAttribute("stroke", "#333333")


const ws = new WebSocket('wss://172.104.242.87:8080');

ws.onmessage = (event) => {
    const logs = document.getElementById('logs');
    
    // Option 1: Append log data as text
    logs.textContent += event.data + '\n';
    
    // Option 2: Create a new h1 element for each log message
    let h1 = document.createElement("h1");
    h1.textContent = event.data;
    logs.appendChild(h1);
};

ws.onclose = () => {
    console.log('WebSocket connection closed');
};

