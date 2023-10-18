const mysql = require("mysql");
const conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    // password: 'system',
    password: 'System_1',
    database: 'fullstack2023'
    // database: 'fullstack2023'
});
conn.connect(function (err) {
    // if (err) throw err;
    if (err) {
        console.log(err.message);
    } else {
        console.log("connection created");
    }
});
module.exports = conn;