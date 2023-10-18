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

/* ----------------------------------- */
router.get('/cancel-my-ride/:id', (req, res) => {
    let {id} = req.params
    let cancelSQL = `Update bookride SET status='Cancelled' WHERE id=${id}`
    conn.query(cancelSQL, (error) => {
        res.redirect('/user/my-bookings')
    })
})

router.get('/view-driver-info', (req, res) => {
    let {driverEmail} = req.query
    let driverInfo = `SELECT * FROM drivers WHERE email='${driverEmail}'`;
    conn.query(driverInfo, (error, row) => {
        if (error) {
            res.json({driver: [], error: error.message})
        } else {
            res.json({driver: row[0], error: ''})
        }
    })
})

router.get("/my-bookings", (req, res) => {
    if (session.userssession === undefined) {
        res.redirect('/userlogin')
    } else {
        let email = session.userssession;
        let myOrders = `SELECT *, bookride.status AS bstatus, bookride.id AS bid, DATE_FORMAT(bookride.PickDate, '%Y-%m-%d') AS bdate FROM bookride INNER JOIN cars ON bookride.carid=cars.id WHERE bookride.user_email='${email}' ORDER BY bookride.id DESC`;
        conn.query(myOrders, (err, rows1) => {
            if (err) throw err;

            let drivers = `SELECT * FROM drivers ORDER BY driver ASC`;
            conn.query(drivers, (err, rows2) => {
                if (err) throw err;
                res.render('users/my-bookings', {bookings: rows1, driver: rows2});
            }); // inner query

        }); // outer query
    }
});

router.get("/bookingaction", (req, res) => {
    console.log(req.query);
    console.log(session.userssession);
    if (session.userssession === undefined) {
        return res.send("userlogin");
    }

    var name = req.query.name;
    var email = req.query.email;
    var phone = req.query.phone;
    // var city = req.query.city;
    var pickup = req.query.pickup;
    var dropoff = req.query.dropoff;
    var date = req.query.date;
    var time = req.query.time;
    var price = req.query.price;
    var payment = req.query.payment;
    var message = req.query.message;
    var car_id = req.query.car_id;

    // `Name`, `Phone`, `user_email`, `pickup`, `dropoff`, `carid`, `PickDate`, `PickTime`, `Message`, `Price`, `PaymentType`, `Status`


    let Query = `INSERT INTO bookride(Name, Phone, user_email, pickup, dropoff, carid, PickDate, PickTime, Message, Price, PaymentType, Status) 
                        VALUES('${name}', '${phone}', '${email}', '${pickup}', '${dropoff}', ${car_id}, '${date}' , '${time}', '${message}', '${price}', '${payment}', 'Pending')`;
    // console.log(Query);
    conn.query(Query, (err) => {
        if (err) throw err;
        res.send('inserted');
    });
});
/* ----------------------------------- */

router.get("/userhome", function (req, res) {
    if (session.userssession === undefined) {
        res.redirect("/userlogin");
    } else {
        res.render("userhome", {usession: session.userssession});

    }
});

