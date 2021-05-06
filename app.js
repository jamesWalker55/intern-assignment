const express = require("express");
const logger = require("morgan");

const waitlistRouter = require("./routes/waitlist");
const db = require("./db");
const app = express();

app.use(logger("dev"));

// process input data, supports json and urlencoded data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// use router defined in routes/waitlist.js
app.use("/", waitlistRouter);

// custom error handler
app.use(errorHandler);

function errorHandler(err, req, res, next) {
  console.error(err.stack);
  res.status(400).send({
    error: err.name,
    message: err.message,
  });
}

// initialise database
db.connectTo("database.sqlite");

module.exports = app;
