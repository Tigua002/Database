const state = {
    dbInUse: null,
    tableInUse: null,
    validIP: false,
    blackListedDBs: ["information_schema", "mysql", "performance_schema", "sys"],
    user: null
};

//Header styling
document.getElementsByClassName("navItem")[1].style.background = "#333333";


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
                    state.user = JSON.parse(data).user
                    return true
                }
            });
    }
    return false
}
getToken(localStorage.getItem('token'));


const loadDatabases = async () => {
    await fetch('/checkToken', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: localStorage.getItem('token') })
    }).then(response => response.text())
        .then(data => {
            if (data == 'Unauthorized') {
                console.log("Unauthorized")
                window.location.assign('/login')
                localStorage.clear()
                return false
            } else {
                state.user = JSON.parse(data).user
                return true
            }
        });
    try {
        const response = await fetch("/FetchDatabases",
            {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ owner: state.user })
            });
        if (!response.ok) throw new Error("Failed to fetch databases");

        const databases = await response.json();

        const fragment = document.createDocumentFragment();
        document.getElementsByClassName("databaseDisplays")[0].innerHTML += `            
        <div class="databaseCreation flex">
                <h1 class="databaseTitle">New Database</h1>
                <div class="databaseOther flex">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1"
                    stroke="#444444" class="databaseImage">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                    <h1 class="databaseOwner">-Timur</h1>
                </div>
            </div> `
        document.getElementsByClassName("databaseCreation")[0].addEventListener("click", () => openModal("NewDatabaseModal"));

        databases.forEach(db => {
            if (state.blackListedDBs.includes(db.base)) return;
            let div = document.createElement("div")
            div.setAttribute("class", "database flex")

            let h1 = document.createElement("h1");
            h1.setAttribute("class", "databaseTitle");
            h1.textContent = sanitizeHTML(db.base);


            let other = document.createElement("div")
            other.setAttribute("class", "databaseOther flex")

            let img = document.createElement("img")
            img.setAttribute("class", "databaseImage")
            if (db.picture && db.picture != "NULL") {
                img.setAttribute("src", "../pictures/" + db.picture)
            } else {
                img.setAttribute("src", "../pictures/a-drawing-of-a-planet-with-a-white-background-the--TY7DezedSea11RaW_FXM-w-Bxfwz2PeT6SqBgdEl_TC_w.webp")
            }


            let owner = document.createElement("h1")
            owner.setAttribute("class", "databaseOwner")
            owner.innerHTML = db.owner

            other.appendChild(img)
            other.appendChild(owner)

            div.appendChild(h1)
            div.innerHTML += `
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="#66B2FF" class="databaseIcon">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>`
            div.getElementsByClassName("databaseIcon")[0].addEventListener("click", async () => {
                openModal("DatabaseUserModal")
                state.dbInUse = db.base
                let resopnse = await fetch("/get/users/", {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        database: db.base
                    })
                })
                let data = await resopnse.json()
                if (data.length == 0) {
                    console.log(data);
                    document.getElementById("createUser").style.display = "flex"
                    document.getElementsByClassName("dbUserInfo")[0].style.display = "none"
            
            
                } else {
                    document.getElementById("createUser").style.display = "none"
                    document.getElementsByClassName("dbUserInfo")[0].style.display = "flex"
                    document.getElementsByClassName("dbUserValue")[0].innerHTML = data[0].username
                    document.getElementsByClassName("dbUserValue")[1].innerHTML = data[0].password
                    document.getElementsByClassName("dbUserValue")[2].innerHTML = "172.104.242.87"
                    console.log(data[0].host);
            
                    if (data[0].host == "%") {
                        document.getElementsByClassName("dbUserValue")[3].innerHTML = "all"
                    }
                    else {
                        document.getElementsByClassName("dbUserValue")[3].innerHTML = data[0].host
            
                    }
                }
            })
            div.append(other)
            fragment.appendChild(div);

            div.getElementsByClassName("databaseTitle")[0].addEventListener("click", () => {
                state.dbInUse = db.base
                loadTables(db.base)
                console.log("click");

            })

        });

        document.getElementsByClassName("databaseDisplays")[0].appendChild(fragment);

    } catch (error) {
        console.error(error);
        alert("An error occurred while fetching databases.");
    }
}
const loadTables = async (database) => {
    console.log(database);

    try {
        const dbResponse = await fetch("/FetchDatabases",
            {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ owner: state.user })
            });
        if (!dbResponse.ok) throw new Error("Failed to fetch databases");

        const databases = await dbResponse.json();
        console.log(databases);
        
        for (let i = 0; i < databases.length; i++) {
            const element = databases[i];
            console.log(element);
            if (element.base == database) {
                break
            }

            if (i + 1 == databases.length) {
                window.location.reload()                
            }
            
        }
        /* document.getElementsByClassName("BackButton")[0].textContent = database */
        document.getElementsByClassName("tableHolder")[0].innerHTML = '';
        document.getElementsByClassName("databaseDiv")[0].style.height = '100%';
        document.getElementsByClassName("dataInsertBtn")[0].setAttribute("disabled", "false");
        document.getElementById("alterTable").setAttribute("disabled", "false");
        /*        
       document.getElementsByClassName("BlueBlackBtn")[0].removeAttribute("disabled");
       document.getElementsByClassName("BlueBlackBtn")[1].removeAttribute("disabled");
       document.getElementById("createUser").style.display = "flex";
       document.getElementsByClassName("dbUserInfo")[0].style.display = "flex";
       */
        const data = {
            token: localStorage.getItem('token'),
            db: database
        }

        const response = await fetch(`/get/Tables/`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error("Failed to fetch tables");

        const tables = await response.json();
        const fragment = document.createDocumentFragment();
        console.log(tables);

        tables.forEach(table => {
            let h1 = document.createElement("h1");
            h1.setAttribute("class", "table flex");
            h1.textContent = sanitizeHTML(table[`Tables_in_${database}`]);
            fragment.appendChild(h1);

            h1.addEventListener("click", () => {
                resetStyles(document.getElementsByClassName("table"), "#333333", "#66B2FF");
                h1.style.background = "#66b2ff";
                h1.style.color = "#333333";
                loadData(database, table[`Tables_in_${database}`]);
            });
        });

        document.getElementsByClassName("tableHolder")[0].appendChild(fragment);
        if(document.getElementsByClassName("newTable")[0]){
        
            document.getElementsByClassName("newTable")[0].remove()
        }
        let newTable = document.createElement("h1")
        newTable.setAttribute("class", "newTable")
        newTable.textContent = "New Table"
        newTable.addEventListener("click", () => openModal("NewTableModal"));

        document.getElementsByClassName("dataHeader")[0].appendChild(newTable);

    } catch (error) {
        console.log(error.message);
        alert("An error occurred while fetching tables.");
    }
};


