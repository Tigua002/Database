document.getElementsByClassName("navItem")[2].style.background = "#66B2FF"
document.getElementsByClassName("navImg")[2].setAttribute("stroke", "#333333")

const consoleDiv = document.getElementById('consoleOutput');
const errorDiv = document.getElementById('consoleError');
// const ws = new WebSocket('ws://localhost:8080');
const ws = new WebSocket('wss://dataspot.gusarov.site:8080');
const state = {
    errEvent: null,
    logEvent: null,
    LogCache: null,
    ErrorCache: null,
    blackListedProcesses: ["test", "Datatest"],
    processInUse: null,
    oldDomain: null
}
const loadProjects = async  () => {
    await fetch('/processes')
        .then(response => response.json())
        .then(data => {
            for (let i = 0; i < data.length; i++) {
                const process = data[i];
                if (state.blackListedProcesses.includes(process.Name)) {
                    continue;
                }
                let div = document.createElement("div")
                let h1 = document.createElement("h1")
                let indic = document.createElement("h1")
                div.setAttribute("class", "project")
                h1.setAttribute("class", "projectTitle")
                indic.setAttribute("class", "projectIndicator")
                div.appendChild(h1)
                div.appendChild(indic)
                document.getElementsByClassName("ConsoleHeader")[0].appendChild(div)
                h1.innerHTML = process.DisplayName
                indic.innerHTML = "&#x276C"

                h1.addEventListener("click", () => {
                    fetch('/file/' + process.Name + "/" + process.DisplayName)
                        .then(response => response.json())
                        .then(body => {
                            state.processInUse = process.DisplayName
                            consoleDiv.innerHTML = ""
                            errorDiv.innerHTML = ""
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
                            console.log(process);
                            
                            document.getElementById("GLink").value = process.GithubLink
                            document.getElementById("port").value = process.PORT
                            document.getElementById("domain").value = process.Domain
                            document.getElementById("email").value = process.Email
                            state.oldDomain = process.Domain
                            createOverlay(errorDiv, "CLEAR ERRORS", state.errEvent, "56.5%", "42%", "consoleError")
                            createOverlay(consoleDiv, "CLEAR LOGS", state.logEvent, "20.5%", "6%", "consoleLine")
                            
                            getServerStatus(state.processInUse)

                        });
                })
            }
        })
        .catch(error => console.error('Error:', error));
}
loadProjects()



ws.onmessage = (event) => {
    let data = JSON.parse(event.data)



    if (data.error == false) {
        if (data.dt == state.LogCache) {
            return
        }

        state.LogCache = data.dt
        let number = document.getElementsByClassName("consoleLine").length
        for (let i = 0; i < number; i++) {

            document.getElementsByClassName("consoleLine")[0].remove()

        }
        let lines = data.dt.split("\n")

        lines.forEach(line => {
            let newMessage = document.createElement("h1")
            newMessage.setAttribute("class", "consoleLine")
            consoleDiv.appendChild(newMessage)
            newMessage.innerHTML = line

        })

    } else if (data.error == true) {
        if (data.dt == state.ErrorCache) {
            return
        }

        state.ErrorCache = data.dt
        let number = document.getElementsByClassName("consoleError").length
        for (let i = 0; i < number; i++) {
            document.getElementsByClassName("consoleError")[0].remove()

        }
        let errLines = data.dt.split("Error")

        errLines.forEach(line => {
            let newMessage = document.createElement("h1")
            newMessage.setAttribute("class", "consoleError")
            errorDiv.appendChild(newMessage)
            newMessage.innerHTML = line

        })

    }
    consoleDiv.scrollTop = consoleDiv.scrollHeight;
    errorDiv.scrollTop = errorDiv.scrollHeight;
};

