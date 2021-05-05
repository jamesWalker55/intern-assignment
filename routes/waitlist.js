var express = require("express");
var router = express.Router();
const db = require("../db");

// wrap async functions so that any errors are handled by
// espress.js's error handler
function asyncFuncHandler(asyncFunc) {
  return async function (req, res, next) {
    try {
      await asyncFunc(req, res);
    } catch (error) {
      next(error);
    }
  };
}

// define REST routes
router.get("/", asyncFuncHandler(getWaitlist));
router.post("/", asyncFuncHandler(addCustomer));
router.delete("/", asyncFuncHandler(removeCustomer));

// non-REST routes for waitlist limit
router.get("/limit/", asyncFuncHandler(getWaitlistLimit));
router.post("/limit/", asyncFuncHandler(setWaitlistLimit));

async function getWaitlist(req, res) {
  // list all customers in waitlist
  const waitlist = await db.waitlist();
  res.send(waitlist);
}

// add customer to waitlist
async function addCustomer(req, res) {
  // input validation
  if (name === undefined || phone === undefined)
    throw "name or phone is undefined.";
  const name = String(req.body.name);
  const phone = String(req.body.phone);

  const customer = await db.addCustomer(name, phone);
  // return the created customer
  res.status(201).send(customer);
}

async function removeCustomer(req, res) {
  // input validation
  const index = parseInt(req.body.index);
  if (Number.isNaN(index)) throw `Invalid index ${req.body.index}.`;

  const customer = await db.removeCustomer(index);
  // return the removed customer
  res.status(200).send(customer);
}

// set waitlist limit
async function setWaitlistLimit(req, res) {
  // input validation
  const limit = parseInt(req.body.limit);
  if (Number.isNaN(limit)) throw `Invalid limit ${req.body.limit}.`;

  await db.setWaitlistLimit(limit);
  res.status(200).send([await db.getWaitlistLimit()]);
}

// set waitlist limit
async function getWaitlistLimit(req, res) {
  res.status(200).send([await db.getWaitlistLimit()]);
}

module.exports = router;
