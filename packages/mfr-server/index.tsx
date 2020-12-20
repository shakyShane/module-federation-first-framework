import express from "express";
import ProcessEnv = NodeJS.ProcessEnv;
import { compilerName, createMachine } from "./machine";
import { interpret } from "xstate";
import debugPkg from "debug";
import { existsSync } from "fs";
import { join } from "path";
import { renderToStaticMarkup } from "react-dom/server";
import React from "react";
const CWD = process.cwd();
const debug = debugPkg("mff:debug");
const trace = debugPkg("mff:trace");

debug(CWD);

function init(env: ProcessEnv) {
    const machine = createMachine();
    const counterService = interpret(machine)
        .onTransition((state, evt) => {
            trace("--transition-- %o", state.value, evt.type);
        })
        .start();

    const app = express();
    function ssrHandler(req, res, next) {
        if (req.method !== "GET" && req.method !== "HEAD") {
            return next();
        }
        const accept = req.headers["accept"] || "";

        if (accept !== "*/*" && !accept.includes("text/html")) {
            return next();
        }

        trace("[ssr handler] %O", req.url);
        const App = <p>Hello world</p>;
        const html = renderToStaticMarkup(App);
        res.setHeader("content-type", "text/html");
        return res.send(
            `<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title></head>
<body>
<main>
    <!-- MFF -->${html}
    <!-- MFF END -->
</main>
<script src="/main.js"></script>
</body>
</html>`
        );
    }
    function page(req, res, next) {
        trace("[page handler] %O", req.url);
        const nextUrl = "./app/pages" + req.url.replace(/\.js$/, "");
        const asPath = nextUrl + ".tsx";

        if (existsSync(join(CWD, asPath))) {
            counterService.send({
                type: "INCOMING_REQUEST",
                url: nextUrl,
            });
            const sub = counterService.subscribe((state) => {
                if (state.event.type === "COMPILATION_COMPLETE") {
                    if (state.event.name === compilerName(nextUrl)) {
                        res.sendFile(join(CWD, "dist", "pages", req.url));
                        sub.unsubscribe();
                    }
                }
            });
        } else {
            next();
        }
    }
    app.use("/pages", page);
    app.use("/", express.static(join(CWD, "dist")));
    app.use("/", ssrHandler);
    // app.all("*", (req, res, next) => {
    //     console.log("unhandled", req.url);
    //     next();
    // });
    app.listen(8080, (e, other) => {
        console.log("listening on http://localhost:8080");
    });
}

init(process.env);
