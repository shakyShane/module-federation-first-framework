const path = require("path");
const {ESBuildPlugin, ESBuildMinifyPlugin} = require('esbuild-loader')
const {ModuleFederationPlugin} = require('webpack').container;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const OUTPUT = path.resolve(__dirname, "dist");
const optimization = {
    chunkIds: "named", // for this example only: readable filenames in production too
    nodeEnv: "production", // for this example only: always production version of react
    minimize: true,
    minimizer: [
    //     // new ESBuildMinifyPlugin({ target: "es2015" }),
        new TerserPlugin()
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
        "mfr-router": path.join(__dirname, "packages", "mfr-router"),
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

const shared = ["react", "react-dom", "mfr-router"];
// const sharedNoImport = shared.reduce()

/**
 * @return import("webpack").Configuration
 */
function main() {
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
        mode: "development",
        devtool,
        entry: {
            main: "./app/index.tsx",
        },
        output: {
            filename: "[name].js",
            path: OUTPUT,
            publicPath: "/",
            uniqueName: "module-federation-entry"
        },
        stats,
        optimization,
        resolve,
        module: moduleRules,
        devServer: {
            contentBase: path.join(__dirname, 'dist'),
            compress: true,
            port: 9000
        },
        plugins: [
            new ESBuildPlugin(),
            new ModuleFederationPlugin({
                name: "app",
                // List of remotes with URLs
                // remotes: remotes,

                // list of shared modules from shell
                shared: shared
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
    return {page, slug: page.slice(2).replace(/[./]/g, "_")}
});

/**
 * @return import("webpack").Configuration[]
 */
function perPage() {
    /**
     * @type import("webpack").Configuration[];
     */
    const configs = [];
    configs.push({
        name: "pages",
        mode: "development",
        devtool,
        entry: {},
        output: {
            filename: "[name].js",
            path: path.join(OUTPUT, "pages"),
            uniqueName: "something uniquye"
        },
        stats,
        optimization,
        resolve,
        module: moduleRules,
        plugins: [
            new ESBuildPlugin(),
            ...slugs.map(({slug, page}) => new ModuleFederationPlugin({
                library: { type: "var", name: slug },
                name: slug,
                // List of remotes with URLs
                exposes: {
                    ".": page,
                },

                // list of shared modules with optional options
                shared: {
                    react: { import: false },
                    "react-dom": { import: false },
                    "mfr-router": { import: false },
                }
            }))
        ]
    });
    return configs;
}
