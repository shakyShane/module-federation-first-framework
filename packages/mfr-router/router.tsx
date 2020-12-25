import React from "react";
import { assign, DoneInvokeEvent, Machine } from "xstate";
import { History } from "history";
import debugpkg from "debug";

const debug = debugpkg("router");
const trace = debugpkg("router:trace");

export type Context = {
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
    | { type: "HISTORY_EVT"; location: History["location"]; depth: number; matchData: MatchData };

export type MatchData = {
    path: string;
    url: string;
    isExact: boolean;
    params: Record<string, any>;
};
export type Seg = {
    key: string;
    as: string;
};
export type ResolverParams = {
    location: History["location"];
    depth: number;
    parents: string[];
    segs: Seg[];
};
export type Resolver = (params: ResolverParams) => Promise<ResolveResult>;

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

export function createRouterMachine(
    id: string,
    parents: Array<string>,
    segs: Seg[],
    depth: number,
    location: History["location"],
    resolver?: Resolver,
    dataLoader?: DataLoader
) {
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
                            case "HISTORY_EVT": {
                                return evt.location;
                            }
                        }
                    })();
                    if (!location) {
                        trace("location data not found in event");
                        return null;
                    }
                    trace(
                        "--> pathname=%o, depth=%o parents=%o segs=%o",
                        location.pathname,
                        ctx.depth,
                        ctx.parents,
                        ctx.segs
                    );
                    const output = await resolver({
                        location,
                        depth: ctx.depth,
                        parents: ctx.parents,
                        segs: ctx.segs,
                    });
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
}
