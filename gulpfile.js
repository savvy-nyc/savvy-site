require("dotenv").config();
const globalConfig = require("./config.json");
const process = require("process");
const util = require("util");
const fs = require("fs-extra");
const gulp = require("gulp");
const replace = require("gulp-replace");
const zip = require("gulp-zip");
const AWS = require("aws-sdk");
const exec = require("child_process").exec;
const awspublish = require("gulp-awspublish");

const { APP_ENV } = process.env;

Object.assign(process.env, globalConfig);

AWS.config.update({ region: "us-east-1" });

let config = {
  assetPrefix: "http://localhost:3000"
};

if (APP_ENV !== "local") {
  let env = require(`./envs/${APP_ENV}.json`);
  Object.assign(config, {
    staticDomain: env.StaticDomain,
    assetPrefix: `https://${env.StaticDomain}`
  });
}

gulp.task("reset", function() {
  return Promise.all([
    fs.remove(`./.pkg/${APP_ENV}/lambda`),
    fs.remove(`./.pkg/${APP_ENV}/local`),
    fs.remove(`./.pkg/${APP_ENV}/static`)
  ]);
});

gulp.task("moveStatic", function() {
  return gulp
    .src([`./.pkg/${APP_ENV}/source/static/**/**`])
    .pipe(replace("/_next/static/", "/"))
    .pipe(replace("/_next/", "/"))
    .pipe(replace(/static\/css\//g, "css/"))
    .pipe(replace(/static\/chunks\//g, "chunks/"))
    .pipe(replace(/static\/runtime\//g, "runtime/"))
    .pipe(gulp.dest(`.pkg/${APP_ENV}/static`));
});

gulp.task("moveLambda", function() {
  return gulp
    .src([
      `./.pkg/${APP_ENV}/source/**/**`,
      `!./.pkg/${APP_ENV}/source/static/**/**`
    ])
    .pipe(replace("/_next/static/", "/"))
    .pipe(replace("/_next/", "/"))
    .pipe(replace(/static\/css\//g, "css/"))
    .pipe(replace(/static\/chunks\//g, "chunks/"))
    .pipe(replace(/static\/runtime\//g, "runtime/"))
    .pipe(gulp.dest(`.pkg/${APP_ENV}/lambda`));
});

gulp.task("moveLocal", function() {
  return gulp
    .src([`./.pkg/${APP_ENV}/source/**/**`])
    .pipe(
      replace(
        new RegExp(`https://${config.staticDomain}`, "g"),
        "http://localhost:3000"
      )
    )
    .pipe(gulp.dest(`.pkg/${APP_ENV}/local`));
});

gulp.task("build-json", function() {
  return gulp
    .src([`./.pkg/${APP_ENV}/source/build-manifest.json`])
    .pipe(replace("static/", `${config.assetPrefix}/`))
    .pipe(gulp.dest("dist"));
});

gulp.task("setupLambda", function() {
  return gulp
    .src(["./lib/lambda/**", "./src/routes.js"])
    .pipe(gulp.dest(`.pkg/${APP_ENV}/lambda`))
    .pipe(gulp.dest(`.pkg/${APP_ENV}/local`));
});

gulp.task("zip", function() {
  console.log(process.env.CODEBUILD_WEBHOOK_HEAD_REF);
  let branchArr = process.env.CODEBUILD_WEBHOOK_HEAD_REF.split("/");
  let theBranch = branchArr[branchArr.length - 1];
  return gulp
    .src([`.pkg/${APP_ENV}/lambda/**/**`])
    .pipe(zip(`${theBranch}.zip`))
    .pipe(gulp.dest(`.pkg/${APP_ENV}`));
});

gulp.task("lambdaInstall", function(cb) {
  exec(`cd .pkg/${APP_ENV}/lambda && yarn install --production`, function(
    err,
    stdout,
    stderr
  ) {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
});

gulp.task("uploadLambda", async function() {
  const s3 = new AWS.S3();
  const lambda = new AWS.Lambda();
  const cloudformation = new AWS.CloudFormation();
  const branchArr = process.env.CODEBUILD_WEBHOOK_HEAD_REF.split("/");
  const zipFile = `${branchArr[branchArr.length - 1]}.zip`;
  let Key = "media/";
  if (branchArr.length > 1) {
    Key += `${branchArr[0]}/`;
  }
  Key += zipFile;
  let { VersionId } = await s3
    .putObject({
      Bucket: process.env.LAMBDAS_BUCKET,
      Key: Key,
      Body: await fs.readFile(`.pkg/${APP_ENV}/${zipFile}`)
    })
    .promise();
  let envConfig = await fs.readJSON(`./envs/${APP_ENV}.json`);
  envConfig.S3ObjectKey = Key;
  envConfig.S3ObjectVersion = VersionId;
  try {
    let data = await cloudformation
      .describeStacks({
        StackName: `media-${APP_ENV}`
      })
      .promise();
    let LambdaFunction = data.Stacks[0].Outputs.find(
      output => output.OutputKey === "FunctionName"
    );
    if (LambdaFunction) {
      let FunctionName = LambdaFunction.OutputValue;
      const Latest = await lambda
        .updateFunctionCode({
          FunctionName: FunctionName,
          S3Bucket: process.env.LAMBDAS_BUCKET,
          S3Key: Key,
          S3ObjectVersion: VersionId
        })
        .promise();
      const { Version } = await lambda
        .publishVersion({
          FunctionName: FunctionName,
          CodeSha256: Latest.CodeSha256
        })
        .promise();
      envConfig.TargetLambdaVersion = Version;
    }
    let TemplateBody = await fs.readFile("./template.yml", {
      encoding: "utf8"
    });
    await cloudformation
      .updateStack({
        StackName: `media-${APP_ENV}`,
        TemplateBody: TemplateBody,
        Parameters: [
          {
            ParameterKey: "Env",
            UsePreviousValue: true
          },
          {
            ParameterKey: "Domain",
            UsePreviousValue: true
          },
          {
            ParameterKey: "StaticDomain",
            UsePreviousValue: true
          },
          {
            ParameterKey: "HostedZoneId",
            UsePreviousValue: true
          },
          {
            ParameterKey: "StaticHostedZoneId",
            UsePreviousValue: true
          },
          {
            ParameterKey: "SSLArn",
            UsePreviousValue: true
          },
          {
            ParameterKey: "LambdaBucketName",
            UsePreviousValue: true
          },
          {
            ParameterKey: "S3ObjectKey",
            ParameterValue: Key
          },
          {
            ParameterKey: "S3ObjectVersion",
            ParameterValue: VersionId
          },
          {
            ParameterKey: "TargetLambdaVersion",
            ParameterValue: envConfig.TargetLambdaVersion
          }
        ],
        Capabilities: ["CAPABILITY_IAM", "CAPABILITY_NAMED_IAM"]
      })
      .promise();
  } catch (err) {
    console.log(err);
  }
  await fs.writeJSON(`./envs/${APP_ENV}.json`, envConfig, { spaces: 2 });
});

gulp.task("publishStatic", async function() {
  fs.ensureFile(`./.cache/${APP_ENV}.json`);
  var publisher = awspublish.create(
    {
      region: "us-east-1",
      params: {
        Bucket: config.staticDomain
      }
    },
    {
      cacheFileName: `.cache/${APP_ENV}.json`
    }
  );
  var headers = {
    "Cache-Control": "max-age=315360000, s-maxage=315360000, public"
  };
  return (
    gulp
      .src(`./.pkg/${APP_ENV}/static/**/**`)
      // gzip, Set Content-Encoding headers and add .gz extension
      .pipe(awspublish.gzip())

      // publisher will add Content-Length, Content-Type and headers specified above
      // If not specified it will set x-amz-acl to public-read by default
      .pipe(publisher.publish(headers))

      // create a cache file to speed up consecutive uploads
      .pipe(publisher.cache())

      // print upload updates to console
      .pipe(awspublish.reporter())
  );
});

gulp.task("build-container", async () => {
  const { BUILD_IMAGE, AWS_PROFILE } = process.env;
  const BUILD_NAME = BUILD_IMAGE.split("/")[1];
  const exec = util.promisify(require("child_process").exec);
  await fs.copy(
    `${process.cwd()}/package.json`,
    `${process.cwd()}/lib/build-container/package.json`
  );
  await fs.copy(
    `${process.cwd()}/yarn.lock`,
    `${process.cwd()}/lib/build-container/yarn.lock`
  );
  await fs.copy(
    `${process.cwd()}/.npmrc`,
    `${process.cwd()}/lib/build-container/.npmrc`
  );
  let { error, stdout, stderr } = await exec(
    `aws ecr get-login --no-include-email --profile ${AWS_PROFILE} --region us-east-1`
  );
  console.log(error ? error : stderr ? stderr : stdout);
  ({ error, stdout, stderr } = await exec(stdout));
  console.log(error ? error : stderr ? stderr : stdout);

  ({ error, stdout, stderr } = await exec(
    `docker build lib/build-container -t ${BUILD_NAME}`
  ));
  console.log(error ? error : stderr ? stderr : stdout);
  ({ error, stdout, stderr } = await exec(
    `docker tag ${BUILD_NAME}:latest ${BUILD_IMAGE}:${APP_ENV}`
  ));
  console.log(error ? error : stderr ? stderr : stdout);
  ({ error, stdout, stderr } = await exec(
    `AWS_PROFILE=${AWS_PROFILE} docker push ${BUILD_IMAGE}:${APP_ENV}`
  ));
  console.log(error ? error : stderr ? stderr : stdout);
});

gulp.task(
  "build",
  gulp.series(
    "reset",
    "moveStatic",
    "moveLambda",
    "moveLocal",
    "setupLambda",
    "lambdaInstall",
    "zip"
  )
);

gulp.task("publish", gulp.series("publishStatic", "uploadLambda"));

gulp.task("codebuild", gulp.series("build", "publish"));
