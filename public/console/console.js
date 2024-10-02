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
        createOverlay(errorDiv, "CLEAR ERRORS", state.errEvent, "47%", "consoleError")
        createOverlay(consoleDiv, "CLEAR LOGS", state.logEvent, "6%", "consoleLine")

    });

ws.onmessage = (event) => {
    console.log("UPDATE");
    consoleDiv.innerHTML = ""
    console.log(event.data);
    
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

const createOverlay = (element, buttonText, stateEvent, position, wiper) => {
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
    errButton.addEventListener("click", async () => {
        if (!confirm("Are you sure you want to " + buttonText + "?")) {
            return;
        }

        const data = {
            dataType: buttonText
        };

        try {
            const response = await fetch('/clear/files', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            for (let i = 0; i < document.getElementsByClassName(wiper).length; i++) {
                const line = document.getElementsByClassName(wiper)[i];
                line.remove()
            }
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
        }
    });

}

ws.onclose = () => {
    console.log('WebSocket connection closed');
};
ws.onerror = (error) => {
    console.error('WebSocket error:', error);
};