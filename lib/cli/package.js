const { spawn } = require("child_process");
const chalk = require("chalk");

module.exports.packageStack = function() {
  return new Promise((resolve, reject) => {
    const deploy = spawn(
      "sam",
      [
        "package",
        "--template-file",
        "template.yml",
        "--s3-bucket",
        process.env.LAMBDAS_BUCKET,
        "--output-template-file",
        process.env.TEMPLATE_PATH,
        "--profile",
        process.env.AWS_PROFILE
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
