require("dotenv").config()
const express = require("express")
const mongoose = require("mongoose")
const app = express()
const cors = require("cors")
const favicon = require("express-favicon")
const logger = require("morgan")

const errorHandlerMiddleware = require('./middleware/errorHandler');
const notFoundMiddleware = require('./middleware/notFound');

const userRouter = require("./routes/userRouter")
const projectsRouter = require("./routes/projectsRouter")

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
app.use("/api/v1/projects", projectsRouter)
app.use("/api/v1/users", userRouter)

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

module.exports = app
