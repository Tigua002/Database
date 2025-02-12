const getToken = async (token) => {
    if (!token) {
        window.location.assign('/login')
        localStorage.clear()
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
                    window.location.assign('/login')
                    localStorage.clear()
                }
            });
    }
}

document.getElementsByClassName("navItem")[0].style.background = "#333333";




const loadDashboard = async () => {
    let res = await fetch('dashDB', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: localStorage.getItem("token") })
    })
    let response = await res.json()
    console.log(response);
    document.getElementsByClassName("DashDatabasesTitle")[0].innerHTML = response.db
    let tableRow = document.createElement("tr");
    tableRow.setAttribute("class", "tableRow")
    document.getElementsByClassName("DashDatabase")[0].appendChild(tableRow);
    for (let i = 0; i < response.columns.length; i++) {
        const column = response.columns[i];
        let tableData = document.createElement("td");
        tableData.setAttribute("class", "tableDesc");
        tableData.innerHTML = column.Field;
        tableRow.appendChild(tableData);
        tableData.style.borderTop = "solid #444444 2px"
        if (i == 0) {
            tableData.style.borderTopLeftRadius = ".5vw"
            tableData.style.borderBottomLeftRadius = ".5vw"
            tableData.style.borderLeft = "solid #444444 2px"
        } else if (i + 1 == response.columns.length) {
            tableData.style.borderTopRightRadius = ".5vw"
            tableData.style.borderBottomRightRadius = ".5vw"
            tableData.style.borderRight = "solid #444444 2px"

        }
    }
    response.tableData.forEach(row => {
        let tableDataRow = document.createElement("tr");
        tableDataRow.setAttribute("class", "tableRow")
        document.getElementsByClassName("DashDatabase")[0].appendChild(tableDataRow);

        for (let i = 0; i < response.columns.length; i++) {
            const column = response.columns[i];
            let tableData = document.createElement("td");
            tableData.setAttribute("class", "tableData");
            tableData.innerHTML = row[column.Field] || "NULL";
            if (tableData.innerHTML == "NULL") {
                tableData.style.opacity = ".5"
            }
            tableDataRow.appendChild(tableData);
            // if (i == 0) {
            //     tableData.style.borderLeft = "solid #444444 2px"
            // } else if ((i + 1) == columns.length) {
            //     tableData.style.borderRight = "solid #444444 2px"
            // }
        }
    })
}

getToken(localStorage.getItem('token'));
loadDashboard()