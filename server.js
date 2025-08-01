// Load all necessary Node.js modules
require("dotenv").config()
const express = require('express');
const useragent = require('express-useragent');
const app = express();
const { exec } = require('child_process');
app.set('trust proxy', 'loopback');
app.set('trust proxy', 1);
const geoip = require('geoip-lite');
const testing = process.env.TEST
const path = require('path');
const multer = require('multer');
const upload = multer({ dest: 'public/userFiler/', fileSize: 50 * 1024 * 1024 });
const PORT = process.env.DataspotPORT;
app.listen(PORT, () => console.log(`Dataspot port: ${PORT}`));


// Middleware for parsing request bodies
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(useragent.express());
const mysql = require('mysql2');
// Test database connection
const connection = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.DBUSER,
    password: process.env.DBPASS,
    database: process.env.DB
});

// Connect to the database with error handling
connection.connect();
if (!testing) {
    connection.query("DELETE FROM dataSpotUsers.sessions WHERE ID > 0")

}

const https = require('https');
const fs = require('fs');
const WebSocket = require('ws');
const pm2 = require('pm2');
const md5 = require('md5');
var wss;
var server
if (!testing) {
    const serverOptions = {
        cert: fs.readFileSync(process.env.FULLCHAIN),
        key: fs.readFileSync(process.env.PRIVKEY)
    };
    server = https.createServer(serverOptions);

    wss = new WebSocket.Server({ server }, () => {
        console.log('WebSocket server listening on port 8080');
    });

}

const state = {
    filePath: process.env.FILEPATH,
    errorPath: process.env.ERRORPATH,
    targetProcess: process.env.TARGET,
    bashPath: process.env.BASH

}

// Serve the index.html file
app.get('/', (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});
app.get('/ip', (req, res) => {
    const ip = req.headers['cf-connecting-ip'] ||
        req.headers['x-real-ip'] ||
        req.headers['x-forwarded-for'] || "171.23.129.37"
    const location = geoip.lookup(ip);
    const source = req.headers['user-agent'];
    const ua = useragent.parse(source);
    return res.json({ ip, location, ua });

});

// Console
app.get('/file/:a/:b/:c', (req, res) => {
    let file = "";
    let error = "";
    let filePath = `../../.pm2/logs/${req.params.a}-out.log`
    let errorPath = `../../.pm2/logs/${req.params.a}-error.log`
    state.filePath = filePath
    state.errorPath = errorPath
    let targetProcess = req.params.b
    let bashPath = req.params.c

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading file');
        }
        file = data;

        fs.readFile(errorPath, 'utf8', (err, dataThing) => {
            if (err) {
                return res.status(500).send('Error reading file');
            }
            error = dataThing;

            let body = {
                data: file,
                err: error
            };
            res.send(body);
        });
    });
});
app.post('/processes', (req, res) => {
    connection.query("SELECT * FROM dataSpotUsers.processes WHERE owner = ?", [req.body.mail], (err, result) => {
        if (err) {
            console.error("Error fetching processes:", err);
            return res.status(500).send("Error fetching processes");
        }

        let data = JSON.parse(JSON.stringify(result));
        let blackListedProcesses = ["test", "Datatest"];
        let sendData = [];

        for (let i = 0; i < data.length; i++) {
            if (!blackListedProcesses.includes(data[i].Name)) {
                sendData.push(data[i]);
            }
        }

        res.status(200).json(sendData);
    });
});
app.post('/checkToken', (req, res) => {
    connection.execute("SELECT * FROM dataSpotUsers.sessions WHERE token = ?", [req.body.token], (err, result) => {
        if (err) {
            res.status(500).send('Error checking token');
            return;
        }
        if (result.length === 0) {
            res.status(401).send('Unauthorized');
            return;
        }
        res.status(200).send(result[0]);
    });
});

app.post('/start/server/:process', (req, res) => {
    exec('pm2 start ' + req.params.process, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing command: ${error.message}`);
            res.status(500).send('Error starting server');
            return;
        }
        if (stderr) {
            console.error(`Error output: ${stderr}`);
            res.status(500).send('Error starting server');
            return;
        }
        res.status(200).send('Server started successfully');
    });
});
app.post('/restart/server/:process', (req, res) => {
    exec('pm2 restart ' + req.params.process, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing command: ${error.message}`);
            res.status(500).send('Error starting server');
            return;
        }
        if (stderr) {
            console.error(`Error output: ${stderr}`);
            res.status(500).send('Error starting server');
            return;
        }
        fs.appendFile(state.filePath, "Server shut down  \n", (err) => {
            if (err) {
                console.error('Failed to write to file', err);
            }
        })
        res.status(200).send('Server restarted successfully');
    });
});

