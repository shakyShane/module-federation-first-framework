import { assign, forwardTo, Machine, send, Sender, spawn } from "xstate";
import debugPkg from "debug";
import { appWebpack } from "./app-webpack";
import { createWebpackMachine } from "./compiler.machine";
import { pageWebpack } from "./page-webpack";
import { pure } from "xstate/lib/actions";
const debug = debugPkg("mff:machine:debug");
const trace = debugPkg("mff:machine:trace");

type Schema = {
    states: {
        compilers: {
            states: {
                waitingForApp: Record<string, any>;
                watching: Record<string, any>;
                creatingCompiler: Record<string, any>;
                done: Record<string, any>;
            };
        };
        appWatcher: {
            states: {
                startingWatch: Record<string, any>;
                watching: Record<string, any>;
                stoppingApp: Record<string, any>;
                done: Record<string, any>;
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
    | { type: "COMPILATION_COMPLETE"; name: string; time: number }
    | { type: "STATS_ERRORS"; errors: any }
    | { type: "STATS_WARNINGS"; warnings: any }
    | { type: "WATCHING" }
    | { type: "STOPPING_APP" }
    | { type: "CHILD_STOPPED"; name: string }
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
                                    cond: "isAppMsg",
                                },
                                CHILD_STOPPED: [
                                    {
                                        target: "done",
                                        cond: "isAppMsg",
                                    },
                                ],
                            },
                        },
                        watching: {
                            entry: "logWaitingForReq",
                            on: {
                                COMPILATION_COMPLETE: {
                                    actions: "logAppCompilationComplete",
                                },
                                INCOMING_REQUEST: [
                                    {
                                        actions: [
                                            "spawnCompiler",
                                            "logCompilers",
                                        ],
                                        cond: "compilerIsAbsent",
                                    },
                                    {
                                        actions: "respondReady",
                                        cond: "compilerPresent",
                                    },
                                ],
                                CHILD_STOPPED: [
                                    {
                                        target: "done",
                                        cond: "isAppMsg",
                                    },
                                ],
                            },
                        },
                        creatingCompiler: {},
                        done: {
                            type: "final",
                        },
                    },
                },
                appWatcher: {
                    initial: "startingWatch",
                    states: {
                        startingWatch: {
                            entry: ["spawnAppCompiler"],
                            on: {
                                COMPILATION_COMPLETE: {
                                    target: "watching",
                                    actions: "logAppReady",
                                    cond: "isAppMsg",
                                },
                            },
                        },
                        watching: {
                            on: {
                                STOP_ALL: {
                                    target: "stoppingApp",
                                    actions: forwardTo("app"),
                                },
                            },
                        },
                        stoppingApp: {
                            on: {
                                CHILD_STOPPED: [
                                    {
                                        target: "done",
                                        cond: "isAppMsg",
                                    },
                                ],
                            },
                        },
                        done: { type: "final" },
                    },
                },
            },
        },
        {
            guards: {
                isAppMsg: (ctx, evt) => evt.name === "app",
                compilerIsAbsent: (ctx, evt) => {
                    return forEvent("INCOMING_REQUEST", evt, (evt) => {
                        const name = compilerName(evt.url);
                        return !ctx.compilers[name];
                    });
                },
                compilerPresent: (ctx, evt) => {
                    return forEvent("INCOMING_REQUEST", evt, (evt) => {
                        const name = compilerName(evt.url);
                        return ctx.compilers[name];
                    });
                },
            },
            actions: {
                logWaitingForReq: (ctx, evt) => {
                    debug("waiting for incoming requests...");
                },
                logAppReady: (ctx, evt) => {
                    debug("app ready");
                },
                logAppCompilationComplete: (ctx, evt) => {
                    /** noop currnetly */
                    // forEvent("COMPILATION_COMPLETE", evt, (evt) => {
                    //     debug("DONEEEE!!!!! %O", evt.name);
                    // });
                },
                logCompilers: (ctx) => {
                    debug(
                        "%O compilers = %O",
                        Object.keys(ctx.compilers).length,
                        Object.keys(ctx.compilers)
                    );
                },
                respondReady: pure((ctx, evt) => {
                    if (evt.type === "INCOMING_REQUEST") {
                        trace(
                            "responding as 'ready' as a compiler exists for %O",
                            evt.url
                        );
                        return send(
                            {
                                type: "COMPILATION_COMPLETE",
                                name: compilerName(evt.url),
                            },
                            { delay: 10 }
                        );
                    }
                    return undefined;
                }),
                spawnAppCompiler: assign({
                    compilers: (ctx) => {
                        return {
                            ...ctx.compilers,
                            ["app"]: spawn(
                                createWebpackMachine("app", appWebpack({})),
                                "app"
                            ),
                        };
                    },
                }),
                spawnCompiler: assign({
                    compilers: (ctx, evt) => {
                        if (evt.type === "INCOMING_REQUEST") {
                            trace("request to start compiler for %O", evt);
                            const name = compilerName(evt.url);
                            return {
                                ...ctx.compilers,
                                [name]: spawn(
                                    createWebpackMachine(
                                        name,
                                        pageWebpack(evt.url, {})
                                    ),
                                    name
                                ),
                            };
                        }
                        return ctx.compilers;
                    },
                }),
            },
        }
    );
}

export function compilerName(pathname: string): string {
    return `compiler:${pathname}`;
}

function forEvent<S extends Events["type"]>(
    s: S,
    n: Events,
    fn: (e: Evt<S>) => any
): boolean {
    if (n.type === s) return fn(n as Evt<S>);
    return false;
}

export type Evt<M extends Events["type"]> = Extract<Events, { type: M }>;
