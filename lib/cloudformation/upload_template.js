const fs = require("fs-extra");
const AWS = require("aws-sdk");
const moment = require("moment");

module.exports.uploadTemplate = async function() {
  const s3 = new AWS.S3();
  let Body = await fs.readFile(process.env.TEMPLATE_PATH);
  let Key = (process.env.S3Key = `${process.env.STACK_NAME}/${moment().format(
    "YYYY-MM-DD-HH-mm-ss"
  )}.yml`);
  process.env.S3_URL = `https://s3.amazonaws.com/${
    process.env.TEMPLATES_BUCKET
  }/${Key}`;
  await s3
    .putObject({
      Body: Body,
      Bucket: process.env.TEMPLATES_BUCKET,
      Key: Key
    })
    .promise();
  return process.env.S3_URL;
};
