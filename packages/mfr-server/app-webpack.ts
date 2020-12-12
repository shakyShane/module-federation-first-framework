import webpack from "webpack";
import path from "path";
import { ESBuildPlugin } from "esbuild-loader";

const HtmlWebpackPlugin = require("html-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const { sync } = require("glob");

interface AppWebpackParams {
    slugs?: string[];
    mode?: "production" | "development";
    cwd?: string;
}

export function appWebpack(params: AppWebpackParams): webpack.Configuration {
    const { slugs = [], cwd = process.cwd(), mode = "development" } = params;
    const OUTPUT = path.resolve(cwd, "dist");
    const shared = [
        "react",
        "react-dom",
        "xstate",
        "@xstate/react",
        "mfr-router",
    ];

    const sharedNoImport = shared.reduce((acc, item) => {
        acc[item] = { import: false };
        return acc;
    }, {});

    // const remotes = slugs.reduce((acc, item) => {
    //     acc[item.slug] = item.slug + "@" + item.slug + ".js";
    //     return acc;
    // }, {});
    // console.log(remotes);
    const output: webpack.Configuration = {
        name: "app",
        mode,
        devtool: "source-map",
        entry: {
            main: "./app/index.tsx",
        },
        output: {
            filename: "[name].js",
            path: OUTPUT,
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
        // devServer: {
        //     contentBase: path.join(cwd, "dist"),
        //     compress: true,
        //     port: 9000,
        // },
        plugins: [
            new ESBuildPlugin(),
            new webpack.container.ModuleFederationPlugin({
                name: "app",
                // List of remotes with URLs
                // remotes: remotes,

                // list of shared modules from shell
                shared: shared,
            }),
            new HtmlWebpackPlugin({
                template: "html/index.html",
            }),
        ],
    };

    return output;
}
