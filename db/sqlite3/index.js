const { Sequelize } = require("sequelize");
const defineCustomer = require("./definitions/customers");

function createSequelize(path = null) {
  // create a Sequelize instance pointing to the given path
  // if no path is given, Sequelize points to memory (temporary database)
  if (path) {
    return new Sequelize({
      dialect: "sqlite",
      storage: path,
      logQueryParameters: true,
    });
  } else {
    return new Sequelize("sqlite::memory:");
  }
}

const sequelize = createSequelize();
const Customer = defineCustomer(sequelize);

async function verifyConnection() {
  // tests if database connection is successful
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    return true;
  } catch (error) {
    return false;
  }
}

// verifyConnection().then();
