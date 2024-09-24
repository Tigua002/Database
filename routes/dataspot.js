const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const mysql = require('mysql2')
require("dotenv").config()

// Test database connection
const connection = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.DBUSER,
    password: process.env.DBPASS,
    database: process.env.DB
});

// Connect to the database with error handling
connection.connect();

app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const fetchDatabases = () => {
    return new Promise((resolve, reject) => {
        connection.query('SHOW DATABASES', function (err, result, fields) {
            if (err) reject(err);
            let data = JSON.parse(JSON.stringify(result));
            resolve(data);
        });
    });
};

const fetchTables = (dbName) => {
    return new Promise((resolve, reject) => {
        connection.query(`SHOW TABLES FROM ${dbName}`, function (err, result, fields) {
            if (err) reject(err);
            let data = JSON.parse(JSON.stringify(result));
            resolve(data);
        });
    });
};

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
    console.log(req.params.DB);
    try {
        const dbs = await fetchDatabases();
        const tbls = await fetchTables(req.params.DB);
        res.render('index', { dbs, tbls });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
