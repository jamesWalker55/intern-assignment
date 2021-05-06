"use strict";

const sq = require("./sequelize");
const debug = require("debug")("sequelize: main");

async function main() {
  debug("creating sequelize instance");
  const db = await sq.createSequelize();
  debug("verifying sequelize instance");
  await sq.verifyConnection(db);
  debug("initializing database");
  await sq.initialaizeDatabase(db);

  debug("creating test customers");
  const customer = db.models.customer;
  await customer.quickCreate("first guy", "124");
  await customer.quickCreate("next guy", "124132");
  await customer.quickCreate("third guy", "112324");
  await customer.quickCreate("last guy", "11242124");

  return db;
}

let db = null;
let models = null;
let test = null;

main().then(async (x) => {
  db = x;
  models = x.models;
  test = await models.customer.listAll();
});
