const path = require("path");
const { ESBuildPlugin } = require("esbuild-loader");
const { ModuleFederationPlugin } = require("webpack").container;
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const { sync } = require("glob");

const OUTPUT = path.resolve(__dirname, "dist");
const optimization = (mode = "production") => {
    return {
        chunkIds: "named", // for this example only: readable filenames in production too
        nodeEnv: mode, // for this example only: always production version of react
        minimize: mode === "production",
        minimizer: [
            // new ESBuildMinifyPlugin({ target: "es2015" }),
            mode === "production" && new TerserPlugin(),
        ].filter(Boolean),
    };
};
const stats = {
    chunks: false,
    modules: false,
    chunkModules: false,
    chunkOrigins: false,
};
const resolve = {
    extensions: [".ts", ".tsx", ".js", ".json"],
    alias: {
        "mfr-router": path.join(__dirname, "packages", "mfr-router"),
        react: "preact/compat",
        "react-dom": "preact/compat",
    },
};
const devtool = "source-map";
const moduleRules = {
    rules: [
        {
            test: /\.tsx?$/,
            loader: "esbuild-loader",
            options: {
                loader: "tsx", // Or 'ts' if you don't need tsx
                target: "es2017",
            },
        },
    ],
};

const shared = ["react", "react-dom", "xstate", "@xstate/react", "mfr-router"];

const sharedNoImport = shared.reduce((acc, item) => {
    acc[item] = { import: false };
    return acc;
}, {});

/**
 * @return import("webpack").Configuration
 * @param {"production" | "development"} mode
 * @param {{page: T, slug: *}[]} slugs
 */
function main(slugs, mode) {
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
            uniqueName: "module-federation-entry",
        },
        stats,
        optimization: optimization(mode),
        resolve,
        module: moduleRules,
        devServer: {
            contentBase: path.join(__dirname, "dist"),
            compress: true,
            port: 9000,
        },
        plugins: [
            new ESBuildPlugin(),
            new ModuleFederationPlugin({
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
}

/**
 */
module.exports = (_, env) => {
    const { mode = "development" } = env;

    const pages = sync("**/*.tsx", {
        cwd: path.join(__dirname, "app", "pages"),
    })
        .map((m) => "./" + path.join("app", "pages", m))
        .map((p) => p.replace(/\.tsx$/, ""));

    const slugs = pages.map((page) => {
        return {
            page,
            slug: page.slice(2).replace(/[./]/g, "_"),
        };
    });

    const perPages = perPage(pages, slugs, mode);
    return [main(slugs, mode), ...perPages];
};

/**
 * @return import("webpack").Configuration[]
 * @param {"production"|"development"} mode
 * @param {string[]} pages
 * @param {{page: T, slug: *}[]} slugs
 */
function perPage(pages, slugs, mode) {
    /**
     * @type import("webpack").Configuration[];
     */
    const configs = [];
    configs.push({
        name: "pages",
        mode,
        devtool,
        entry: {},
        output: {
            filename: "[name].js",
            path: path.join(OUTPUT, "pages"),
            uniqueName: "app pages",
        },
        stats,
        optimization: optimization(mode),
        resolve,
        module: moduleRules,
        plugins: [
            new ESBuildPlugin(),
            ...slugs.map(
                ({ slug, page }) =>
                    new ModuleFederationPlugin({
                        library: { type: "var", name: slug },
                        name: slug,
                        // List of remotes with URLs
                        exposes: {
                            ".": page,
                        },

                        // list of shared modules with optional options
                        shared: sharedNoImport,
                    })
            ),
        ],
    });
    return configs;
}
