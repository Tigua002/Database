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

const fetchDatabases = () => {
    return new Promise((resolve, reject) => {
        connection.query('SHOW DATABASES', function (err, result, fields) {
            if (err) reject(err);
            let data = JSON.parse(JSON.stringify(result));
            resolve(data);
        });
    });
}
const fetchTables = (db) => {
    return new Promise((resolve, reject) => {
        connection.query(`use ${db}`)
        connection.query('SHOW TABLES', function (err, result, fields) {
            if (err) reject(err);
            let data = JSON.parse(JSON.stringify(result));
            resolve(data);
        });
    });
}


router.get('/', async (req, res) => {
    try {
        const dbs = await fetchDatabases();
        res.render('index', { dbs });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});
router.get('/:DB', async (req, res) => {
    try {
        const dbs = await fetchDatabases();
        const tbls = await fetchTables(req.params.DB);
        res.render('index', { dbs, tbls });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});



module.exports = router