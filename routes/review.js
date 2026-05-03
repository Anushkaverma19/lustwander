const express = require('express');
const router = express.Router({ mergeParams: true }); 
const review = require('../models/init/review');  
const { listingschema } = require('../schema.js');
const listing = require('../models/listing');
const { reviewschema } = require('../schema.js');
const wrapasync = require("../utils/wrapasyn.js");
const ExpressError = require("../utils/ExpressError"); 
const{validatereview} = require('../middleware.js');
const { loggedin } = require('../middleware.js');
const { isauthor } = require('../middleware.js');
const reviewcontroller = require("../controller/review.js");    
//jpoi

// reviews
router.post("/",loggedin,validatereview, wrapasync(reviewcontroller.create));
//delete review
router.delete("/:reviewid",loggedin, isauthor,wrapasync(reviewcontroller.destroy));
   
module.exports = router;