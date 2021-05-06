const sq = require("./sequelize");
const debug = require("debug")("sequelize: wrapper");

class SequelizeWrapper {
  // constants for Config
  WAITLIST_LIMIT_KEY = "waitlist_limit";

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
    // checks if connection is made, this.sequelize must be set
    if (!this.sequelize) {
      throw new this.ConnectionError("Connection is not established yet!");
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
    debug(`Connection success!`);
  }

  /**
   * add a customer to waitlist, given the name and phone number
   *
   * throws WaitlistLimitError if operation exceeds size-limit
   */
  async addCustomer(name, phone) {
    // waitlistLimitReached already checks connection, no need for this.checkConnection()
    debug(`Adding customer with (${name}, ${phone})`);
    const limitReached = await this.waitlistLimitReached();
    if (limitReached) {
      const limit = await this.getWaitlistLimit();
      debug(`Waitlist limit reached, discarding (${name}, ${phone})`);
      throw new this.WaitlistLimitError(`Adding customer exceeds waitlist limit of ${limit}.`)
    }
    const instance = await this.customer.quickCreate(name, phone);
    // customer must be added at end of list, so length of list - 1 == customer index
    const waitlistLength = await this.customer.count();
    debug(`Added customer with (${name}, ${phone})`);
    return this.Customer(instance, waitlistLength - 1);
  }

  /**
   * remove a customer from waitlist, given the index in the waitlist
   * 
   * throws NoCustomerError if index doesn't correspond to a customer
   */
  async removeCustomer(index) {
    debug(`removing customer with list index (${index})`);
    this.checkConnection();
    const match = await this.customer.getFromListIndex(index);
    if (!match) {
      const message = `No customer with index ${index} found.`;
      debug(message);
      throw new this.NoCustomerError(message);
    }
    await this.customer.destroyByID(match.id);
    debug(`removed customer with (${index}) => (${match.name}, ${match.phone})`);
    return this.Customer(match, index);
  }

  /**
   * return the waitlist as an array of customer objects
   */
  async waitlist() {
    debug(`obtaining waitlist`);
    this.checkConnection();
    const waitlistRaw = await this.customer.listAll();
    const waitlist = waitlistRaw.map((instance, i) =>
      this.Customer(instance, i)
    );
    debug(`obtained waitlist`);
    return waitlist;
  }
  
  /**
   * return waitlist size limit, 0 represents no limit
   */
  async getWaitlistLimit() {
    debug(`getting waitlist limit`);
    this.checkConnection();
    const limitRaw = await this.config.get(this.WAITLIST_LIMIT_KEY);
    // all values from config are strings, so parse it first
    const limit = parseInt(limitRaw);
    if (Number.isNaN(limit)) {
      debug(`invalid limit ${limitRaw}, treating as 0`);
      return 0;
    }
    debug(`got waitlist limit = ${limit}`);
    return limit;
  }
  
  /**
   * set waitlist size limit; value of 0 disables limit
   */
  async setWaitlistLimit(limitRaw) {
    debug(`setting waitlist limit`);
    this.checkConnection();
    const limit = parseInt(limitRaw);
    if (limit < 0 || Number.isNaN(limit)) {
      debug(`invalid limit ${limitRaw}, treating as 0`);
      limit = 0;
    }
    await this.config.set(this.WAITLIST_LIMIT_KEY, limit);
    debug(`set waitlist limit = ${limit}`);
    return limit;
  }

  /**
   * check if limit has been reached; value of 0 disables limit
   */
  async waitlistLimitReached() {
    // getWaitlistLimit already checks connection, no need for this.checkConnection()
    const limit = await this.getWaitlistLimit();
    if (limit == 0) return false;
    const waitlistLength = await this.customer.count();
    const limitReached = waitlistLength >= limit;
    debug(`determined waitlist limit has${limitReached ? "" : " not"} been reached ${limitReached}`);
    return limitReached;
  }
}

const db = new SequelizeWrapper();

module.exports = db;
