const { toLambda } = require("probot-serverless-now")
const appFunction = require(".")
module.exports = toLambda(appFunction)
