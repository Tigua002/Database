//Header styling
document.getElementsByClassName("navItem")[1].style.background = "#66b2ff";
document.getElementsByClassName("navImg")[1].setAttribute("stroke", "#333333");

const blackListedDBs = ["information_schema", "mysql", "performance_schema", "sys", "dataSpotUsers"];

const state = {
    dbInUse: null,
    tableInUse: null
};

const fetchDatabases = async () => {
    try {
        document.getElementsByClassName("databaseHeader")[0].innerHTML = '<h1 class="SmlBBBtn">New Database</h1>';
        document.getElementsByClassName("SmlBBBtn")[0].addEventListener("click", () => openModal("NewDatabaseModal"));

        const response = await fetch("/FetchDatabases", { method: "GET" });
        if (!response.ok) throw new Error("Failed to fetch databases");

        const databases = await response.json();
        const fragment = document.createDocumentFragment();

        databases.forEach(db => {
            if (blackListedDBs.includes(db.Database)) return;

            let h1 = document.createElement("h1");
            h1.setAttribute("class", "databaseItem flex");
            h1.innerHTML = db.Database;
            fragment.appendChild(h1);

            h1.addEventListener("click", () => {
                resetStyles(document.getElementsByClassName("databaseItem"), "none", "#ffffff");
                h1.style.background = "#ffffff";
                h1.style.color = "#66B2FF";
                state.dbInUse = db.Database;
                loadTables(db.Database);
            });
        });

        document.getElementsByClassName("databaseHeader")[0].appendChild(fragment);
    } catch (error) {
        console.error(error.message);
    }
};

const loadTables = async (database) => {
    try {
        document.getElementsByClassName("BlueBlackBtn")[1].removeAttribute("disabled");
        document.getElementsByClassName("tableHolder")[0].innerHTML = '';
        document.getElementsByClassName("TableDisplay")[0].innerHTML = "";

        const response = await fetch(`/get/Tables/${database}`, { method: "GET" });
        if (!response.ok) throw new Error("Failed to fetch tables");

        const tables = await response.json();
        const fragment = document.createDocumentFragment();

        tables.forEach(table => {
            let h1 = document.createElement("h1");
            h1.setAttribute("class", "table flex");
            h1.innerHTML = table[`Tables_in_${database}`];
            fragment.appendChild(h1);

            h1.addEventListener("click", () => {
                resetStyles(document.getElementsByClassName("table"), "#333333", "#66B2FF");
                h1.style.background = "#66B2FF";
                h1.style.color = "#333333";
                loadData(database, table[`Tables_in_${database}`]);
            });
        });

        document.getElementsByClassName("tableHolder")[0].appendChild(fragment);
    } catch (error) {
        console.error(error.message);
    }
};

const loadData = async (database, table) => {
    try {
        state.tableInUse = table;
        document.getElementsByClassName("dataInsertBtn")[0].removeAttribute("disabled");
        document.getElementsByClassName("TableDisplay")[0].innerHTML = "";

        let response = await fetch(`/get/columns/${database}/${table}`, { method: "GET" });
        if (!response.ok) throw new Error("Failed to fetch columns");

        let columns = await response.json();
        let tableRow = document.createElement("tr");
        document.getElementsByClassName("TableDisplay")[0].appendChild(tableRow);

        columns.forEach(column => {
            let tableData = document.createElement("td");
            tableData.setAttribute("class", "tableDesc");
            tableData.innerHTML = column.Field;
            tableRow.appendChild(tableData);
        });

        response = await fetch(`/Select/data/${database}/${table}`, { method: "GET" });
        if (!response.ok) throw new Error("Failed to fetch data");

        let data = await response.json();
        data.forEach(row => {
            let tableDataRow = document.createElement("tr");
            document.getElementsByClassName("TableDisplay")[0].appendChild(tableDataRow);

            columns.forEach(column => {
                let tableData = document.createElement("td");
                tableData.setAttribute("class", "tableData");
                tableData.innerHTML = row[column.Field];
                tableDataRow.appendChild(tableData);
            });
        });
    } catch (error) {
        console.error(error.message);
    }
};

const resetStyles = (elements, background, color) => {
    for (let i = 0; i < elements.length; i++) {
        elements[i].style.background = background;
        elements[i].style.color = color;
    }
};

const openModal = (name) => {
    let modal = document.getElementsByClassName(name)[0];
    modal.showModal();
    modal.style.display = "flex";
};

const closeModal = (name) => {
    let modal = document.getElementsByClassName(name)[0];
    modal.close();
    modal.style.display = "none";
};

document.getElementsByClassName("ModalClose")[0].addEventListener("click", () => closeModal("NewDatabaseModal"));
document.getElementsByClassName("ModalClose")[1].addEventListener("click", async () => { closeModal("DatabaseUserModal"); });
document.getElementsByClassName("ModalClose")[2].addEventListener("click", () => closeModal("InsertDataModal"));
document.getElementsByClassName("ModalClose")[3].addEventListener("click", () => closeModal("NewTableModal"));
document.getElementsByClassName("BlueBlackBtn")[0].addEventListener("click", async () => {
    openModal("DatabaseUserModal")
    let resopnse = await fetch("/get/users/" + state.dbInUse, {
        method: "GET"
    })
    let data = await resopnse.json()
    if (data.length == 0) {
        let user = data[0]
        document.getElementsByClassName("DatabaseUserModal")[0].innerHTML = `
        <h1 class="ModalClose flex">&#x00D7;</h1>
        <div class="ModalDiv flex">
            <h1 class="ModalH1">USERS:</h1>
        </div>
        `


    }
});
document.getElementsByClassName("BlueBlackBtn")[1].addEventListener("click", () => openModal("NewTableModal"));


