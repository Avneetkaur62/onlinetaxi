var express = require('express');
var router = express.Router();
const mysql = require('mysql');
const session = require('express-session');
const conn = require('../connection');

// var conn = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     // password: 'system',
//     password: '',
//     database: 'fullstack2023'
// });
// conn.connect(function (err) {
//     // if (err) throw err;
//     if (err) {
//         console.log(err.message);
//     } else {
//         console.log("connection created");
//     }
// });


/* GET home page. */
router.get('/', function (req, res, next) {
    let sql = "SELECT * FROM cars order by id desc limit 3";
    conn.query(sql, (e, rows) => {
        console.log(rows);
        // console.log(rows.length);
        res.render('index', {title: 'Express', cars: rows});
    })

});

router.get("/login", (req, res) => {
    res.render("login");
});

router.post('/loginaction', function (req, res) {
    let {username, pass} = req.body;
    // console.log(req.body);
    let selectSQL = "select * from admin where username='" + username + "' and password='" + pass + "'";
    console.log(selectSQL);
    conn.query(selectSQL, (err, row) => {
        // if (err) throw err;
        if (err) {
            console.log(err.message);
        } else if (row.length > 0) {
            session.adminsession = username;
            console.log(session.adminsession);
            res.send("success");
        } else {
            res.send("no data found");
        }
    })
});

router.get('/', function (req, res, next) {
    let sql = "SELECT * FROM drivers";
    conn.query(sql, (e, rows) => {
        console.log(rows);
        // console.log(rows.length);
    })
    res.render('index', {title: 'Express'});
});

router.get("/driverslogin", (req, res) => {
    res.render("driverslogin");
});
router.post('/driversloginaction', function (req, res) {
    let {email, pass} = req.body;
    // console.log(req.body);
    let select = "select * from drivers where email='" + email + "' and password='" + pass + "'";
    console.log(select);
    conn.query(select, (err, row) => {
        if (err) throw err;
        if (row.length > 0) {
            session.driverssession = email;
            console.log(session.driverssession);
            res.send("success");
        } else {
            res.send("no data found");
        }
    })
});

router.get('/', function (req, res, next) {
    let sql = "SELECT * FROM user";
    conn.query(sql, (e, rows) => {
        console.log(rows);
        // console.log(rows.length);
    })
    res.render('index', {title: 'Express'});
});

router.get("/userlogin", (req, res) => {
    res.render("userlogin");
});
router.post('/userloginaction', function (req, res) {
    console.log(req.body);
    let {email, pass} = req.body;
    let select = "select * from user where email='" + email + "' and password='" + pass + "'";
    console.log(select);
    conn.query(select, (err, row) => {
        if (err) throw err;
        console.log(row);
        if (row.length > 0) {
            session.userssession = email;
            console.log(session.userssession);
            res.send("success");
        } else {
            res.send("no data found");
        }
    })
});

router.get("/contact", (req, res) => {
    res.render("contact");
});

router.get("/about", (req, res) => {
    res.render("about");
});

router.get("/blog", (req, res) => {
    res.render("blog");
});
router.get("/book-ride", (req, res) => {
    res.render("book-ride");
});
router.get("/blogdetails", (req, res) => {
    res.render("blogdetails");
});
router.get("/driver", (req, res) => {
    let drivers = `Select * From drivers`;
    conn.query(drivers, (e, rows) => {
        res.render("driver", {drivers: rows});
    });
});
router.get("/taxi", (req, res) => {
    let carsSQL = `select * from cars`;
    conn.query(carsSQL, (e, rows) => {
        res.render("taxi", {cars: rows});
    });
});

router.get("/single-taxi", (req, res) => {
    res.render("single-taxi");
});

router.get("/single-taxi/:carid", (req, res) => {
    let {carid} = req.params;
    let singleCar = `select * from cars where id=${carid}`;
    conn.query(singleCar, (e, row) => {
        console.log(row)
        let type = row[0].type;
        let similarCars = `SELECT * FROM cars where type='${type.trim()}' and id !=${carid}`
        console.log(similarCars);
        conn.query(similarCars, (e, row2) => {
            // res.json({row: row, row2: row2})
            console.log(row2);
            res.render("single-taxi", {car: row[0], similarCars: row2});
        })
    })
});
router.get("/single-driver", (req, res) => {
    res.render("singledriver");
});
router.get("/single-driver/:q", (req, res) => {
    let {q} = req.params;
    let driver = "select * from drivers where email='" + q + "'";
    conn.query(driver, (err, row) => {
        if (err) throw err;
        res.render("singledriver", {drivers: row[0]});
    })
})

router.get("/contact", (req, res) => {
    res.render("contact");
});
router.get("/contactusaction", function (req, res) {
    console.log(req.query);
    let {name, email, subject, message, phone} = req.query;
    let insertSQL = 'insert into contact values(null, "' + name + '","' + email + '","' + phone + '","' + subject + '","' + message + '")';
    // console.log(insertSQL);
    conn.query(insertSQL, (err) => {
        if (err) {
            console.log(err.message);
            res.send("error");
        } else {
            res.send("message delivered");
        }
    });
});

module.exports = router;
