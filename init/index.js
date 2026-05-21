const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGOURL = "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
  await mongoose.connect(MONGOURL);
}

const initDb = async () => {
  await Listing.deleteMany({});

  initData.data = initData.data.map((obj) => ({
    ...obj,
    owner: "6a070da74997ae316b6c5275",
  }));
  await Listing.insertMany(initData.data);
  console.log("Data was initialized");
};

main()
  .then(async () => {
    console.log("connected to db");
    await initDb();
    await mongoose.connection.close();
  })
  .catch((err) => {
    console.log(err);
  });