app.post('/pull/server/:process', (req, res) => {
    connection.execute(`SELECT * FROM dataSpotUsers.processes WHERE Name = '${req.params.process}' `, (err, result) => {
        if (err) {
            console.error(`Database error: ${err.message}`);
            res.status(500).send('Database error');
            return;
        }


        let data = JSON.parse(JSON.stringify(result));
        let bashPath = data[0];

        exec(`cd ${bashPath.BashPath} \n bash ${bashPath.Name}.sh`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing command: ${error.message}`);
                res.status(500).send('Error starting server');
                return;
            }
            if (stderr) {
                console.error(`Error output: ${stderr}`);
                res.status(500).send('Error starting server');
                return;
            }

            fs.appendFile(state.filePath, "Server shut down  \n", (err) => {
                if (err) {
                    console.log(err);
                    
                    console.error('Failed to write to file', err);
                }
            });

            res.status(200).send('Server started successfully');
        });
    });
});


app.post('/stop/server/:process', (req, res) => {
    exec('pm2 stop ' + req.params.process, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing command: ${error.message}`);
            res.status(500).send('Error stopping server');
            return;
        }
        if (stderr) {
            console.error(`Error output: ${stderr}`);
            res.status(500).send('Error stopping server');
            return;
        }
        fs.appendFile(state.filePath, "Server shut down \n", (err) => {
            if (err) {
                console.error('Failed to write to file', err);
            }
        })
        res.status(200).send('Server stopped successfully');
    });
});
app.get('/status/server/:process', (req, res) => {
    const appName = req.params.process;

    if (!appName) {
        res.status(400).send({ error: 'App name is required' });
        return;
    }

    pm2.connect((err) => {
        if (err) {
            res.status(500).send({ error: 'Failed to connect to PM2' });
            return;
        }

        pm2.describe(appName, (err, processDescription) => {
            if (err) {
                res.status(500).send({ error: 'Failed to get process description' });
                pm2.disconnect();
                return;
            }
            res.send(processDescription[0].pm2_env.status);
            pm2.disconnect();
        });
    });
});
app.post('/clear/files', (req, res) => {
    let secondPath = "";
    if (req.body.dataType === "CLEAR ERRORS") {
        secondPath = "error";
    } else {
        secondPath = "out";
    }
    let path = `../../.pm2/logs/${req.body.processName}-${secondPath}.log`

    fs.truncate(path, 0, (err) => {
        if (err) {
            res.status(500).send('Error clearing the file', err);
        } else {
            res.status(200).send('File contents cleared successfully!');
        }
    });
});
app.post('/update/settings', (req, res) => {

    connection.execute(
        'UPDATE dataSpotUsers.processes SET GithubLink = ?, PORT = ?, Domain = ?, Email = ? WHERE DisplayName = ?',
        [req.body.GLink, req.body.PORT, req.body.Domain, req.body.Email, req.body.Name],
        (err, results) => {
            if (err) {
                console.error('Database update error:', err);
                return res.status(500).send('Database update failed');
            }

            fs.unlink(`../../../etc/nginx/sites-available/${req.body.OldDomain}`, (err) => {
                if (err) {
                    console.error('Error deleting old domain file:', err);
                    return res.status(500).send('Failed to delete old domain file');
                }

                let fileContents = `
                server {
                listen 80;
                server_name ${req.body.Domain};

                location / {
                    proxy_pass http://localhost:${req.body.PORT};
                    proxy_http_version 1.1;
                    proxy_set_header Upgrade $http_upgrade;
                    proxy_set_header Connection 'upgrade';
                    proxy_set_header Host $host;
                    proxy_cache_bypass $http_upgrade;
                }
                }`;

                fs.writeFile(`../../../etc/nginx/sites-available/${req.body.Domain}`, fileContents, (err) => {
                    if (err) {
                        console.error('Error writing new domain file:', err);
                        return res.status(500).send('Failed to write new domain file');
                    }
                    exec('rm /etc/nginx/sites-enabled/' + req.body.OldDomain)
                    exec(`ln -s /etc/nginx/sites-available/${req.body.Domain} /etc/nginx/sites-enabled/`)
                    exec(`certbot --nginx -n --agree-tos --email ${req.body.Email} -d ${req.body.Domain}`, (err, stdout, stderr) => {
                        if (err) {
                            console.error('Error running Certbot:', err);
                            return res.status(500).send('Failed to run Certbot');
                        }
                        exec('systemctl restart nginx')
                        res.status(200).send('Settings updated successfully');
                    });
                });
            });
        }
    );
});

