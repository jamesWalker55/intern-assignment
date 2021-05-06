const express = require("express");
const logger = require("morgan");

const waitlistRouter = require("./routes/waitlist");
const db = require("./db");
const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/", waitlistRouter);
app.use(errorHandler)

function errorHandler(err, req, res, next) {
  console.error(err.stack)
  res.status(400).send({
    error: err.name,
    message: err.message,
  })
}

db.connectTo();

module.exports = app;
