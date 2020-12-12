import { assign, forwardTo, Machine, Sender, spawn } from "xstate";
import webpack from "webpack";
import debugPkg from "debug";
import { appWebpack } from "./app-webpack";
const debug = debugPkg("mff:machine");

type Schema = {
    states: {
        compilers: {
            states: {
                waitingForApp: Record<string, any>;
                watching: Record<string, any>;
                creatingCompiler: Record<string, any>;
            };
        };
        appWatcher: {
            states: {
                startingWatch: Record<string, any>;
                stoppingApp: Record<string, any>;
                stopped: Record<string, any>;
            };
        };
    };
};

type Context = {
    compilers: Record<string, any>;
};

// prettier-ignore
type Events =
    | { type: "COMPILATION_ERROR"; error: Error }
    | { type: "COMPILATION_COMPLETE" }
    | { type: "STATS_ERRORS"; errors: any }
    | { type: "STATS_WARNINGS"; warnings: any }
    | { type: "WATCHING" }
    | { type: "STOPPING_APP" }
    | { type: "APP_STOPPED" }
    | { type: "STOP_ALL" }
    | { type: "INCOMING_REQUEST"; url: string }

export function createMachine() {
    return Machine<Context, Schema, Events>(
        {
            id: "main",
            type: "parallel",
            context: {
                compilers: {},
            },
            states: {
                compilers: {
                    initial: "waitingForApp",
                    states: {
                        waitingForApp: {
                            on: {
                                COMPILATION_COMPLETE: {
                                    target: "watching",
                                    actions: "logAppReady",
                                },
                            },
                        },
                        watching: {
                            entry: "logWaitingForReq",
                            on: {
                                COMPILATION_COMPLETE: {
                                    actions: "logAppCompilationComplete",
                                },
                                INCOMING_REQUEST: {
                                    target: "creatingCompiler",
                                },
                            },
                        },
                        creatingCompiler: {
                            entry: ["spawnCompiler"],
                        },
                    },
                },
                appWatcher: {
                    initial: "startingWatch",
                    states: {
                        startingWatch: {
                            on: {
                                COMPILATION_ERROR: {
                                    actions: "logWatchingError",
                                },
                                STATS_ERRORS: { actions: "logStatsErrors" },
                                STATS_WARNINGS: { actions: "logStatsWarnings" },
                                STOPPING_APP: "stoppingApp",
                                STOP_ALL: {
                                    actions: forwardTo("spawnCompileApp"),
                                },
                            },
                            invoke: {
                                id: "spawnCompileApp",
                                src: "spawnCompileApp",
                            },
                        },
                        stoppingApp: {
                            on: { APP_STOPPED: "stopped" },
                        },
                        stopped: { type: "final" },
                    },
                },
            },
        },
        {
            actions: {
                spawnCompiler: assign({
                    compilers: (ctx, evt) => {
                        return ctx.compilers;
                        // if (evt.type !== "INCOMING_REQUEST") return;
                        // if (evt.url === "/") {
                        //     return {
                        //         ...ctx.compilers,
                        //         ['/']: spawn()
                        //     }
                        // }
                    },
                }),
                logStatsErrors: (ctx, evt) => {
                    forEvent("STATS_ERRORS", evt, (e) => {
                        debug("[error] %O", e.errors);
                    });
                },
                logStatsWarnings: (ctx, evt) => {
                    forEvent("STATS_WARNINGS", evt, (e) => {
                        debug("[warnings] %O", e.warnings);
                    });
                },
                logAppReady: (ctx) =>
                    debug("app compiled - watching for changes"),
                logAppCompilationComplete: (ctx) => debug("app compiled"),
                logAppCompilationError: (ctx, evt) => {},
                logWatchingError: (ctx, evt) => {
                    forEvent("COMPILATION_ERROR", evt, (e) => {
                        debug("[error] app compilation failed %O", e.error);
                    });
                },
                logWaitingForReq: (ctx) =>
                    debug(
                        "waiting for file changes or for a request to come in"
                    ),
            },
            services: {
                // https://webpack.js.org/api/node/
                spawnCompileApp: (ctx, evt) => (cb: Sender<Events>, recv) => {
                    const config = appWebpack({});
                    const compiler = webpack(config);

                    const watching = compiler.watch(
                        {
                            // Example [watchOptions](/configuration/watch/#watchoptions)
                            aggregateTimeout: 300,
                            poll: undefined,
                        },
                        (err, stats) => {
                            if (err) {
                                cb({ type: "COMPILATION_ERROR", error: err });
                                if ((err as any).details) {
                                    console.error((err as any).details);
                                }
                                return;
                            }
                            if (!stats) {
                                // I don't think this is possible, but here for Typescript
                                return;
                            }
                            const info = stats.toJson();

                            if (stats.hasErrors()) {
                                cb({
                                    type: "STATS_ERRORS",
                                    errors: info.errors,
                                });
                            }

                            if (stats.hasWarnings()) {
                                cb({
                                    type: "STATS_WARNINGS",
                                    warnings: info.warnings,
                                });
                            }

                            cb("COMPILATION_COMPLETE");
                        }
                    );

                    recv((evt) => {
                        const e = evt as Events;
                        if (e.type === "STOP_ALL") {
                            watching.close(() => {
                                cb({ type: "APP_STOPPED" });
                            });
                        }
                    });
                },
            },
        }
    );
}

function forEvent<S extends Events["type"]>(
    s: S,
    n: Events,
    fn: (e: Evt<S>) => void
): boolean {
    if (n.type === s) fn(n as Evt<S>);
    return false;
}

export type Evt<M extends Events["type"]> = Extract<Events, { type: M }>;
