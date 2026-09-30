process.env.BABEL_ENV = "production";
process.env.NODE_ENV = "production";
process.env.ASSET_PATH = "/";
const webpack = require("webpack");
const config = require("../webpack.config");
delete config.chromeExtensionBoilerplate;
config.plugins = config.plugins.filter((plugin) => !(plugin instanceof webpack.ProgressPlugin));
config.mode = "production";
config.cache = { type: "filesystem", name: "ytmusic-remastered" };
const compiler = webpack(config);
compiler.run((err, stats) => {
  if (err) { console.error(err); process.exitCode = 1; }
  else {
    console.log(stats.toString({ all: false, errors: true, warnings: true, timings: true }));
    if (stats.hasErrors()) process.exitCode = 1;
  }
  compiler.close(() => {});
});
