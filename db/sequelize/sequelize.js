"use strict";

const { Sequelize } = require("sequelize");
const definitions = require("./models");
const debug = require("debug")("sequelize: [startup]");

/**
 * create a Sequelize instance pointing to the given path
 *
 * if no path is given, Sequelize points to a new database in memory (temporary database)
 */
async function createSequelize(path = null) {
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

/**
 * test if database connection is successful
 */
async function verifyConnection(sequelize) {
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

/**
 * setup database, creating tables and defining the customer model
 */
async function initialaizeDatabase(sequelize) {
  function defineModel(sequelize, modelDefinition) {
    // setup a model, given the sequelize instance and the exported object from ./models
    const model = modelDefinition.model;
    const attributes = modelDefinition.attributes;
    const options = modelDefinition.options;

    const final_options = Object.assign({ sequelize }, options);
    return model.init(attributes, final_options);
  }

  // define each model in ./models
  for (const modelDef of definitions) {
    debug(`Defining model with ${modelDef}`);
    defineModel(sequelize, modelDef);
  }
  // sync with sequelize
  debug(`Syncing database with model`);
  await sequelize.sync({ alter: true });
}

module.exports = {
  createSequelize,
  verifyConnection,
  initialaizeDatabase,
};
