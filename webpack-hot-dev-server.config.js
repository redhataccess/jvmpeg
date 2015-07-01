module.exports = require("./make-webpack-config")({
    devServer: true,
    hotComponents: true,
    separateStylesheet: true,
    //devtool: "eval",
    //devtool: "eval-source-map",
    devtool: "source-map",
    debug: true
});