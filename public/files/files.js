const getToken = async (token) => {
    if (!token) {
        localStorage.clear()
        window.location.assign('/login')
        return false
    } else {
        await fetch('/checkToken', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token: token })
        }).then(response => response.text())
            .then(data => {
                if (data == 'Unauthorized') {
                    console.log("Unauthorized")
                    localStorage.clear()
                    window.location.assign('/login')
                    return false
                } else {
                    return true
                }
            });
    }
    return false
}
getToken(localStorage.getItem('token'));

document.getElementsByClassName("navItem")[3].style.background = "#333333";
const state = {
    NewFile: false
};

const loadFiles = async () => {
    const response = await fetch("/FetchFiles",
        {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ owner: localStorage.getItem("username") })
        });
    if (!response.ok) throw new Error("Failed to fetch databases");
    let files = await response.json()
    console.log(files);
    document.getElementsByClassName("filesContainer")[0].innerHTML = ""
    files.forEach(file => {
        let div = document.createElement("div")
        div.setAttribute("class", "fileDiv")
        let fileName = document.createElement("h1")
        fileName.setAttribute("class", "fileName")
        fileName.innerHTML = file.Filename
        let filePath = document.createElement("h1")
        filePath.setAttribute("class", "fileOwner")
        filePath.innerHTML = file.owner
        let fileUpload = document.createElement("h1")
        fileUpload.setAttribute("class", "fileuploadDate")
        fileUpload.innerHTML = file.uploadDate
        let fileButton = document.createElement("div")
        fileButton.setAttribute("class", "fileButton")
        fileButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="fileIcon">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
        `
        div.appendChild(fileName)
        div.appendChild(filePath)
        div.appendChild(fileUpload)
        div.appendChild(fileButton)
        document.getElementsByClassName("filesContainer")[0].appendChild(div)
        fileButton.addEventListener("click", async () => {
            window.location.href = `https://dataspot.gusarov.site/download?file=${file.filepath}`;
        })
        if (file.owner == localStorage.getItem("username")) {
            let option = document.createElement("option")
            option.setAttribute("value", file.filepath)
            option.innerHTML = file.Filename
    
            document.getElementById("fileOptions").appendChild(option)

        }
    });
}

document.getElementById("fileUpload").addEventListener("click", (event) => {
    if (!state.NewFile) {
        document.getElementById("filename").style.display = "flex"
        document.getElementById("fileCover").style.display = "flex"
        document.getElementById("fileSubmit").style.display = "flex"
        document.getElementsByClassName("fileSelected")[0].style.display = "flex"
        event.target.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="#66B2FF" class="SVG">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
        CANCEL`
    } else {
        document.getElementById("filename").style.display = "none"
        document.getElementById("fileCover").style.display = "none"
        document.getElementById("fileSubmit").style.display = "none"
        document.getElementsByClassName("fileSelected")[0].style.display = "none"
        event.target.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="#66B2FF" class="SVG">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
        </svg>
        NEW FILE`
    }
    state.NewFile = !state.NewFile
})

document.getElementById("fileCover").addEventListener("click", () => {
    document.getElementById("file").click()
})

document.getElementById("file").addEventListener("change", (e) => {
    document.getElementsByClassName("fileSelected")[0].innerText = "SELECTED: " + e.target.files[0].name
})

document.getElementById("fileSubmit").addEventListener("click", async () => {

    if (document.getElementById("filename").value == "") {
        alert("File name is empty")
        return;
    } else if (!document.getElementById("file").files[0]) {
        alert("Select a file")
        return
    }

    const formData = new FormData();
    const fileInput = document.getElementById('file').files[0];
    formData.append('file', fileInput);
    formData.append('filename', document.getElementById("filename").value);
    formData.append("token", localStorage.getItem("token"));
    const response = await fetch('/upload', {
        method: 'POST',
        body: formData
    });
    const data = await response.json();
    if (response.ok) {
        alert("Success");
        sessionStorage.setItem("PFP", data.filename);
        window.location.reload()
    } else {
        console.error('Failed to upload file');
    }
})

document.getElementsByClassName("shareClose")[0].addEventListener("click", () => {
    document.getElementsByClassName("fileShareModal")[0].close();
    document.getElementsByClassName("fileShareModal")[0].style.display = "none";
})

document.getElementById("fileShare").addEventListener("click", () => {
    document.getElementsByClassName("fileShareModal")[0].showModal();
    document.getElementsByClassName("fileShareModal")[0].style.display = "flex";
})

document.getElementsByClassName("sendBtn")[0].addEventListener("click", async () => {
    document.getElementsByClassName("sendBtn")[0].innerHTML = 
    `<img class="loadingSVG" src="../pictures/icons8-loading-100.png" alt="">`
    
    let user = document.getElementById("user").value
    let file = document.getElementById("fileOptions").value
    if (user == "") {
        alert("fill in the 'user' area")
        return
    }
    console.log(user, file);
    let response = await fetch("/share/file", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(
            {
                user: user,
                file: file

            })
    })
    let answer = await response.json()
    alert(answer.message)


})

loadFiles()
