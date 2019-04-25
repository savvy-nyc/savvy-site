const { spawn } = require("child_process");
const process = require("process");
const chalk = require("chalk");

module.exports.deployStack = function() {
  return new Promise((resolve, reject) => {
    let command = `sam deploy --template-file ./packaged.yml --stack-name ${
      process.env.STACK_NAME
    } --parameter-overrides '${
      process.env.DEPLOY_PARAMS
    }' --region us-east-1 --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM --profile ${
      process.env.AWS_PROFILE
    }`;
    console.log(chalk.green(command));
    const deploy = spawn(
      "sam",
      [
        "deploy",
        "--template-file",
        "./packaged.yml",
        "--stack-name",
        process.env.STACK_NAME,
        "--parameter-overrides",
        process.env.DEPLOY_PARAMS,
        "--region",
        "us-east-1",
        "--capabilities",
        "CAPABILITY_IAM",
        "CAPABILITY_NAMED_IAM",
        "--profile",
        process.env.AWS_PROFILE
      ],
      {
        shell: true,
        stdio: "inherit"
      }
    );

    deploy.on("close", code => {
      if (code === 0) {
        resolve();
      } else {
        reject();
      }
    });
  });
};
