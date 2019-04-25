const process = require("process");
const AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-1" });
let cloudformation = new AWS.CloudFormation();

module.exports.createStack = function(TemplateURL) {
  return new Promise((resolve, reject) => {
    let stackName = process.env.STACK_NAME;
    cloudformation.createStack(
      {
        StackName: stackName,
        TemplateURL: TemplateURL,
        Parameters: JSON.parse(process.env.PARAMS),
        OnFailure: "DO_NOTHING",
        Capabilities: ["CAPABILITY_IAM"]
      },
      err => {
        if (err) {
          return reject({
            message: "Couldn't create stack.",
            err: err
          });
        }
        cloudformation.waitFor(
          "stackCreateComplete",
          { StackName: stackName },
          function(err, data) {
            if (err) {
              return reject({
                message: "Couldn't create stack.",
                err: err
              });
            }
            return resolve(data);
          }
        );
      }
    );
  });
};
