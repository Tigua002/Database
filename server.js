// Load all necessary Node.js modules
const express = require('express');
const app = express();
const router = express.Router()
const bodyParser = require('body-parser');
const mysql = require('mysql2');
require("dotenv").config()

// Define the port to use
app.set("view engine", "ejs")
const userRouter = require('./routes/dataspot')
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Dataspot port: ${PORT}`));

// Middleware for parsing request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Serve static files from the 'client' directory


// Test database connection
const connection = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.DBUSER,
    password: process.env.DBPASS,
    database: process.env.DB
});

// Connect to the database with error handling
connection.connect();

// Handle requests

// Serve the index.html file
app.get('/', (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

app.post("/create/database", function (req, res) {

    // Use parameterized query to insert user
    connection.query('CREATE DATABASE ' + req.body.db, function (err, result) {
        if (err) {
            console.error("Error creating user:", err);
            res.status(500).send(err);
            return;
        }
        res.send(result)
    });
});
app.post("/create/table", function (req, res) {
    let string = "ID int auto_increment PRIMARY KEY"
    console.log(req.body.tableArray);

    for (let i = 0; i < req.body.tableArray.length; i++) {
        let table = req.body.tableArray[i]

        string += `, ${table.name} ${table.type}`
        console.log(string);


    }
    console.log(string);

    connection.query(`use ${req.body.db}`)
    // Use parameterized query to insert user
    connection.query(`CREATE TABLE ${req.body.name} (${string})`, function (err, result) {
        if (err) {
            console.error("Error creating user:", err);
            res.status(500).send(err);
            return;
        }
        res.send(result)
    });
});

app.post("/create/column", function (req, res) {
    let name = req.body.name
    let tableType = req.body.type
    connection.query(`use ${req.body.db}`)
    // Use parameterized query to insert user
    connection.query(`ALTER TABLE ${req.body.table} ADD COLUMN ${name} ${tableType}`, function (err, result) {
        if (err) {
            console.error("Error creating user:", err);
            res.status(500).send(err);
            return;
        }
        res.send(result)
    });
});
app.post("/drop/column", function (req, res) {
    let db = req.body.db
    let table = req.body.table
    let column = req.body.column
    connection.query(`use ${db}`)
    // Use parameterized query to insert user
    connection.query(`ALTER TABLE ${table} DROP COLUMN ${column}`, function (err, result) {
        if (err) {
            console.error("Error creating user:", err);
            res.status(500).send(err);
            return;
        }
        res.send(result)
    });
});
app.post("/insert/data", function (req, res) {
    const { array, db, table } = req.body;
    let columns = [];
    let values = [];

    array.forEach(item => {
        if (item.value !== "") {
            columns.push(item.name);
            values.push(item.value);
        }
    });

    if (columns.length === 0) {
        return res.status(400).send("No valid data provided.");
    }

    const columnsString = columns.join(", ");
    const placeholders = values.map(() => "?").join(", ");

    connection.query(`USE ??`, [db], (err) => {
        if (err) {
            console.error("Error selecting database:", err);
            return res.status(500).send(err);
        }

        const query = `INSERT INTO ?? (${columnsString}) VALUES (${placeholders})`;
        connection.query(query, [table, ...values], (err, result) => {
            if (err) {
                console.error("Error inserting data:", err);
                return res.status(500).send(err);
            }
            res.send(result);
        });
    });
});

app.post("/create/user", function (req, res) {
    let chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let host = req.body.host
    let db = req.body.db
    let username = ""
    if (host = "0.0.0.0") {
        host = "%"
    }
    let password = ""

    for (let i = 0; i < 12; i++) {
        username += chars.charAt(Math.floor(Math.random() * chars.length));
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    console.log(`BATCH START \n username: ${username} \n password: ${password} \n host: ${host} \n db: ${db} \n Batch END`);



    connection.query(`use dataSpotUsers`)
    // Use parameterized query to insert user
    connection.query(`INSERT INTO users(username, password, host, database) VALUES ('${username}', '${password}', '${host}', '${db}')`);
    connection.query(`CREATE USER '${username}'@'${host}' IDENTIFIED BY '${password}'`)
    connection.query(`GRANT ALL PRIVILEGES ON ${db}.* TO '${username}'@'${host}'`)
    connection.query("FLUSH PRIVILEGES;")
    res.send(200)
});
app.post("/update/row", function (req, res) {
    const { array, fieldArr, db, tbl, id } = req.body;
    let updates = [];

    array.forEach((value, index) => {
        if (value !== "") {
            updates.push(`${fieldArr[index]} = ?`);
        }
    });

    if (updates.length === 0) {
        return res.status(400).send("No valid data provided.");
    }

    const updateString = updates.join(", ");

    connection.query(`USE ??`, [db], (err) => {
        if (err) {
            console.error("Error selecting database:", err);
            return res.status(500).send(err);
        }

        const query = `UPDATE ?? SET ${updateString} WHERE ID = ?`;
        connection.query(query, [tbl, ...array.filter(value => value !== ""), id], (err, result) => {
            if (err) {
                console.error("Error updating data:", err);
                return res.status(500).send(err);
            }
            res.send(result);
        });
    });
});
app.post('/delete/table', function (req, res) {
    let db = req.body.db
    let table = req.body.table
    connection.query(`DROP TABLE ${db}.${table}`)
    res.send(200)
})


app.get('/FetchDatabases', (req, res) => {
    connection.query('SHOW DATABASES', function (err, result, fields) {
        let data = JSON.parse(JSON.stringify(result));
        res.send(data);
    });
});
app.get('/get/Tables/:a', (req, res) => {
    connection.query(`use ${req.params.a}`)
    connection.query('SHOW TABLES', function (err, result, fields) {
        let data = JSON.parse(JSON.stringify(result));
        res.send(data);
    });
});
app.get('/get/columns/:a/:b', (req, res) => {
    connection.query(`use ${req.params.a}`)
    connection.query('DESCRIBE ' + req.params.b, function (err, result, fields) {
        let data = JSON.parse(JSON.stringify(result));
        res.send(data);
    });
});
app.get('/Select/data/:a/:b', (req, res) => {
    connection.query(`use ${req.params.a}`)
    connection.query('SELECT * FROM ' + req.params.b, function (err, result, fields) {
        let data = JSON.parse(JSON.stringify(result));
        res.send(data);
    });
});
app.get('/get/users/:a', (req, res) => {
    connection.query(`SELECT * FROM dataSpotUsers.users WHERE database= '${req.params.a}'`, function (err, result, fields) {
        let data = JSON.parse(JSON.stringify(result));
        res.send(data);
    });
});





app.use(express.static("public"));