app.post('/create/Server', (req, res) => {

    connection.execute(
        'INSERT INTO dataSpotUsers.processes (GithubLink, PORT, Domain, Email, DisplayName, Name, BashPath, owner) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [req.body.GLink, req.body.PORT, req.body.Domain, req.body.Email, req.body.Name, req.body.Name, `../DataspotServers/${req.body.Domain}`, req.body.Owner],
        (err, results) => {
            if (err) {
                console.error('Database update error:', err);
                return res.status(500).send('Database update failed');
            }

            let fileContents = `
server {
    listen 80;
    server_name ${req.body.Domain};
    location / {
        proxy_pass http://localhost:${req.body.PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    error_page 500 502 503 504 /custom_502.html;
    location = /custom_502.html {
        root /usr/share/nginx/html;
        internal;

    }
}
            `;

            fs.writeFile(`../../../etc/nginx/sites-available/${req.body.Domain}`, fileContents, (err) => {
                if (err) {
                    console.error('Error writing new domain file:', err);
                    return res.status(500).send('Failed to write new domain file');
                }

                const parts = req.body.GLink.split('/');
                const lastPart = parts[parts.length - 1];
                let bashFile = `
                ln -s /etc/nginx/sites-available/${req.body.Domain} /etc/nginx/sites-enabled/
                wait
                certbot --nginx -n --agree-tos --email gusarov.timur@gmail.com -d ${req.body.Domain}
                wait
                cd ../DataspotServers
                mkdir ${req.body.Domain}
                cd ${req.body.Domain}
                wait
                git clone ${req.body.GLink}
                wait
                cd ${lastPart}
                npm i ${req.body.Modules}
                wait
                pm2 start ${req.body.appName} -n ${req.body.Name}
                cd ../../../Database

                `;

                fs.writeFile("./TestBash.sh", bashFile, (err) => {
                    if (err) {
                        console.error('Error writing bash script:', err);
                        return res.status(500).send('Failed to write bash script');
                    }

                    exec('sh ./TestBash.sh', (err, stdout, stderr) => {
                        if (err) {
                            console.error('Error executing bash script:', err);
                            return res.status(500).send('Failed to execute bash script');
                        }

                        fs.writeFile(`../DataspotServers/${req.body.Domain}/${lastPart}/.env`, req.body.ENV, (err) => {
                            if (err) {
                                console.error('Error writing .env file:', err);
                                return res.status(500).send('Failed to write .env file');
                            }
                            const gitBash = `
                            mv ${lastPart}/.env ./
                            wait
                            rm -r ${lastPart}
                            git clone ${req.body.GLink}
                            wait
                            mv '.env' ${lastPart}
                            pm2 restart ${req.body.Name}
                            `
                            fs.writeFile(`../DataspotServers/${req.body.Domain}/${req.body.Name}.sh`, gitBash, () => {
                                console.log("Server Created");
                            })
                            res.status(200).send('Server created successfully');
                        });
                    });
                });
            });
        }
    );
});

app.post('/delete/server/', (req, res) => {
    connection.query(`DELETE FROM dataSpotUsers.processes WHERE Name = ?`, [req.body.trueName], (err, result) => {
        if (err) {
            console.error('Database update error:', err);
            return res.status(500).send('Database update failed');
        }
    });
    exec(`pm2 stop ${req.body.processName}`)
    exec(`pm2 delete ${req.body.processName}`)
    exec(`rm -r ../DataspotServers/${req.body.Domain}`)
    exec(`rm ../../../etc/nginx/sites-available/${req.body.Domain}`)
    exec(`rm ../../../etc/nginx/sites-enabled/${req.body.Domain}`)
    exec(`certbot delete -d ${req.body.Domain}`)
    exec(`systemctl restart nginx`)
    res.status(200).send('Server deleted successfully');
});

