const express = require('express');
const router = express.Router();

const wrapasync = require("../utils/wrapasyn.js");
const { loggedin, isowner, validatelisting } = require('../middleware.js');
const listingcontroller = require("../controller/listing.js");

const multer = require('multer');
const { storage } = require('../cloudConfig.js');
const upload = multer({ storage });

/* ---------------- NEW LISTING FORM ---------------- */
router.get('/new', loggedin, listingcontroller.new);

/* ---------------- INDEX & CREATE ---------------- */
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

/* ---------------- SHOW / UPDATE / DELETE ---------------- */
router.route('/:id')
  .get(wrapasync(listingcontroller.show))
  .put(
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

/* ---------------- EDIT FORM ---------------- */
router.get('/:id/edit', loggedin, isowner, wrapasync(listingcontroller.edit));

module.exports = router;