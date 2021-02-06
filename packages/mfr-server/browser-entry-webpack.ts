import webpack from "webpack";
import path from "path";
import { ESBuildPlugin } from "esbuild-loader";
import { BROWSER_ENTRY_NAME } from "./machine";

const HtmlWebpackPlugin = require("html-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const { sync } = require("glob");

export interface AppWebpackParams {
    slugs?: string[];
    mode?: "production" | "development";
    cwd?: string;
}

export const createOutput = (cwd) => path.resolve(cwd, "dist");
export const shared = [
    "react",
    "react-dom",
    "xstate",
    "@xstate/react",
    "mfr-router",
    "./app/shared/Styles",
];
export function browserEntryWebpack(
    params: AppWebpackParams
): webpack.Configuration {
    const { cwd = process.cwd(), mode = "development" } = params;

    // const remotes = slugs.reduce((acc, item) => {
    //     acc[item.slug] = item.slug + "@" + item.slug + ".js";
    //     return acc;
    // }, {});
    // console.log(remotes);
    const output: webpack.Configuration = {
        name: BROWSER_ENTRY_NAME,
        mode,
        devtool: "source-map",
        entry: {
            main: "./app/index.tsx",
        },
        output: {
            filename: "[name].js",
            path: createOutput(cwd),
            publicPath: "/",
            uniqueName: "module-federation-entry",
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
                mode === "production" && new TerserPlugin(),
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
        // devServer: {
        //     contentBase: path.join(cwd, "dist"),
        //     compress: true,
        //     port: 9000,
        // },
        plugins: [
            new ESBuildPlugin(),
            new webpack.container.ModuleFederationPlugin({
                name: BROWSER_ENTRY_NAME,
                // List of remotes with URLs
                // remotes: remotes,

                // list of shared modules from shell
                shared: shared,
            }),
            // new HtmlWebpackPlugin({
            //     template: "html/index.html",
            // }),
        ],
    };

    return output;
}
