const listing = require('../models/listing');

// INDEX
module.exports.index = async (req, res) => {
  const listings = await listing.find({});
  res.render("listings/index", { listings });
};

// NEW
module.exports.new = (req, res) => {
  res.render("listings/new");
};

// CREATE
module.exports.create = async (req, res) => {
  try {
    req.body.listing.country = req.body.listing.country || "India";

const mainImageFile = req.files?.mainImage?.[0] || null;
const otherImageFiles = req.files?.otherImages || [];
    const newListing = new listing(req.body.listing);

    // 🌍 FIXED LOCATION STRING
    const location = `${req.body.listing.location || ""}, ${req.body.listing.country || "India"}`;
    console.log("🟡 Location sent:", location);

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1&countrycodes=in`,
      {
        headers: {
          "User-Agent": "listing-app (test@email.com)"
        }
      }
    );

    const text = await response.text();
    let data;

    try {
      data = JSON.parse(text);
    } catch (err) {
      console.log("❌ JSON parse error:", text);
      data = [];
    }

    console.log("📦 Parsed data:", data);

    // ✅ SAVE GEOMETRY
    if (data.length > 0) {
      newListing.geometry = {
        type: "Point",
        coordinates: [
          parseFloat(data[0].lon),
          parseFloat(data[0].lat)
        ]
      };
    } else {
      console.log("❌ No location found from API");
    }

    // 🖼️ MAIN IMAGE
    if (mainImageFile) {
      newListing.mainImage = {
        url: mainImageFile.path,
        filename: mainImageFile.filename
      };
    }

    // 🖼️ OTHER IMAGES
    newListing.otherImages = otherImageFiles.map(file => ({
      url: file.path,
      filename: file.filename
    }));

    // 👤 OWNER
    newListing.owner = req.user._id;

    await newListing.save();
    res.redirect('/listings');

  } catch (err) {
    console.log("❌ CREATE ERROR:", err);
    res.redirect('/listings');
  }
};

// SHOW
module.exports.show = async (req, res) => {
  const { id } = req.params;

  const listings = await listing.findById(id)
    .populate({
      path: "review",
      populate: { path: "author" }
    })
    .populate("owner");

  if (!listings) {
    req.flash("failure", "Cannot find that listing!");
    return res.redirect("/listings");
  }

  res.render("listings/show", { listings });
};

// EDIT
module.exports.edit = async (req, res) => {
  const { id } = req.params;

  const listings = await listing.findById(id);

  if (!listings) {
    req.flash("failure", "Cannot find that listing!");
    return res.redirect("/listings");
  }

  let originalurl = listings.mainImage ? listings.mainImage.url : null;

  if (originalurl) {
    originalurl = originalurl.replace("/upload", "/upload/h_200,w_300");
  }

  res.render("listings/edit", { listings, originalurl });
};

// UPDATE
module.exports.update = async (req, res) => {
  try {
    const { id } = req.params;

    let updatedListing = await listing.findByIdAndUpdate(
      id,
      req.body.listing,
      { new: true }
    );

    // 🌍 FIXED LOCATION STRING
    const location = `${req.body.listing.location || ""}, ${req.body.listing.country || "India"}`;
    console.log("🟡 Update location:", location);

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1&countrycodes=in`,
      {
        headers: {
          "User-Agent": "listing-app (test@email.com)"
        }
      }
    );

    const text = await response.text();
    let data;

    try {
      data = JSON.parse(text);
    } catch (err) {
      console.log("❌ JSON parse error:", text);
      data = [];
    }

    console.log("📦 Update parsed data:", data);

    // ✅ UPDATE GEOMETRY
    if (data.length > 0) {
      updatedListing.geometry = {
        type: "Point",
        coordinates: [
          parseFloat(data[0].lon),
          parseFloat(data[0].lat)
        ]
      };
    } else {
      console.log("❌ No location found during update");
    }

    // 🖼️ MAIN IMAGE
    if (req.files['mainImage']) {
      const mainImageFile = req.files['mainImage'][0];
      updatedListing.mainImage = {
        url: mainImageFile.path,
        filename: mainImageFile.filename
      };
    }

    // 🖼️ OTHER IMAGES
    if (req.files['otherImages']) {
      const otherImageFiles = req.files['otherImages'];
      updatedListing.otherImages = otherImageFiles.map(file => ({
        url: file.path,
        filename: file.filename
      }));
    }

    await updatedListing.save();

    req.flash("success", "Updated listing");
    res.redirect(`/listings/${id}`);

  } catch (err) {
    console.log("❌ UPDATE ERROR:", err);
    res.redirect('/listings');
  }
};

// DELETE
module.exports.destroy = async (req, res) => {
  const { id } = req.params;
  await listing.findByIdAndDelete(id);
  req.flash("success", "Successfully deleted listing!");
  res.redirect('/listings');
};