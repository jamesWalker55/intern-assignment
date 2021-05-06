// A fake database backed by an array
// Used before sqlite3 database is implemented
// Passes all unit tests
const debug = require("debug")("native: main");

class NativeModel {
  // define errors
  ConnectionError = class extends Error {
    constructor(message) {
      super(message);
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
  Customer(name, phone, index) {
    return { name: name, phone: phone, index: index };
  }

  /**
   * connect to the given path
   *
   * if path is not given, it should connect to a temporary and empty database for unit testing
   *
   * since this is a fake database for unit testing, the path does not matter
   */
  async connectTo(path = null) {
    debug("Resetting database");
    this.list = [];
    this.limit = 0;
  }

  /**
   * add a customer to waitlist, given the name and phone number
   *
   * throws WaitlistLimitError if operation exceeds size-limit
   */
  async addCustomer(name, phone) {
    if (await this.waitlistLimitReached())
      throw new this.WaitlistLimitError(
        "Adding customer exceeds waitlist limit."
      );
    this.list.push([name, phone]);
    return this.Customer(name, phone, this.list.length - 1);
  }

  /**
   * remove a customer from waitlist, given the index in the waitlist
   * 
   * throws NoCustomerError if index doesn't correspond to a customer
   */
  async removeCustomer(index) {
    if (this.list === undefined) throw new this.ConnectionError();
    const result = this.list.splice(index, 1);
    if (result.length == 0)
      throw new this.NoCustomerError(`No customer with index ${index} found.`);
    const customer = result[0];
    return this.Customer(customer[0], customer[1], index);
  }

  /**
   * return the waitlist as an array of customer objects
   */
  async waitlist() {
    if (this.list === undefined) throw new this.ConnectionError();
    return this.list.map((x, i) => this.Customer(x[0], x[1], i));
  }
  
  /**
   * return waitlist size limit, 0 represents no limit
   */
  async getWaitlistLimit() {
    if (this.limit === undefined) throw new this.ConnectionError();
    return this.limit;
  }
  
  /**
   * set waitlist size limit; value of 0 disables limit
   */
  async setWaitlistLimit(limit) {
    if (this.limit === undefined) throw new this.ConnectionError();
    this.limit = limit;
  }

  /**
   * check if limit has been reached; value of 0 disables limit
   */
  async waitlistLimitReached() {
    if (this.list === undefined) throw new this.ConnectionError();
    if (this.limit === 0) return false;
    return this.list.length >= this.limit;
  }
}

const model = new NativeModel();

module.exports = model;
