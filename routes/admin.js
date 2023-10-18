var express = require('express');
var router = express.Router();
const mysql = require('mysql');
const session = require("express-session");
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
        from: "nodeexample2@gmail.com",
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

/*var conn = mysql.createConnection({
    host: 'localhost',
    user: 'avi',
    password: 'System_1',
     password: '',
    database: 'fullstack2023'
 });
 conn.connect(function (err) {
    if (err) throw err;
     if (err) {
         console.log(err.message);
     } else {
        console.log("connection created");
    }
 });*/


/* ----------------------------- */
const isAdminLoggedIn = (req, res, next) => {
    // console.log(session.adminsession)
    if (session.adminsession === undefined) {
        return res.redirect('/login');
    }
    next();
}

router.post('/assign-driver', (req, res) => {
    // console.log(req.body);
    let {b_id, driver} = req.body;
    let updateStatus = `UPDATE bookride SET Status='Assigned', driver_email='${driver}' WHERE id=${b_id}`;
    conn.query(updateStatus, (error) => {
        if (error) {
            res.send(error.message);
        } else {
            res.send('success');
        }
    })
});

router.get('/completeBookings', isAdminLoggedIn, function (req, res, next) {
    let myOrders = `SELECT *, bookride.status AS bstatus, bookride.id AS bid, DATE_FORMAT(bookride.PickDate, '%Y-%m-%d') AS bdate FROM bookride INNER JOIN cars ON bookride.carid=cars.id WHERE bookride.Status='Complete' ORDER BY bookride.id DESC`;
    conn.query(myOrders, (err, rows1) => {
        if (err) throw err;
        res.render('admin/completeBookings', {bookings: rows1});
    }); // outer query
});

router.get('/assignedBookings', isAdminLoggedIn, function (req, res, next) {
    let myOrders = `SELECT *, bookride.status AS bstatus, bookride.id AS bid, DATE_FORMAT(bookride.PickDate, '%Y-%m-%d') AS bdate FROM bookride INNER JOIN cars ON bookride.carid=cars.id WHERE bookride.Status='Assigned' ORDER BY bookride.id DESC`;
    conn.query(myOrders, (err, rows1) => {
        if (err) throw err;
        res.render('admin/assignedBookings', {bookings: rows1});
    }); // outer query
});

router.get('/newBookings', isAdminLoggedIn, function (req, res, next) {
    let myOrders = `SELECT *, bookride.status AS bstatus, bookride.id AS bid, DATE_FORMAT(bookride.PickDate, '%Y-%m-%d') AS bdate FROM bookride INNER JOIN cars ON bookride.carid=cars.id WHERE bookride.Status='Pending' ORDER BY bookride.id DESC`;
    conn.query(myOrders, (err, rows1) => {
        if (err) throw err;
        let drivers = `SELECT * FROM drivers ORDER BY driver ASC`;
        conn.query(drivers, (err, rows2) => {
            if (err) throw err;
            res.render('admin/newBookings', {bookings: rows1, driver: rows2});
        }); // inner query
    }); // outer query
});
/* ----------------------------- */

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

router.get("/add-admin", (req, res) => {
    res.render("add_admin");
});

/*router.get('/add-adminaction', function (req, res, next) {
    // res.send("success");
    console.log(req.query);
    let {username, password, cpass, fname, phone, email, admin} = req.body;
    // console.log(username, password, cpass, fname, phone, email, admin);
    // let insert = 'insert into admin(username, password, fullname, phone, email, admintype) values(" "+ username + "," + password +" ," + fname + " ,"+ phone + "," + email + " " + admin + " ")';
    let insert = `Insert Into admin(username, password, fullname, phone, email, admintype) values('${username}', '${password}', '${fname}', '${phone}', '${email}', '${admin}')`;
    // console.log(insert);
    conn.query(insert, (err) => {
        if (err) {
            res.send(err.message);
        } else {
            res.send("success");
        }
    })
});*/

