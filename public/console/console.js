document.getElementsByClassName("navItem")[2].style.background = "#66B2FF"
document.getElementsByClassName("navImg")[2].setAttribute("stroke", "#333333")

const consoleDiv = document.getElementById('consoleOutput');
const errorDiv = document.getElementById('consoleError');
// const ws = new WebSocket('ws://localhost:8080');
const ws = new WebSocket('wss://dataspot.gusarov.site:8080');
const state = {
    errEvent: null,
    logEvent: null
}

fetch('/file')
    .then(response => response.json())
    .then(body => {
        console.log(body);
        
        console.log("LOADED");

        let lines = body.data.split("\n")
        lines.forEach(line => {
            let newMessage = document.createElement("h1")
            newMessage.setAttribute("class", "consoleLine")
            consoleDiv.appendChild(newMessage)
            newMessage.innerHTML = line

        })
        consoleDiv.scrollTop = consoleDiv.scrollHeight;
        let errLines = body.err.split("Error")
        errLines.forEach(line => {
            let newMessage = document.createElement("h1")
            newMessage.setAttribute("class", "consoleError")
            errorDiv.appendChild(newMessage)
            newMessage.innerHTML = line

        })
        createOverlay(errorDiv, "CLEAR ERROR", state.errEvent, "47%")
        createOverlay(consoleDiv, "CLEAR LOGS", state.logEvent, "6%")

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

const createOverlay = (element, buttonText, stateEvent, position) => {
    let errReset = document.createElement("div")
    let errButton = document.createElement("button")
    let errIndic = document.createElement("h1")
    errReset.appendChild(errIndic)
    errReset.appendChild(errButton)
    errReset.setAttribute("class", "errReset")
    errButton.setAttribute("class", "errButton")
    errIndic.setAttribute("class", "errIndic")
    errIndic.innerHTML = "&#x276C"
    errButton.innerHTML = buttonText
    element.appendChild(errReset)
    element.scrollTop = element.scrollHeight;
    errReset.style.left = position

    errReset.addEventListener("mouseover", () => {
        clearTimeout(stateEvent)
        stateEvent = setTimeout(() => {
            errReset.style.transition = "200ms"
            errReset.style.height = "11vh"
            errIndic.style.transform = "rotate(-90deg) rotateY(180deg)"
        }, 200)  
    })
    errReset.addEventListener("mouseout", () => {
        clearTimeout(stateEvent)
        stateEvent = setTimeout(() => {
            errReset.style.transition = "200ms"
            errReset.style.height = "3vh"
            errIndic.style.transform = "rotate(-90deg)"
        }, 200)
    })
    errIndic.addEventListener("click", (e) => {
        if (errReset.style.height == "11vh") {
            clearTimeout(stateEvent)
            stateEvent = setTimeout(() => {
                errReset.style.transition = "200ms"
                errReset.style.height = "3vh"
                errIndic.style.transform = "rotate(-90deg)"
            }, 1)
        } 
    })
}

ws.onclose = () => {
    console.log('WebSocket connection closed');
};
ws.onerror = (error) => {
    console.error('WebSocket error:', error);
};