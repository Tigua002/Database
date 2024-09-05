// Load all necessary Node.js modules
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mysql = require('mysql2');

// Define the port to use
const PORT = 5000;
app.listen(PORT, () => console.log(`Server is running on port: ${PORT}`));

// Middleware for parsing request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Serve static files from the 'client' directory
app.use(express.static("client"));

// Test database connection
const connection = mysql.createConnection({
    host: '172.104.242.87',
    user: "databaseManager",
    password: "Testing",
    database: "WebChat"
});

// Connect to the database with error handling
connection.connect();

// Handle requests

// Serve the index.html file
app.get('/', (req, res) => {
    res.sendFile(__dirname + "/client/index.html");
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
