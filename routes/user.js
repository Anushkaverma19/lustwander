const express = require('express');
const router = express.Router(); 
const wrapasync = require("../utils/wrapasyn.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const usercontroller = require("../controller/user.js");      

router.route("/signup")
.get(usercontroller.rendersignup) 
.post(wrapasync(usercontroller.signup));  

router.route("/login")
.get(usercontroller.renderlogin)   
.post(
    saveRedirectUrl,
    passport.authenticate("local", {
        failureFlash: true,
        failureRedirect: "/login"
    }),
    wrapasync(usercontroller.login)
);

router.get("/logout", usercontroller.logout);    

module.exports = router;