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
    oldDomain: null,
    BaskLink: null,
    trueName: null
}
const loadProjects = async () => {
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
                div.setAttribute("class", "project")
                h1.setAttribute("class", "projectTitle")
                div.appendChild(h1)
                document.getElementsByClassName("ConsoleHeader")[0].appendChild(div)
                h1.innerHTML = process.DisplayName

                div.addEventListener("click", (event) => {
                    const bashPathEncoded = encodeURIComponent(process.BashPath);
                    fetch(`/file/${process.Name}/${process.DisplayName}/${bashPathEncoded}`)
                        .then(response => response.json())
                        .then(body => {
                            for (let x = 0; (x + 1) < document.getElementsByClassName("project").length; x++) {
                                const element = document.getElementsByClassName("project")[x];
                                if (element.classList.contains("projectHover")) {
                                    element.classList.remove("projectHover")
                                }
                            }
                                                      
                            if (event.target.classList.contains("projectTitle")) {
                                event.target.parentElement.classList.add("projectHover")
                                
                            } else {
                                event.target.style.background = "#1A1A1A"
                            }
                            state.processInUse = process.DisplayName
                            state.trueName = process.Name
                            state.BaskLink = process.BashPath
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
            let div = document.createElement("div")
            let h1 = document.createElement("h1")
            h1.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="#66B2FF" class="newServerIcon">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
`
            h1.innerHTML += "New Server"
            div.appendChild(h1)

            div.setAttribute("class", "project")
            h1.setAttribute("class", "projectTitle")
            h1.style.margin = "0%"
            document.getElementsByClassName("ConsoleHeader")[0].appendChild(div)
            h1.addEventListener("click", () => {

                let ServerDiv = document.createElement("form")
                ServerDiv.setAttribute("class", "ServerDiv")
                let ServerTitle = document.createElement("h1")
                ServerTitle.setAttribute("class", "ServerTitle")
                let Git = document.createElement("input")
                Git.setAttribute("required", "true")
                Git.setAttribute("class", "ServerInput")
                Git.setAttribute("placeholder", "https://github.com/name/reposiotry")
                let port = document.createElement("input")
                port.setAttribute("required", "true")
                port.setAttribute("class", "ServerInputHalf")
                port.setAttribute("placeholder", "3000")
                let Name = document.createElement("input")
                Name.setAttribute("required", "true")
                Name.setAttribute("class", "ServerInputHalf")
                Name.setAttribute("placeholder", "MyServer")
                let Domain = document.createElement("input")
                Domain.setAttribute("required", "true")
                Domain.setAttribute("class", "ServerInput")
                Domain.setAttribute("placeholder", "example.com")
                let Email = document.createElement("input")
                Email.setAttribute("class", "ServerInput")
                Email.setAttribute("placeholder", "example@gmail.com")
                let Modules = document.createElement("input")
                Modules.setAttribute("class", "ServerInput")
                Modules.setAttribute("placeholder", "express mysql2 dotenv")
                let ENV = document.createElement("textarea")
                ENV.setAttribute("class", "ServerInput")
                ENV.setAttribute("placeholder", "USER=example123")
                let appName = document.createElement("input")
                appName.setAttribute("class", "ServerInput")
                appName.setAttribute("placeholder", "server.js")

                let GitLabel = document.createElement("h1")
                GitLabel.setAttribute("class", "ServerDesc")
                GitLabel.innerHTML = "GITHUB LINK: "
                let portLabel = document.createElement("h1")
                portLabel.setAttribute("class", "ServerDescHalf")
                portLabel.innerHTML = "PORT:"
                let NameLabel = document.createElement("h1")
                NameLabel.setAttribute("class", "ServerDescHalf")
                NameLabel.innerHTML = "Server Name:"
                let DomainLabel = document.createElement("h1")
                DomainLabel.setAttribute("class", "ServerDesc")
                DomainLabel.innerHTML = "Domain Name:"
                let EmailLabel = document.createElement("h1")
                EmailLabel.setAttribute("class", "ServerDesc")
                EmailLabel.innerHTML = "EMAIL (recommended):"
                let ModuleLabel = document.createElement("h1")
                ModuleLabel.setAttribute("class", "ServerDesc")
                ModuleLabel.innerHTML = "Node Modules:"
                let ENVLabel = document.createElement("h1")
                ENVLabel.setAttribute("class", "ServerDesc")
                ENVLabel.innerHTML = ".env File:"
                let AppNameLabel = document.createElement("h1")
                AppNameLabel.setAttribute("class", "ServerDesc")
                AppNameLabel.innerHTML = "App Name:"


                let createServer = document.createElement("button")
                createServer.setAttribute("class", "ServerCreate")
                createServer.innerHTML = "CREATE"
                createServer.type = "submit"

                let closeButton = document.createElement("button")
                closeButton.setAttribute("class", "ServerCreate")
                closeButton.innerHTML = "CANCEL"
                closeButton.style.background = "#333333"
                closeButton.style.color = "#ffffff"

                ServerDiv.appendChild(GitLabel)
                ServerDiv.appendChild(Git)
                ServerDiv.appendChild(portLabel)
                ServerDiv.appendChild(NameLabel)
                ServerDiv.appendChild(port)
                ServerDiv.appendChild(Name)
                ServerDiv.appendChild(DomainLabel)
                ServerDiv.appendChild(Domain)
                ServerDiv.appendChild(EmailLabel)
                ServerDiv.appendChild(Email)
                ServerDiv.appendChild(ModuleLabel)
                ServerDiv.appendChild(Modules)
                ServerDiv.appendChild(ENVLabel)
                ServerDiv.appendChild(ENV)
                ServerDiv.appendChild(AppNameLabel)
                ServerDiv.appendChild(appName)
                ServerDiv.appendChild(createServer)
                ServerDiv.appendChild(closeButton)

                div.appendChild(ServerDiv)
                ServerDiv.addEventListener("submit", () => {

                })

                closeButton.addEventListener("click", () => {
                    ServerDiv.remove()

                });
                ServerDiv.addEventListener("submit", async (event) => {
                    event.preventDefault()
                    createServer.innerHTML = `
                    <img class="loadingSVG" src="../pictures/icons8-loading-100.png" alt="">
                `
                    const data = {
                        GLink: Git.value,
                        PORT: port.value,
                        Domain: Domain.value,
                        Email: Email.value,
                        Name: Name.value,
                        Modules: Modules.value,
                        ENV: ENV.value,
                        appName: appName.value
                    };
                    try {
                        const response = await fetch("/create/Server", {
                            method: "POST",
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(data)
                        });
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        closeButton.click()
                        console.log('Settings updated successfully:', data);
                    } catch (error) {
                        console.error('Error updating settings:', error);
                        alert('Failed to update settings. Please try again.');
                    }
                })

            })

        })
        .catch(error => console.error('Error:', error));
}




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
            dataType: buttonText,
            processName: state.trueName
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
                throw new Error('Network response was not ok', response.statusText);
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
        let response = await fetch('/start/server/' + state.processInUse, {
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
        let response = await fetch('/stop/server/' + state.processInUse, {
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
        let response = await fetch('/restart/server/' + state.processInUse, {
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
        let response = await fetch(`/pull/server/${state.processInUse}/${state.GLink}`, {
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
document.getElementsByClassName("settingsSave")[0].addEventListener("click", async (event) => {
    let GithubLink = document.getElementById("GLink").value;
    event.target.innerHTML = `
    <img class="loadingSVG" src="../pictures/icons8-loading-100.png" alt="">
`
    event.target.disable = true
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
        state.OldDomain = document.getElementById("domain").value
        event.target.disable = false
        event.target.innerHTML = "SAVE"
    } catch (error) {
        console.error('Error updating settings:', error);
        alert('Failed to update settings. Please try again.');
    }
});

const getServerStatus = async (serverName) => {

    fetch(`/status/server/${serverName}`)
        .then(response => response.text())
        .then(data => {
            let status = data
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


loadProjects()