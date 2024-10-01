document.getElementsByClassName("navItem")[2].style.background = "#66B2FF"
document.getElementsByClassName("navImg")[2].setAttribute("stroke", "#333333")

const consoleDiv = document.getElementById('consoleOutput');
const ws = new WebSocket('ws://localhost:8080');
// const ws = new WebSocket('ws://dataspot.gusarov.site:8080');

fetch('/file')
    .then(response => response.text())
    .then(data => {
        console.log("LOADED");

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
    console.log("UPDATE");
    consoleDiv.innerHTML = ""
    let lines = event.data.split("\n")
    lines.forEach(line => {
        let newMessage = document.createElement("h1")
        newMessage.setAttribute("class", "consoleLine")
        consoleDiv.appendChild(newMessage)
        newMessage.innerHTML = line

    })
    consoleDiv.scrollTop = consoleDiv.scrollHeight;
};

ws.onclose = () => {
    console.log('WebSocket connection closed');
};
