"use strict";

const { Sequelize } = require("sequelize");
const definitions = require("./models");
const debug = require("debug")("sequelize: [startup]");

async function createSequelize(path = null) {
  // create a Sequelize instance pointing to the given path
  // if no path is given, Sequelize points to a new database in memory (temporary database)
  if (path) {
    debug(`Creating new sequelize to ${path}`);
    return new Sequelize({
      dialect: "sqlite",
      storage: path,
      logQueryParameters: true,
    });
  } else {
    debug(`Creating new sequelize to :memory:`);
    const db = new Sequelize("sqlite::memory:", { logging: false });
    return db;
  }
}

async function verifyConnection(sequelize) {
  // test if database connection is successful
  debug(`Verifing sequelize...`);
  try {
    await sequelize.authenticate();
    debug(`Verify success!`);
    return true;
  } catch (error) {
    debug(`Verify failed!`);
    return false;
  }
}

// define a model given the Sequelize instance and the exported object of each model module
function defineModel(sequelize, modelDefinition) {
  const model = modelDefinition.model;
  const attributes = modelDefinition.attributes;
  const options = modelDefinition.options;

  const final_options = Object.assign({ sequelize }, options);
  return model.init(attributes, final_options);
}

async function initialaizeDatabase(sequelize) {
  // setup database, creating tables and defining the customer model
  for (const modelDef of definitions) {
    debug(`Defining model with ${modelDef}`);
    defineModel(sequelize, modelDef);
  }
  debug(`Syncing database with model`);
  await sequelize.sync({ alter: true });
}

module.exports = {
  createSequelize,
  verifyConnection,
  initialaizeDatabase,
};
