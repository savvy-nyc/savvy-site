const fs = require("fs-extra");
const path = require("path");

module.exports.saveTemplate = function(template) {
  return fs.outputJson(
    path.resolve(__dirname, "../../cloudformation.json"),
    typeof template === "string" ? JSON.parse(template) : template,
    {
      spaces: "\t"
    }
  );
};
