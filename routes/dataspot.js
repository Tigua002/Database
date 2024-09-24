// Load all necessary Node.js modules
const express = require('express');
const router = express.Router()
const bodyParser = require('body-parser');
const mysql = require('mysql2');
require("dotenv").config()

// Define the port to use

// // Middleware for parsing request bodies
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));

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

const fetchDatabases = async () => {
    connection.query('SHOW DATABASES', function (err, result, fields) {
        let data = JSON.parse(JSON.stringify(result));
        return data;
    });
}

router.get('/', (req, res) => {
    res.render('index', {dbs: fetchDatabases()});
})
