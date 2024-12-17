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
        window.location.assign('/login')
        localStorage.clear()
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
                    window.location.assign('/login')
                    localStorage.clear()
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

        databases.forEach(db => {
            console.log(db);
            
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
            div.append(other)
            fragment.appendChild(div);

            div.addEventListener("click", ()=> {
                state.dbInUse = db.base
                loadTables(db.base)
            } )

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
        document.getElementsByClassName("BackButton")[0].textContent = database
        document.getElementsByClassName("tableHolder")[0].innerHTML = '';
        document.getElementsByClassName("databaseDiv")[0].style.height = '100%';
/*         document.getElementsByClassName("dataInsertBtn")[0].setAttribute("disabled", "true");
        document.getElementById("alterTable").setAttribute("disabled", "true");
        document.getElementsByClassName("BlueBlackBtn")[0].removeAttribute("disabled");
        document.getElementsByClassName("BlueBlackBtn")[1].removeAttribute("disabled");
        document.getElementById("createUser").style.display = "flex";
        document.getElementsByClassName("dbUserInfo")[0].style.display = "flex";
        
        document.getElementsByClassName("TableDisplay")[0].innerHTML = "";
        document.getElementsByClassName("tableRows")[0].innerHTML = `
        <input type="text" class="TableName" required placeholder="Table Name" maxlength="50">
        <h1 class="ModalH1">ROWS:</h1>
        <div class="newRow">
            <input type="text" class="RowName" required value="ID" maxlength="50" disabled>
            <select class="TableType" disabled>
                <option class="typeOptions" value="int">Number</option>
                <option class="typeOptions" value="varchar(255)">Short Text</option>
                <option class="typeOptions" value="LONGTEXT">Multiple Lines of Text</option>
                <option class="typeOptions" value="custom">Custom</option>
            </select>
            <input type="text" class="RowCustom" placeholder="Column Type">
        </div>
        `; */
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
                h1.style.background = "#444444";
                h1.style.color = "#66b2ff";
                loadData(database, table[`Tables_in_${database}`]);
            });
        });

        document.getElementsByClassName("tableHolder")[0].appendChild(fragment);
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

document.getElementsByClassName("BackButton")[0].addEventListener("click", () => {
    document.getElementsByClassName("databaseDiv")[0].style.height = '0%';
    document.getElementsByClassName("TableDisplay")[0].innerHTML = "";
})
document.getElementsByClassName("BackButtonSVG")[0].addEventListener("click", () => {
    document.getElementsByClassName("databaseDiv")[0].style.height = '0%';
    document.getElementsByClassName("TableDisplay")[0].innerHTML = "";
})

loadDatabases()