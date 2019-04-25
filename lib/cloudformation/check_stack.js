const AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-1" });
let cloudformation = new AWS.CloudFormation();

module.exports.stackExists = function(stackName) {
  return new Promise((resolve, reject) => {
    cloudformation.describeStacks(
      {
        StackName: stackName
      },
      function(err, data) {
        if (err) {
          return reject({
            message: "Stack doesn't exist.",
            err: err
          });
        }
        return resolve(data);
      }
    );
  });
};

module.exports.stackDoesntExist = function(stackName) {
  return new Promise((resolve, reject) => {
    cloudformation.describeStacks(
      {
        StackName: stackName
      },
      function(err) {
        if (err) {
          return resolve();
        }
        return reject({
          message: "Stack already exists."
        });
      }
    );
  });
};
