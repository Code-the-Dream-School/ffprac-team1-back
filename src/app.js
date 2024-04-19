require("dotenv").config();
const express = require("express");
const app = express();

const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const swaggerDocument = YAML.load('./api-docs.yaml');
//security packages
const cors = require("cors");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimiter = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');

const favicon = require("express-favicon");
const cloudinary = require('cloudinary').v2;

const xssClean = require('./middleware/xssClean');
const errorHandlerMiddleware = require("./middleware/errorHandler");
const notFoundMiddleware = require("./middleware/notFound");

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});


const userRouter = require("./routes/userRouter");
const projectsRouter = require("./routes/projectsRouter");
const profilesRouter = require("./routes/profilesRouter");

const connectDB = require("./db/db");
connectDB();

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// middleware
app.use(helmet()); //adds security headers to protect from vulnerabilities
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true //allows sending cookies and credentials from client from specified origins
})); 
app.use(
    rateLimiter({
      windowMs: 15 * 60 * 1000, //15 minutes -  the time frame for rate limiting
      max: 200, //limits each IP to 100 requests per window
    })
); //limits repeated requests to the endpoints
app.use(mongoSanitize()); //sanitizes user inputs to prevent MongoDB injection attacks


app.use(express.json());
app.use(express.urlencoded({ extended: false })); //ensures that all incoming request bodies are parsed before any other logic processes them
app.use(xssClean); //sanitizes user input to prevent XSS attacks by escaping harmful scripts
app.use(logger("dev"));
app.use(express.static("public"));
app.use(favicon(__dirname + "/public/favicon.ico"));
app.use(cookieParser(process.env.JWT_SECRET)); //the secret key should match the one we sign the cookie with

// routes
//temporary route to test xssClean
app.post('/test', (req, res) => {
    res.send({
        body: req.body,
        query: req.query,
        params: req.params
    });
});

app.use("/api/v1/projects", projectsRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/profiles", profilesRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

module.exports = app;
