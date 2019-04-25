const webpack = require("webpack");
//const config = require("../../webpack.config");
const fs = require("fs-extra");

module.exports.compile = function(silent = false) {
  return new Promise((resolve, reject) => {
    fs.emptyDirSync(process.env.BUILD_DIR);
    webpack(config, function(err, stats) {
      if (err) {
        throw err;
      }
      if (!silent) {
        stats
          .toString({
            modules: false,
            cached: false,
            chunks: false
          })
          .split("\n")
          .map(line => {
            console.log("[webpack]", line);
          });
      }
      resolve();
      if (stats.hasErrors()) {
        reject();
      }
    });
  });
};
