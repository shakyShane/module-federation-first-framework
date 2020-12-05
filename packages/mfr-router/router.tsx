import React, { useCallback, useEffect } from "react";
import { assign, DoneInvokeEvent, Interpreter, Machine, send } from "xstate";
import { v4 as uuidv4 } from "uuid";
import { useMachine, useService } from "@xstate/react";
import { createContext, PropsWithChildren, useContext, useMemo } from "react";
import { BrowserHistory, createBrowserHistory, History } from "history";
import debugpkg from "debug";
import { pure } from "xstate/lib/actions";
import { pageLoader } from "./page-loader";
import matchPath from "./match-path";

const debug = debugpkg("router");
const trace = debugpkg("router:trace");

type Context = {
    location: History["location"];
    depth: number;
    parents: Array<string>;
    segs: Seg[];
    component: null | any;
    resolveData: {
        loading: boolean;
        data: ResolveData;
        error: string | null;
    };
    routeData: {
        loading: boolean;
        data: any;
        error: string | null;
    };
};

// prettier-ignore
type Events =
    | { type: "xstate.init"; }
    | { type: "HISTORY_EVT"; location: History["location"]; depth: number };

export type Resolver = (
    location: History["location"],
    depth: number,
    parents: string[],
    segs: Seg[]
) => Promise<ResolveResult>;

export type DataLoader = (resolve: ResolveData) => Promise<any>;

type ResolveResult = {
    component?: any;
    query: Record<string, any>;
    params: Record<string, any>;
    status?: number;
};
type ResolveData = {
    query: Record<string, any>;
    params: Record<string, any>;
};

const createRouterMachine = (
    id: string,
    parents: Array<string>,
    segs: Seg[],
    depth: number,
    location: History["location"],
    resolver?: Resolver,
    dataLoader?: DataLoader
) => {
    return Machine<Context, Record<string, any>, Events>(
        {
            id,
            initial: "resolving",
            context: {
                location,
                depth: depth,
                segs,
                parents,
                component: null,
                resolveData: {
                    loading: false,
                    data: {
                        query: {},
                        params: {},
                    },
                    error: null,
                },
                routeData: {
                    loading: false,
                    data: undefined,
                    error: null,
                },
            },
            on: {
                HISTORY_EVT: [{ target: "resolving", cond: "matchedDepth" }],
            },
            states: {
                invalid: {},
                resolving: {
                    entry: ["assignResolveLoading"],
                    invoke: {
                        src: "resolveComponent",
                        onDone: {
                            target: "loadingData",
                            actions: ["assignResolveData"],
                        },
                    },
                },
                loadingData: {
                    entry: "assignDataLoading",
                    invoke: {
                        src: "loadData",
                        onDone: {
                            target: "dataLoaded",
                            actions: "assignRouteData",
                        },
                    },
                },
                dataLoaded: {},
            },
        },
        {
            guards: {
                matchedDepth: (ctx, evt) => {
                    return true;
                },
            },
            services: {
                resolveComponent: async (ctx, evt) => {
                    if (!resolver) {
                        return null;
                    }
                    const location = (() => {
                        switch (evt.type) {
                            case "xstate.init":
                                return ctx.location;
                            case "HISTORY_EVT":
                                return evt.location;
                        }
                    })();
                    if (!location) {
                        trace("location data not found in event");
                        return null;
                    }
                    trace(
                        "--> pathname=%o, depth=%o parents=%o",
                        location.pathname,
                        ctx.depth,
                        ctx.parents
                    );
                    const output = await resolver(
                        location,
                        ctx.depth,
                        ctx.parents,
                        ctx.segs
                    );
                    trace("++ resolved %o", output);
                    return { ...output, location };
                },
                loadData: async (ctx, evt) => {
                    if (!dataLoader) {
                        return null;
                    }
                    const output = await dataLoader(ctx.resolveData.data);
                    trace("output from loadData = %o", output);
                    return output;
                },
            },
            actions: {
                assignResolveData: assign({
                    component: (x, evt) => {
                        const e = evt as DoneInvokeEvent<ResolveResult>;
                        return e.data.component;
                    },
                    resolveData: (ctx, evt) => {
                        const e = evt as DoneInvokeEvent<ResolveResult>;
                        const { component, ...rest } = e.data;
                        return {
                            ...ctx.resolveData,
                            loading: false,
                            data: rest,
                        };
                    },
                }),
                assignResolveLoading: assign({
                    resolveData: (ctx) => {
                        return {
                            ...ctx.resolveData,
                            loading: true,
                        };
                    },
                }),
                assignDataLoading: assign({
                    routeData: (ctx) => {
                        return {
                            ...ctx.routeData,
                            loading: true,
                        };
                    },
                }),
                assignRouteData: assign({
                    routeData: (ctx, evt) => {
                        return {
                            ...ctx.routeData,
                            loading: false,
                            data: (evt as any).data,
                        };
                    },
                }),
            },
        }
    );
};

