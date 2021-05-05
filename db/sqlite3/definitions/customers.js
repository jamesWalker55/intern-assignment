const { DataTypes } = require("sequelize");

// this function defines the customer model, given the sequelize instance
const customer = (sequelize) => {
  sequelize.define(
    "customer",
    {
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
    },
    { timestamps: true, updatedAt: false }
  );
};

module.exports = customer;
// .load ./models/customers.js
