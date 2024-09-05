//Header styling
document.getElementsByClassName("navItem")[1].style.background = "#66b2ff"
document.getElementsByClassName("navImg")[1].setAttribute("stroke", "#333333")

const blackListedDBs = [
    "information_schema",
    "mysql",
    "performance_schema",
    "sys"

]
const fetchDatabases = async () => {
    const data = await fetch("/FetchDatabases", {
        method: "GET"
    });
    const databases = await data.json();
    for (let i = 0; i < databases.length; i++) {
        if (blackListedDBs.includes(databases[i].Database)) {
            continue
        }
        console.log(databases[i].Database)
        let h1 = document.createElement("h1")
        h1.setAttribute("class", "databaseItem flex")
        h1.innerHTML = databases[i].Database
        document.getElementsByClassName("databaseHeader")[0].appendChild(h1)
        h1.addEventListener("click", () => {
            for (let i = 0; i < document.getElementsByClassName("databaseItem").length; i++) {
                document.getElementsByClassName("databaseItem")[i].style.background = "none";
                document.getElementsByClassName("databaseItem")[i].style.color = "#ffffff";

            }
            h1.style.background = "#ffffff"
            h1.style.color = "#66B2FF"
            loadTables(databases[i].Database)
        })
    }
}

const loadTables = async (database) => {
    document.getElementsByClassName("tableHolder")[0].innerHTML = '<h1 class="BlueBlackBtn">Database Details</h1>'
    document.getElementsByClassName("TableDisplay")[0].innerHTML = ""
    let data = {
        db: database
    }
    const response = await fetch("/get/Tables/" + database, {
        method: "GET"

    })
    let tables = await response.json()
    console.log(tables);
    for (let i = 0; i < tables.length; i++) {
        let table = tables[i]
        let h1 = document.createElement("h1")
        h1.setAttribute("class", "table flex")
        h1.innerHTML = table["Tables_in_" + database]
        document.getElementsByClassName("tableHolder")[0].appendChild(h1)
        h1.addEventListener("click", () => {
            for (let i = 0; i < document.getElementsByClassName("table").length; i++) {
                document.getElementsByClassName("table")[i].style.background = "#333333";
                document.getElementsByClassName("table")[i].style.color = "#66B2FF";

            }
            h1.style.background = "#66B2FF";
            h1.style.color = "#333333";
            loadData(database, table["Tables_in_" + database])
        })

    }
}

const loadData = async (database, table) => {
    document.getElementsByClassName("TableDisplay")[0].innerHTML = ""
    let response = await fetch(`/get/columns/${database}/${table}`, {
        method: "GET"
    })
    let columns = await response.json()
    let tableRow = document.createElement("tr")
    document.getElementsByClassName("TableDisplay")[0].appendChild(tableRow)
    for (let i = 0; i < columns.length; i++) {
        let column = columns[i]
        let tableData = document.createElement("td")
        tableData.setAttribute("class", "tableDesc")
        tableData.innerHTML = column.Field
        tableRow.appendChild(tableData)
    }
    let itemResponse = await fetch(`/Select/data/${database}/${table}`, {
        method: "GET"
    })
    let data = await itemResponse.json()
    for (let i = 0; i < data.length; i++) {
        let row = data[i]
        let tableDataRow = document.createElement("tr")
        document.getElementsByClassName("TableDisplay")[0].appendChild(tableDataRow)
        for (let i = 0; i < columns.length; i++) {
            let column = columns[i]
            let tableData = document.createElement("td")
            tableData.setAttribute("class", "tableData")
            tableData.innerHTML = row[column.Field]
            tableDataRow.appendChild(tableData)
        }
    }
}

const openModal = (name) => {
    let modal = document.getElementsByClassName(name)[0]
    modal.showModal()
    modal.style.display = "flex"
}
const closeModal = (name) => {
    let modal = document.getElementsByClassName(name)[0]
    modal.close()
    modal.style.display = "none"
}
document.getElementsByClassName("SmlBBBtn")[0].addEventListener("click", () => { openModal("NewDatabaseModal") })
document.getElementsByClassName("ModalClose")[0].addEventListener("click", () => { closeModal("NewDatabaseModal") })
document.getElementsByClassName("BlueBlackBtn")[1].addEventListener("click", () => { openModal("NewTableModal") })

//Create a database
document.getElementsByClassName("ModalBtn")[0].addEventListener("click", async () => {
    let dbName = document.getElementsByClassName("ModalInp")[0].value
    console.log(dbName);
    
    const data = {
        db: dbName
    }
    let success = await fetch("/create/database", {
        method: "POST",
        headers: {
            'Content-Type': "'application/json"
        },
        body: {
            data
        }
    })
    let response = await success.json()
    closeModal(NewDatabaseModal)
    fetchDatabases()
    loadTables(dbName)

})
fetchDatabases()


