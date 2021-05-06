const sq = require("./sequelize");
const debug = require("debug")("sequelize: wrapper");

class SequelizeWrapper {
  // define errors
  ConnectionError = class extends Error {
    constructor() {
      super("Not connected to database yet!");
      this.name = `ConnectionError`;
    }
  };

  NoCustomerError = class extends Error {
    constructor(message) {
      super(message);
      this.name = `NoCustomerError`;
    }
  };

  WaitlistLimitError = class extends Error {
    constructor(message) {
      super(message);
      this.name = `WaitlistLimitError`;
    }
  };

  /**
   * helper method for creating customer objects
   */
  Customer(sqlInstance, index) {
    return { name: sqlInstance.name, phone: sqlInstance.phone, index: index };
  }

  constructor() {
    this.sequelize = null;
    this.customer = null;
    this.config = null;
  }

  checkConnection() {
    if (!this.sequelize) {
      throw new this.ConnectionError("Connection is not established yet!")
    }
  }

  /**
   * connect to the given path and initialize database
   *
   * if path is not given, it should connect to a temporary and empty database for unit testing
   */
  async connectTo(path = null) {
    if (path) {
      debug(`Connecting to ${path}`);
    } else {
      debug(`Connecting to temporary database at :memory:`);
    }
    this.sequelize = sq.createSequelize(path);
    await sq.verifyConnection(this.sequelize);
    await sq.initialaizeDatabase(this.sequelize);
    this.customer = this.sequelize.models.customer;
    this.config = this.sequelize.models.config;
  }

  /**
   * add a customer to waitlist, given the name and phone number
   *
   * throws WaitlistLimitError if operation exceeds size-limit
   */
  async addCustomer(name, phone) {
    this.checkConnection();
    const instance = await this.customer.quickCreate(name, phone);
    // customer must be added at end of list, so length of list - 1 == customer index
    const waitlistLength = await this.customer.count();
    return this.Customer(instance, waitlistLength - 1);
  }

  /**
   * remove a customer from waitlist, given the index in the waitlist
   * 
   * throws NoCustomerError if index doesn't correspond to a customer
   */
  async removeCustomer(index) {
    this.checkConnection();
  }

  /**
   * return the waitlist as an array of customer objects
   */
  async waitlist() {
    this.checkConnection();
    const waitlistRaw = await this.customer.listAll();
    const waitlist = waitlistRaw.map((instance, i) => this.Customer(instance, i));
    return waitlist;
  }
  
  /**
   * return waitlist size limit, 0 represents no limit
   */
  async getWaitlistLimit() {
    this.checkConnection();
  }
  
  /**
   * set waitlist size limit; value of 0 disables limit
   */
  async setWaitlistLimit(limit) {
    this.checkConnection();
  }

  /**
   * check if limit has been reached; value of 0 disables limit
   */
  async waitlistLimitReached() {
    this.checkConnection();
  }
}

const db = new SequelizeWrapper();

module.exports = db;