require("dotenv").config()
const express = require("express")
const mongoose = require("mongoose")
const app = express()
const cors = require("cors")
const favicon = require("express-favicon")
const logger = require("morgan")
const cookieParser = require("cookie-parser")
const crypto = require("crypto")
const errorHandlerMiddleware = require("./middleware/errorHandler")
const notFoundMiddleware = require("./middleware/notFound")

const userRouter = require("./routes/userRouter")
const projectsRouter = require("./routes/projectsRouter")
const profilesRouter = require("./routes/profilesRouter")

// Connect to MongoDB
const connectDB = require("./db/db")
connectDB()

// middleware
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
   })); 
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(logger("dev"))
app.use(express.static("public"))
app.use(favicon(__dirname + "/public/favicon.ico"))
app.use(cookieParser(process.env.JWT_SECRET)) //the secret key should match the one we sign the cookie with

// routes
app.use("/api/v1/projects", projectsRouter)
app.use("/api/v1/users", userRouter)
app.use("/api/v1/profiles", profilesRouter)

app.use(notFoundMiddleware)
app.use(errorHandlerMiddleware)

module.exports = app
