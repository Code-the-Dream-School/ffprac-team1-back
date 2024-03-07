require("dotenv").config()

const express = require("express")
const mongoose = require("mongoose")
const app = express()
const cors = require("cors")
const favicon = require("express-favicon")
const logger = require("morgan")

const mainRouter = require("./routes/mainRouter.js")
const userRouter = require("./routes/userRouter")

// Connect to MongoDB
const connectDB = require("./db/db")
connectDB()

// middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(logger("dev"))
app.use(express.static("public"))
app.use(favicon(__dirname + "/public/favicon.ico"))

// routes
app.use("/api/v1", mainRouter)
app.use("/api/v1/users", userRouter)

// Start the server
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

module.exports = app
