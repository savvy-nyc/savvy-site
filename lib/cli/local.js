require("dotenv").config();
const process = require("process");
const path = require("path");
const open = require("open");

let { APP_ENV } = process.env;

require(path.resolve(process.cwd(), `.pkg/${APP_ENV}/local/local.js`)).then(
  url => {
    open(url);
  }
);
