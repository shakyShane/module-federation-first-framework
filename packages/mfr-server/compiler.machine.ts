import { forwardTo, Machine, Sender, sendParent } from "xstate";
import webpack from "webpack";
import debugPkg from "debug";
import { join } from "path";
import { SERVER_ENTRY_NAME } from "./machine";
const debug = debugPkg("mff:webpack:machine:debug");
const trace = debugPkg("mff:webpack:machine:trace");

type Schema = {
    states: {
        starting: Record<string, any>;
        watching: Record<string, any>;
        stopping: Record<string, any>;
        stopped: Record<string, any>;
    };
};

type Context = {
    name: string;
    config: webpack.Configuration;
};

// prettier-ignore
type Events =
    | { type: "COMPILATION_ERROR"; error: Error }
    | { type: "COMPILATION_COMPLETE"; name: string; time: number; buffer: Buffer }
    | { type: "STATS_ERRORS"; errors: any }
    | { type: "STATS_WARNINGS"; warnings: any }
    | { type: "WATCHING" }
    | { type: "STOP" }
    | { type: "STOPPED" }
    | { type: "STOP_ALL" };

export function createWebpackMachine(
    name: string,
    config: webpack.Configuration
) {
    return Machine<Context, Schema, Events>(
        {
            id: "webpack",
            initial: "starting",
            context: {
                config,
                name: name,
            },
            invoke: {
                id: "spawnCompiler",
                src: "spawnCompiler",
            },
            on: {
                COMPILATION_ERROR: {
                    actions: "logWatchingError",
                },
                STATS_ERRORS: { actions: "logStatsErrors" },
                STATS_WARNINGS: { actions: "logStatsWarnings" },
            },
            states: {
                starting: {
                    on: {
                        COMPILATION_COMPLETE: {
                            target: "watching",
                            actions: [
                                sendParent((ctx, evt) => {
                                    return evt;
                                }),
                                "logCompilationComplete",
                                "logReady",
                            ],
                        },
                    },
                },
                watching: {
                    on: {
                        STOP_ALL: {
                            target: "stopping",
                            actions: [
                                forwardTo("spawnCompiler"),
                                "logStopping",
                            ],
                        },
                        COMPILATION_COMPLETE: {
                            actions: [
                                sendParent((ctx, evt) => {
                                    return evt;
                                }),
                                "logCompilationComplete",
                            ],
                        },
                    },
                },
                stopping: {
                    on: {
                        STOPPED: { target: "stopped", actions: "logStopped" },
                    },
                },
                stopped: {
                    entry: sendParent((ctx) => ({
                        type: "CHILD_STOPPED",
                        name: ctx.name,
                    })),
                    type: "final",
                },
            },
        },
        {
            actions: {
                logStatsErrors: (ctx, evt) => {
                    forEvent("STATS_ERRORS", evt, (e) => {
                        debug("[%s][error] %O", ctx.name, e.errors);
                    });
                },
                logStatsWarnings: (ctx, evt) => {
                    forEvent("STATS_WARNINGS", evt, (e) => {
                        debug("[%s][warnings] %O", ctx.name, e.warnings);
                    });
                },
                logReady: (ctx, evt) => {
                    debug("[%s] watching for changes", ctx.name);
                },
                logStoppinglogStopping: (ctx) =>
                    debug("[%s] stopping...", ctx.name),
                logCompilationComplete: (ctx, evt) => {
                    forEvent("COMPILATION_COMPLETE", evt, (evt) => {
                        debug("[%s] compiled in %Oms", ctx.name, evt.time);
                    });
                },
                logCompilationError: (ctx, evt) => {
                    forEvent("COMPILATION_ERROR", evt, (e) => {
                        debug(
                            "[%s][error] app compilation failed %O",
                            ctx.name,
                            e.error
                        );
                    });
                },
                logStopped: (ctx) => debug("[%s] watcher stopped", ctx.name),
            },
            services: {
                // https://webpack.js.org/api/node/
                spawnCompiler: (ctx, evt) => (cb: Sender<Events>, recv) => {
                    const compiler = webpack(ctx.config);

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

                            // console.log(
                            //     compiler.outputPath,
                            //     (compiler.outputFileSystem as any).readFileSync(
                            //         join(compiler.outputPath, "main.js")
                            //     )
                            // );

                            const buffer =
                                compiler.name === SERVER_ENTRY_NAME
                                    ? ((compiler.outputFileSystem as any).readFileSync(
                                          join(compiler.outputPath, "main.js")
                                      ) as Buffer)
                                    : Buffer.from("");

                            trace("sending %O bytes", buffer.length);

                            cb({
                                type: "COMPILATION_COMPLETE",
                                name: ctx.name,
                                time: info.time,
                                buffer:
                                    compiler.name === SERVER_ENTRY_NAME
                                        ? ((compiler.outputFileSystem as any).readFileSync(
                                              join(
                                                  compiler.outputPath,
                                                  "main.js"
                                              )
                                          ) as Buffer)
                                        : Buffer.from(""),
                            });
                        }
                    );

                    recv((evt) => {
                        const e = evt as Events;
                        trace("compiler received %O", e);
                        if (e.type === "STOP_ALL") {
                            trace("stopping webpack watcher...");
                            watching.close(() => {
                                trace("stopped!");
                                cb({ type: "STOPPED" });
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
