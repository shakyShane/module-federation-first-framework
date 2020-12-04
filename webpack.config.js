const path = require("path");
const {ESBuildPlugin, ESBuildMinifyPlugin} = require('esbuild-loader')
const {ModuleFederationPlugin} = require('webpack').container;
const HtmlWebpackPlugin = require('html-webpack-plugin');
// const TerserPlugin = require('terser-webpack-plugin');

const OUTPUT = path.resolve(__dirname, "dist");
const optimization = {
    chunkIds: "named", // for this example only: readable filenames in production too
    nodeEnv: "production", // for this example only: always production version of react
    minimize: true,
    minimizer: [
        // new ESBuildMinifyPlugin({ target: "es2015" }),
        // new TerserPlugin()
    ]
};
const stats = {
    chunks: false,
    modules: false,
    chunkModules: false,
    chunkOrigins: false
};
const resolve = {
    extensions: [".ts", ".tsx", ".js", ".json"],
    alias: {
        "react": "preact/compat",
        "react-dom": "preact/compat",
    }
}
const devtool = "source-map";
const moduleRules = {
    rules: [
        {
            test: /\.tsx?$/,
            loader: 'esbuild-loader',
            options: {
                loader: 'tsx', // Or 'ts' if you don't need tsx
                target: 'es2015',

            }
        }
    ]
};

/**
 * @return import("webpack").Configuration
 */
function main(mode = "development") {
    console.log("env");
    const remotes = slugs.reduce((acc, item) => {
        acc[item.slug] = item.slug + "@" + item.slug + ".js";
        return acc;
    }, {});
    console.log(remotes);

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
                remotes: remotes,

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
    const perPages = perPage();
    return [
        main(mode),
        ...perPages,
    ]
}

const pages = [
    "./app/pages/index.tsx",
    "./app/pages/user/index.tsx",
    "./app/pages/user/dashboard.tsx",
];
const slugs = pages.map(page => {
    return { page, slug: page.slice(2).replace(/[./]/g, "_")}
});

/**
 * @return import("webpack").Configuration[]
 */
function perPage() {
    /**
     * @type import("webpack").Configuration[];
     */
    const configs = [];
    slugs.forEach((params) => {
        const {slug, page} = params;
        configs.push({
            name: slug,
            mode: "development",
            devtool,
            entry: {},
            output: {
                filename: "[name].js",
                path: OUTPUT,
                uniqueName: slug
            },
            stats,
            optimization,
            resolve,
            module: moduleRules,
            plugins: [
                new ESBuildPlugin(),
                new ModuleFederationPlugin({
                    name: slug,
                    // List of remotes with URLs
                    exposes: {
                        ".": page,
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
        });
    });
    return configs;
}
