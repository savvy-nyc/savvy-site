const chalk = require("chalk");

const { ensureTemplate } = require("../cloudformation/ensure_template");
const { validateTemplate } = require("../cloudformation/validate_template");
const { uploadTemplate } = require("../cloudformation/upload_template");

module.exports.validateStack = async function() {
  try {
    await ensureTemplate();
    console.log(chalk.green(`📄 Using template: ${process.env.TEMPLATE_NAME}`));
    let TemplateURL = await uploadTemplate();
    await validateTemplate(TemplateURL);
    console.log(chalk.green("Template is valid!"));
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
