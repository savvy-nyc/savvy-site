const serverless = require("serverless-http");
const app = require("./app");

module.exports.handler = serverless(app, {
  platform: "aws",
  type: "edge-origin-request"
});