app.post('/login/google', (req, res) => {

    const ip = req.headers['cf-connecting-ip'] ||
        req.headers['x-real-ip'] ||
        req.headers['x-forwarded-for'] ||
        '171.23.129.37';


    const source = req.headers['user-agent'];
    const ua = useragent.parse(source);
    const location = geoip.lookup(ip).country;



    if (!req.body.isNewUser) {
        let date = new Date()
        let dateString = `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`
        let time = `${date.getMonth()}/${date.getDay()}/${date.getFullYear()}-${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}:${date.getMilliseconds()}`;
        let token = md5(time);
        connection.execute("DELETE FROM dataSpotUsers.sessions WHERE user = ?", [req.body.username]);
        connection.execute("INSERT INTO dataSpotUsers.analytics (user, ip, country, page, dato, platform, browser, os) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [req.body.username, ip, location, "login", dateString, ua.platform, ua.browser, ua.os]);
        connection.execute("INSERT INTO dataSpotUsers.sessions (token, user) VALUES (?, ?)", [token, req.body.username]);
        setTimeout(() => {
            connection.execute("DELETE FROM dataSpotUsers.sessions WHERE token = ?", [token]);
        }, 10800000);
        res.status(200).send(token);
    } else {
        connection.execute("INSERT INTO dataSpotUsers.DataspotUsers (email, password, type) VALUES (?, ?, ?)", [req.body.username, md5(req.body.password), "google"], (err, result) => {
            if (err) {
                console.error('Database update error:', err);
                return res.status(500).send('Database update failed');
            }
            let date = new Date();
            let time = `${date.getMonth()}/${date.getDay()}/${date.getFullYear()}-${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}:${date.getMilliseconds()}`;
            let token = md5(time + req.body.password);
            connection.execute("DELETE FROM dataSpotUsers.sessions WHERE user = ?", [req.body.username]);
            connection.execute("INSERT INTO dataSpotUsers.sessions (token, user) VALUES (?, ?)", [token, req.body.username]);
            setTimeout(() => {
                connection.execute("DELETE FROM dataSpotUsers.sessions WHERE token = ?", [token]);
            }, 10800000);
            res.status(200).send(token);
        });
    }
})

if (!testing) {

    wss.on('connection', (ws) => {
        fs.watch(state.filePath, (eventType, filename) => {
            if (eventType === 'change') {
                fs.readFile(state.filePath, 'utf8', (err, data) => {
                    if (err) {
                        console.error('Error reading file');
                        return;
                    }
                    const body = {
                        dt: data,
                        error: false,
                        serverName: state.targetProcess
                    };
                    ws.send(JSON.stringify(body)); // Convert body to string
                });
            }
        });
        fs.watch(state.errorPath, (eventType, filename) => {
            if (eventType === 'change') {
                fs.readFile(state.filePath, 'utf8', (err, data) => {
                    if (err) {
                        console.error('Error reading file');
                        return;
                    }
                    const body = {
                        dt: data,
                        error: true,
                        serverName: state.targetProcess
                    };
                    ws.send(JSON.stringify(body)); // Convert body to string
                });
            }
        });
    });
    wss.on('close', () => {
        console.log('Client disconnected');
    });
    wss.on('error', (err) => {
        console.error('WebSocket error:', err);
    });
    server.listen(8080, () => {
        console.log('WebSocket server listening on port 8080 (via HTTPS)');
    });
}



// Database
app.post("/create/database", function (req, res) {
    // Use parameterized query to insert user
    connection.query('CREATE DATABASE ' + req.body.db, function (err, result) {
        if (err) {
            console.error("Error creating user:", err);
            res.status(500).send(err);
            return;
        }
        connection.execute("INSERT INTO dataSpotUsers.dataspotDatabases (base, owner) VALUES (?, ?)", [req.body.db, req.body.user])
        res.send(result)
    });
});
app.post("/create/table", function (req, res) {
    let string = "ID int auto_increment PRIMARY KEY"

    for (let i = 0; i < req.body.tableArray.length; i++) {
        let table = req.body.tableArray[i]

        string += `, ${table.name} ${table.type}`


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
    let password = ""

    for (let i = 0; i < 12; i++) {
        username += chars.charAt(Math.floor(Math.random() * chars.length));
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    if (host == "0.0.0.0") {
        host = "%"
    }




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



app.post('/FavDB', (req, res) => {
    connection.execute("SELECT * FROM dataSpotUsers.sessions WHERE token = ?", [req.body.token], (err, result) => {
        if (err) {
            res.status(500).send('Error checking token');
            return;
        }
        if (result.length === 0) {
            res.status(401).send('Unauthorized');
            return;
        }
        let username = result[0].user

        connection.execute("SELECT * FROM dataSpotUsers.DataspotUsers WHERE email = ?", [username], (error, result) => {

            if (result[0].FavDB == `${req.body.Database}.${req.body.table}`) {
                res.status(200).send({ Message: true });
            } else {
                res.status(200).send({ Message: false })
            }
        })
    });

});
app.post('/setFavDB', (req, res) => {
    connection.execute("SELECT * FROM dataSpotUsers.sessions WHERE token = ?", [req.body.token], (err, result) => {
        if (err) {
            res.status(500).send('Error checking token');
            return;
        }
        if (result.length === 0) {
            res.status(401).send('Unauthorized');
            return;
        }
        let username = result[0].user

        connection.execute("UPDATE dataSpotUsers.DataspotUsers SET FavDB = ? WHERE email = ?", [`${req.body.db}.${req.body.tbl}`, username], (error, result) => {

            if (error) {
                res.status(500).send(error)
            } else {
                res.status(200).send({ message: "Successfully updated favorite db" })
            }
        })
    });

});
app.post('/FetchDatabases', (req, res) => {

    connection.query('Select * FROM dataSpotUsers.dataspotDatabases WHERE owner = ?', [req.body.owner], function (err, result, fields) {
        if (err) {
            console.error("Error fetching databases:", err);
            return res.status(500).send("Error fetching databases");
        }

        let data = JSON.parse(JSON.stringify(result));
        let blackListedDBs = ["information_schema", "mysql", "performance_schema", "sys"];
        let sendData = [];

        for (let i = 0; i < data.length; i++) {
            const element = data[i];
            if (!blackListedDBs.includes(element.Database)) {
                sendData.push(element);
            }
        }

        res.status(200).json(sendData);
    });
});
app.post('/get/Tables/', (req, res) => {
    connection.query(`use ${req.body.db}`)
    connection.query('SHOW TABLES', function (err, result, fields) {
        let data = JSON.parse(JSON.stringify(result));
        res.send(data);
    });
});
app.post('/get/columns/', (req, res) => {

    connection.query(`DESCRIBE ${req.body.db}.${req.body.table}`, function (err, result, fields) {
        if (result) {
            let data = JSON.parse(JSON.stringify(result));
            res.send(data);

        } else {
            res.send("No hacking please :)")
        }
    });
});
app.post('/Select/data/', (req, res) => {
    connection.query(`use ${req.body.db}`)
    connection.query('SELECT * FROM ' + req.body.table, function (err, result, fields) {
        let data = JSON.parse(JSON.stringify(result));
        res.send(data);
    });
});
app.post('/get/users/', (req, res) => {
    connection.query(`SELECT * FROM dataSpotUsers.users WHERE database= '${req.body.database}'`, function (err, result, fields) {
        let data = JSON.parse(JSON.stringify(result));
        res.send(data);
    });
});
app.get('/describe/Table/:database/:table', (req, res) => {
    connection.query(`describe ${req.params.database}.${req.params.table}`, function (err, result, fields) {
        let data = JSON.parse(JSON.stringify(result));
        res.send(data);
    });
})


app.post('/dashDB', (req, res) => {
    connection.execute("SELECT * FROM dataSpotUsers.sessions WHERE token = ?", [req.body.token], (err, result) => {
        if (err) {
            res.status(500).send('Error checking token');
            return;
        }
        if (result.length === 0) {
            res.status(401).send('Unauthorized');
            return;
        }
        let username = result[0].user
        connection.execute("SELECT * FROM dataSpotUsers.DataspotUsers WHERE email = ?", [username], (error, result) => {
            let favDB = result[0].FavDB
            connection.execute(`SELECT * FROM ${favDB}`, [username], (mistakes, answer) => {
                let tableData = answer|
                connection.execute(`Describe ${favDB}`, [username], (mistakes, answer) => {
                    res.status(200).send({ db: favDB, tableData: tableData, columns: answer })
                })
            })
        })
    });
});


app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send({ message: "No file uploaded", success: false });
    }

    let Newdate = new Date()
    let DateName = `${Newdate.getDate()}.${Newdate.getMonth() + 1}.${Newdate.getFullYear()}`
    let token = req.body.token;

    const date = new Date();
    const dateString = `${date.getFullYear()}/${date.getMonth()}/${date.getDate()}/${date.getHours()}/${date.getMinutes()}/${date.getSeconds()}/${date.getMilliseconds()}`;

    const parts = req.file.originalname.split('.');
    const extension = parts[parts.length - 1];
    const customFilename = md5(dateString) + "." + extension;
    console.log(customFilename);

    connection.execute('SELECT user FROM dataSpotUsers.sessions WHERE token = ?', [token], (err, result, fields) => {
        let user = result[0].user
        console.log(user);
        if (err) {
            console.error('Error saving file:', err);
            return res.status(500).send({ message: "Error saving file", success: false });
        }
        const filePath = `public/userFiles/${customFilename}`;
        fs.rename(req.file.path, filePath, (err) => {
            if (err) {
                console.error('Error saving file:', err);
                return res.status(500).send({ message: "Error saving file", success: false });
            }

            // Use parameterized query to update user profile link
            connection.execute('INSERT INTO dataSpotUsers.Files (user, filepath, role, uploadDate, Filename, owner, parent, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [user, customFilename, "owner", DateName, req.body.filename, user, req.body.folder, "file"]);
            res.status(200).send({ message: "Successfully uploaded file", success: true });
        });

    })
});
app.post('/uploadFolder', (req, res) => {
    console.log(req.body);
    let token = req.body.token;

    let Newdate = new Date()
    let DateName = `${Newdate.getDate()}.${Newdate.getMonth() + 1}.${Newdate.getFullYear()}`
    connection.execute('SELECT user FROM dataSpotUsers.sessions WHERE token = ?', [token], (err, result, fields) => {
        let user = result[0].user
        connection.execute('INSERT INTO dataSpotUsers.Files (user, role, uploadDate, Filename, owner, parent, type) VALUES (?,  ?, ?, ?, ?, ?, ?)', [user,  "owner", DateName, req.body.folderName, user, req.body.folder, "folder"], (error, resultNr2, fieldsnr2) => {
            if (error) {
                console.log(error);
                res.status(500).send({ message: "Something went wrong :(", success: false });
            }
            res.status(200).send({ message: "Successfully created file", success: true });
        });
    })
});
app.post('/FetchFiles', (req, res) => {
    connection.execute('SELECT user FROM dataSpotUsers.sessions WHERE token = ?', [req.body.token], (error, result1, fields1) => {
        if (result1.length < 1) {res.status(500).send("Shady shi goin on"); return;}
        let user = result1[0].user
        connection.query('Select Filename, uploadDate, filepath, type, owner FROM dataSpotUsers.Files WHERE user = ? AND parent = ?', [user, req.body.location], function (err, result, fields) {
            if (err) {
                console.error("Error fetching databases:", err);
                return res.status(500).send("Error fetching databases");
            }
            let data = JSON.parse(JSON.stringify(result));
            res.status(200).json(data);
        });
    })
});

app.get('/download', (req, res) => {
    const fileName = req.query.file;
    if (fileName.includes('../')) {
        res.status(404).send("File not found :(")
    }
    const file = path.join(__dirname, 'public/userFiles/' + fileName);
    res.download(file); // Set the file to be downloaded
});
app.post('/changefile/rename', (req, res) => {
    connection.execute(`UPDATE dataSpotUsers.Files SET Filename = ? WHERE filepath = ?`, [req.body.name, req.body.file], )
})
app.post('/changefile/delete', (req, res) => {
    connection.execute(`DELETE FROM dataSpotUsers.Files WHERE filepath = ?`, [req.body.file], )
    exec(`rm -r ${req.body.file}`, (error, stdout, stderr) => {
        if (error) {
            
            res.status(500).send('Error deleting file');
            console.log('Error deleting file: \n' + error);
            
        }
        res.status(200).send('File deleted successfully');
    });
})
app.post('/share/file', (req, res) => {
    const filePath = req.body.file;
    const user = req.body.user
    connection.execute('SELECT owner, uploadDate, Filename FROM dataSpotUsers.Files WHERE filepath = ?', [filePath], (err, result, fields) => {
        if (err) {
            res.status(500).send({ message: "Unknown server error" })
            console.log(err)
        } else if (result.length > 1) {
            console.log(result);
            res.status(500).send({ message: "Suspicious server error, contact admin" })

        }
        let file = result[0]
        connection.execute('INSERT INTO dataSpotUsers.Files (user, filepath, role, uploadDate, Filename, owner) VALUES (?, ?, ?, ?, ?, ?)', [user, filePath, "user", file.uploadDate, file.Filename, file.owner], (error, resp, fiel) => {
            if (error) {
                res.status(500).send({ message: "Unknown server error" })
                console.log(error)
            }
            res.status(200).send({ message: "Successfully shared file" })
        });
    });

});


app.use(express.static("public"));
