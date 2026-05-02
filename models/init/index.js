const mongoose = require('mongoose');
const initdata = require('./data');              // imported data
const Listing = require('../listing.js');  // ek level upar jao, bas
main()
.then(() => { console.log('Connected to MongoDB') })
.catch(err => { console.log(err) });

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/wandering');
}

// Function to insert initial data
const insertInitialData = async () => {
    await Listing.deleteMany({});
    initdata.data=initdata.data.map((obj) => ({
      ...obj,owner: new mongoose.Types.ObjectId('69dfb4782a02aa6bb5f609dd') // Generate a new ObjectId for each listing
    }));

     
    await Listing.insertMany(initdata.data);
    console.log("Data inserted");
};

insertInitialData();