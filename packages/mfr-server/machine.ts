import { assign, forwardTo, Machine, Sender, spawn } from "xstate";
import webpack from "webpack";
import debugPkg from "debug";
import { appWebpack } from "./app-webpack";
import { createWebpackMachine } from "./compiler.machine";
const debug = debugPkg("mff:machine");

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
    | { type: "COMPILATION_COMPLETE"; name: string }
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
                                    actions: "logAppReady",
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
                                INCOMING_REQUEST: {
                                    target: "creatingCompiler",
                                    actions: "spawnCompiler",
                                },
                                CHILD_STOPPED: [
                                    {
                                        target: "done",
                                        cond: "isAppMsg",
                                    },
                                ],
                            },
                        },
                        done: {
                            type: "final",
                        },
                        creatingCompiler: {},
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
            },
            actions: {
                logWaitingForReq: (ctx, evt) => {
                    debug("waiting for incoming requests...");
                },
                logAppReady: (ctx, evt) => {
                    debug("app ready");
                },
                spawnAppCompiler: assign({
                    compilers: (ctx) => {
                        return {
                            ...ctx.compilers,
                            ["app"]: spawn(createWebpackMachine("app"), "app"),
                        };
                    },
                }),
                spawnCompiler: assign({
                    compilers: (ctx, evt) => {
                        console.log(evt);
                        return ctx.compilers;
                    },
                }),
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
