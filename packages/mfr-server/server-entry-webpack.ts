import webpack from "webpack";
import path from "path";
import { ESBuildPlugin } from "esbuild-loader";
import { SERVER_ENTRY_NAME } from "./machine";
import nodeExternals from "webpack-node-externals";

export interface AppWebpackParams {
    slugs?: string[];
    mode?: "production" | "development";
    cwd?: string;
}

export const createOutput = (cwd) => path.join(cwd, "dist-ssr");
export const shared = [
    "react",
    "react-dom",
    "xstate",
    "@xstate/react",
    "mfr-router",
];
export function serverEntryWebpack(
    params: AppWebpackParams
): webpack.Configuration {
    const { cwd = process.cwd(), mode = "development" } = params;

    // const remotes = slugs.reduce((acc, item) => {
    //     acc[item.slug] = item.slug + "@" + item.slug + ".js";
    //     return acc;
    // }, {});
    // console.log(remotes);
    const output: webpack.Configuration = {
        name: SERVER_ENTRY_NAME,
        mode: "development",
        devtool: "source-map",
        target: "node",
        entry: {
            main: "./app/server.tsx",
        },
        output: {
            filename: "[name].js",
            path: createOutput(cwd),
            publicPath: "/",
            uniqueName: "module-federation-server-entry",
            libraryTarget: "commonjs",
        },
        // externals: ["enhanced-resolve"],
        externals: [
            "enhanced-resolve",
            nodeExternals({ allowlist: ["mfr-router"] }),
        ],
        stats: {
            chunks: false,
            modules: false,
            chunkModules: false,
            chunkOrigins: false,
        },
        optimization: {
            chunkIds: "named" as const, // for this example only: readable filenames in production too
            nodeEnv: mode, // for this example only: always production version of react
            minimize: false,
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
                name: SERVER_ENTRY_NAME,
                // List of remotes with URLs
                library: { type: "commonjs-module" },
                filename: "container.js",
                // remotes: remotes,
                // list of shared modules from shell
                // shared: shared,
            }),
            // new HtmlWebpackPlugin({
            //     template: "html/index.html",
            // }),
        ],
    };

    return output;
}
