const chalk = require("chalk");

const { deleteStack } = require("../cloudformation/delete_stack");
const { stackExists } = require("../cloudformation/check_stack");

module.exports.deleteStack = async function() {
  try {
    await stackExists(process.env.STACK_NAME);
    console.log(chalk.green(`Deleting stack: ${process.env.STACK_NAME}`));
    await deleteStack(process.env.STACK_NAME);
    console.log(chalk.green("Stack deleted!"));
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