//const session = require("express-session");
router.get("/userchangepassword", function (req, res) {
    console.log(session.userssession);
    if (session.userssession != undefined) {
        res.render('userchangepassword', {username: session.userssession});
    } else {
        res.redirect("/userlogin");
    }
    // console.log("abcd");
});
router.post("/userchangepasswordaction", (req, res) => {
    console.log(req.body)
    let {password, newpassword, confirmpassword} = req.body;
    let email = session.userssession;
    let selectdata = "select * from user where email='" + email + "' and password='" + password + "'";
    //console.log(selectdata);
    conn.query(selectdata, (err, row) => {
        if (err) throw err;
        if (row.length > 0) {
            if (newpassword == confirmpassword) {
                let updatepass = "update user set password='" + newpassword + "' where email='" + email + "'";
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
});

// router.get("/login_user", (req, res) => {
//     res.render("userlogin");
// });

router.get('/adduser',function (req,res,next){
    res.render('adduser');
});

router.post("/adduser", (req,res) => {
    console.log(req.body);
    let firstName =req.body.fname;
    let lastName =req.body.lname;
    let phone=req.body.phone;
    let email =req.body.email;
    let password =req.body.password;
    let gender =req.body.gender;
    // let photo =req.body.photo;
    let address =req.body.address;
    let city =req.body.city;
    let state = req.body.state;

    let img = req.files.photo;
    let path ="public/images/" + img.name;
    let pathDB = "/images/" + img.name;
    img.mv(path,function(err){
        if(err) throw err;
    })

    let addUser = "insert into user(firstname,lastName,phone,email,password,gender,photo,address,city,state) values('"+ firstName +"', '"+ lastName +"', '"+ phone +"', '"+ email +"','"+ password +"', '"+ gender +"', '"+ pathDB +"', '"+ address +"', '"+ city +"', '"+ state +"')";
    conn.query(addUser,(err) => {
        if(err) throw err;
        sendEmail(email,"Account created",`Account created successfully . Your email is ${email} and password is ${password}`);
        res.send('inserted');
    })

});

router.get("/logout", function (req, res, next) {
    session.userssession = undefined;
    res.redirect("/userlogin");
});

router.get("/booking/:carid", (req, res) => {
    // console.log("session" + session.userssession);
    let {carid} = req.params;
    // console.log(carid);
    if (session.userssession === undefined) {
        res.redirect("/userlogin");
    } else {
        let cities = `select * from cars where id=${carid}`;
        conn.query(cities, (error, rows1) => {
            let email = session.userssession;
            let userData = `select * from user where email='${email}'`;
            conn.query(userData, (error, rows2) => {
                console.log(rows2[0]);
                res.render("booking", {car: rows1[0], user: rows2[0]});
            });
        });
    }
});

router.get('/booking/:carid', function (req, res, next) {
    if (session.usersession !== undefined) {
        let {carid} = req.params;
        let singleCar = `select * from cars where carid=${carid}`;
        conn.query(singleCar, (err, row) => {
            if (err) throw err;
            let userEmail = session.usersession;
            let userInfo = `select * from user where email=${userEmail}`;
            conn.query(userInfo, (err, row2) => {
                if (err) throw err;
                res.render('booking', {car: row[0], user: row2[0]});
            });
        });
    } else {
        res.redirect('/userlogin');
    }
});

router.get("/viewcity", function (req, res) {
    let select = "select * from city";
    conn.query(select, function (err, rows) {
        if (err) throw err;
        if (rows.length > 0) {
            // console.log(rows);
            res.send(rows);
        } else {
            res.send("no data found");
        }
    })
})

router.get("/viewcars", function (req, res) {
    let select = "select * from type";
    conn.query(select, function (err, rows) {
        if (err) throw err;
        if (rows.length > 0) {
            // console.log(rows);
            res.send(rows);
        } else {
            res.send("no data found");
        }
    })
})
router.get("/fetch-areas", function (req, res) {
    let {cityid} = req.query;
    let fetchAreas = `select * from area where cityid=${cityid}`;
    conn.query(fetchAreas, function (err, rows) {
        if (err) throw err;
        res.send(rows);
    })
})
router.get("/user-view-taxi-types", function (req, res) {
    let select = "select * from taxitype";
    conn.query(select, function (err, rows) {
        if (err) throw err;
        if (rows.length > 0) {
            // console.log(rows);
            res.send(rows);
        } else {
            res.send("no data found");
        }
    })
})
router.get('/select-taxi', function (req, res, next) {
    if (session.userssession != undefined) {
        res.render('userViewTaxiType', {email: session.usersession});
    } else {
        res.redirect("/userlogin");
    }
});
router.get("/display-cars", function (req, res) {
    let {type} = req.query;
    let displayCars = `select * from cars where type='${type}'`;
    conn.query(displayCars, function (err, rows) {
        if (err) throw err;
        res.send(rows);
    })

})

router.get("/resetpassword", function (req, res, next) {

    res.render('resetpassword');


});
router.get("/resetpasswordaction", function (req, res, next) {
    let {email, password, cpassword} = req.query;
    let updateUsers = `UPDATE user set password="${password}" where email='${email}'`;
    console.log(updateUsers);
    conn.query(updateUsers, function (err) {
        if (err) throw err;
        res.send("success");
    })
});


router.get('/forgotpassword',function (req,res,next){
    res.render('forgotpassword');
});
router.get("/forgotpasswordaction", function (req, res, next) {

    let {email} = req.query;
    let selectuser = `SELECT * from user where email= '${email}'`;
    conn.query(selectuser, function (err, row) {
        if (err) throw err;
        if (row.length > 0) {
            res.send("success");
        } else {
            res.send("no data found");
        }
    })


});
module.exports = router;
