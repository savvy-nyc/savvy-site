require("dotenv");
const inquirer = require("inquirer");
const pkg = require("../../package.json");
const path = require("path");
const fs = require("fs-extra");

const { getTemplate } = require("../cloudformation/get_template");
const { saveTemplate } = require("../cloudformation/save_template");

module.exports.getStack = async function() {
  try {
    let localTemplateExists = await fs.pathExists(
      path.resolve(process.env.TEMPLATE_PATH)
    );
    if (!localTemplateExists) {
      let answers = await inquirer.prompt([
        {
          name: "stackName",
          default: pkg.name,
          message: "stack name"
        },
        {
          name: "region",
          message: "region:",
          default: "us-east-1"
        }
      ]);
      let template = await getTemplate({
        stackName: answers.stackName,
        region: answers.region
      });
      await saveTemplate(template);
    } else {
      console.log("Local teplate already exists.");
    }
  } catch (err) {
    console.log(err);
  }
};