const createOverlay = (element, buttonText, stateEvent, position, fullPosition, wiper) => {
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
            errReset.style.width = "34vw"
            errReset.style.left = fullPosition
            errIndic.style.transform = "rotate(-90deg) rotateY(180deg)"
            errReset.style.borderRadius = "0vw"
            errReset.style.borderTopLeftRadius = "1vw"
            errReset.style.borderTopRightRadius = "1vw"
        }, 200)
    })
    errReset.addEventListener("mouseout", () => {
        clearTimeout(stateEvent)
        stateEvent = setTimeout(() => {
            errReset.style.transition = "200ms"
            errReset.style.height = "3vh"
            errReset.style.width = "5vw"
            errReset.style.left = position
            errReset.style.borderRadius = "0vw"
            errReset.style.borderBottomLeftRadius = "1vw"
            errReset.style.borderBottomRightRadius = "1vw"
            errIndic.style.transform = "rotate(-90deg)"
        }, 200)
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

            let number = document.getElementsByClassName(wiper).length
            for (let i = 0; i < number; i++) {

                document.getElementsByClassName(wiper)[0].remove()

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

document.getElementById("start").addEventListener("click", async () => {
    document.getElementsByClassName("statusIndic")[0].style.background = "#66B2FF"
    document.getElementsByClassName("statusIndic")[0].style.border = "#444444 solid 1px"
    document.getElementById("statusText").innerText = "Booting"
    try {
        let response = await fetch('/start/server', {
            method: "POST"
        });
        if (response.ok) {
            console.log('Server started successfully');
        } else {
            console.error('Failed to start server');
        }
    } catch (error) {
        console.error('Error:', error);
    }
    setTimeout(() => {
        getServerStatus(state.processInUse)

    }, 5000)
});
document.getElementById("stop").addEventListener("click", async () => {
    document.getElementsByClassName("statusIndic")[0].style.background = "#d32c2c"
    document.getElementsByClassName("statusIndic")[0].style.border = "#1A1A1A solid 1px"
    document.getElementById("statusText").innerText = "Shutting down"
    try {
        let response = await fetch('/stop/server', {
            method: "POST"
        });
        if (response.ok) {
            console.log('Server stopped successfully');
        } else {
            console.error('Failed to stop server');
        }
    } catch (error) {
        console.error('Error:', error);
    }
    setTimeout(() => {
        getServerStatus(state.processInUse)

    }, 1000)
});
document.getElementById("rerun").addEventListener("click", async () => {
    document.getElementsByClassName("statusIndic")[0].style.background = "#66B2FF"
    document.getElementsByClassName("statusIndic")[0].style.border = "#444444 solid 1px"
    document.getElementById("statusText").innerText = "Restarting"
    try {
        let response = await fetch('/restart/server', {
            method: "POST"
        });
        if (response.ok) {
            console.log('Server stopped successfully');
        } else {
            console.error('Failed to stop server');
        }
    } catch (error) {
        console.error('Error:', error);
    }
    setTimeout(() => {
        getServerStatus(state.processInUse)

    }, 6000)
});
document.getElementById("restart").addEventListener("click", async () => {
    document.getElementsByClassName("statusIndic")[0].style.background = "#66B2FF"
    document.getElementsByClassName("statusIndic")[0].style.border = "#444444 solid 1px"
    document.getElementById("statusText").innerText = "Restarting"

    try {
        let response = await fetch('/pull/server', {
            method: "POST"
        });
        if (response.ok) {
            console.log('Server Pulled successfully');
        } else {
            console.error('Failed to pull server');
        }
    } catch (error) {
        console.error('Error:', error);
    }
    setTimeout(() => {
        getServerStatus(state.processInUse)

    }, 6000)
});
document.getElementById("Settings").addEventListener("click", async () => {
    document.getElementsByClassName("settingsDiv")[0].style.height = "auto"
})
document.getElementsByClassName("settingsSave").addEventListener("click", async () => {
    let GithubLink = document.getElementById("GLink").value;
    if (!GithubLink.includes("https://github.com/")) {
        alert("Not a GitHub repository link. \nPlease enter a valid repository");
        return;
    }
    const data = {
        GLink: GithubLink,
        PORT: document.getElementById("port").value,
        Domain: document.getElementById("domain").value,
        OldDomain: state.oldDomain,
        Email: document.getElementById("email").value,
        Name: state.processInUse
    };
    try {
        const response = await fetch("/update/settings", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        console.log('Settings updated successfully:', data);
    } catch (error) {
        console.error('Error updating settings:', error);
        alert('Failed to update settings. Please try again.');
    }
});

const getServerStatus = async (serverName) => {
    
    fetch(`/status/server?appName=${serverName}`)
        .then(response => response.json())
        .then(data => {
            let status = data[0].pm2_env.status
            if (status == "stopped") {
                document.getElementsByClassName("statusIndic")[0].style.background = "#1A1A1A"
                document.getElementsByClassName("statusIndic")[0].style.border = "#ffffff solid 1px"
                document.getElementById("statusText").innerText = status
            } else if (status == "online") {
                document.getElementsByClassName("statusIndic")[0].style.background = "rgb(54, 201, 54)"
                document.getElementsByClassName("statusIndic")[0].style.border = "#ffffff solid 1px"
                document.getElementById("statusText").innerText = "Live"
            } else if (status == "errored") {
                document.getElementsByClassName("statusIndic")[0].style.background = "#d32c2c"
                document.getElementsByClassName("statusIndic")[0].style.border = "#ffffff solid 1px"
                document.getElementById("statusText").innerText = "Error"
            }
        })
        .catch(error => console.error('Error:', error));


}