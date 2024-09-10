//Header styling
document.getElementsByClassName("navItem")[1].style.background = "#66b2ff"
document.getElementsByClassName("navImg")[1].setAttribute("stroke", "#333333")
var dbInUse;

const blackListedDBs = [
    "information_schema",
    "mysql",
    "performance_schema",
    "sys"

]
const fetchDatabases = async () => {
    document.getElementsByClassName("databaseHeader")[0].innerHTML = '<h1 class="SmlBBBtn">New Database</h1>'
    document.getElementsByClassName("SmlBBBtn")[0].addEventListener("click", () => { openModal("NewDatabaseModal") })
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
            dbInUse = databases[i].Database
            loadTables(databases[i].Database)
        })
    }
}

const loadTables = async (database) => {
    document.getElementsByClassName("tableHolder")[0].innerHTML = ''
    document.getElementsByClassName("TableDisplay")[0].innerHTML = ""

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
    console.log(modal);

    modal.close()
    modal.style.display = "none"
}

document.getElementsByClassName("ModalClose")[0].addEventListener("click", () => { closeModal("NewDatabaseModal") })
document.getElementsByClassName("ModalClose")[1].addEventListener("click", () => { closeModal("NewTableModal") })
document.getElementsByClassName("BlueBlackBtn")[1].addEventListener("click", () => { openModal("NewTableModal") })

//Create a database
document.getElementsByClassName("ModalBtn")[0].addEventListener("click", async () => {
    let dbName = document.getElementsByClassName("ModalInp")[0].value
    console.log(dbName);

    const data = {
        db: dbName
    }
    await fetch("/create/database", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })

    closeModal("NewDatabaseModal")
    fetchDatabases()

})

// add a row to a new table
document.getElementsByClassName("newTableRow")[0].addEventListener("click", (event) => {
    let div = document.createElement("div")
    let Nameinput = document.createElement("input")
    let DropDown = document.createElement("select")
    let varchar = document.createElement("option")
    let longtext = document.createElement("option")
    let int = document.createElement("option")
    let Boolean = document.createElement("option")

    div.appendChild(Nameinput)
    div.appendChild(DropDown)
    DropDown.appendChild(varchar)
    DropDown.appendChild(longtext)
    DropDown.appendChild(int)
    // DropDown.appendChild(Boolean)

    div.setAttribute("class", "newRow")
    Nameinput.setAttribute("class", "RowName")
    Nameinput.setAttribute("required", "true")
    Nameinput.setAttribute("placeholder", "Column Name")
    Nameinput.setAttribute("maxlength", "50")
    Nameinput.setAttribute("type", "text")
    DropDown.setAttribute("class", "TableType")
    varchar.setAttribute("value", "varchar(255)")
    longtext.setAttribute("value", "longtext")
    int.setAttribute("value", "int")
    Boolean.setAttribute("value", "Boolean")
    varchar.innerHTML = "Short Text"
    longtext.innerHTML = "Multiplie Lines of Text"
    int.innerHTML = "Number"
    Boolean.innerHTML = "True/False"


    document.getElementsByClassName("tableRows")[0].appendChild(div)

})


document.getElementsByClassName("TableForm")[0].addEventListener("submit", async (event) => {
    event.preventDefault()
    let tableName = document.getElementsByClassName("TableName")[0].value
    let tableArray = [

    ]
    for (let i = 0; i < document.getElementsByClassName("newRow").length; i++) {
        
        let name = document.getElementsByClassName("RowName")[i].value
        let type = document.getElementsByClassName("TableType")[i].value
        tableArray.push({ name: name, type: type });

    }
    console.log(tableName);
    const data = {
        db: dbInUse,
        name: tableName,
        tableArray: tableArray
    }
    console.log(data);
    
    await fetch("/create/table", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)

    })
    closeModal("NewTableModal")
    loadTables(dbInUse)
})
fetchDatabases()


