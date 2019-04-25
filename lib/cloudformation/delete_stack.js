const AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-1" });
let cloudformation = new AWS.CloudFormation();

module.exports.deleteStack = function(stackName) {
  return new Promise((resolve, reject) => {
    cloudformation.deleteStack(
      {
        StackName: stackName
      },
      err => {
        if (err) {
          reject(err);
        }
        cloudformation.waitFor(
          "stackDeleteComplete",
          { StackName: stackName },
          function(err, data) {
            if (err) {
              return reject({
                message: "Couldn't delete statck.",
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
