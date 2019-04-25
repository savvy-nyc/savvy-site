const process = require("process");
const fs = require("fs-extra");

module.exports.ensureTemplate = async function() {
  let templateExists = await fs.pathExists(process.env.TEMPLATE_PATH);
  return templateExists
    ? Promise.resolve()
    : Promise.reject({
        message: `CloudFormation template not found: ${
          process.env.TEMPLATE_PATH
        }`
      });
};
