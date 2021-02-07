import {
    AppWebpackParams,
    createOutput,
    shared,
} from "./browser-entry-webpack";
import webpack from "webpack";
import { createTrace } from "./debug";
const trace = createTrace("webpack:page");

const path = require("path");
const { ESBuildPlugin } = require("esbuild-loader");
const { ModuleFederationPlugin } = require("webpack").container;

const sharedNoImport = shared.reduce((acc, item) => {
    acc[item] = { import: false };
    return acc;
}, {});

/**
 */
export function pageWebpack(
    page: string,
    params: AppWebpackParams
): webpack.Configuration {
    const { cwd = process.cwd(), mode = "development" } = params;
    const localName = page.replace("./app/pages/", "");
    const slug = page.slice(2).replace(/[./]/g, "_");
    trace("creating page for %O", { slug, localName, sharedNoImport });
    return {
        name: "pages",
        mode,
        devtool: "inline-source-map",
        entry: {},
        output: {
            filename: "[name].js",
            path: path.join(createOutput(cwd), "pages"),
            uniqueName: "app pages",
        },
        stats: {
            chunks: false,
            modules: false,
            chunkModules: false,
            chunkOrigins: false,
        },
        optimization: {
            chunkIds: "named" as const, // for this example only: readable filenames in production too
            nodeEnv: mode, // for this example only: always production version of react
            minimize: mode === "production",
            minimizer: [
                // new ESBuildMinifyPlugin({ target: "es2015" }),
                // mode === "production" && new TerserPlugin(),
            ].filter(Boolean),
        },
        resolve: {
            extensions: [".ts", ".tsx", ".js", ".json"],
            alias: {
                "mfr-router": path.join(cwd, "packages", "mfr-router"),
                react: "preact/compat",
                "react-dom": "preact/compat",
            },
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: [
                        {
                            loader: "esbuild-loader",
                            options: {
                                loader: "tsx", // Or 'ts' if you don't need tsx
                                target: "es2017",
                            },
                        },
                    ],
                },
            ],
        },
        plugins: [
            new ESBuildPlugin(),
            new ModuleFederationPlugin({
                filename: `${localName}.js`,
                name: slug,
                // List of remotes with URLs
                exposes: {
                    ".": page,
                },

                // list of shared modules with optional options
                shared: sharedNoImport,
            }),
        ],
    };
}
