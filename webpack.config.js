const path = require("path");
const {ESBuildPlugin} = require('esbuild-loader')
const {ModuleFederationPlugin} = require('webpack').container;
const HtmlWebpackPlugin = require('html-webpack-plugin');

const OUTPUT = path.resolve(__dirname, "dist");
const optimization = {
    chunkIds: "named", // for this example only: readable filenames in production too
    nodeEnv: "production" // for this example only: always production version of react
};
const stats = {
    chunks: true,
    modules: false,
    chunkModules: true,
    chunkOrigins: true
};
const resolve = {
    extensions: [".ts", ".tsx", ".js", ".json"]
}
const devtool = false;
const moduleRules = {
    rules: [
        {
            test: /\.tsx?$/,
            loader: 'esbuild-loader',
            options: {
                loader: 'tsx', // Or 'ts' if you don't need tsx
                target: 'es2015'
            }
        }
    ]
};
/**
 * @return import("webpack").Configuration
 */
function main(mode = "development") {
    console.log("env");

    /**
     * @type import("webpack").Configuration
     */
    return {
        name: "app",
        mode,
        devtool,
        entry: {
            main: "./app/index.tsx",
        },
        output: {
            filename: "[name].js",
            path: OUTPUT,
            uniqueName: "module-federation-entry"
        },
        stats,
        optimization,
        resolve,
        module: moduleRules,
        plugins: [
            new ESBuildPlugin(),
            new ModuleFederationPlugin({
                name: "app_main",
                // List of remotes with URLs
                remotes: {
                    "app_pages_user": "app_pages_user@/app_pages_user.js"
                },

                // list of shared modules with optional options
                shared: {
                    react: {
                        singleton: true // make sure only a single react module is used
                    }
                }
            }),
            new HtmlWebpackPlugin({
                template: "html/index.html"
            })
        ]
    }
}

module.exports = (mode = "development") => {
    return [
        main(mode),
        ...perPage()
    ]
}

const pages = ["./app/pages/user.tsx"];

/**
 * @return import("webpack").Configuration[]
 */
function perPage() {
    /**
     * @type import("webpack").Configuration[];
     */
    const configs = [];
    pages.forEach(page => {
        configs.push({
                name: "app_pages_user",
                mode: "development",
                devtool,
                entry: {},
                output: {
                    filename: "[name].js",
                    path: OUTPUT,
                    uniqueName: "app_pages_user"
                },
                stats,
                optimization,
                resolve,
                module: moduleRules,
                plugins: [
                    new ESBuildPlugin(),
                    new ModuleFederationPlugin({
                        name: "app_pages_user",
                        // List of remotes with URLs
                        exposes: {
                            ".": "./app/pages/user.tsx"
                        },

                        // list of shared modules with optional options
                        shared: {
                            react: {
                                import: false,
                                singleton: true // make sure only a single react module is used
                            }
                        }
                    })
                ]
            }
        )
    })
    return configs;
}