const defaultParents: string[] = [];

export const RouterContext = createContext<{
    send: any;
    service: any;
    prev: number;
    parents: Array<string>;
}>({
    send: null,
    service: null,
    prev: 0,
    parents: defaultParents,
});

type Seg = {
    key: string;
    as: string;
};
type ProviderProps = {
    dataLoader?: DataLoader;
    resolver?: Resolver;
    fallback?: () => React.ReactNode;
    segs: Seg[];
};
const noopDataLoader = () => Promise.resolve({});
const noopResolver = () => Promise.resolve({});

export function RouterProvider(props: PropsWithChildren<ProviderProps>) {
    const { dataLoader = noopDataLoader, resolver = pageLoader, segs } = props;
    const baseRouter = useContext(BaseRouterContext);
    if (!baseRouter.send) {
        throw new Error(
            "baseRouter.send absent, likely an issue with BaseRouterContext"
        );
    }
    const {
        history,
        service: baseRouterService,
        send: baseRouterSend,
    } = baseRouter;
    const {
        send: parentSend,
        service: parentService,
        prev,
        parents,
    } = useContext(RouterContext);
    const currentDepth = parentSend === null ? 0 : prev + 1;
    const machine = useMemo(() => {
        return createRouterMachine(
            `router-${currentDepth}-${uuidv4().slice(0, 6)}`,
            parents,
            segs,
            currentDepth,
            history.location,
            resolver,
            dataLoader
        );
    }, [currentDepth, dataLoader, history.location, parents, resolver, segs]);

    const [state, send, service] = useMachine(machine, {
        devTools: true,
    });

    useEffect(() => {
        const matchers: Matcher[] = [];
        segs.forEach((seg) => {
            const joined =
                seg.as === "/" ? "/" : "/" + parents.concat(seg.as).join("/");

            matchers.push({ depth: currentDepth, path: joined });
        });
        if (typeof baseRouterSend !== "function") {
            console.warn(
                'typeof baseRouterSend !== "function"',
                baseRouterSend
            );
        } else {
            // debug('sending matchers %o', matchers);
            baseRouterSend({ type: "REGISTER", matchers });
        }
        const listenBase = baseRouterService.subscribe((x: any) => {
            if (x.event.type === "@external.TRIGGER_RESOLVE") {
                if (x.event.depth <= currentDepth) {
                    send({
                        type: "HISTORY_EVT",
                        location: x.event.location,
                        depth: x.event.depth,
                    });
                }
            }
        });

        return () => {
            baseRouterSend({ type: "UNREGISTER", depth: currentDepth });
            return listenBase.unsubscribe();
        };
    }, [baseRouterSend, baseRouterService, currentDepth, parents, segs, send]);

    const baseParents = useMemo(() => {
        const urlSegs = [
            ...history.location.pathname.slice(1).split("/"),
        ].filter(Boolean);
        const subject = urlSegs[currentDepth];
        const match =
            history.location.pathname === "/"
                ? "/"
                : segs.find((seg) => subject === seg.as);
        if (typeof match === "string") {
            return parents.concat(match);
        } else if (match) {
            return parents.concat(match.as);
        }
        return parents;
    }, [history.location.pathname, currentDepth, segs, parents]);

    const api = useMemo(() => {
        return {
            send,
            service,
            prev: currentDepth,
            parents: baseParents,
        };
    }, [send, service, currentDepth, baseParents]);

    return (
        <RouterContext.Provider value={api}>
            {state.context.component
                ? React.createElement(state.context.component)
                : null}{" "}
            {props.children}
        </RouterContext.Provider>
    );
}

type RouterProps = {
    resolver: () => Promise<any>;
    dataLoader: () => Promise<any>;
};

const bh = createBrowserHistory();
const BaseRouterContext = createContext<{
    history: BrowserHistory;
    send: Interpreter<any, any, BaseEvt>["send"];
    service: any;
}>({
    send: null as any,
    service: null,
    history: bh,
});

type BaseContext = {
    matchers: Matcher[];
};

