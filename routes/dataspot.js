const express = require('express');
const router = express.Router();

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
