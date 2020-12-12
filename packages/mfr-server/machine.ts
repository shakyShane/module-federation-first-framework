import { Machine, spawn } from "xstate";
import debugPkg from "debug";
const debug = debugPkg("mff:machine");

export function createMachine() {
    return Machine(
        {
            id: "main",
            initial: "idle",
            context: {
                compilers: {},
            },
            states: {
                idle: {
                    on: {
                        APP_READY: { actions: "logAppReady" },
                    },
                    invoke: {
                        id: "spawnCompileApp",
                        src: "spawnCompileApp",
                    },
                },
            },
        },
        {
            actions: {
                logAppReady: (ctx) => debug("app ready"),
            },
            services: {
                spawnCompileApp: () => (cb) => {
                    debug("listening...");
                    cb("APP_READY");
                },
            },
        }
    );
}
