const mongoose = require("mongoose")

const connectDB = async () => {
  try {
    //console.log("Connecting to MongoDB...", process.env.MONGODB_URI)
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })

    console.log("Connected to MongoDB")
  } catch (error) {
    console.error("Failed to connect to MongoDB. URI:", process.env.MONGODB_URI)
    console.error("Error Details:", error)
    process.exit(1)
  }
}

module.exports = connectDB
