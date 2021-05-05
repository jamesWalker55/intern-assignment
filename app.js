const express = require('express');
const logger = require('morgan');

const waitlistRouter = require('./routes/waitlist');
const db = require("./db")
const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/', waitlistRouter);

db.connectTo();
db.waitlistLimit = 3;

module.exports = app;