const sanitizeHTML = (str) => {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
};
const resetStyles = (elements, background, color) => {
    Array.from(elements).forEach(element => {
        element.style.background = background;
        element.style.color = color;
    });
};

const loadData = async (database, table) => {
    const dbResponse = await fetch("/FetchDatabases",
        {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ owner: state.user })
        });
    if (!dbResponse.ok) throw new Error("Failed to fetch databases");

    const databases = await dbResponse.json();
    console.log(databases);
    
    for (let i = 0; i < databases.length; i++) {
        const element = databases[i];
        if (element.base == database) {
            break
        }

        if (i + 1 == databases.length) {
            window.location.reload()                
        }
        
    }
    document.getElementsByClassName("dataInsertBtn")[0].removeAttribute("disabled");
    document.getElementById("alterTable").removeAttribute("disabled");
    state.tableInUse = table;
    document.getElementsByClassName("TableDisplay")[0].innerHTML = "";

    const info = {
        token: localStorage.getItem('token'),
        db: database,
        table: table
    }

    const response = await fetch(`/get/columns/`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(info)
    });
    if (!response.ok) throw new Error("Failed to fetch columns");

    let columns = await response.json();
    let tableRow = document.createElement("tr");
    tableRow.setAttribute("class", "tableRow")
    document.getElementsByClassName("TableDisplay")[0].appendChild(tableRow);
    for (let i = 0; i < columns.length; i++) {
        const column = columns[i];
        let tableData = document.createElement("td");
        tableData.setAttribute("class", "tableDesc");
        tableData.innerHTML = column.Field;
        tableRow.appendChild(tableData);
        tableData.style.borderTop = "solid #444444 2px"
        if (i == 0) {
            tableData.style.borderTopLeftRadius = ".5vw"
            tableData.style.borderBottomLeftRadius = ".5vw"
            tableData.style.borderLeft = "solid #444444 2px"
        } else if (i + 1 == columns.length) {
            tableData.style.borderTopRightRadius = ".5vw"
            tableData.style.borderBottomRightRadius = ".5vw"
            tableData.style.borderRight = "solid #444444 2px"

        }
    }
    let addRowBtn = document.createElement("button")
    addRowBtn.setAttribute("class", "addRowBtn")
    addRowBtn.innerHTML = "New column"
    tableRow.appendChild(addRowBtn)
    addRowBtn.addEventListener("click", () => {
        openModal("AppendTableModal")
    })

    const FavDBreq = await fetch('/FavDB', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            token: localStorage.getItem("token"),
            Database: database,
            table: table
        })
    })
    let FavDB = await FavDBreq.json()
    console.log(FavDB)
    if(FavDB.Message){
        document.getElementById("FavDB").style.backgroundColor = "#66b2ff"
        document.getElementById("FavDB").style.color = "#333333"
        document.getElementById("FavDB").innerText = "FAVOURITED"
    } else {
        document.getElementById("FavDB").style.backgroundColor = "#444444"
        document.getElementById("FavDB").style.color = "#66b2ff"
        document.getElementById("FavDB").innerText = "Favorite this table"
    }
    
    const SelectData = {
        token: localStorage.getItem('token'),
        db: database,
        table: table
    }

    const dataResponse = await fetch(`/Select/data/`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(SelectData)
    });
    if (!dataResponse.ok) throw new Error("Failed to fetch data");

    let data = await dataResponse.json();
    data.forEach(row => {
        let tableDataRow = document.createElement("tr");
        tableDataRow.setAttribute("class", "tableRow")
        document.getElementsByClassName("TableDisplay")[0].appendChild(tableDataRow);

        for (let i = 0; i < columns.length; i++) {
            const column = columns[i];
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

        let editDiv = document.createElement("td")
        editDiv.setAttribute("class", "tableEdit")
        let editBtn = document.createElement("button")
        editBtn.setAttribute("class", "editRowBtn")
        editBtn.innerHTML = "EDIT"
        editDiv.appendChild(editBtn)
        tableDataRow.appendChild(editDiv)
        editBtn.style.background = "#B22222"
        editBtn.addEventListener("click", async (event) => {
            let parent = event.target.parentElement.parentElement;
            let collection = Array.from(parent.getElementsByClassName("tableData")); // Convert to array
            let id = collection[0].innerHTML;

            if (event.target.style.background == "rgb(178, 34, 34)") {


                for (let i = 1; i < collection.length; i++) {

                    let element = collection[i];

                    let input = document.createElement("textarea");
                    input.value = element.textContent;
                    input.type = "text";
                    input.setAttribute("class", "tableInput");
                    input.focus()
                    input.select()

                    // Create a new td element if working with a table
                    let newTd = document.createElement("td");
                    newTd.appendChild(input);
                    newTd.setAttribute("class", "tableTD")

                    // Replace the old td element with the new one
                    element.parentNode.replaceChild(newTd, element);
                    event.target.innerHTML = "SUBMIT"
                    event.target.style.background = "#66B2FF"
                    event.target.style.color = "#ffffff"

                }
            } else {

                let itemArray = [];
                let inputs = Array.from(parent.getElementsByClassName("tableInput")); // Convert to array

                inputs.forEach((element) => {
                    itemArray.push(element.value);
                    let h1 = document.createElement("td");
                    h1.setAttribute("class", "tableData");
                    h1.innerHTML = element.value;
                    let parentElm = element.parentElement
                    parentElm.parentNode.replaceChild(h1, parentElm);
                });

                let fieldArray = []

                for (let i = 1; i < document.getElementsByClassName("tableDesc").length; i++) {
                    let element = document.getElementsByClassName("tableDesc")[i];
                    fieldArray.push(element.innerHTML)
                }

                const data = {
                    db: state.dbInUse,
                    tbl: state.tableInUse,
                    id: id,
                    array: itemArray,
                    fieldArr: fieldArray
                }

                await fetch("/update/row", {
                    method: "POST",
                    headers: {
                        'Content-Type': "application/json"
                    },
                    body: JSON.stringify(data)
                })
                event.target.innerHTML = "EDIT"
                event.target.style.background = "#B22222"
                event.target.style.color = "#ffffff"
            }
        });
    });

}
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

