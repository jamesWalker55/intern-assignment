var should = require("should");
var db = require("../db");

const CUSTOMER_PROPERTIES = ["name", "phone", "index"];

function arraysEqual(a1, a2) {
  // test that 2 arrays are equal
  function testElement(e1, e2) {
    // test 2 array elements, may be arrays
    if (Array.isArray(e1)) return arraysEqual(e1, e2);
    return e1 === e2;
  }
  if (!(Array.isArray(a1) && Array.isArray(a2))) return false;
  if (a1.length != a2.length) return false;
  for (let i = 0; i < a1.length; i++) {
    const isEqual = testElement(a1[i], a2[i]);
    if (!isEqual) return false;
  }
  return true;
}

describe("Database", () => {
  describe("db methods", () => {
    // when `connectTo` is called without arguments, it should
    // connect to a temporary database for unit testing
    before(() => db.connectTo());
    describe("#connectTo( (path) )", () => {
      it("is present", () => {
        db.should.have.property("connectTo");
        db.connectTo.should.be.a.Function();
      });
    });
    describe("#addCustomer( name, phone )", () => {
      it("is present", () => {
        db.should.have.property("addCustomer");
        db.addCustomer.should.be.a.Function();
      });
    });
    describe("#removeCustomer( index )", () => {
      it("is present", () => {
        db.should.have.property("removeCustomer");
        db.removeCustomer.should.be.a.Function();
      });
    });
    describe("get ::waitlist", () => {
      it("is present", () => {
        db.should.have.property("waitlist");
      });
    });
    describe("set/get ::waitlistLimit", () => {
      it("is present", () => {
        db.should.have.property("waitlistLimit");
      });
    });
    describe("#waitlistLimitReached()", () => {
      it("is present", () => {
        db.should.have.property("waitlistLimitReached");
        db.waitlistLimitReached.should.be.a.Function();
      });
    });
  });
  describe("exception classes", () => {
    describe("NotConnectedError", () => {
      it("is defined", () => {
        db.should.have.property("NotConnectedError");
        new db.NotConnectedError().should.be.Error();
      });
    });
    describe("NoCustomerError", () => {
      it("is defined", () => {
        db.should.have.property("NoCustomerError");
        new db.NoCustomerError().should.be.Error();
      });
    });
    describe("WaitlistLimitError", () => {
      it("is defined", () => {
        db.should.have.property("WaitlistLimitError");
        new db.WaitlistLimitError().should.be.Error();
      });
    });
  });
  describe("basic operations", () => {
    // for each test case, use a new empty temporary database
    describe("adding 3 customers", () => {
      before(() => db.connectTo());
      const customers = [
        ["a", "1"],
        ["b", "2"],
        ["c", "3"],
      ];
      it("can add customers, and return customer objects", () => {
        for (const [name, phone] of customers) {
          const customer = db.addCustomer(name, phone);
          customer.should.have.properties(CUSTOMER_PROPERTIES);
        }
      });
      it("retrieves a waitlist with the correct amount of people", () => {
        const waitlist = db.waitlist;
        waitlist.should.be.an.Array;
        waitlist.length.should.be.exactly(3);
      });
      it("retrieves a waitlist containing customer objects", () => {
        const waitlist = db.waitlist;
        for (let customer of waitlist) {
          customer.should.have.properties(CUSTOMER_PROPERTIES);
        }
      });
      it("the waitlist is not directly linked to the database waitlist", () => {
        // get waitlist
        let waitlist = db.waitlist;
        // remove some customers from retrieved list
        waitlist.splice(0, 2);
        // get waitlist again
        waitlist = db.waitlist;
        // waitlist should be unchanged
        waitlist.length.should.be.exactly(3);
      });
      it("added customers in the order specified", () => {
        const waitlist = db.waitlist;
        const waitlistNames = waitlist.map((c) => c.name);
        const customerNames = customers.map((c) => c[0]);
        should(arraysEqual(waitlistNames, customerNames));
      });
      it("can remove customers, and return customer objects", () => {
        for (let i = 2; i >= 0; i--) {
          // remove last customer in list each time
          const customer = db.removeCustomer(i);
          customer.should.have.properties(CUSTOMER_PROPERTIES);
          customer.name.should.be.exactly(customers[i][0]);
        }
      });
      it("the waitlist is now empty", () => {
        const waitlist = db.waitlist;
        waitlist.length.should.be.exactly(0);
      });
    });
    describe("invalid operations", () => {
      before(() => db.connectTo());

      it("cannot remove from an empty list", () => {
        (() => db.removeCustomer(0)).should.throw(db.NoCustomerError);
      });

      it("cannot remove from invalid index", () => {
        db.addCustomer("a", "a");
        db.addCustomer("a", "a");
        (() => db.removeCustomer(99)).should.throw(db.NoCustomerError);
        db.removeCustomer(0);
        db.removeCustomer(0);
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
      before(() => {
        db.connectTo();
        db.waitlistLimit = 5;
        for (const [name, phone] of customers) {
          const customer = db.addCustomer(name, phone);
          customer.should.have.properties(CUSTOMER_PROPERTIES);
        }
      });
      it("cannot add a customer", () => {
        const oldLength = db.waitlist.length;
        (() => db.addCustomer("not allowed", "no")).should.throw(
          db.WaitlistLimitError
        );
        db.waitlist.length.should.be.exactly(oldLength);
      });
      it("after removing a customer, can add a customer", () => {
        const oldLength = db.waitlist.length;
        const firstCustomer = db.removeCustomer(0);
        firstCustomer.name.should.be.exactly(customers[0][0]);
        db.addCustomer("allowed", "yes");
        // final length should be unchanged
        db.waitlist.length.should.be.exactly(oldLength);
      })
    });
    describe("waitlist with 5 customers, size-limit of 3 set afterwards", () => {
      const customers = [
        ["aa", "11111"],
        ["bb", "22222"],
        ["cc", "33333"],
        ["dd", "44444"],
        ["ee", "55555"],
      ];
      before(() => {
        db.connectTo();
        for (const [name, phone] of customers) {
          const customer = db.addCustomer(name, phone);
          customer.should.have.properties(CUSTOMER_PROPERTIES);
        }
        db.waitlistLimit = 3;
      });
      it("cannot add a customer", () => {
        const oldLength = db.waitlist.length;
        (() => db.addCustomer("not allowed", "no")).should.throw(
          db.WaitlistLimitError
        );
        db.waitlist.length.should.be.exactly(oldLength);
      });
      it("can add a customer only after removing 3 customers", () => {
        const oldLength = db.waitlist.length;
        for (let i = 0; i < 3; i++) {
          // cannot add customers
          (() => db.addCustomer("not allowed", "no")).should.throw(
            db.WaitlistLimitError
          );
          // remove first 3 customers
          db.removeCustomer(0);
        }
        db.addCustomer("allowed", "yes");
        // final length should be unchanged
        db.waitlist.length.should.be.exactly(3);
      })
    });
  });
});