/*router.get("/add-adminaction", function (req, res) {
    console.log(req.query);
    res.send("success");

});*/

router.get("/taxitype", function (req, res) {
    res.render("taxitype");
});


router.post('/taxitypeaction', function (req, res, next) {
    // console.log(req.body);
    let {taxitype} = req.body;

    let insert = `Insert Into taxitype(type) values('${taxitype}')`;
    // console.log(insert);
    conn.query(insert, (err) => {
        if (err) {
            res.send(err.message);
        } else {
            res.send("success");
        }
    })
});


router.get("/gettaxitypedata", function (req, res) {
    let select = "select * from taxitype";
    conn.query(select, function (err, rows) {
        if (err) throw err;
        if (rows.length > 0) {
            console.log(rows);
            res.send(rows);
        } else {
            res.send("no data found");
        }
    })
});

router.get("/viewtaxitype", function (req, res) {
    res.render("viewtaxitype");
});

router.get("/adminhome", function (req, res) {
    res.render("adminhome");

});
router.get("/add_adminaction", (req, res) => {
    console.log(req.query);
    var username = req.query.username;
    var password = req.query.pass;
    var fullname = req.query.fname;
    var phone = req.query.phone;
    var email = req.query.email;
    var admin_type = req.query.admin;
    let Query = "insert into admin values( '" + username + "' , '" + password + "', '" + fullname + "' , '" + phone + "','" + email + "', '" + admin_type + "', 'Active')";
    console.log(Query);
    conn.query(Query, (err) => {
        if (err) throw err;
        res.send('inserted');

    })
})

/*router.get("/drivers", (req, res) => {
    console.log(session.adminsession);
    if (session.adminsession != undefined) {
        res.render('drivers');
    } else {
        res.redirect("/login");
    }
})
*/

router.post("/driversaction", (req, res) => {
    let {driver, phone, username, emailid, password} = req.body;
    console.log(driver, phone, username, emailid, password)
    var photo = req.files.photo;
    let select = "select * from drivers where `email`='" + emailid + "'";
    console.log(select);
    conn.query(select, (err, row) => {
        if (err) throw err;
        // console.log(row);

        if (row.length > 0) {
            res.send("exist");
        } else {
            var dbpath = "/images/team/" + photo.name;
            var realpath = "public/images/team/" + photo.name;
            photo.mv(realpath, (err) => {
                if (err) throw err;
            })
            let Query = "insert into drivers values('" + driver + "','" + phone + "' ,'" + username + "','" + emailid + "', '" + password + "','" + dbpath + "')";
            conn.query(Query, (err) => {
                if (err) throw err;
                sendEmail(emailid, "Driver Added", `Driver added successfully. your email is ${emailid} and password is ${password}`);
                res.send('inserted');
            });
        }
    });
});

