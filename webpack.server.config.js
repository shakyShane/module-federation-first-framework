const { ESBuildPlugin } = require("esbuild-loader");
const nodeExternals = require("webpack-node-externals");
/**
 * @returns import("webpack").Configuration
 */
module.exports = () => {
    return {
        entry: { index: "./packages/mfr-server/index.ts" },
        output: {
            filename: "[name].js",
            path: __dirname + "/dist-server",
        },
        target: "node",
        externals: [nodeExternals()],
        optimization: {
            minimize: false,
        },
        resolve: {
            extensions: [".ts", ".tsx", ".js", ".json"],
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
