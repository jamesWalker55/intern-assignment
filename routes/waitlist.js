var express = require("express");
var router = express.Router();
const db = require("../db");

// get route
router.get("/", (req, res, next) => {
  // list all customers in waitlist
  const waitlist = db.waitlist;
  res.send(waitlist);
});

// post route
router.post("/", (req, res, next) => {
  const name = req.body.name;
  const phone = req.body.phone;
  const index = req.body.index;
  if (name !== undefined && phone !== undefined && index === undefined) {
    // only name and phone are defined, create a customer
    addCustomer(req, res, next);
  } else if (name === undefined && phone === undefined && index !== undefined) {
    // only index is defined, set waitlist limit
    setWaitlistLimit(req, res, next);
  } else {
    // invalid input
    res
      .status(400)
      .send("Please specify either `name` and `phone`, or `index` only.");
  }
});

// delete route
router.delete("/", (req, res, next) => {
  if (req.body.index === undefined) {
    // error if index is not provided
    res.status(400).send("`index` not given.");
    return;
  }
  try {
    const customer = db.removeCustomer(req.body.index);
    // return the removed customer
    res.status(200).send(customer);
  } catch (error) {
    if (error instanceof db.NoCustomerError) {
      // no customer found, return message
      res.status(406).send(`No customer with index ${req.body.index}.`);
    } else {
      // other errors are handled by the error handler
      next(error);
    }
  }
});

// add customer to waitlist
function addCustomer(req, res, next) {
  try {
    const customer = db.addCustomer(req.body.name, req.body.phone);
    // return the created customer
    res.status(201).send(customer);
  } catch (error) {
    if (error instanceof db.WaitlistLimitError) {
      res.status(405).send("Waitlist limit reached.");
    } else {
      next(error);
    }
  }
}

// set waitlist limit
function setWaitlistLimit(req, res, next) {
  db.waitlistLimit = req.body.index;
  res.status(200).send([db.waitlistLimit]);
}

module.exports = router;
