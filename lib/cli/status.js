require("dotenv").config();
var globalConfig = require("../../config");
var process = require("process");
Object.assign(process.env, globalConfig);
const AWS = require("aws-sdk");
const readdir = require("recursive-readdir-async");
AWS.config.update({ region: "us-east-1" });

let { PROJECT_NAME } = process.env;

let cloudformation = new AWS.CloudFormation();

async function main() {
  let envs = await readdir.list("./envs");
  let stacks = await envs.reduce(async (previousPromise, item) => {
    let env = require(`${item.fullname}`);
    let acc = await previousPromise;
    let stack = await cloudformation
      .describeStacks({
        StackName: `${PROJECT_NAME}-${env.Env}`
      })
      .promise();
    acc.push(stack);
    return acc;
  }, Promise.resolve([]));
  stacks.forEach(item => {
    let Env = item.Stacks[0].Parameters.find(
      param => param.ParameterKey === "Env"
    ).ParameterValue;
    let Status = item.Stacks[0].StackStatus;
    let S3ObjectVersion = item.Stacks[0].Parameters.find(
      param => param.ParameterKey === "S3ObjectVersion"
    ).ParameterValue;
    let S3ObjectKey = item.Stacks[0].Parameters.find(
      param => param.ParameterKey === "S3ObjectKey"
    ).ParameterValue;
    let TargetLambdaVersion = item.Stacks[0].Parameters.find(
      param => param.ParameterKey === "TargetLambdaVersion"
    ).ParameterValue;
    console.log(`${Env}: ${Status}`);
    console.log(
      `${S3ObjectKey} (${S3ObjectVersion}) -> ${TargetLambdaVersion}\n`
    );
  });
}

main();