document.getElementsByClassName("dataInsertBtn")[0].addEventListener("click", () => {
    document.getElementsByClassName("dataInsertDiv")[0].innerHTML = "";
    for (let i = 0; i < document.getElementsByClassName("tableDesc").length; i++) {
        let div = document.createElement("div");
        let h1 = document.createElement("h1");
        let input = document.createElement("input");

        div.setAttribute("class", "dataInsertRow");
        h1.setAttribute("class", "InsertDataH1");
        input.setAttribute("class", "InsertDataInp");
        input.setAttribute("placeholder", "...");
        input.setAttribute("type", "text");
        h1.innerHTML = document.getElementsByClassName("tableDesc")[i].innerHTML;

        document.getElementsByClassName("dataInsertDiv")[0].appendChild(div);
        div.appendChild(h1);
        div.appendChild(input);
    }
    openModal("InsertDataModal");
});

document.getElementsByClassName("ModalBtn")[0].addEventListener("click", async () => {
    let dbName = document.getElementsByClassName("ModalInp")[0].value;
    const data = { db: dbName };

    try {
        await fetch("/create/database", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        closeModal("NewDatabaseModal");
        fetchDatabases();
    } catch (error) {
        console.error("Failed to create database", error);
    }
});


document.getElementsByClassName("newTableRow")[0].addEventListener("click", () => {
    let div = document.createElement("div");
    let Nameinput = document.createElement("input");
    let DropDown = document.createElement("select");
    let varchar = document.createElement("option");
    let longtext = document.createElement("option");
    let int = document.createElement("option");
    let Boolean = document.createElement("option");

    div.appendChild(Nameinput);
    div.appendChild(DropDown);
    DropDown.appendChild(varchar);
    DropDown.appendChild(longtext);
    DropDown.appendChild(int);

    div.setAttribute("class", "newRow");
    Nameinput.setAttribute("class", "RowName");
    Nameinput.setAttribute("required", "true");
    Nameinput.setAttribute("placeholder", "Column Name");
    Nameinput.setAttribute("maxlength", "50");
    Nameinput.setAttribute("type", "text");
    DropDown.setAttribute("class", "TableType");
    varchar.setAttribute("value", "varchar(255)");
    longtext.setAttribute("value", "longtext");
    int.setAttribute("value", "int");
    Boolean.setAttribute("value", "Boolean");
    varchar.innerHTML = "Short Text";
    longtext.innerHTML = "Multiple Lines of Text";
    int.innerHTML = "Number";
    Boolean.innerHTML = "True/False";

    document.getElementsByClassName("tableRows")[0].appendChild(div);
});

document.getElementsByClassName("TableForm")[0].addEventListener("submit", async (event) => {
    event.preventDefault();
    let tableName = document.getElementsByClassName("TableName")[0].value;
    let tableArray = [];

    for (let i = 0; i < document.getElementsByClassName("newRow").length; i++) {
        let name = document.getElementsByClassName("RowName")[i].value;
        let type = document.getElementsByClassName("TableType")[i].value;
        tableArray.push({ name, type });
    }

    console.log(tableName);
    const data = {
        db: state.dbInUse,
        name: tableName,
        tableArray
    };
    console.log(data);

    try {
        const response = await fetch("/create/table", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error("Failed to create table");
        closeModal("NewTableModal");
        loadTables(state.dbInUse);
    } catch (error) {
        console.error(error.message);
    }
});

// document.getElementsByClassName("username-container")[0].addEventListener("click", () => {

//     console.log("Thing");
// })
for (let i = 0; i < document.getElementsByClassName("dbUserRow").length; i++) {

    document.getElementsByClassName("dbUserRow")[i].addEventListener("click", () => {
        console.log("Thing");

        const username = document.getElementsByClassName('dbUserValue')[i].innerText;
        navigator.clipboard.writeText(username).then(() => {
            const indicator = document.getElementsByClassName('indicator')[i];
            indicator.innerHTML = "Copied!";
            setTimeout(() => {
                indicator.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                stroke="#ffffff" class="indicatorSVG">
                <path stroke-linecap="round" stroke-linejoin="round"
                d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                </svg>
                
                `;
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    })
}


// Insert data
document.getElementById("InsertData").addEventListener("click", async () => {
    let dataArray = [];
    for (let i = 0; i < document.getElementsByClassName("InsertDataInp").length; i++) {
        let rowName = document.getElementsByClassName("InsertDataH1")[i].innerHTML;
        let rowValue = document.getElementsByClassName("InsertDataInp")[i].value;
        dataArray.push({ name: rowName, value: rowValue });
    }

    const data = {
        db: state.dbInUse,
        table: state.tableInUse,
        array: dataArray
    };
    console.log(dataArray);

    try {
        const response = await fetch("/insert/data", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error("Failed to insert data");
        closeModal("InsertDataModal");
        loadData(state.dbInUse, state.tableInUse);
    } catch (error) {
        console.error(error.message);
    }
});


fetchDatabases();
