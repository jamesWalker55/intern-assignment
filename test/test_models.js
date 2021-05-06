// use chai assertion module
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
chai.should();

// import database
var db = require("../db");

const CUSTOMER_PROPERTIES = ["name", "phone", "index"];

describe("Database", () => {
  describe("methods", () => {
    // when `connectTo` is called without arguments, it should
    // connect to a temporary database for unit testing
    before(db.connectTo);
    describe("#connectTo( [path] )", () => {
      it("is present", () => {
        db.should.have.property("connectTo");
        db.connectTo.should.be.a("function");
      });
      it("can take 0 arguments", () => {
        db.connectTo.should.have.property("length", 0);
      });
    });
    describe("#addCustomer( name, phone )", () => {
      it("is present", () => {
        db.should.have.property("addCustomer");
        db.addCustomer.should.be.a("function");
      });
      it("can take 2 arguments", () => {
        db.addCustomer.should.have.property("length", 2);
      });
    });
    describe("#removeCustomer( index )", () => {
      it("is present", () => {
        db.should.have.property("removeCustomer");
        db.removeCustomer.should.be.a("function");
      });
      it("can take 1 argument", () => {
        db.removeCustomer.should.have.property("length", 1);
      });
    });
    describe("#waitlist()", () => {
      it("is present", () => {
        db.should.have.property("waitlist");
        db.waitlist.should.be.a("function");
      });
    });
    describe("#getWaitlistLimit()", () => {
      it("is present", () => {
        db.should.have.property("getWaitlistLimit");
        db.getWaitlistLimit.should.be.a("function");
      });
    });
    describe("#setWaitlistLimit( limit )", () => {
      it("is present", () => {
        db.should.have.property("setWaitlistLimit");
        db.setWaitlistLimit.should.be.a("function");
      });
      it("can take 1 argument", () => {
        db.setWaitlistLimit.should.have.property("length", 1);
      });
    });
    describe("#waitlistLimitReached()", () => {
      it("is present", () => {
        db.should.have.property("waitlistLimitReached");
        db.waitlistLimitReached.should.be.a("function");
      });
    });
  });
  describe("exception classes", () => {
    describe("ConnectionError", () => {
      it("is defined", () => {
        db.should.have.property("ConnectionError");
        new db.ConnectionError().should.be.an("error");
      });
    });
    describe("NoCustomerError", () => {
      it("is defined", () => {
        db.should.have.property("NoCustomerError");
        new db.NoCustomerError().should.be.an("error");
      });
    });
    describe("WaitlistLimitError", () => {
      it("is defined", () => {
        db.should.have.property("WaitlistLimitError");
        new db.WaitlistLimitError().should.be.an("error");
      });
    });
  });
  describe("when database is not initialized, these methods should throw ConnectionError", () => {
    it("#addCustomer( name, phone )", () => {
      return db.addCustomer("not", "allowed").should.be.rejectedWith(db.ConnectionError);
    });
    it("#removeCustomer( index )", () => {
      return db.removeCustomer(0).should.be.rejectedWith(db.ConnectionError);
    });
    it("#waitlist()", () => {
      return db.waitlist().should.be.rejectedWith(db.ConnectionError);
    });
    it("#getWaitlistLimit()", () => {
      return db.getWaitlistLimit().should.be.rejectedWith(db.ConnectionError);
    });
    it("#setWaitlistLimit( limit )", () => {
      return db.setWaitlistLimit(10).should.be.rejectedWith(db.ConnectionError);
    });
    it("#waitlistLimitReached()", () => {
      return db.waitlistLimitReached().should.be.rejectedWith(db.ConnectionError);
    });
  })
  describe("operations", () => {
    // for each test case, use a new empty temporary database
    describe("adding 3 customers", () => {
      before(async () => await db.connectTo());

      const customers = [
        ["a", "1"],
        ["b", "2"],
        ["c", "3"],
      ];

      it("can add customers, and return customer objects", async () => {
        for (const [name, phone] of customers) {
          const customer = await db.addCustomer(name, phone);
          customer.should.have.all.keys(CUSTOMER_PROPERTIES);
        }
      });
      it("retrieves a waitlist with the correct amount of people", async () => {
        const waitlist = await db.waitlist();
        waitlist.should.be.an("array");
        waitlist.should.have.property("length", 3);
      });
      it("retrieves a waitlist containing customer objects", async () => {
        const waitlist = await db.waitlist();
        for (const customer of waitlist) {
          customer.should.have.all.keys(CUSTOMER_PROPERTIES);
        }
      });
      it("the waitlist does not reference database waitlist", async () => {
        // get waitlist
        let waitlist = await db.waitlist();
        // remove some customers from retrieved list
        waitlist.splice(0, 2);
        // get waitlist again
        waitlist = await db.waitlist();
        // waitlist should be unchanged
        waitlist.should.have.property("length", 3);
      });
      it("added customers in the order specified", async () => {
        const waitlist = await db.waitlist();
        const waitlistNames = waitlist.map((c) => c.name);
        const customerNames = customers.map((c) => c[0]);
        waitlistNames.should.deep.equal(customerNames);
      });
      it("can remove customers, and return customer objects", async () => {
        for (let i = 2; i >= 0; i--) {
          // remove last customer in list each time
          const customer = await db.removeCustomer(i);
          customer.should.have.all.keys(CUSTOMER_PROPERTIES);
          customer.name.should.equal(customers[i][0]);
        }
      });
      it("the waitlist is now empty", async () => {
        const waitlist = await db.waitlist();
        waitlist.should.have.property("length", 0);
      });
    });
    describe("invalid operations", () => {
      before(async () => await db.connectTo());

      it("cannot remove from an empty list", async () => {
        return db.removeCustomer(0).should.be.rejectedWith(db.NoCustomerError);
      });
    });
    describe("waitlist with 5 customers and size-limit of 5", () => {
      const customers = [
        ["aa", "11111"],
        ["bb", "22222"],
        ["cc", "33333"],
        ["dd", "44444"],
        ["ee", "55555"],
      ];
      beforeEach(async () => {
        await db.connectTo();
        await db.setWaitlistLimit(5);
        for (const [name, phone] of customers) {
          await db.addCustomer(name, phone);
        }
      });
      it("cannot add a customer", () => {
        return db
          .addCustomer("not allowed", "no")
          .should.be.rejectedWith(db.WaitlistLimitError);
      });
      it("after removing a customer, can add a customer", async () => {
        const oldLength = (await db.waitlist()).length;
        const firstCustomer = await db.removeCustomer(0);
        firstCustomer.should.have.property("name", customers[0][0]);
        await db.addCustomer("5 customers", "limit 5");
      });
    });
    describe("waitlist with 5 customers, size-limit of 3 set afterwards", () => {
      const customers = [
        ["aa", "11111"],
        ["bb", "22222"],
        ["cc", "33333"],
        ["dd", "44444"],
        ["ee", "55555"],
      ];
      before(async () => {
        await db.connectTo();
        for (const [name, phone] of customers) {
          await db.addCustomer(name, phone);
        }
        await db.setWaitlistLimit(3);
      });
      it("cannot add a customer", () => {
        return db
          .addCustomer("not allowed", "no")
          .should.be.rejectedWith(db.WaitlistLimitError);
      });
      it("can add a customer after removing 3 customers", async () => {
        for (let i = 0; i < 3; i++) {
          // remove first 3 customers
          await db.removeCustomer(0);
        }
        return db.addCustomer("5 customers", "limit 3").should.be.fulfilled;
      });
    });
  });
});
