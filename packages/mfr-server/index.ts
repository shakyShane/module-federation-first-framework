import express from "express";
import ProcessEnv = NodeJS.ProcessEnv;
import { compilerName, createMachine } from "./machine";
import { interpret } from "xstate";
import debugPkg from "debug";
import { existsSync } from "fs";
import { join } from "path";
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
    function index(req, res, next) {
        console.log("handle home");
        res.send(
            "<!doctype html>\n<html lang='en'>\n<head>\n    <meta charset='UTF-8'>\n    <meta name='viewport' content='width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0'>\n    <meta http-equiv='X-UA-Compatible' content='ie=edge'>\n    <title>Document</title></head>\n<body><h1>Hello world</h1></body>\n</html>"
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
    app.use("/", index);
    // app.all("*", (req, res, next) => {
    //     console.log("unhandled", req.url);
    //     next();
    // });
    app.listen(8080, (e, other) => {
        console.log("listening on http://localhost:8080");
    });
}

init(process.env);
