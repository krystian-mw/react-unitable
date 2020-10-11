"use strict";

const fs = require("fs");
const path = require("path");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    let out = [];
    let files = fs.readdirSync(path.resolve(__dirname, "mock"));
    files.forEach((filePath) => {
      let file = JSON.parse(
        fs
          .readFileSync(path.resolve(__dirname, "mock", filePath))
          .toString()
          .replace(/"id":[0-9]*,/g, "")
          .replace(/Female/g, "F")
          .replace(/Male/g, "M")
      );
      file.forEach((record) => {
        let temp = record.bd.split("/");
        record.bd = `${temp[1]}-${temp[0]}-${temp[2]}`;
        temp = null;
        out.push({
          ...record,
          createdAt: new Date().toUTCString(),
          updatedAt: new Date().toUTCString(),
        });
        file = null;
      });
    });

    files = null;
    await queryInterface.bulkInsert("people", [...out], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("people", null, {});
  },
};
