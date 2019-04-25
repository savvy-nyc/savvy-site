const AWS = require("aws-sdk");
const moment = require("moment");

let cloudformation = new AWS.CloudFormation();
AWS.config.update({ region: "us-east-1" });

module.exports.createChangeSet = function(TemplateURL) {
  return new Promise((resolve, reject) => {
    let stackName = process.env.STACK_NAME;
    let changeSetName = `change-set-${moment().format("x")}`;
    cloudformation.createChangeSet(
      {
        StackName: stackName,
        TemplateURL: TemplateURL,
        Parameters: JSON.parse(process.env.PARAMS),
        ChangeSetName: changeSetName,
        ChangeSetType: "UPDATE",
        Capabilities: ["CAPABILITY_IAM"]
      },
      err => {
        if (err) {
          return reject({
            message: "Couldn't create changeset",
            err: err
          });
        }
        cloudformation.waitFor(
          "changeSetCreateComplete",
          {
            StackName: stackName,
            ChangeSetName: changeSetName
          },
          function(err) {
            if (err) {
              return reject({
                message: "Couldn't create changeset",
                err: err
              });
            }
            return resolve(changeSetName);
          }
        );
      }
    );
  });
};

module.exports.executeChangeSet = function(changeSetName) {
  return new Promise((resolve, reject) => {
    let stackName = process.env.STACK_NAME;
    cloudformation.executeChangeSet(
      {
        StackName: stackName,
        ChangeSetName: changeSetName
      },
      function(err) {
        if (err) {
          return reject({
            message: `Could not execute changset: ${changeSetName}`,
            err: err
          });
        }
        cloudformation.waitFor(
          "stackUpdateComplete",
          {
            StackName: stackName
          },
          function(err, data) {
            if (err) {
              return reject({
                message: `Could not execute changset: ${changeSetName}`,
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