function isValidMySQLDatabaseName(name, checkBlackList) {
    let value = checkBlackList || false
    // Check length
    if (name.length > 64) {
        alert("LENGTH")
        return false;
    }
    if (state.blackListedDBs[name] && value) {
        alert("BLACKLIST")
        return false;
    }

    // Check for invalid characters
    const invalidChars = /[^a-zA-Z0-9_$]/;
    if (invalidChars.test(name)) {
        alert("Characters")
        return false;
    }

    // Check if name starts with a dollar sign (deprecated in MySQL 8.0.32 and later)
    if (name.startsWith('$')) {
        alert("dollar")
        return false;
    }

    // Check for reserved words (simplified example, not exhaustive)
    const reservedWords = ["SELECT", "INSERT", "UPDATE", "DELETE", "CREATE", "DROP", "ALTER"];
    if (reservedWords.includes(name.toUpperCase())) {
        alert("Reserved")
        return false;
    }

    // Check for trailing spaces
    if (name.endsWith(' ')) {
        alert("SPACING")
        return false;
    }

    // Check for ASCII NUL and supplementary characters
    if (name.includes('\0') || /[\u{10000}-\u{10FFFF}]/u.test(name)) {
        alert("SOME BULLSHIT")
        return false;
    }

    return true;
}
function isValidIPv4(ip) {
    const ipv4Pattern = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipv4Pattern.test(ip);
}
// adds the code functionality to the user modal
for (let i = 0; i < document.getElementsByClassName("dbUserRow").length; i++) {

    document.getElementsByClassName("dbUserRow")[i].addEventListener("click", () => {

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

/* document.getElementsByClassName("BackButton")[0].addEventListener("click", () => {
    document.getElementsByClassName("databaseDiv")[0].style.height = '0%';
    document.getElementsByClassName("TableDisplay")[0].innerHTML = "";
    document.getElementsByClassName("newTable")[0].remove()
})
document.getElementsByClassName("BackButtonSVG")[0].addEventListener("click", () => {
    document.getElementsByClassName("databaseDiv")[0].style.height = '0%';
    document.getElementsByClassName("TableDisplay")[0].innerHTML = "";
    document.getElementsByClassName("newTable")[0].remove()
}) */


document.getElementsByClassName("ModalClose")[0].addEventListener("click", () => closeModal("NewDatabaseModal"));
document.getElementsByClassName("ModalClose")[1].addEventListener("click", async () => { closeModal("DatabaseUserModal"); }); 
document.getElementsByClassName("ModalClose")[2].addEventListener("click", () => closeModal("InsertDataModal"));
document.getElementsByClassName("ModalClose")[4].addEventListener("click", () => closeModal("NewTableModal"));
document.getElementsByClassName("ModalClose")[6].addEventListener("click", () => closeModal("AppendTableModal"));

document.getElementById("closeModify").addEventListener("click", () => {
    closeModal("ModifyTable")
    loadData(state.dbInUse, state.tableInUse)
});
document.getElementById("closeBulk").addEventListener("click", () => closeModal("BulkDataModal"))


// creates a database
document.getElementsByClassName("ModalBtn")[0].addEventListener("click", async () => {
    let dbName = document.getElementsByClassName("ModalInp")[0].value;
    const data = {
        db: dbName,
        user: state.user
    };
    if (!isValidMySQLDatabaseName(dbName, true)) {
        alert("Invalid Name")
        document.getElementsByClassName("ModalInp")[0].value = ""
        return
    }
    try {
        await fetch("/create/database", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        closeModal("NewDatabaseModal");
        loadDatabases();
    } catch (error) {
        console.error("Failed to create database", error);
    }
});

// opens the alterTable menu
document.getElementById("alterTable").addEventListener("click", async () => {
    document.getElementsByClassName("ModifyHolder")[0].innerHTML = ""
    openModal("ModifyTable")
    const info = {
        token: localStorage.getItem('token'),
        db: state.dbInUse,
        table: state.tableInUse
    }

    const response = await fetch(`/get/columns/`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(info)
    });
    let data = await response.json()

    for (let i = 1; i < data.length; i++) {
        let div = document.createElement("div")
        let separator = document.createElement("div")
        let h1 = document.createElement("h1")
        let select = document.createElement("h1")
        let btnDiv = document.createElement("div")
        let btn = document.createElement("button")
        btnDiv.appendChild(btn)
        separator.appendChild(h1)
        separator.appendChild(select)
        div.appendChild(separator)
        div.appendChild(btnDiv)
        h1.innerHTML = data[i].Field
        select.innerHTML = data[i].Type
        btn.innerHTML = "DELETE"
        btnDiv.setAttribute("class", "modifyBtnDiv")
        separator.setAttribute("class", "modifySeparator flex")
        div.setAttribute("class", "flex modifyDiv")
        h1.setAttribute("class", "modifyH1")
        select.setAttribute("class", "modifySelect")
        btn.setAttribute("class", "modifyBtn")
        document.getElementsByClassName("ModifyHolder")[0].appendChild(div)
        btn.addEventListener("click", async () => {
            const info = {
                db: state.dbInUse,
                table: state.tableInUse,
                column: data[i].Field
            }
            await fetch(`/drop/column/`, {
                method: "POST",
                headers: {
                    'Content-Type': "application/json"
                },
                body: JSON.stringify(info)
            })
            closeModal("ModifyTable")
            document.getElementById("alterTable").click()
        })
    }
})

// opens the insert data modal
document.getElementsByClassName("dataInsertBtn")[0].addEventListener("click", () => {
    document.getElementsByClassName("dataInsertDiv")[0].innerHTML = "";
    for (let i = 1; i < document.getElementsByClassName("tableDesc").length; i++) {
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



// new column to a table
document.getElementById("newColumn").addEventListener("click", async (event) => {
    let tableName = event.target.parentElement.parentElement.getElementsByClassName("RowName")[0].value
    let option = event.target.parentElement.parentElement.getElementsByClassName("TableType")[0].value
    const data = {
        db: state.dbInUse,
        table: state.tableInUse,
        type: option,
        name: tableName
    }
    console.log(data);


    await fetch("/create/column", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    closeModal("AppendTableModal")
    loadData(state.dbInUse, state.tableInUse)
})

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


// create a new user
document.getElementById("createUser").addEventListener("click", (event) => {
    // create input field
    if (document.getElementsByClassName("IpDiv")[0]) {
        document.getElementsByClassName("IpDiv")[0].remove()
    }
    event.target.parentElement.style.display = "none"
    let div = document.createElement("div")
    let label = document.createElement("h1")
    let ipInp = document.createElement("input")
    let btn = document.createElement("button")
    div.appendChild(label)
    div.appendChild(ipInp)
    div.appendChild(btn)

    div.setAttribute("class", "IpDiv")
    ipInp.setAttribute("class", "IpInp")
    label.setAttribute("class", "IpLabel")
    btn.setAttribute("class", "Ipbtn")
    btn.innerHTML = "CREATE"
    label.innerHTML = "IP:"
    ipInp.placeholder = "0.0.0.0 for all ip's"
    ipInp.type = "text"
    document.getElementsByClassName("DatabaseUserModal")[0].appendChild(div)
    ipInp.addEventListener("change", () => {

        state.validIP = isValidIPv4(ipInp.value)

    })
    // create user
    btn.addEventListener("click", async () => {
        if (!state.validIP) {
            alert("Invalid ip")
            return
        }
        let hostIP = document.getElementsByClassName("IpInp")[0].value
        const data = {
            db: state.dbInUse,
            host: hostIP
        }

        await fetch("/create/user", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        window.location.reload()

    })

})


// delete a table
document.getElementsByClassName("removeTbl")[0].addEventListener("click", async () => {
    if (!confirm("Are you sure you want to delete this table?")) {
        return;
    }

    const data = {
        db: state.dbInUse,
        table: state.tableInUse,
    };

    try {
        const response = await fetch('/delete/table', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        closeModal("ModifyTable");
        state.tableInUse = null;
        loadTables(state.dbInUse);
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
});

// inreases the number of rows in a new table
document.getElementsByClassName("newTableRow")[0].addEventListener("click", () => {
    let div = document.createElement("div");
    let Nameinput = document.createElement("input");
    let DropDown = document.createElement("select");
    let varchar = document.createElement("option");
    let longtext = document.createElement("option");
    let int = document.createElement("option");
    let Custom = document.createElement("option");

    div.appendChild(Nameinput);
    div.appendChild(DropDown);
    DropDown.appendChild(varchar);
    DropDown.appendChild(longtext);
    DropDown.appendChild(int);
    DropDown.appendChild(Custom);

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
    Custom.setAttribute("value", "custom");
    varchar.innerHTML = "Short Text";
    longtext.innerHTML = "Multiple Lines of Text";
    int.innerHTML = "Number";
    Custom.innerHTML = "Custom";
    let customInp = document.createElement("input")
    customInp.setAttribute("class", "RowCustom")
    customInp.setAttribute("placeholder", "Column Type")

    div.appendChild(customInp)

    document.getElementsByClassName("tableRows")[0].appendChild(div);
    DropDown.addEventListener("change", () => {
        if (DropDown.value == "custom") {
            customInp.style.display = "block"
        } else {
            customInp.style.display = "none"

        }
    })
});
// creates a new table
document.getElementsByClassName("TableForm")[0].addEventListener("submit", async (event) => {
    event.preventDefault();
    let tableName = document.getElementsByClassName("TableName")[0].value;
    let tableArray = [];
    if (!isValidMySQLDatabaseName(tableName, false)) {
        alert("invalid table name")
        return;
    }

    for (let i = 1; i < document.getElementsByClassName("newRow").length; i++) {
        let name = document.getElementsByClassName("RowName")[i].value;
        let type = document.getElementsByClassName("TableType")[i].value
        if (type == "custom") {
            type = document.getElementsByClassName("RowCustom")[i].value
        }



        tableArray.push({ name, type });
    }

    const data = {
        db: state.dbInUse,
        name: tableName,
        tableArray
    };

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
// bulk insert
document.getElementById("bulkInsert").addEventListener("click", async () => {
    let info = document.getElementsByClassName("BulkArea")[0].value;
    try {
        let parsedInfo = JSON.parse(info); // Directly parse the string
        console.log('Parsed data:', parsedInfo);
        let response = await fetch(`/describe/Table/${state.dbInUse}/${state.tableInUse}`, {
            method: "GET"
        })
        let tableData = await response.json()
        console.log(tableData);

        /*         let tableRows = ''
                for (let i = 0; i < tableData.length; i++) {
                    if (tableData[i].Field == "ID") {
                        continue;
                    }
                    tableRows += tableData[i].Field + " "
                    
                }
        
         */
        let dataConversion = [];
        for (let i = 0; i < document.getElementsByClassName("bulkTable").length; i++) {
            const element = document.getElementsByClassName("bulkTable")[i];
            let desiredValue = element.parentElement.getElementsByClassName("bulkInput")[0].value;


            let arr = { [desiredValue]: element.innerHTML }; // Use computed property name
            dataConversion.push(arr)
        }
        console.log(dataConversion);
        console.log(dataConversion[0]);




        /*         for (let i = 0; i < parsedInfo.length; i++) {
        
                    
                    let row = parsedInfo[i]
                    let string = `INSERT INTO ${state.dbInUse}.${state.tableInUse} (${tableRows}) VALUES (${valueString}); `
        
                    
                } */
    } catch (e) {
        console.log(e);
        alert('Faulty data, paste this inn to ChatGPT: \n i am trying to JSON.parse a string but it does not work, here is the string:');
    }
});
document.getElementById("FavDB").addEventListener("click", async () => {
    let response = await fetch('/setFavDB', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            token: localStorage.getItem("token"),
            db: state.dbInUse,
            tbl: state.tableInUse
        })
    })
    let answer = await response.json()
    console.log(answer);
    if (answer.message = "Successfully updated favorite db") {
        document.getElementById("FavDB").style.backgroundColor = "#36C936"
        document.getElementById("FavDB").style.color = "#333333"
        document.getElementById("FavDB").innerText = "FAVOURITED"
        
    } else {
        console.error("Stinky occurance");
    }
})




loadDatabases()