document.getElementsByClassName("navItem")[2].style.background = "#66B2FF"
document.getElementsByClassName("navImg")[2].setAttribute("stroke", "#333333")

const consoleDiv = document.getElementById('consoleOutput');
const errorDiv = document.getElementById('consoleError');
// const ws = new WebSocket('ws://localhost:8080');
const ws = new WebSocket('wss://dataspot.gusarov.site:8080');

fetch('/file')
    .then(response => response.text())
    .then(body => {
        console.log("LOADED");

        let lines = body.data.split("\n")
        lines.forEach(line => {
            let newMessage = document.createElement("h1")
            newMessage.setAttribute("class", "consoleLine")
            consoleDiv.appendChild(newMessage)
            newMessage.innerHTML = line

        })
        consoleDiv.scrollTop = consoleDiv.scrollHeight;
        let errLines = body.data.split("\n")
        errLines.forEach(line => {
            let newMessage = document.createElement("h1")
            newMessage.setAttribute("class", "consoleError")
            errorDiv.appendChild(newMessage)
            newMessage.innerHTML = line

        })
        errorDiv.scrollTop = errorDiv.scrollHeight;
    });

ws.onmessage = (event) => {
    console.log("UPDATE");
    consoleDiv.innerHTML = ""
    let lines = event.data.split("\n")
    if (event.body.error == false) {
        lines.forEach(line => {
            let newMessage = document.createElement("h1")
            newMessage.setAttribute("class", "consoleLine")
            consoleDiv.appendChild(newMessage)
            newMessage.innerHTML = line
    
        })
    } else if (event.body.error == true) {
        lines.forEach(line => {
            let newMessage = document.createElement("h1")
            newMessage.setAttribute("class", "consoleError")
            errorDiv.appendChild(newMessage)
            newMessage.innerHTML = line
    
        })
        
    }
    consoleDiv.scrollTop = consoleDiv.scrollHeight;
    errorDiv.scrollTop = errorDiv.scrollHeight;
};

ws.onclose = () => {
    console.log('WebSocket connection closed');
};
ws.onerror = (error) => {
    console.error('WebSocket error:', error);
};