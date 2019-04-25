const http = require("http");
const app = require("./app");

module.exports = new Promise(resolve => {
  http.createServer(app).listen(3000, function() {
    let url = "http://localhost:3000";
    console.log(`Server listening on ${url}`);
    resolve(url);
  });
});
