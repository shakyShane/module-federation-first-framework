import { assign, forwardTo, Machine, send, Sender, spawn } from "xstate";
import debugPkg from "debug";
import { createWebpackMachine } from "./compiler.machine";
import { pageWebpack } from "./page-webpack";
import { pure } from "xstate/lib/actions";
import { browserEntryWebpack } from "./browser-entry-webpack";
import { serverEntryWebpack } from "./server-entry-webpack";
const debug = debugPkg("mff:machine:debug");
const trace = debugPkg("mff:machine:trace");

export const BROWSER_ENTRY_NAME = "browser-entry";
export const SERVER_ENTRY_NAME = "server-entry";

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
    browserReady: boolean;
    serverReady: boolean;
    serverBuffer: Buffer;
};

// prettier-ignore
type Events =
    | { type: "COMPILATION_ERROR"; error: Error }
    | { type: "COMPILATION_COMPLETE"; name: string; time: number; buffer: Buffer }
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
                browserReady: false,
                serverReady: false,
                serverBuffer: Buffer.from(""),
            },
            states: {
                compilers: {
                    initial: "waitingForApp",
                    states: {
                        waitingForApp: {
                            on: {
                                COMPILATION_COMPLETE: {
                                    target: "watching",
                                    cond: "oneComplete",
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
                                COMPILATION_COMPLETE: [
                                    {
                                        actions: [
                                            "logReady",
                                            "markReady",
                                            "updateSSR",
                                        ],
                                        cond: "noneComplete",
                                    },
                                    {
                                        target: "watching",
                                        actions: [
                                            "logReady",
                                            "markReady",
                                            "updateSSR",
                                        ],
                                        cond: "oneComplete",
                                    },
                                ],
                            },
                        },
                        watching: {
                            on: {
                                STOP_ALL: {
                                    target: "stoppingApp",
                                    actions: forwardTo(BROWSER_ENTRY_NAME),
                                },
                                COMPILATION_COMPLETE: [
                                    {
                                        cond: "isServerMsg",
                                        actions: "updateSSR",
                                    },
                                ],
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
                noneComplete: (ctx) => {
                    return (
                        ctx.serverReady === false && ctx.browserReady === false
                    );
                },
                oneComplete: (ctx) => {
                    return ctx.serverReady || ctx.browserReady;
                },
                isBrowserMsg: (ctx, evt) => {
                    return (evt as any).name === BROWSER_ENTRY_NAME;
                },
                isServerMsg: (ctx, evt) => {
                    return (evt as any).name === SERVER_ENTRY_NAME;
                },
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
                logReady: (ctx, evt) => {
                    forEvent("COMPILATION_COMPLETE", evt, (evt) => {
                        debug("%O ready", evt.name);
                    });
                },
                updateSSR: assign({
                    serverBuffer: (ctx, evt) => {
                        console.log("evet->", evt);
                        if (evt.type === "COMPILATION_COMPLETE") {
                            if (evt.name === SERVER_ENTRY_NAME) {
                                return evt.buffer;
                            }
                        }
                        return ctx.serverBuffer;
                    },
                }),
                markReady: assign((ctx, evt) => {
                    if (evt.type !== "COMPILATION_COMPLETE") return ctx;
                    return {
                        ...ctx,
                        serverReady:
                            evt.name === SERVER_ENTRY_NAME
                                ? true
                                : ctx.serverReady,
                        browserReady:
                            evt.name === BROWSER_ENTRY_NAME
                                ? true
                                : ctx.browserReady,
                    };
                }),
                saveServerBuffer: assign({
                    serverBuffer: (ctx, evt) => {
                        if (evt.type === "COMPILATION_COMPLETE") {
                            return evt.buffer;
                        }
                        return ctx.serverBuffer;
                    },
                    serverReady: (_ctx) => true,
                }),
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
                            [BROWSER_ENTRY_NAME]: spawn(
                                createWebpackMachine(
                                    BROWSER_ENTRY_NAME,
                                    browserEntryWebpack({})
                                ),
                                BROWSER_ENTRY_NAME
                            ),
                            [SERVER_ENTRY_NAME]: spawn(
                                createWebpackMachine(
                                    SERVER_ENTRY_NAME,
                                    serverEntryWebpack({})
                                ),
                                SERVER_ENTRY_NAME
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
