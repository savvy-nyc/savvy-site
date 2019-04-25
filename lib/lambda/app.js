const path = require("path");
const process = require("process");
const express = require("express");
const routes = require("./routes");

const app = express();
const handler = routes.getServerlessRequestHandler(app);

if (process.env.DEV_SERVER === "true") {
  app.use("/_next/static", express.static(path.join(__dirname, "static")));
}

app.use(handler);

module.exports = app;
