const chalk = require("chalk");
const process = require("process");
const { uploadTemplate } = require("../cloudformation/upload_template");
const { validateTemplate } = require("../cloudformation/validate_template");
const {
  createChangeSet,
  executeChangeSet
} = require("../cloudformation/update_stack");
const { ensureTemplate } = require("../cloudformation/ensure_template");

module.exports.updateStack = async function() {
  try {
    await ensureTemplate();
    console.log(chalk.green(`Using template: ${process.env.TEMPLATE_PATH}`));
    let TemplateUrl = await uploadTemplate();
    await validateTemplate(TemplateUrl);
    let changeSetName = await createChangeSet(TemplateUrl);
    console.log(chalk.green(`Created changeset: ${changeSetName}`));
    await executeChangeSet(changeSetName);
    console.log(chalk.green("Stack updated!"));
  } catch (err) {
    console.log(chalk.red(err.message));
    if (err.err && err.message) {
      console.log(chalk.red(err.err.message));
    }
    if (err.err) {
      console.log(err.err);
    }
  }
};
