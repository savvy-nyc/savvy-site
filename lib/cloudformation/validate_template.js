const AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-1" });
let cloudformation = new AWS.CloudFormation();

module.exports.validateTemplate = function(TemplateURL) {
  return new Promise((resolve, reject) => {
    cloudformation.validateTemplate(
      {
        TemplateURL: TemplateURL
      },
      (err, data) => {
        if (err) {
          return reject({
            message: "Template is invalid.",
            err: err
          });
        }
        if (data === null) {
          console.log("Two");
          return reject({
            message: "AWS Request error."
          });
        }
        return resolve(data);
      }
    );
  });
};
