const { join } = require("path");
const { ESBuildPlugin } = require("esbuild-loader");
const nodeExternals = require("webpack-node-externals");
/**
 * @returns import("webpack").Configuration
 */
module.exports = () => {
    return {
        entry: {
            watch: "./packages/mfr-server/watch.ts",
            build: "./packages/mfr-server/build.ts",
        },
        output: {
            filename: "[name].js",
            path: __dirname + "/dist-server",
        },
        target: "node",
        externals: [nodeExternals({ allowlist: ["mfr-router"] })],
        optimization: {
            minimize: false,
        },
        resolve: {
            extensions: [".ts", ".tsx", ".js", ".json"],
            alias: {
                "mfr-router": join(__dirname, "packages", "mfr-router"),
                // react: "preact/compat",
                // "react-dom": "preact/compat",
            },
        },
        module: {
            rules: [
                {
                    loader: "esbuild-loader",
                    options: {
                        loader: "tsx", // Or 'ts' if you don't need tsx
                        target: "es2017",
                    },
                },
            ],
        },
        plugins: [new ESBuildPlugin()],
    };
};
