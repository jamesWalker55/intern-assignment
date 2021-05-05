// A fake database backed by an array
// Used before sqlite3 database is implemented
// Passes all unit tests

class NativeModel {
  // define errors
  NotConnectedError = class extends Error {
    constructor() {
      super("Not connected to database yet!");
      this.name = `NotConnectedError`;
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
  // helper method for creating customer objects
  Customer(name, phone, index) {
    return { name: name, phone: phone, index: index };
  }
  // connect to the given path
  // if path is not given, it should connect to a temporary and empty database for unit testing
  connectTo(path = null) {
    this.list = [];
    this.limit = 0;
  }
  // add a customer to waitlist, given the name and phone number
  // throws WaitlistLimitError if operation exceeds size-limit
  addCustomer(name, phone) {
    if (this.waitlistLimitReached())
      throw new this.WaitlistLimitError(
        "Adding customer exceeds waitlist limit."
      );
    this.list.push([name, phone]);
    return this.Customer(name, phone, this.list.length - 1);
  }
  // remove a customer from waitlist, given the index in the waitlist
  // throws NoCustomerError if index doesn't correspond to a customer
  removeCustomer(index) {
    if (this.list === undefined) throw new this.NotConnectedError();
    const result = this.list.splice(index, 1);
    if (result.length == 0)
      throw new this.NoCustomerError(`No customer with index ${index} found.`);
    const customer = result[0];
    return this.Customer(customer[0], customer[1], index);
  }
  // return the waitlist as an array of customer objects
  get waitlist() {
    if (this.list === undefined) throw new this.NotConnectedError();
    return this.list.map((x, i) => this.Customer(x[0], x[1], i));
  }
  // return waitlist size limit, 0 represents no limit
  get waitlistLimit() {
    if (this.limit === undefined) throw new this.NotConnectedError();
    return this.limit;
  }
  // set waitlist size limit
  // value of 0 disables limit
  set waitlistLimit(limit) {
    if (this.limit === undefined) throw new this.NotConnectedError();
    this.limit = limit;
  }
  // check if limit has been reached
  // value of 0 disables limit
  waitlistLimitReached() {
    if (this.list === undefined) throw new this.NotConnectedError();
    if (this.limit === 0) return false;
    return this.list.length >= this.limit;
  }
}

const model = new NativeModel();

module.exports = model;
