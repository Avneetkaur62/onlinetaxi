var express = require('express');
var router = express.Router();
const mysql = require('mysql');
const session = require("express-session")
const nodeMailer = require("nodemailer");
const conn = require('../connection');

const sendEmail = (to, subject, text) => {
    console.log(to, subject, text);
    let mailer = nodeMailer.createTransport({
        service: "gmail",
        auth: {
            user: "nodeexample2@gmail.com",
            pass: "nbchudbjgnbolivp"

        }
    })
    const options = {
        from: "nodemailsending@gmail.com",
        to: to,
        subject: subject,
        text: text
    }
    mailer.sendMail(options, (err) => {
        if (err)
            console.log(err)
        else
            console.log("sent");
    });
}


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

/* ------------------------------------ */
const isDriverLoggedIn = (req, res, next) => {
    // console.log(session.adminsession)
    if (session.driverssession === undefined) {
        return res.redirect('/driverslogin');
    }
    next();
}

router.get("/complete-booking/:id", isDriverLoggedIn, function (req, res) {
    // console.log(req.params);
    let {id} = req.params;
    // let driverEmail = session.driverssession;
    let updateStatus = `UPDATE bookride SET Status='Complete' WHERE id=${id}`;
    conn.query(updateStatus, (err, rows1) => {
        if (err) throw err;
        res.redirect('/drivers/view-orders');
    });
});

router.get("/view-orders", isDriverLoggedIn, function (req, res) {
    let driverEmail = session.driverssession;
    let myOrders = `SELECT *, bookride.status AS bstatus, bookride.id AS bid, user.phone AS uphone, user.email AS uemail, DATE_FORMAT(bookride.PickDate, '%Y-%m-%d') AS bdate FROM bookride INNER JOIN cars ON bookride.carid=cars.id INNER JOIN user ON bookride.user_email=user.email WHERE bookride.Status='Assigned' AND bookride.driver_email='${driverEmail}' ORDER BY bookride.id DESC`;
    conn.query(myOrders, (err, rows1) => {
        if (err) throw err;
        res.render('driver/bookings', {bookings: rows1});
    }); // outer query
});
/* ------------------------------------ */

router.get("/drivershome", function (req, res) {
    // res.render("drivershome");
    if (session.driverssession != undefined) {
        res.render('drivershome', {username: session.driverssession});
    } else {
        res.redirect("/driverslogin");
    }
});

// const session = require("express-session");
router.get("/driverschangepassword", function (req, res) {
    console.log(session.driverssession);
    if (session.driverssession != undefined) {
        res.render('driverschangepassword', {username: session.driverssession});
    } else {
        res.redirect("/driverslogin");
    }
    // console.log("abcd");
});
router.post("/driverschangepasswordaction", (req, res) => {
    console.log(req.body)
    let {password, newpassword, confirmpassword} = req.body;
    let email = session.driverssession;
    let selectdata = "select * from drivers where email='" + email + "' and password='" + password + "'";
    //console.log(selectdata);
    conn.query(selectdata, (err, row) => {
        if (err) throw err;
        if (row.length > 0) {
            if (newpassword == confirmpassword) {
                let updatepass = "update drivers set password='" + newpassword + "' where email='" + email + "'";
                // console.log(updatepass)
                conn.query(updatepass, function (err) {
                    if (err) throw err;
                    sendEmail(email, "Password Updated", `Your password has been updated successfully`);
                    res.send("updated");
                })
            } else {
                res.send("New password and confirm password does not match");
            }
        } else {
            res.send("current password is not correct.");
        }
    })
})

router.get("/logout", function (req, res, next) {
    session.adminsession = undefined;
    res.redirect("/driverslogin");
});

router.get("/singledriver/:driversEmail", (req, res) => {
    // console.log(req.params);
    let {driversEmail} = req.params;
    let singleDriver = `select * from drivers where Email='${driversEmail}'`;
    conn.query(singleDriver, (e, row) => {
        console.log(row);
        res.render("singledriver", {dri: row[0]});
    })
});
router.post("/driversaction", (req, res) => {
    /console.log(req.query);/
    var driver = req.body.driver;
    var phone = req.body.phone;
    var Username = req.body.Username;
    var email = req.body.email;
    var password = req.body.password;

    // var photo = req.body.photo;


    let img = req.files.photo;
    let path = "public/images/" + img.name;
    let pathDB = "/images/" + img.name;

    img.mv(path, function (err) {
        if (err) throw err;
    })
    let select = "select * from drivers where email='" + email + "'";
    console.log(select);

    let Query = "insert into drivers (driver,phone,Username,email,password,photo) values('" + driver + "','" + phone + "','" + Username + "','" + Email + "','" + password + "','" + pathDB + "')";
    /console.log(Query);/
    conn.query(Query, (err) => {
        if (err) throw err;

        sendEmail(Email, "Driver Added", `Driver added successfully. your email is ${Email} and password is ${password}`);

        res.send('inserted');
    })


})


router.get("/viewdrivers", function (req, res) {
    let select = "select * from drivers";
    conn.query(select, function (err, rows) {
        if (err) throw err;
        if (rows.length > 0) {
            console.log(rows);
            res.send(rows);
        } else {
            res.send("no data found");
        }

    })
})


module.exports = router;
