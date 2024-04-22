require("dotenv").config();

const mongoose = require("mongoose");
const User = require("./src/models/User");
const Project = require("./src/models/User");

const populateForNotifications = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const result = await User.updateMany(
      {},
      {
        $set: {}
      }
    );
    console.log("Update result:", result);
  } catch (error) {
    console.error("Error populating profiles:", error);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  }
};

populateForNotifications();
