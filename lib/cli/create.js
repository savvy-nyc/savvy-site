const process = require("process");
const chalk = require("chalk");

const { stackDoesntExist } = require("../cloudformation/check_stack");
const { ensureTemplate } = require("../cloudformation/ensure_template");
const { createStack } = require("../cloudformation/create_stack");
const { uploadTemplate } = require("../cloudformation/upload_template");

module.exports.createStack = async function() {
  try {
    await ensureTemplate();
    let TemplateURL = await uploadTemplate();
    console.log(chalk.green(`📄 Using template: ${process.env.TEMPLATE_NAME}`));
    await stackDoesntExist(process.env.STACK_NAME);
    console.log(
      "🏭 " + chalk.green(`Creating new stack: ${process.env.STACK_NAME}`)
    );
    //await validateTemplate(template);
    let { Stacks } = await createStack(TemplateURL);
    console.log(chalk.green(`Stack created!`));
    Stacks.forEach(stack => {
      if (stack.Outputs.length !== 0) {
        stack.Outputs.forEach(output => {
          console.log(output);
        });
      }
    });
  } catch (err) {
    console.log("💣 " + chalk.red(err.message));
    if (err.err && err.message) {
      console.log("💣 " + chalk.red(err.err.message));
    }
  }
};