router.get("/viewdrivers", function (req, res) {
    /* if (session.adminsession != undefined)*/
    res.render('viewdrivers');

    /* else {
         res.redirect('/login');
     }*/
})
router.get('/viewdriversaction', function (req, res) {
    let select = "select * from drivers ";
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

router.get("/addcars", function (req, res) {
    /* if (session.adminsession != undefined)*/
    res.render('addcars');

    /* else {
         res.redirect('/login');
     }*/
})

router.post('/carsaction', function (req, res) {
    let car_name = req.body.car_name;
    let brand = req.body.brand;
    let model = req.body.model;
    let color = req.body.color;
    let description = req.body.description;
    let photo = req.body.photo;
    let registration_no = req.body.registration_no;
    let insurance_validity = req.body.insurance_validity;
    let rent = req.body.rent;
    let cartype = req.body.cartype;

    let img = req.files.photo;
    let path = "public/images/" + img.name;
    let pathDB = "/images/" + img.name;
    img.mv(path, function (err) {
        if (err) throw err;
        let Query = "insert into cars values(null, '" + car_name + "','" + brand + " ' ,'" + model + " ','" + color + "','" + description + "','" + pathDB + "','" + registration_no + "','" + insurance_validity + "','" + rent + "', 'Active','" + cartype + "' )";
        conn.query(Query, (err) => {
            if (err) throw err;
            res.send('inserted');
        })
    })
});

router.get('/addcarsaction', function (req, res) {
    let select = "select * from cars";
    conn.query(select, function (err, rows) {
        if (err) throw err;
        if (rows.length > 0) {
            // console.log(rows);
            res.send(rows);
        } else {
            res.send("no data found");
        }
    })
});

router.get('/getTaxiType', function (req, res) {
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
router.get("/adminchangepassword", function (req, res) {
    // console.log("abcd");
    console.log(session.adminsession);
    if (session.adminsession === undefined) {
        res.redirect("/login");
      //  res.render('adminchangepassword', {username: session.adminsession});
    } else {
        res.render('adminchangepassword', {username: session.adminsession});
        // res.redirect("/login");
    }
    // console.log("abcd");
});
router.post("/adminchangepasswordaction", (req, res) => {
     console.log(req.body)
    let {password, newpassword, confirmpassword} = req.body;
    let username = session.adminsession;
    let selectdata = "select * from admin where username='" + username + "' and password='" + password + "'";
    // console.log(selectdata);
    conn.query(selectdata, (err, row) => {
        if (err) throw err;
        if (row.length > 0) {
            if (newpassword == confirmpassword) {
                let updatepass = "update admin set password='" + newpassword + "' where username='" + username + "'";
                // console.log(updatepass)
                conn.query(updatepass, function (err) {
                    if (err) throw err;
                    res.send("updated");
                })
            } else {
                res.send("newpassword and confirmpassword does not match");
            }
        } else {
            res.send("current password is not correct.");
        }
    })
})


//router.get("/logout", function (req, res, next) {
 //   session.adminsession = undefined;
 //   res.redirect("/login");
//});


router.get("/logout", function (req, res, next) {
    session.adminsession = undefined;
    res.redirect("/login");
});

router.get("/city", function (req, res) {
    // if (session.usersession != undefined) {
    res.render("city");
    // } else {
    //     res.redirect("/login");
    // }

})


router.post("/cityaction", (req, res) => {
    /*console.log(req.query);*/
    var cityname = req.body.cityname;
    var photo = req.body.photo;


    let img = req.files.photo;
    let path = "public/images/" + img.name;
    let pathDB = "/images/" + img.name;

    img.mv(path, function (err) {
        if (err) throw err;
    })

    let Query = "insert into city (cityname,cityphoto) values('" + cityname + "', '" + pathDB + "')";
    /*console.log(Query);*/
    conn.query(Query, (err) => {
        if (err) throw err;


        res.send('inserted');
    })


})


router.get("/viewcity", function (req, res) {
    let select = "select * from city";
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

router.get("/area", function (req, res) {
    // if (session.usersession != undefined) {
    res.render("area");
    //  } else {
    //     res.redirect("/login");
    // }

})


router.get("/viewcities", function (req, res) {
    let select = "select * from city";
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

router.post("/areaaction", (req, res) => {
    // console.log(req.body);
    var areaname = req.body.areaname;
    var cityname = req.body.cityname;

    let img = req.files.photo;
    let path = "public/images/" + img.name;
    let pathDB = "/images/" + img.name;

    img.mv(path, function (err) {
        if (err) throw err;
    })

    let Query = "insert into area values(null, '" + areaname + "', '" + pathDB + "', '" + cityname + "')";
    /*console.log(Query);*/
    conn.query(Query, (err) => {
        if (err) throw err;
        res.send('inserted');
    })
})
router.get("/viewarea", function (req, res) {
    let select = "SELECT area.*, city.cityname FROM area inner join city on area.cityid=city.cityid";
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
module.exports = router;
