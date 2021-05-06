"use strict";

const { DataTypes, Model } = require("sequelize");
const debug = require("debug")("sequelize: Config")

// define table columns
const attributes = {
  key: {
    allowNull: false,
    type: DataTypes.STRING,
    unique: true,
    primaryKey: true,
  },
  value: {
    allowNull: true,
    type: DataTypes.STRING,
    unique: false,
  },
};

// define table options
const options = {
  timestamps: false,
  modelName: "config",
};

// extend Model to add some helper methods
class Config extends Model {
  /**
   * set a key to a given value, like a map
   */
  static async set(key, value) {
    debug(`Setting (${key}) = (${value})`)
    const row = (await this.findOrBuild({where:{key: key}}))[0]
    row.value = value;
    row.save();
  }

  /**
   * get a value corresponding to a key
   * 
   * returns undefined if key is not in config
   */
  static async get(key) {
    debug(`Retrieving value from key (${key})`)
    const row = (await this.findOrBuild({where:{key: key}}))[0]
    const value = row.value;
    debug(`Retrieved value (${key})=>(${value})`)
    return value;
  }
}

module.exports = {
  model: Config,
  attributes,
  options,
};
