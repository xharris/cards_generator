const { resolve } = require("path")
const { override, addWebpackAlias } = require("customize-cra")

module.exports = override(
  addWebpackAlias({
    ["component"]: resolve(__dirname, "./src/js/component"),
    ["feature"]: resolve(__dirname, "./src/js/feature"),
    ["api"]: resolve(__dirname, "./src/js/api"),
    ["util"]: resolve(__dirname, "./src/js/util"),
    ["style"]: resolve(__dirname, "./src/style")
  })
)