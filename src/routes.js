const router = require("@spencerbeggs/next-routes").default;
const NextLink = require("next/link").default;
const NextRouter = require("next/router").default;

module.exports = router({
  Link: NextLink,
  Router: NextRouter
});
