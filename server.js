// Load all necessary Node.js modules
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mysql = require('mysql2');

// Define the port to use
const PORT = 33345;
app.listen(PORT, () => console.log(`Server is running on port: ${PORT}`));

// Middleware for parsing request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Serve static files from the 'client' directory


// Test database connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: "databaseManager",
    password: "Testing",
    database: "WebChat"
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
    let string = ""
    for (let i = 0; i < req.body.tableArray.length; i++) {
        let table = req.body.tableArray[i]
        if (i == 0) {
            string += `${table.name} ${table.type}`
        } else {
            string += ` ,${table.name} ${table.type}`
        }
    }
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
app.post("/insert/data", function (req, res) {
    let rows = ""
    let values = ""
    for (let i = 0; i < req.body.array.length; i++) {
        let table = req.body.array[i]
        if (i == 0) {
            rows += `${table.name}`
            values += `"${table.values}"`
        } else {
            rows += ` ,${table.name}`
            values += ` ,"${table.values}"`
        }
    }
    connection.query(`use ${req.body.db}`)
    // Use parameterized query to insert user
    connection.query(`INSERT INTO ${req.body.table} (${rows} VALUES (${values}))`, function (err, result) {
        if (err) {
            console.error("Error creating user:", err);
            res.status(500).send(err);
            return;
        }
        res.send(result)
    });
});


app.get('/FetchDatabases', (req, res) => {
    console.log("Recieved")
    connection.query('SHOW DATABASES', function (err, result, fields) {
        console.log(result)
        let data = JSON.parse(JSON.stringify(result));
        console.log(data)
        res.send(data);
    });
});
app.get('/get/Tables/:a', (req, res) => {
    connection.query(`use ${req.params.a}`)
    connection.query('SHOW TABLES', function (err, result, fields) {
        console.log(result)
        let data = JSON.parse(JSON.stringify(result));
        console.log(data)
        res.send(data);
    });
});
app.get('/get/columns/:a/:b', (req, res) => {
    console.log("Recieved")
    connection.query(`use ${req.params.a}`)
    connection.query('DESCRIBE ' + req.params.b, function (err, result, fields) {
        console.log(result)
        let data = JSON.parse(JSON.stringify(result));
        console.log(data)
        res.send(data);
    });
});
app.get('/Select/data/:a/:b', (req, res) => {
    console.log("Recieved")
    connection.query(`use ${req.params.a}`)
    connection.query('SELECT * FROM ' + req.params.b, function (err, result, fields) {
        console.log(result)
        let data = JSON.parse(JSON.stringify(result));
        console.log(data)
        res.send(data);
    });
});




app.use(express.static("public"));
