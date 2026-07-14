const state = {
    dbInUse: null,
    tableInUse: null,
    validIP: false,
    blackListedDBs: [
        "information_schema",
        "mysql",
        "performance_schema",
        "sys",
    ],
    user: null,
};

//Header styling
document.getElementsByClassName("navItem")[1].style.background = "#333333";

const getToken = async (token) => {
    if (!token) {
        localStorage.clear();
        window.location.assign("/login");
        return false;
    } else {
        await fetch("/checkToken", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token: token }),
        })
            .then((response) => response.text())
            .then((data) => {
                if (data == "Unauthorized") {
                    console.log("Unauthorized");
                    localStorage.clear();
                    window.location.assign("/login");
                    return false;
                } else {
                    state.user = JSON.parse(data).user;
                    return true;
                }
            });
    }
    return false;
};
getToken(localStorage.getItem("token"));

const loadDatabases = async () => {
    await fetch("/checkToken", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: localStorage.getItem("token") }),
    })
        .then((response) => response.text())
        .then((data) => {
            if (data == "Unauthorized") {
                console.log("Unauthorized");
                window.location.assign("/login");
                localStorage.clear();
                return false;
            } else {
                state.user = JSON.parse(data).user;
                return true;
            }
        });
    try {
        const response = await fetch("/FetchDatabases", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ owner: state.user }),
        });
        if (!response.ok) throw new Error("Failed to fetch databases");

        const databases = await response.json();

        const fragment = document.createDocumentFragment();
        document.getElementsByClassName("databaseDisplays")[0].innerHTML = "";
        document.getElementsByClassName("databaseDisplays")[0].innerHTML +=
            `            
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
            </div> `;
        document
            .getElementsByClassName("databaseCreation")[0]
            .addEventListener("click", () => openModal("NewDatabaseModal"));

        databases.forEach((db) => {
            if (state.blackListedDBs.includes(db.base)) return;
            let div = document.createElement("div");
            div.setAttribute("class", "database flex");

            let h1 = document.createElement("h1");
            h1.setAttribute("class", "databaseTitle");
            h1.textContent = sanitizeHTML(db.Name || db.base);

            let other = document.createElement("div");
            other.setAttribute("class", "databaseOther flex");

            let img = document.createElement("img");
            img.setAttribute("class", "databaseImage");
            if (db.picture && db.picture != "NULL") {
                img.setAttribute("src", "../pictures/" + db.picture);
            } else {
                img.setAttribute(
                    "src",
                    "../pictures/a-drawing-of-a-planet-with-a-white-background-the--TY7DezedSea11RaW_FXM-w-Bxfwz2PeT6SqBgdEl_TC_w.webp",
                );
            }

            let owner = document.createElement("h1");
            owner.setAttribute("class", "databaseOwner");
            owner.innerHTML = db.owner;

            other.appendChild(img);
            other.appendChild(owner);

            div.appendChild(h1);
            div.innerHTML += `
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="#66B2FF" class="databaseIcon">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>`;
            div.getElementsByClassName("databaseIcon")[0].addEventListener(
                "click",
                async () => {
                    openModal("DatabaseUserModal");
                    state.dbInUse = db.base;
                    let dbresponse = await fetch("/get/users/", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            database: db.base,
                            token: localStorage.getItem("token"),
                        }),
                    });
                    const response = await dbresponse.json();

                    if (response.code != 200) {
                        localStorage.clear();
                        alert(response.message);
                        window.location.assign("/login");
                    }
                    let data = response.data;
                    if (data.length == 0) {
                        document.getElementById("createUser").style.display =
                            "flex";
                        document.getElementsByClassName(
                            "dbUserInfo",
                        )[0].style.display = "none";
                    } else {
                        document.getElementById("createUser").style.display =
                            "none";
                        document.getElementsByClassName(
                            "dbUserInfo",
                        )[0].style.display = "flex";
                        document.getElementsByClassName(
                            "dbUserValue",
                        )[0].innerHTML = data[0].username;
                        document.getElementsByClassName(
                            "dbUserValue",
                        )[1].innerHTML = data[0].password;
                        document.getElementsByClassName(
                            "dbUserValue",
                        )[2].innerHTML = "172.104.242.87";
                        document.getElementsByClassName(
                            "dbUserValue",
                        )[3].textContent = data[0].database;

                        if (data[0].host == "%") {
                            document.getElementsByClassName(
                                "dbUserValue",
                            )[4].innerHTML = "all";
                        } else {
                            document.getElementsByClassName(
                                "dbUserValue",
                            )[4].innerHTML = data[0].host;
                        }
                    }
                },
            );
            div.append(other);
            fragment.appendChild(div);

            div.getElementsByClassName("databaseTitle")[0].addEventListener(
                "click",
                () => {
                    state.dbInUse = db.base;
                    loadTables(db.base);
                },
            );
        });

        document
            .getElementsByClassName("databaseDisplays")[0]
            .appendChild(fragment);
    } catch (error) {
        console.error(error);
        alert("An error occurred while fetching databases.");
    }
};
const loadTables = async (database) => {
    const dbResponse = await fetch("/FetchDatabases", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ owner: state.user }),
    });
    if (!dbResponse.ok) throw new Error("Failed to fetch databases");
    const databases = await dbResponse.json();

    for (let i = 0; i < databases.length; i++) {
        const element = databases[i];

        if (element.base == database) {
            break;
        }

        if (i + 1 == databases.length) {
            window.location.reload();
        }
    }
    document.getElementsByClassName("tableHolder")[0].innerHTML = "";
    document.getElementsByClassName("databaseDiv")[0].style.height = "100%";
    document
        .getElementsByClassName("dataInsertBtn")[0]
        .setAttribute("disabled", "false");
    document.getElementById("alterTable").setAttribute("disabled", "false");

    const data = {
        token: localStorage.getItem("token"),
        db: database,
    };

    const dbresponse = await fetch(`/get/Tables/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    const response = await dbresponse.json();

    if (response.code != 200) {
        localStorage.clear();
        alert(response.message);
        window.location.assign("/login");
    }

    console.log(response);
    const tables = response.data;

    const fragment = document.createDocumentFragment();

    tables.forEach((table) => {
        let h1 = document.createElement("h1");
        h1.setAttribute("class", "table flex");
        h1.textContent = sanitizeHTML(table[`Tables_in_${database}`]);
        fragment.appendChild(h1);

        h1.addEventListener("click", () => {
            resetStyles(
                document.getElementsByClassName("table"),
                "#333333",
                "#66B2FF",
            );
            h1.style.background = "#66b2ff";
            h1.style.color = "#333333";
            loadData(database, table[`Tables_in_${database}`]);
        });
    });

    document.getElementsByClassName("tableHolder")[0].appendChild(fragment);
    if (document.getElementsByClassName("newTable")[0]) {
        document.getElementsByClassName("newTable")[0].remove();
    }
    let newTable = document.createElement("h1");
    newTable.setAttribute("class", "newTable");
    newTable.textContent = "New Table";
    newTable.addEventListener("click", () => openModal("NewTableModal"));

    document.getElementsByClassName("dataHeader")[0].appendChild(newTable);
};

const sanitizeHTML = (str) => {
    const temp = document.createElement("div");
    temp.textContent = str;
    return temp.innerHTML;
};
const resetStyles = (elements, background, color) => {
    Array.from(elements).forEach((element) => {
        element.style.background = background;
        element.style.color = color;
    });
};

const loadData = async (database, table) => {
    const dbResponse = await fetch("/FetchDatabases", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ owner: state.user }),
    });
    if (!dbResponse.ok) throw new Error("Failed to fetch databases");

    const databases = await dbResponse.json();

    for (let i = 0; i < databases.length; i++) {
        const element = databases[i];
        if (element.base == database) {
            break;
        }

        if (i + 1 == databases.length) {
            window.location.reload();
        }
    }
    document
        .getElementsByClassName("dataInsertBtn")[0]
        .removeAttribute("disabled");
    document.getElementById("alterTable").removeAttribute("disabled");
    state.tableInUse = table;
    document.getElementsByClassName("TableDisplay")[0].innerHTML = "";

    const info = {
        token: localStorage.getItem("token"),
        db: database,
        table: table,
    };

    const dbresponsea = await fetch(`/get/columns/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(info),
    });
    const responsea = await dbresponsea.json();

    if (responsea.code != 200) {
        localStorage.clear();
        alert(responsea.message);
        window.location.assign("/login");
    }

    let columns = responsea.data;

    let tableRow = document.createElement("tr");
    tableRow.setAttribute("class", "tableRow");
    document.getElementsByClassName("TableDisplay")[0].appendChild(tableRow);
    for (let i = 0; i < columns.length; i++) {
        const column = columns[i];
        let tableData = document.createElement("td");
        tableData.setAttribute("class", "tableDesc");
        tableData.innerHTML = column.Field;
        tableRow.appendChild(tableData);
        tableData.style.borderTop = "solid #444444 2px";
        if (i == 0) {
            tableData.style.borderTopLeftRadius = ".5vw";
            tableData.style.borderBottomLeftRadius = ".5vw";
            tableData.style.borderLeft = "solid #444444 2px";
        } else if (i + 1 == columns.length) {
            tableData.style.borderTopRightRadius = ".5vw";
            tableData.style.borderBottomRightRadius = ".5vw";
            tableData.style.borderRight = "solid #444444 2px";
        }
    }
    let addRowBtn = document.createElement("button");
    addRowBtn.setAttribute("class", "addRowBtn");
    addRowBtn.innerHTML = "New column";
    tableRow.appendChild(addRowBtn);
    addRowBtn.addEventListener("click", () => {
        openModal("AppendTableModal");
    });

    const FavDBreq = await fetch("/FavDB", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            token: localStorage.getItem("token"),
            Database: database,
            table: table,
        }),
    });
    let FavDB = await FavDBreq.json();
    if (FavDB.Message) {
        document.getElementById("FavDB").style.backgroundColor = "#66b2ff";
        document.getElementById("FavDB").style.color = "#333333";
        document.getElementById("FavDB").innerText = "FAVOURITED";
    } else {
        document.getElementById("FavDB").style.backgroundColor = "#444444";
        document.getElementById("FavDB").style.color = "#66b2ff";
        document.getElementById("FavDB").innerText = "Favorite this table";
    }

    const SelectData = {
        token: localStorage.getItem("token"),
        db: database,
        table: table,
    };

    const dataResponse = await fetch(`/Select/data/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(SelectData),
    });
    
    const datadbresponse = await dataResponse.json();

    if (datadbresponse.code != 200) {
        localStorage.clear();
        alert(datadbresponse.message);
        window.location.assign("/login");
    }
    
    let data = datadbresponse.data;
    
    data.forEach((row) => {
        let tableDataRow = document.createElement("tr");
        tableDataRow.setAttribute("class", "tableRow");
        document
            .getElementsByClassName("TableDisplay")[0]
            .appendChild(tableDataRow);

        for (let i = 0; i < columns.length; i++) {
            const column = columns[i];
            let rowValue = row[column.Field];
            let tableData = document.createElement("td");
            tableData.setAttribute("class", "tableData");
            tableData.innerHTML = rowValue || "NULL";
            if (tableData.innerHTML == "NULL") {
                tableData.style.opacity = ".5";
            }

            let value = "text";

            if (column.Type == "int(11)") {
                value = "number";
            } else if (column.Type == "date") {
                value = "date";
                rowValue = new Date(rowValue);
                tableData.innerHTML = `${String(rowValue.getDate()).padStart(2, "0")}.${String(rowValue.getMonth() + 1).padStart(2, "0")}.${rowValue.getFullYear()}`;
            } else if (column.Type == "varchar(255)") {
                tableData.setAttribute("maxlength", "254");
            }
            tableData.setAttribute("data-type", value);
            tableData.setAttribute("data-value", rowValue);
            tableDataRow.appendChild(tableData);
        }

        let editDiv = document.createElement("td");
        let delDiv = document.createElement("td");
        editDiv.setAttribute("class", "tableEdit");
        delDiv.setAttribute("class", "tableEdit");
        let editBtn = document.createElement("button");
        let delBtn = document.createElement("button");
        editBtn.setAttribute("class", "editRowBtn");
        editBtn.innerHTML = "Edit";
        editDiv.appendChild(editBtn);
        delBtn.setAttribute("class", "editRowBtn");
        delBtn.innerHTML = "Delete";
        delDiv.appendChild(delBtn);
        tableDataRow.appendChild(editDiv);
        tableDataRow.appendChild(delDiv);
        editBtn.style.background = "#B22222";

        delBtn.addEventListener("click", async (event) => {
            let parent = event.target.parentElement.parentElement;
            let collection = Array.from(
                parent.getElementsByClassName("tableData"),
            ); // Convert to array
            let id = collection[0].innerHTML;

            try {
                let response = await fetch("/delete/row/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        sessionID: localStorage.getItem("token"),
                        db: state.dbInUse,
                        table: state.tableInUse,
                        ID: id,
                    }),
                });
                if ((response.status = 200)) {
                    loadData(state.dbInUse, state.tableInUse);
                }
            } catch (err) {
                console.log(err);
            }
        });
        editBtn.addEventListener("click", async (event) => {
            let parent = event.target.parentElement.parentElement;
            let collection = Array.from(
                parent.getElementsByClassName("tableData"),
            ); // Convert to array
            let id = collection[0].innerHTML;

            if (event.target.style.background == "rgb(178, 34, 34)") {
                for (let i = 1; i < collection.length; i++) {
                    let element = collection[i];

                    let input = document.createElement("input");
                    input.value = element.dataset.value;
                    if (element.dataset.type == "date") {
                        let tempValue = new Date(element.dataset.value);
                        input.value = `${tempValue.getFullYear()}-${String(tempValue.getMonth() + 1).padStart(2, "0")}-${String(tempValue.getDate()).padStart(2, "0")}`;
                    }

                    input.type = element.dataset.type;
                    input.setAttribute("class", "tableInput");
                    input.focus();
                    input.select();

                    // Create a new td element if working with a table
                    let newTd = document.createElement("td");
                    newTd.appendChild(input);
                    newTd.setAttribute("class", "tableTD");

                    // Replace the old td element with the new one
                    element.parentNode.replaceChild(newTd, element);
                    event.target.innerHTML = "SUBMIT";
                    event.target.style.background = "#66B2FF";
                    event.target.style.color = "#ffffff";
                }
            } else {
                let itemArray = [];
                let inputs = Array.from(
                    parent.getElementsByClassName("tableInput"),
                ); // Convert to array

                inputs.forEach((element) => {
                    itemArray.push(element.value);
                    let h1 = document.createElement("td");
                    h1.setAttribute("class", "tableData");
                    h1.setAttribute("data-type", element.getAttribute("type"));
                    h1.setAttribute("data-value", element.value);
                    h1.innerHTML = element.value;
                    if (element.getAttribute("type") == "date") {
                        rowValue = new Date(element.value);
                        h1.innerHTML = `${String(rowValue.getDate()).padStart(2, "0")}.${String(rowValue.getMonth() + 1).padStart(2, "0")}.${rowValue.getFullYear()}`;
                    }
                    let parentElm = element.parentElement;
                    parentElm.parentNode.replaceChild(h1, parentElm);
                });

                let fieldArray = [];

                for (
                    let i = 1;
                    i < document.getElementsByClassName("tableDesc").length;
                    i++
                ) {
                    let element =
                        document.getElementsByClassName("tableDesc")[i];
                    fieldArray.push(element.innerHTML);
                }

                const data = {
                    db: state.dbInUse,
                    tbl: state.tableInUse,
                    id: id,
                    array: itemArray,
                    fieldArr: fieldArray,
                };

                await fetch("/update/row", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data),
                });
                event.target.innerHTML = "EDIT";
                event.target.style.background = "#B22222";
                event.target.style.color = "#ffffff";
            }
        });
    });
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

function isValidMySQLDatabaseName(name, checkBlackList) {
    let value = checkBlackList || false;
    // Check length
    if (name.length > 64) {
        alert("LENGTH");
        return false;
    }
    if (state.blackListedDBs[name] && value) {
        alert("BLACKLIST");
        return false;
    }

    // Check for invalid characters
    const invalidChars = /[^a-zA-Z0-9_$]/;
    if (invalidChars.test(name)) {
        alert("Characters");
        return false;
    }

    // Check if name starts with a dollar sign (deprecated in MySQL 8.0.32 and later)
    if (name.startsWith("$")) {
        alert("dollar");
        return false;
    }

    // Check for reserved words (simplified example, not exhaustive)
    const reservedWords = [
        "SELECT",
        "INSERT",
        "UPDATE",
        "DELETE",
        "CREATE",
        "DROP",
        "ALTER",
    ];
    if (reservedWords.includes(name.toUpperCase())) {
        alert("Reserved");
        return false;
    }

    // Check for trailing spaces
    if (name.endsWith(" ")) {
        alert("SPACING");
        return false;
    }

    // Check for ASCII NUL and supplementary characters
    if (name.includes("\0") || /[\u{10000}-\u{10FFFF}]/u.test(name)) {
        alert("SOME BULLSHIT");
        return false;
    }

    return true;
}
function isValidIPv4(ip) {
    const ipv4Pattern =
        /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipv4Pattern.test(ip);
}
// adds the code functionality to the user modal
for (let i = 0; i < document.getElementsByClassName("dbUserRow").length; i++) {
    document
        .getElementsByClassName("dbUserRow")
        [i].addEventListener("click", () => {
            const username =
                document.getElementsByClassName("dbUserValue")[i].innerText;
            navigator.clipboard
                .writeText(username)
                .then(() => {
                    const indicator =
                        document.getElementsByClassName("indicator")[i];
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
                })
                .catch((err) => {
                    console.error("Failed to copy: ", err);
                });
        });
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

document
    .getElementsByClassName("ModalClose")[0]
    .addEventListener("click", () => closeModal("NewDatabaseModal"));
document
    .getElementsByClassName("ModalClose")[1]
    .addEventListener("click", async () => {
        closeModal("DatabaseUserModal");
    });
document
    .getElementsByClassName("ModalClose")[2]
    .addEventListener("click", () => closeModal("InsertDataModal"));
document
    .getElementsByClassName("ModalClose")[4]
    .addEventListener("click", () => closeModal("NewTableModal"));
document
    .getElementsByClassName("ModalClose")[6]
    .addEventListener("click", () => closeModal("AppendTableModal"));

document.getElementById("closeModify").addEventListener("click", () => {
    closeModal("ModifyTable");
    loadData(state.dbInUse, state.tableInUse);
});
document
    .getElementById("closeBulk")
    .addEventListener("click", () => closeModal("BulkDataModal"));

// creates a database
document
    .getElementsByClassName("ModalBtn")[0]
    .addEventListener("click", async () => {
        let dbName = document.getElementsByClassName("ModalInp")[0].value;
        const data = {
            db: dbName,
            user: state.user,
        };
        if (!isValidMySQLDatabaseName(dbName, true)) {
            alert("Invalid Name");
            document.getElementsByClassName("ModalInp")[0].value = "";
            return;
        }
        try {
            await fetch("/create/database", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            closeModal("NewDatabaseModal");
            loadDatabases();
        } catch (error) {
            console.error("Failed to create database", error);
        }
    });

// opens the alterTable menu
document.getElementById("alterTable").addEventListener("click", async () => {
    document.getElementsByClassName("ModifyHolder")[0].innerHTML = "";
    openModal("ModifyTable");
    const info = {
        token: localStorage.getItem("token"),
        db: state.dbInUse,
        table: state.tableInUse,
    };

    const dbresponse = await fetch(`/get/columns/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(info),
    });

    const response = await dbresponse.json();

    if (response.code != 200) {
        localStorage.clear();
        alert(response.message);
        window.location.assign("/login");
    }
    let data = response.data;

    for (let i = 1; i < data.length; i++) {
        let div = document.createElement("div");
        let separator = document.createElement("div");
        let h1 = document.createElement("h1");
        let select = document.createElement("h1");
        let btnDiv = document.createElement("div");
        let btn = document.createElement("button");
        btnDiv.appendChild(btn);
        separator.appendChild(h1);
        separator.appendChild(select);
        div.appendChild(separator);
        div.appendChild(btnDiv);
        h1.innerHTML = data[i].Field;
        select.innerHTML = data[i].Type;
        btn.innerHTML = "DELETE";
        btnDiv.setAttribute("class", "modifyBtnDiv");
        separator.setAttribute("class", "modifySeparator flex");
        div.setAttribute("class", "flex modifyDiv");
        h1.setAttribute("class", "modifyH1");
        select.setAttribute("class", "modifySelect");
        btn.setAttribute("class", "modifyBtn");
        document.getElementsByClassName("ModifyHolder")[0].appendChild(div);
        btn.addEventListener("click", async () => {
            const info = {
                db: state.dbInUse,
                table: state.tableInUse,
                column: data[i].Field,
            };
            await fetch(`/drop/column/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(info),
            });
            closeModal("ModifyTable");
            document.getElementById("alterTable").click();
        });
    }
});

// opens the insert data modal
document
    .getElementsByClassName("dataInsertBtn")[0]
    .addEventListener("click", () => {
        document.getElementsByClassName("dataInsertDiv")[0].innerHTML = "";
        for (
            let i = 1;
            i < document.getElementsByClassName("tableDesc").length;
            i++
        ) {
            let div = document.createElement("div");
            let h1 = document.createElement("h1");
            let input = document.createElement("input");

            div.setAttribute("class", "dataInsertRow");
            h1.setAttribute("class", "InsertDataH1");
            input.setAttribute("class", "InsertDataInp");
            input.setAttribute("placeholder", "...");
            input.setAttribute("type", "text");
            h1.innerHTML =
                document.getElementsByClassName("tableDesc")[i].innerHTML;

            document
                .getElementsByClassName("dataInsertDiv")[0]
                .appendChild(div);
            div.appendChild(h1);
            div.appendChild(input);
        }
        openModal("InsertDataModal");
    });

// new column to a table
document
    .getElementById("newColumn")
    .addEventListener("click", async (event) => {
        let tableName =
            event.target.parentElement.parentElement.getElementsByClassName(
                "RowName",
            )[0].value;
        let option =
            event.target.parentElement.parentElement.getElementsByClassName(
                "TableType",
            )[0].value;
        const data = {
            db: state.dbInUse,
            table: state.tableInUse,
            type: option,
            name: tableName,
        };

        await fetch("/create/column", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
        closeModal("AppendTableModal");
        loadData(state.dbInUse, state.tableInUse);
    });

// Insert data
document.getElementById("InsertData").addEventListener("click", async () => {
    let dataArray = [];
    for (
        let i = 0;
        i < document.getElementsByClassName("InsertDataInp").length;
        i++
    ) {
        let rowName =
            document.getElementsByClassName("InsertDataH1")[i].innerHTML;
        let rowValue =
            document.getElementsByClassName("InsertDataInp")[i].value;
        dataArray.push({ name: rowName, value: rowValue });
    }

    const data = {
        db: state.dbInUse,
        table: state.tableInUse,
        array: dataArray,
    };

    try {
        const response = await fetch("/insert/data", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
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
        document.getElementsByClassName("IpDiv")[0].remove();
    }
    event.target.parentElement.style.display = "none";
    let div = document.createElement("div");
    let label = document.createElement("h1");
    let ipInp = document.createElement("input");
    let btn = document.createElement("button");
    div.appendChild(label);
    div.appendChild(ipInp);
    div.appendChild(btn);

    div.setAttribute("class", "IpDiv");
    ipInp.setAttribute("class", "IpInp");
    label.setAttribute("class", "IpLabel");
    btn.setAttribute("class", "Ipbtn");
    btn.innerHTML = "CREATE";
    label.innerHTML = "IP:";
    ipInp.placeholder = "0.0.0.0 for all ip's";
    ipInp.type = "text";
    document.getElementsByClassName("DatabaseUserModal")[0].appendChild(div);
    ipInp.addEventListener("change", () => {
        state.validIP = isValidIPv4(ipInp.value);
    });
    // create user
    btn.addEventListener("click", async () => {
        if (!state.validIP) {
            alert("Invalid ip");
            return;
        }
        let hostIP = document.getElementsByClassName("IpInp")[0].value;
        const data = {
            db: state.dbInUse,
            host: hostIP,
        };

        await fetch("/create/user", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
        window.location.reload();
    });
});

// delete a table
document
    .getElementsByClassName("removeTbl")[0]
    .addEventListener("click", async () => {
        if (!confirm("Are you sure you want to delete this table?")) {
            return;
        }

        const data = {
            db: state.dbInUse,
            table: state.tableInUse,
        };

        try {
            const response = await fetch("/delete/table", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            closeModal("ModifyTable");
            state.tableInUse = null;
            loadTables(state.dbInUse);
        } catch (error) {
            console.error(
                "There was a problem with the fetch operation:",
                error,
            );
        }
    });

// inreases the number of columns in a new table
document
    .getElementsByClassName("newTableRow")[0]
    .addEventListener("click", () => {
        let div = document.createElement("div");
        let Nameinput = document.createElement("input");
        let DropDown = document.createElement("select");
        let varchar = document.createElement("option");
        let longtext = document.createElement("option");
        let int = document.createElement("option");
        let dateOpt = document.createElement("option");
        let Custom = document.createElement("option");
        let svgDiv = document.createElement("div");
        svgDiv.innerHTML += `<svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="svgColumn"
                            data-type="svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke-width="1.5"
                            stroke="#ffffff"
                            class="size-6"
                        >
                            <path
                                data-type="path"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                            />
                        </svg>`;
        div.appendChild(svgDiv);
        div.appendChild(Nameinput);
        div.appendChild(DropDown);
        DropDown.appendChild(varchar);
        DropDown.appendChild(longtext);
        DropDown.appendChild(int);
        DropDown.appendChild(dateOpt);
        DropDown.appendChild(Custom);

        div.setAttribute("class", "newColumn flex");
        Nameinput.setAttribute("class", "RowName");
        Nameinput.setAttribute("required", "true");
        Nameinput.setAttribute("placeholder", "Column Name");
        Nameinput.setAttribute("maxlength", "50");
        Nameinput.setAttribute("type", "text");
        DropDown.setAttribute("class", "TableType");
        varchar.setAttribute("value", "varchar(255)");
        longtext.setAttribute("value", "longtext");
        int.setAttribute("value", "int");
        dateOpt.setAttribute("value", "date");
        Custom.setAttribute("value", "custom");
        varchar.setAttribute("class", "typeOptions");
        longtext.setAttribute("class", "typeOptions");
        int.setAttribute("class", "typeOptions");
        dateOpt.setAttribute("class", "typeOptions");
        Custom.setAttribute("class", "typeOptions");
        varchar.innerHTML = "Short Text";
        longtext.innerHTML = "Multiple Lines of Text";
        int.innerHTML = "Number";
        dateOpt.innerHTML = "Date";
        Custom.innerHTML = "Custom";
        let customInp = document.createElement("input");
        customInp.setAttribute("class", "RowCustom");
        customInp.setAttribute("placeholder", "Column Type");

        div.appendChild(customInp);

        document.getElementsByClassName("tableRows")[0].appendChild(div);
        DropDown.addEventListener("change", () => {
            if (DropDown.value == "custom") {
                customInp.style.display = "block";
            } else {
                customInp.style.display = "none";
            }
        });

        // remove column
        svgDiv.addEventListener("click", (e) => {
            if (e.target.dataset.type == "path") {
                e.target.parentElement.parentElement.parentElement.remove();
            } else {
                e.target.parentElement.parentElement.remove();
            }
        });
    });
// creates a new table
document
    .getElementsByClassName("TableForm")[0]
    .addEventListener("submit", async (event) => {
        event.preventDefault();
        let tableName = document.getElementsByClassName("TableName")[0].value;
        let tableArray = [];
        if (!isValidMySQLDatabaseName(tableName, false)) {
            alert("invalid table name");
            return;
        }

        for (
            let i = 1;
            i < document.getElementsByClassName("RowName").length - 1;
            i++
        ) {
            let name = document.getElementsByClassName("RowName")[i].value;
            let type = document.getElementsByClassName("TableType")[i].value;
            if (type == "custom") {
                type = document.getElementsByClassName("RowCustom")[i].value;
            }

            tableArray.push({ name, type });
        }

        const data = {
            db: state.dbInUse,
            name: tableName,
            tableArray,
        };

        try {
            const response = await fetch("/create/table", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
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
        let response = await fetch(
            `/describe/Table/${state.dbInUse}/${state.tableInUse}`,
            {
                method: "GET",
            },
        );
        let tableData = await response.json();
        let dataConversion = [];
        for (
            let i = 0;
            i < document.getElementsByClassName("bulkTable").length;
            i++
        ) {
            const element = document.getElementsByClassName("bulkTable")[i];
            let desiredValue =
                element.parentElement.getElementsByClassName("bulkInput")[0]
                    .value;

            let arr = { [desiredValue]: element.innerHTML }; // Use computed property name
            dataConversion.push(arr);
        }
    } catch (e) {
        console.log(e);
        alert(
            "Faulty data, paste this inn to ChatGPT: \n i am trying to JSON.parse a string but it does not work, here is the string:",
        );
    }
});
document.getElementById("FavDB").addEventListener("click", async () => {
    let response = await fetch("/setFavDB", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            token: localStorage.getItem("token"),
            db: state.dbInUse,
            tbl: state.tableInUse,
        }),
    });
    let answer = await response.json();
    if ((answer.message = "Successfully updated favorite db")) {
        document.getElementById("FavDB").style.backgroundColor = "#36C936";
        document.getElementById("FavDB").style.color = "#333333";
        document.getElementById("FavDB").innerText = "FAVOURITED";
    } else {
        console.error("Stinky occurance");
    }
});

loadDatabases();
