"use strict";

const { DataTypes, Model } = require("sequelize");
const debug = require("debug")("sequelize: Customer")

// define table columns
const attributes = {
  name: {
    allowNull: false,
    type: DataTypes.STRING,
    unique: false,
  },
  phone: {
    allowNull: false,
    type: DataTypes.STRING,
    unique: false,
  },
};

// define table options
const options = {
  timestamps: true,
  updatedAt: false,
  modelName: "customer",
};

// extend Model to add some helper methods
class Customer extends Model {
  /**
   * list all customers in database, ordered by insertion time (i.e. the waitlist)
   */
  static async listAll() {
    debug("Getting list of all customers")
    return await this.findAll({ order: ["createdAt"] });
  }

  /**
   * get a customer given the index in the waitlist (0-based)
   *
   * return null if index is out of bounds
   */
  static async getFromListIndex(index) {
    const customers = await this.listAll();
    debug(`Getting customer from list index: ${index}`)
    const matches = customers.slice(index, index + 1);
    const customer = matches.length == 1 ? matches[0] : null;
    debug(`Found customer: ${customer}`)
    return customer;
  }

  /**
   * create a customer given the name and phone
   */
  static async quickCreate(name, phone) {
    debug(`Creating customer from (${name}, ${phone})`)
    return await this.create({ name: name, phone: phone });
  }

  /**
   * destroy an instance given the database id
   */
  static async destroyByID(id) {
    debug(`Destroying customer with id=(${id})`)
    return await this.destroy({ where: { id: id } });
  }
}

// // this function defines the customer model, given the sequelize instance
// const defineCustomer = (sequelize) => {
//   const final_options = Object.assign({ sequelize }, options);
//   return Customer.init(attributes, final_options);
// };

module.exports = {
  model: Customer,
  attributes,
  options,
};
