require("dotenv").config();
var globalConfig = require("../../config");
var process = require("process");
Object.assign(process.env, globalConfig);
var COMMAND = process.env.npm_lifecycle_event;
var BUILD_DIR = (process.env.BUILD_DIR = `${process.cwd()}/build`);
var isTest = COMMAND === "test";
var ENV = (process.env.ENV = process.argv[isTest ? 3 : 2]);
if (!ENV && isTest) {
  ENV = "staging";
}
process.env.APP_ENV = ENV ? ENV : "staging";
var PROJECT_NAME = process.env.PROJECT_NAME;
var STACK_NAME = (process.env.STACK_NAME = !ENV
  ? PROJECT_NAME
  : `${PROJECT_NAME}-${ENV}`);
var TEMPLATE_NAME = (process.env.TEMPLATE_NAME = "template.yml");
var TEMPLATE_DIR = (process.env.TEMPLATE_DIR = `${process.cwd()}`);
var TEMPLATE_PATH = (process.env.TEMPLATE_PATH = `${TEMPLATE_DIR}/${TEMPLATE_NAME}`);
var ENV_PATH = ENV ? `${process.cwd()}/envs/${ENV}.json` : null;
var AWS_REGION = (process.env.AWS_REGION = process.env.AWS_REGION
  ? process.env.AWS_REGION
  : "us-east-1");

async function main() {
  try {
    var { createStack } = require("./create");
    var { deleteStack } = require("./delete");
    var { deployStack } = require("./deploy");
    var { getStack } = require("./get");
    var { updateStack } = require("./update");
    var { validateStack } = require("./validate");
    var { packageStack } = require("./package");
    var { compile } = require("./compile");
    var { testFunction } = require("./test");
    let PARAMS = [];
    let DEPLOY_PARAMS = "";
    let TEST_PARAMS = [];
    if (ENV_PATH) {
      let params = require(ENV_PATH);
      for (var ParameterKey in params) {
        let ParameterValue = params[ParameterKey];
        PARAMS.push({
          ParameterKey: ParameterKey,
          ParameterValue: ParameterValue,
          UsePreviousValue: false
        });
        DEPLOY_PARAMS += `${
          DEPLOY_PARAMS === "" ? "" : " "
        }${ParameterKey}=${ParameterValue}`;
        TEST_PARAMS.push(
          `ParameterKey=${ParameterKey},ParameterValue=${ParameterValue}`
        );
      }
      process.env.TEST_PARAMS = TEST_PARAMS.join(" ");
      process.env.PARAMS = JSON.stringify(PARAMS);
      process.env.DEPLOY_PARAMS = DEPLOY_PARAMS.trim();
    }

    console.log(COMMAND);
    console.log(AWS_REGION);
    console.log(ENV);
    console.log(STACK_NAME);
    console.log(BUILD_DIR);
    console.log(TEMPLATE_NAME);
    console.log(TEMPLATE_PATH);
    console.log(ENV_PATH);
    console.log(PARAMS);
    console.log(DEPLOY_PARAMS);

    switch (COMMAND) {
      case "create":
        return await createStack();
      case "compile":
        return await compile();
      case "delete":
        return deleteStack();
      case "deploy":
        return deployStack();
      case "package":
        return packageStack();
      case "push":
        await compile();
        await packageStack();
        return await deployStack();
      case "get":
        return getStack();
      case "test":
        await compile(true);
        return await testFunction();
      case "update":
        return updateStack();
      case "validate":
        return validateStack();
    }
  } catch (err) {
    console.log(err);
  }
}

main();