//prettier-ignore
type BaseEvt =
    | { type: '@external.TRIGGER_RESOLVE'; depth: number; exact: boolean; location: History['location']; action: History['action'] }
    | { type: 'REGISTER'; matchers: Matcher[] }
    | { type: 'UNREGISTER'; depth: number }
    | { type: 'HISTORY_EVT'; location: History['location']; action: History['action'] };

const baseMachine = Machine<BaseContext, Record<string, any>, BaseEvt>(
    {
        id: "base-router",
        initial: "idle",
        context: {
            matchers: [],
        },
        states: {
            idle: {},
        },
        on: {
            HISTORY_EVT: { actions: "notifyRouters" },
            REGISTER: { actions: "assignMatchers" },
            UNREGISTER: { actions: "removeMatchers" },
        },
    },
    {
        actions: {
            assignMatchers: assign({
                matchers: (ctx, evt) => {
                    switch (evt.type) {
                        case "REGISTER": {
                            const matches = ctx.matchers.concat(evt.matchers);
                            return matches;
                        }
                        default:
                            return ctx.matchers;
                    }
                },
            }),
            removeMatchers: assign({
                matchers: (ctx, evt) => {
                    switch (evt.type) {
                        case "UNREGISTER": {
                            return ctx.matchers.filter(
                                (ctxM) => ctxM.depth !== evt.depth
                            );
                        }
                        default:
                            return ctx.matchers;
                    }
                },
            }),
            notifyRouters: pure((ctx, evt) => {
                switch (evt.type) {
                    case "HISTORY_EVT": {
                        const location = evt.location;
                        const action = evt.action;
                        const segLength = location.pathname.slice(1).split("/")
                            .length;

                        const depthFirstsorted = ctx.matchers
                            .filter((x) => x.depth + 1 <= segLength)
                            .sort((a, b) => b.depth - a.depth);

                        const exactMatch = select({
                            inputs: depthFirstsorted,
                            pathname: location.pathname,
                            exact: true,
                        });

                        if (exactMatch) {
                            const output = {
                                type: "@external.TRIGGER_RESOLVE",
                                depth: exactMatch.depth,
                                exact: true,
                                location,
                                action,
                            };
                            trace("exact match = %o", output);
                            return send(output);
                        }

                        const noneExact = select({
                            inputs: depthFirstsorted,
                            pathname: location.pathname,
                            exact: false,
                        });

                        if (noneExact) {
                            const output = {
                                type: "@external.TRIGGER_RESOLVE",
                                depth: noneExact.depth,
                                exact: false,
                                location,
                                action,
                            };
                            trace("none-exact match %o", output);
                            return send(output);
                        }

                        console.warn("no matching route found");
                    }
                }
                return undefined;
            }),
        },
    }
);

export function BaseRouter(props: PropsWithChildren<any>) {
    const [state, send, service] = useMachine(baseMachine, { devTools: true });
    useEffect(() => {
        const unlisten = bh.listen(({ location, action }) => {
            send({ type: "HISTORY_EVT", location, action });
        });
        return () => {
            unlisten();
        };
    }, [send]);
    const api = useMemo(() => {
        return { history: bh, send, service };
    }, [send, service]);
    return (
        <BaseRouterContext.Provider value={api}>
            {props.children}
        </BaseRouterContext.Provider>
    );
}

export function Outlet() {
    const { service, prev } = useContext(RouterContext);
    return <p>Outlet at depth: {prev}</p>;
}

export function useRouteData() {
    const { service } = useContext(RouterContext);
    const [state] = useService(service);
    return (state as any).context.routeData;
}

export function useResolveData() {
    const { service } = useContext(RouterContext);
    const [state] = useService(service);
    return (state as any).context.resolveData;
}

export function Link(props: PropsWithChildren<any>) {
    const { history } = useContext(BaseRouterContext);
    const onClick = useCallback(
        (evt) => {
            evt.preventDefault();
            history.push(evt.target.pathname);
        },
        [history]
    );
    return (
        <a href={props.to} onClick={onClick}>
            {props.children}
        </a>
    );
}

interface Matcher {
    path: string;
    depth: number;
}

interface SelectParams {
    inputs: Matcher[];
    pathname: string;
    exact: boolean;
}

export function select(inputs: SelectParams) {
    trace("considering %o", inputs);
    return inputs.inputs.find((m) => {
        const input = { path: m.path, exact: inputs.exact };
        trace("[select] ? pathname=%o vs %o", inputs.pathname, input);
        const res = matchPath(inputs.pathname, input);
        trace("[select] = %o", res);
        return res;
    });
}
