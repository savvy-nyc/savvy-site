const next = require("next");
const express = require("express");

const routes = require("./routes");
const app = next({ dev: true });
const handler = routes.getRequestHandler(app);

app.prepare().then(() => {
  express()
    .use(handler)
    .listen(3000, function() {
      console.log("Server listening on https://localhost:3000");
    });
});
