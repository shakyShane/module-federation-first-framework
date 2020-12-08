const { join } = require("path");
const { transformSync } = require("@babel/core");
const { getOptions } = require("loader-utils");
const webpack = require("webpack");
const plugin = require("./plugin");

module.exports = function (source, sourceMap) {
    const self = this;
    const done = this.async();
    if (!done) throw new Error("couldn't init es-build-loader");
    const options = getOptions(this);
    const { cwd } = options;
    const base = join(cwd, "app");
    const isTsx = this.resourcePath.endsWith(".tsx");
    const isSrc = this.resourcePath.startsWith(base);
    console.log(options);

    if (!isTsx || !isSrc) {
        return done(null, source, sourceMap);
    }
    const babelOptions = {
        plugins: [plugin],
        sourceMaps: options.sourceMaps,
        inputSourceMap: options.sourceMaps ? JSON.parse(sourceMap) : undefined,
        sourceFileName: options.sourceMaps ? this.resourcePath : undefined,
    };
    const output = transformSync(source, babelOptions);
    if (output) {
        done(null, output.code, output.map);
    } else {
        done(new Error("Could not parse with babel"));
    }
};
