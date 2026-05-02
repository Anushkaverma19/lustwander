const mongoose = require('mongoose');

const review = require('./init/review');
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    price: Number,
    location: String,
    country:{
        type: String,
        default: "India"

    } ,

 mainImage: {
  url: { type: String, required: true },
  filename: String
},
otherImages: [
  {
    url: { type: String, required: true },
    filename: String
  }
],

    review: [
        {
            type: Schema.Types.ObjectId,
            ref: "review"
        }
    ],
    owner:{
        type:Schema.Types.ObjectId,
        ref:"user"
    },
    geometry: {
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point'
  },
  coordinates: {
    type: [Number] // [lng, lat]
  }
}
});

listingSchema.post('findOneAndDelete', async (listing) => {
    if(listing){
review.deleteMany({
    _id: {
        $in: listing.review
    }});
    }

});
   

const listing = mongoose.model('listing', listingSchema);

module.exports = listing;