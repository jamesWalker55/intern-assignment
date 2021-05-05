BACKEND_MAP = {
  native: "./native",
  sqlite3: "./sequelize",
}

backend_path = BACKEND_MAP["native"]

module.exports = require("./native");

