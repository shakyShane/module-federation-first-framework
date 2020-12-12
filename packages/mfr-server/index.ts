import express from "express";
import ProcessEnv = NodeJS.ProcessEnv;
import { createMachine } from "./machine";
import { interpret } from "xstate";
import debugPkg from "debug";
const CWD = process.cwd();
const debug = debugPkg("mff:debug");
const trace = debugPkg("mff:trace");

debug(CWD);

function init(env: ProcessEnv) {
    const machine = createMachine();
    const counterService = interpret(machine)
        .onTransition((state) => {
            trace("--transition-- %o", state.value);
        })
        .start();

    // const app = express();
    // app.listen(8080, (e, other) => {
    //     console.log("listening on http://localhost:8080");
    // });
}

if (!require.main) {
    init(process.env);
}
