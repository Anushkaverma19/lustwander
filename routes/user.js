const express = require('express');
const router = express.Router(); 
const user = require('../models/init/user');
const wrapasync = require("../utils/wrapasyn.js");
const passport = require("passport");
const {saveredirecturl} = require("../middleware.js");
const usercontroller = require("../controller/user.js");      
router.
route("/signup")
.get( usercontroller.rendersignup) 
.post( wrapasync(usercontroller.signup));  
router.
route("/login")
.get( usercontroller.renderlogin)   
.post( saveredirecturl,passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login"
}), wrapasync(usercontroller.login));   
// router.get("/signup", usercontroller.rendersignup); 

// router.post("/signup", wrapasync(usercontroller.signup));
// router.get("/login", usercontroller.renderlogin);   
// router.post("/login", saveredirecturl,passport.authenticate("local", {
//     failureFlash: true,
//     failureRedirect: "/login"
// }), wrapasync(usercontroller.login));   
router.get("/logout", usercontroller.logout);    
module.exports = router;