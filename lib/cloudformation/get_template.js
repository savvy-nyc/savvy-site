const AWS = require("aws-sdk");

module.exports.getTemplate = function(config) {
  return new Promise((resolve, reject) => {
    AWS.config.update({ region: "us-east-1" });
    let cloudformation = new AWS.CloudFormation();
    cloudformation.getTemplate(
      {
        StackName: config.stackName,
        TemplateStage: "Processed"
      },
      function(err, data) {
        if (err) {
          return reject("Couldn't get template", err);
        }
        return resolve(data.TemplateBody);
      }
    );
  });
};
