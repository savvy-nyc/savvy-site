require("dotenv").config();
const globalConfig = require("./config.json");
const fs = require("fs-extra");
const process = require("process");
const withSass = require("@zeit/next-sass");
const withCSS = require("@zeit/next-css");
const withImages = require("next-optimized-images");
const withPlugins = require("next-compose-plugins");
const webpack = require("webpack");
const { APP_ENV } = process.env;

Object.assign(process.env, globalConfig);

let config = {
  assetPrefix: "http://localhost:3000"
};

if (APP_ENV !== "local") {
  let env = require(`./envs/${APP_ENV}.json`);
  Object.assign(config, {
    assetPrefix: `https://${env.StaticDomain}`
  });
}

fs.removeSync(`./pkg/${APP_ENV}/source`);

const nextConfig = {
  target: "serverless",
  distDir: `../.pkg/${APP_ENV}/source`,
  assetPrefix: config.assetPrefix,
  webpack: (config, options) => {
    const { isServer } = options;
    config.plugins.push(
      new webpack.ProvidePlugin({
        React: "react",
        Component: ["react", "Component"],
        Fragment: ["react", "Fragment"],
        PropTypes: "prop-types",
        connect: ["react-redux", "connect"],
        Link: [`${process.cwd()}/src/components/link/link.jsx`, "default"],
        NavLink: [
          `${process.cwd()}/src/components/link/nav-link.jsx`,
          "default"
        ]
      })
    );
    if (!isServer) {
      config.module.rules = config.module.rules.reduce((acc, item) => {
        if (item.test.toString() === "/\\.scss$/") {
          item.use.push({
            loader: "sass-resources-loader",
            options: {
              sourceMap: true,
              resources: `${process.cwd()}/src/scss/base.scss`
            }
          });
        }
        acc.push(item);
        return acc;
      }, []);
    }
    return config;
  }
};

module.exports = withPlugins(
  [
    [
      withImages,
      { svgo: { plugins: [{ prefixIds: "foobar" }] }, inlineImageLimit: -1 }
    ],
    [withSass],
    [withCSS]
  ],
  nextConfig
);
