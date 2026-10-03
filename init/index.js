if (process.env.NODE_ENV !== "production") {
    require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
}

const mongoose = require("mongoose");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

const initData = require("./data.js");
const Listing = require("../Models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/StayScape";
const OWNER_ID = "6abd31ff90a976eb56accc8b";

const geocodingClient = mbxGeocoding({
    accessToken: process.env.MAP_TOKEN,
});

async function connectDB() {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to DB");
}

async function getGeometry(obj) {
    const response = await geocodingClient
        .forwardGeocode({
            query: `${obj.location}, ${obj.country}`,
            limit: 1,
        })
        .send();

    const feature = response.body.features[0];
    if (!feature) {
        throw new Error(`No geocoding result for ${obj.location}, ${obj.country}`);
    }
    return feature.geometry;
}

async function initDB() {
    await Listing.deleteMany({});

    const listings = [];

    for (const obj of initData.data) {
        const geometry = await getGeometry(obj);

        listings.push({
            ...obj,
            owner: OWNER_ID,
            geometry,
        });
    }

    await Listing.insertMany(listings);
    console.log("Data was initialized");
}

(async () => {
    try {
        await connectDB();
        await initDB();
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.connection.close();
    }
})();