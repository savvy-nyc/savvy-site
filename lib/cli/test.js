const process = require("process");
const { spawn } = require("child_process");
const chalk = require("chalk");

module.exports.testFunction = function() {
  return new Promise((resolve, reject) => {
    let command = `sam local invoke --parameter-overrides '${
      process.env.TEST_PARAMS
    }' --profile -e ${process.cwd()}/events/${process.argv[2]}.json ${
      process.argv[2]
    }`;
    console.log(chalk.green(command));
    const deploy = spawn(
      "sam",
      [
        "local",
        "invoke",
        "--parameter-overrides",
        `'${process.env.TEST_PARAMS}'`,
        "--profile",
        process.env.AWS_PROFILE,
        "-e",
        `${process.cwd()}/events/${process.argv[2]}.json`,
        process.argv[2]
      ],
      {
        shell: true,
        stdio: "inherit"
      }
    );

    deploy.on("close", code => {
      console.log(chalk.yellow("Packaged "));
      if (code === 0) {
        resolve();
      } else {
        reject();
      }
    });
  });
};
