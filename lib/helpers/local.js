require("dotenv").config();
const { spawn } = require("child_process");

const api = spawn(
  "sam",
  ["local", "start-api", "-p", "4000", "--profile", process.env.AWS_PROFILE],
  {
    stdio: "inherit"
  }
);

api.on("error", err => {
  console.log(err);
});

api.on("close", code => {
  console.log(`child process exited with code ${code}`);
});
