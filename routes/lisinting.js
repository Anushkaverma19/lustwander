const express = require('express');
const router = express.Router(); 

const wrapasync = require("../utils/wrapasyn.js");
const { loggedin, isowner, validatelisting } = require('../middleware.js');
const listingcontroller = require("../controller/listing.js");

const multer  = require('multer');
const { storage } = require('../cloudConfig.js');
const upload = multer({ storage });

// ---------------- NEW ----------------
// Render the form for creating a new listing
router.get('/new', loggedin, listingcontroller.new);

// ---------------- SHOW & DELETE ----------------
// Show a single listing OR delete it
router.route('/:id')
  .get(wrapasync(listingcontroller.show))
  .delete(loggedin, isowner, wrapasync(listingcontroller.destroy));

// ---------------- INDEX & CREATE ----------------
// Show all listings OR create a new one
router.route("/")
  .get(wrapasync(listingcontroller.index))
  .post(
    loggedin,
    upload.fields([
      { name: 'mainImage', maxCount: 1 },
      { name: 'otherImages', maxCount: 10 }
    ]),
    validatelisting,
    wrapasync(listingcontroller.create)
  );

// ---------------- EDIT & UPDATE ----------------
// Render edit form OR update listing
router.route('/:id')
  .get(wrapasync(listingcontroller.show))
  .put( // Add PUT handler here
    loggedin,
    isowner,
    upload.fields([
      { name: 'mainImage', maxCount: 1 },
      { name: 'otherImages', maxCount: 10 }
    ]),
    validatelisting,
    wrapasync(listingcontroller.update)
  )
  .delete(loggedin, isowner, wrapasync(listingcontroller.destroy));

// Edit form should be separate GET route
router.get('/:id/edit', loggedin, isowner, wrapasync(listingcontroller.edit));

module.exports = router;
