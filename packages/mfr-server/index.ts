// require("source-map-support").install();
import express from "express";
import { compilerName, createMachine } from "./machine";
import { interpret } from "xstate";
import debugPkg from "debug";
import { existsSync } from "fs";
import { join } from "path";
import requireFromString from "require-from-string";
import { Result, ResultKind } from "./result";
import { render } from "./react/render";
import ProcessEnv = NodeJS.ProcessEnv;

const CWD = process.cwd();
const debug = debugPkg("mff:debug");
const trace = debugPkg("mff:trace");

debug(CWD);

function init(env: ProcessEnv) {
    const machine = createMachine();
    let ssr = Buffer.from("");
    const counterService = interpret(machine)
        .onTransition((state, evt) => {
            // trace("--transition-- %o %O", state.value, evt.type);
            // trace("--ready?-- %O", state.matches({ appWatcher: "watching" }));
            if (state.matches({ appWatcher: "watching" })) {
                // trace(
                //     "--updating ssr with %O bytes--",
                //     state.context.serverBuffer.length
                // );
                ssr = state.context.serverBuffer;
            }
        })
        .start();

    const app = express();
    async function ssrHandler(req, res, next) {
        if (req.method !== "GET" && req.method !== "HEAD") {
            return next();
        }
        const accept = req.headers["accept"] || "";
        if (accept !== "*/*" && !accept.includes("text/html")) {
            return next();
        }
        trace(
            "[ssr handler] %O, {} bytes in buffer",
            req.url,
            ssr.toString().length
        );
        let result: Result = { kind: ResultKind.Unknown };
        try {
            const mod = requireFromString(
                ssr.toString(),
                join(CWD, "/dist-ssr/main.js")
            );
            result = await render({ mod, req, res });
        } catch (e) {
            result = { kind: ResultKind.ModuleError, error: e };
            console.error("[requireFromString] error :%O", e);
        }

        switch (result.kind) {
            case ResultKind.Unknown: {
                return res.status(500).send("unknown result");
            }
            case ResultKind.Response: {
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
                        <main>${result.html}</main>
                        <script src="/main.js"></script>
                        </body>
                    </html>`
                );
            }
            case ResultKind.Error: {
                return res.status(result.status).send(result.html);
            }
            case ResultKind.ModuleError: {
                return res.status(500).send(result.error.stack);
            }
            case ResultKind.Redirect: {
                return res.redirect(result.status, result.location);
            }
        }
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
